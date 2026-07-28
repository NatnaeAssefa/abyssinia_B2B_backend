import nodemailer from "nodemailer";
import { env } from "../../config";

export interface EmailPayload {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

const normalizeRecipients = (to: string | string[]): string[] =>
  (Array.isArray(to) ? to : [to]).filter(Boolean);

/** Render free tier blocks SMTP ports 25/465/587 — use resend or brevo over HTTPS instead. */
export async function dispatchEmail(payload: EmailPayload): Promise<void> {
  const transport = (env.EMAIL_TRANSPORT || "smtp").toLowerCase();

  switch (transport) {
    case "resend":
      await sendViaResend(payload);
      return;
    case "brevo":
      await sendViaBrevo(payload);
      return;
    default:
      await sendViaSmtp(payload);
  }
}

async function sendViaSmtp(payload: EmailPayload): Promise<void> {
  const port = Number(env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    connectionTimeout: Number(env.SMTP_CONNECTION_TIMEOUT) || 30000,
    greetingTimeout: Number(env.SMTP_CONNECTION_TIMEOUT) || 30000,
    socketTimeout: Number(env.SMTP_CONNECTION_TIMEOUT) || 30000,
  });

  await transporter.sendMail({
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
    replyTo: payload.replyTo,
  });
}

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is required when EMAIL_TRANSPORT=resend (Render blocks SMTP ports)"
    );
  }

  const from = formatFromAddress(payload.from, env.COMPANY_NAME);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: normalizeRecipients(payload.to),
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      reply_to: payload.replyTo,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error (${response.status}): ${body}`);
  }
}

async function sendViaBrevo(payload: EmailPayload): Promise<void> {
  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "BREVO_API_KEY is required when EMAIL_TRANSPORT=brevo (Render blocks SMTP ports)"
    );
  }

  const senderEmail = extractEmailAddress(payload.from) || env.COMPANY_EMAIL;
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: env.COMPANY_NAME || "Abyssinia B2B" },
      to: normalizeRecipients(payload.to).map((email) => ({ email })),
      subject: payload.subject,
      htmlContent: payload.html,
      textContent: payload.text,
      replyTo: payload.replyTo ? { email: payload.replyTo } : undefined,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${body}`);
  }
}

function extractEmailAddress(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from;
}

function formatFromAddress(from: string, name?: string): string {
  if (from.includes("<")) return from;
  if (name) return `${name} <${from}>`;
  return from;
}
