import nodemailer from "nodemailer";
import { env } from "../../config";
import { User } from "../../models/User";

interface EmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

const brandColor = "#1B5E3B";
const accentColor = "#C4A35A";

const emailShell = (title: string, body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f0;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f0;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(27,94,59,0.08);">
          <tr>
            <td style="background:${brandColor};padding:28px 32px;">
              <p style="margin:0;color:${accentColor};font-size:12px;letter-spacing:2px;text-transform:uppercase;">Abyssinia B2B</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:700;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#f8faf7;padding:20px 32px;border-top:1px solid #e5ebe6;">
              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                This message was sent from the Abyssinia B2B website.<br/>
                Reply directly to the sender's email address when responding.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const detailRow = (label: string, value?: string | null) => {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eef2ee;width:38%;vertical-align:top;">
        <span style="color:#6b7280;font-size:13px;font-family:Arial,sans-serif;">${label}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #eef2ee;vertical-align:top;">
        <span style="color:#111827;font-size:14px;font-family:Arial,sans-serif;font-weight:600;">${value}</span>
      </td>
    </tr>
  `;
};

const detailsTable = (rows: string) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 8px;background:#f8faf7;border-radius:12px;padding:8px 16px;">
    ${rows}
  </table>
`;

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  static getNotificationRecipients(): string[] {
    const recipients = [env.INFO_EMAIL, env.SALES_EMAIL].filter(Boolean);
    return [...new Set(recipients)];
  }

  async sendMail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail(options);
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  async sendToTeam(options: Omit<EmailOptions, "to" | "from"> & { from?: string }): Promise<void> {
    await this.transporter.sendMail({
      from: options.from || env.COMPANY_EMAIL,
      to: EmailService.getNotificationRecipients(),
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
    });
    console.log("Team notification email sent successfully");
  }

  public static verificationEmail(
    name: string,
    verification_url: string,
    company: string
  ) {
    return `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            color: #666666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Email Verification</h1>
        <p>Hello ${name},</p>
        <p>Thank you for signing up. Please click the button below to verify your email address:</p>
        <a href="${verification_url}" class="btn">Verify Email</a>
        <p>If you did not sign up for this account, you can ignore this email.</p>
        <p>Thanks, <br>The ${company} Team</p>
    </div>
</body>
</html>

        `;
  }

  public static inqueryEmail(
    lister: User,
    listing_url: string,
    source_url: string,
    inquery: any
  ) {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Listing Inquiry</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            color: #666666;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .btn {
            display: inline-block;
            padding: 10px 20px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
          }
          .btn:hover {
            background-color: #0056b3;
          }
          .details {
            background-color: #f9f9f9;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .details p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Listing Inquiry</h1>
          <p>
            A user has submitted an inquiry for a listing on Read-Sea.ai. Below are
            the details:
          </p>
          <div class="details">
            <p><strong>Name:</strong> ${inquery.name}</p>
            <p><strong>Email:</strong> ${inquery.email}</p>
            <p><strong>Phone Number:</strong> ${inquery.phone_number}${inquery.whatsapp_available ? '(Whatsapp ✅)' : ''}</p>
            <p><strong>Listing ID:</strong> ${inquery.listing_id}</p>
            <p><strong>Description:</strong> ${inquery.description}</p>
          </div>
          <p>You can view the listing by clicking the button below:</p>
          <a href="${listing_url}" class="btn">View Listing</a>
          <p>Realtor Information:</p>
          <div class="details">
            <p>
              <strong>Name:</strong> ${lister.first_name + " " + lister.last_name}
            </p>
            <p><strong>Email:</strong> ${lister.email}</p>
            <p><strong>Phone Number:</strong> ${lister.phone_number}</p>
          </div>
          <a href="${source_url}" class="btn">Listing Source</a>
          <p>Thanks, <br />The Read-Sea.ai Team</p>
        </div>
      </body>
    </html>

    `;
  }

  public static recoveryEmail(
    name: string,
    reset_url: string,
    company: string
  ) {
    return `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            color: #666666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h1 style="text-align: center; color: #333;">Password Recovery</h1>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Please click the button below to proceed with the password recovery process:</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="${reset_url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>Click on the link bellow the button is not working</p>
        <p>${reset_url}</p>
        <p></p>
        <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <p>For your security, this link will expire in 24 hours. If the link has expired, you can request a new one through the password recovery page.</p>
        <p>Thanks,<br>The ${company} Team</p>
    </div>
</body>
</html>
        `;
  }

  public static generalInquiryEmail(data: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    const body = `
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;font-family:Arial,sans-serif;">
        A new general inquiry has been submitted on Abyssinia B2B.
      </p>
      ${detailsTable(
        [
          detailRow("Name", data.name),
          detailRow("Email", data.email),
          detailRow("Company", data.company),
          detailRow("Phone", data.phone),
          detailRow("Subject", data.subject),
        ].join("")
      )}
      <p style="margin:20px 0 8px;color:#111827;font-size:14px;font-weight:700;font-family:Arial,sans-serif;">Message</p>
      <div style="background:#f8faf7;border-radius:12px;padding:16px;color:#374151;font-size:14px;line-height:1.7;font-family:Arial,sans-serif;white-space:pre-wrap;">${data.message}</div>
    `;
    return emailShell("General Inquiry", body);
  }

  public static quoteSourcingEmail(data: {
    product_name?: string;
    quantity?: string;
    packaging?: string;
    incoterm?: string;
    payment_term?: string;
    target_country?: string;
    destination_port?: string;
    shipping_method?: string;
    lead_time?: string;
    name?: string;
    email: string;
    company?: string;
    phone?: string;
    notes?: string;
  }) {
    const body = `
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;font-family:Arial,sans-serif;">
        A new Request Quote / Sourcing Request has been received.
      </p>
      <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:700;font-family:Arial,sans-serif;">Trade Requirements</p>
      ${detailsTable(
        [
          detailRow("Product", data.product_name),
          detailRow("Quantity", data.quantity),
          detailRow("Packaging", data.packaging),
          detailRow("Trade Term / Incoterm", data.incoterm),
          detailRow("Payment Term", data.payment_term),
          detailRow("Target Country", data.target_country),
          detailRow("Destination Port", data.destination_port),
          detailRow("Shipping Method", data.shipping_method),
          detailRow("Lead Time", data.lead_time),
        ].join("")
      )}
      <p style="margin:20px 0 8px;color:#111827;font-size:14px;font-weight:700;font-family:Arial,sans-serif;">Contact Details</p>
      ${detailsTable(
        [
          detailRow("Name", data.name),
          detailRow("Email", data.email),
          detailRow("Company", data.company),
          detailRow("Phone", data.phone),
        ].join("")
      )}
      ${
        data.notes
          ? `<p style="margin:20px 0 8px;color:#111827;font-size:14px;font-weight:700;font-family:Arial,sans-serif;">Additional Notes</p>
             <div style="background:#f8faf7;border-radius:12px;padding:16px;color:#374151;font-size:14px;line-height:1.7;font-family:Arial,sans-serif;white-space:pre-wrap;">${data.notes}</div>`
          : ""
      }
    `;
    return emailShell("Request Quote / Sourcing Request", body);
  }

  public static registrationEmail(data: {
    registration_type: string;
    company_name: string;
    business_type?: string;
    location: string;
    products: string;
    annual_capacity?: string;
    years_in_business?: string;
    contact_name: string;
    position: string;
    email: string;
    phone: string;
    additional_info?: string;
  }) {
    const typeLabel = data.registration_type === "buyer" ? "Buyer" : "Supplier";
    const body = `
      <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;font-family:Arial,sans-serif;">
        A new <strong>${typeLabel}</strong> registration has been submitted.
      </p>
      <div style="display:inline-block;background:${accentColor};color:#1a1a1a;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;font-family:Arial,sans-serif;margin-bottom:12px;">
        ${typeLabel.toUpperCase()}
      </div>
      <p style="margin:16px 0 8px;color:#111827;font-size:14px;font-weight:700;font-family:Arial,sans-serif;">Business Details</p>
      ${detailsTable(
        [
          detailRow("Company / Cooperative", data.company_name),
          detailRow("Business Type", data.business_type),
          detailRow("Location", data.location),
          detailRow(data.registration_type === "buyer" ? "Products of Interest" : "Products Supplied", data.products),
          detailRow(data.registration_type === "buyer" ? "Annual Purchase Volume" : "Annual Capacity", data.annual_capacity),
          detailRow("Years in Business", data.years_in_business),
        ].join("")
      )}
      <p style="margin:20px 0 8px;color:#111827;font-size:14px;font-weight:700;font-family:Arial,sans-serif;">Contact Person</p>
      ${detailsTable(
        [
          detailRow("Full Name", data.contact_name),
          detailRow("Position", data.position),
          detailRow("Email", data.email),
          detailRow("Phone", data.phone),
        ].join("")
      )}
      ${
        data.additional_info
          ? `<p style="margin:20px 0 8px;color:#111827;font-size:14px;font-weight:700;font-family:Arial,sans-serif;">Additional Information</p>
             <div style="background:#f8faf7;border-radius:12px;padding:16px;color:#374151;font-size:14px;line-height:1.7;font-family:Arial,sans-serif;white-space:pre-wrap;">${data.additional_info}</div>`
          : ""
      }
    `;
    return emailShell(`${typeLabel} Registration`, body);
  }
}
