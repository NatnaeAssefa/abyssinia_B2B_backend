import { Response } from "express";
import Joi from "joi";
import ServerResponse from "../../utilities/response/Response";
import { EmailService } from "../../utilities/email/Email";
import { env } from "../../config";

const INCOTERMS = [
  "FOB",
  "EXW",
  "FCA",
  "FAS",
  "CFR",
  "CIF",
  "CPT",
  "CIP",
  "DAT",
  "DDP",
  "Negotiable",
];

const PAYMENT_TERMS = ["T/T", "L/C", "D/P", "W/U", "Negotiable"];

const SHIPPING_METHODS = [
  "Sea Freight",
  "Air Freight",
  "Land Freight",
  "Express",
];

class ContactController {
  static submitInquiry(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      name: Joi.string().trim().required().max(200),
      email: Joi.string().email().required().max(200),
      company: Joi.string().trim().allow("", null).max(200),
      phone: Joi.string().trim().allow("", null).max(50),
      subject: Joi.string().trim().required().max(300),
      message: Joi.string().trim().required().max(5000),
    });

    const { error, value } = schema.validate(request.body, { abortEarly: false });

    if (error) {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
      return;
    }

    EmailService.getInstance()
      .sendToTeam({
        subject: `[Inquiry] ${value.subject} — ${value.name}`,
        html: EmailService.generalInquiryEmail(value),
        replyTo: value.email,
        from: env.COMPANY_EMAIL,
      })
      .then(() => {
        ServerResponse(
          request,
          response,
          200,
          { sent: true },
          "Inquiry submitted successfully",
          startTime
        );
      })
      .catch((err) => {
        console.error("Failed to send inquiry email:", err);
        ServerResponse(
          request,
          response,
          500,
          null,
          "Failed to send inquiry. Please try again later.",
          startTime
        );
      });
  }

  static submitQuote(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      product_name: Joi.string().trim().required().max(300),
      quantity: Joi.string().trim().required().max(100),
      packaging: Joi.string().trim().allow("", null).max(100),
      incoterm: Joi.string()
        .trim()
        .valid(...INCOTERMS)
        .required(),
      payment_term: Joi.string()
        .trim()
        .valid(...PAYMENT_TERMS)
        .required(),
      target_country: Joi.string().trim().required().max(150),
      destination_port: Joi.string().trim().required().max(200),
      shipping_method: Joi.string()
        .trim()
        .valid(...SHIPPING_METHODS)
        .required(),
      lead_time: Joi.string().trim().required().max(150),
      name: Joi.string().trim().required().max(200),
      email: Joi.string().email().required().max(200),
      company: Joi.string().trim().required().max(200),
      phone: Joi.string().trim().allow("", null).max(50),
      notes: Joi.string().trim().allow("", null).max(5000),
      product_id: Joi.string().guid().allow("", null),
    });

    const { error, value } = schema.validate(request.body, { abortEarly: false });

    if (error) {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
      return;
    }

    EmailService.getInstance()
      .sendToTeam({
        subject: `[RFQ / Sourcing] ${value.product_name} — ${value.company}`,
        html: EmailService.quoteSourcingEmail(value),
        replyTo: value.email,
        from: env.COMPANY_EMAIL,
      })
      .then(() => {
        ServerResponse(
          request,
          response,
          200,
          { sent: true },
          "Quote / sourcing request submitted successfully",
          startTime
        );
      })
      .catch((err) => {
        console.error("Failed to send quote email:", err);
        ServerResponse(
          request,
          response,
          500,
          null,
          "Failed to send quote request. Please try again later.",
          startTime
        );
      });
  }

  static submitRegistration(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      registration_type: Joi.string().valid("buyer", "supplier").required(),
      company_name: Joi.string().trim().required().max(200),
      business_type: Joi.string().trim().allow("", null).max(100),
      location: Joi.string().trim().required().max(200),
      products: Joi.string().trim().required().max(500),
      annual_capacity: Joi.string().trim().allow("", null).max(150),
      years_in_business: Joi.string().trim().allow("", null).max(100),
      contact_name: Joi.string().trim().required().max(200),
      position: Joi.string().trim().required().max(150),
      email: Joi.string().email().required().max(200),
      phone: Joi.string().trim().required().max(50),
      additional_info: Joi.string().trim().allow("", null).max(5000),
    });

    const { error, value } = schema.validate(request.body, { abortEarly: false });

    if (error) {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
      return;
    }

    const typeLabel = value.registration_type === "buyer" ? "Buyer" : "Supplier";

    EmailService.getInstance()
      .sendToTeam({
        subject: `[${typeLabel} Registration] ${value.company_name} — ${value.contact_name}`,
        html: EmailService.registrationEmail(value),
        replyTo: value.email,
        from: env.COMPANY_EMAIL,
      })
      .then(() => {
        ServerResponse(
          request,
          response,
          200,
          { sent: true },
          "Registration submitted successfully",
          startTime
        );
      })
      .catch((err) => {
        console.error("Failed to send registration email:", err);
        ServerResponse(
          request,
          response,
          500,
          null,
          "Failed to submit registration. Please try again later.",
          startTime
        );
      });
  }
}

export default ContactController;
