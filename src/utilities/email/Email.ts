import nodemailer from "nodemailer";
import { env } from "../../config";
import { User } from "../../models/User";

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: Number(env.SMTP_PORT) === 465, // true for 465, false for other ports
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

  async sendMail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail(options);
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
    }
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
}
