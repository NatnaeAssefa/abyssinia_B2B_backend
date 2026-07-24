import { Response } from "express";
import { QuoteRequestService } from "../../services/MarketPlace";
import ServerResponse from "../../utilities/response/Response";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import Joi from "joi";
import { User } from "../../models/User";
import { Product } from "../../models/MarketPlace";
import { EmailService } from "../../utilities/email/Email";
import { env } from "../../config";
import { QuoteStatus } from "../../models/MarketPlace/QuoteRequest";

const ModelName = "QuoteRequest";

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

class QuoteRequestController {
  static findMany(request: any, response: Response) {
    const startTime = new Date();
    let parsedQuery: any = ParseQuery(request.query);

    QuoteRequestService.findMany(parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        ServerResponse(
          request,
          response,
          error.statusCode,
          error.payload,
          "Error",
          startTime
        );
      });
  }

  static findOne(request: any, response: Response) {
    const startTime = new Date();
    let parsedQuery: any = ParseQuery(request.query, ["F", "I", "O", "P"]);

    QuoteRequestService.findOne(parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        ServerResponse(
          request,
          response,
          error.statusCode,
          error.payload,
          "Error",
          startTime
        );
      });
  }

  static findById(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.params);

    if (!error) {
      let id: string = request.params.id;
      let parsedQuery: any = ParseQuery(request.query, ["I", "P"]);
      QuoteRequestService.findById(
        request.user,
        parsedQuery.query,
        parsedQuery.paranoid
      )
        .then((result) => {
          if (result) {
            ServerResponse(request, response, 200, result, "", startTime);
          } else {
            ServerResponse(
              request,
              response,
              404,
              null,
              `${ModelName} Not Found`,
              startTime
            );
          }
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
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
  }

  static create(request: any, response: Response) {
    const startTime = new Date();

    const schema = Joi.object({
      product_id: Joi.string().guid().optional(),
      product_name: Joi.string().trim().allow("", null).max(200),
      quantity: Joi.string().trim().required().max(100),
      packaging: Joi.string().trim().allow("", null).max(100),
      destination: Joi.string().trim().allow("", null).max(200),
      incoterm: Joi.string().trim().required().max(50),
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
      name: Joi.string().trim().allow("", null).max(200),
      email: Joi.string().email().required().max(200),
      company: Joi.string().trim().allow("", null).max(200),
      phone: Joi.string().trim().allow("", null).max(50),
      notes: Joi.string().trim().allow("", null).max(5000),
      status: Joi.string().valid(...Object.values(QuoteStatus)),
    });

    const { error, value } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const user: User | undefined = request.user;
      const data: any = {
        ...value,
        user_id: user?.id || null,
        destination: value.target_country || value.destination || null,
      };

      QuoteRequestService.create(user || null, data)
        .then(async (result) => {
          try {
            let productName = value.product_name;
            const product = await Product.findByPk(value.product_id);
            if (product) {
              productName = (product as any).name || productName;
            }

            await EmailService.getInstance().sendToTeam({
              subject: `[RFQ / Sourcing] ${productName} — ${value.company || value.name || value.email}`,
              html: EmailService.quoteSourcingEmail({
                product_name: productName,
                quantity: value.quantity,
                packaging: value.packaging,
                incoterm: value.incoterm,
                payment_term: value.payment_term,
                target_country: value.target_country,
                destination_port: value.destination_port,
                shipping_method: value.shipping_method,
                lead_time: value.lead_time,
                name: value.name,
                email: value.email,
                company: value.company,
                phone: value.phone,
                notes: value.notes,
              }),
              replyTo: value.email,
              from: env.COMPANY_EMAIL,
            });
          } catch (emailError) {
            console.error("Quote saved but email failed:", emailError);
          }

          ServerResponse(request, response, 201, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static update(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
      product_id: Joi.string().guid(),
      quantity: Joi.string().trim().max(100),
      packaging: Joi.string().trim().allow("", null).max(100),
      destination: Joi.string().trim().allow("", null).max(200),
      incoterm: Joi.string()
        .trim()
        .valid(...INCOTERMS)
        .allow("", null),
      payment_term: Joi.string()
        .trim()
        .valid(...PAYMENT_TERMS)
        .allow("", null),
      target_country: Joi.string().trim().allow("", null).max(150),
      destination_port: Joi.string().trim().allow("", null).max(200),
      shipping_method: Joi.string()
        .trim()
        .valid(...SHIPPING_METHODS)
        .allow("", null),
      lead_time: Joi.string().trim().allow("", null).max(150),
      name: Joi.string().trim().allow("", null).max(200),
      email: Joi.string().email().max(200),
      company: Joi.string().trim().allow("", null).max(200),
      phone: Joi.string().trim().allow("", null).max(50),
      notes: Joi.string().trim().allow("", null).max(5000),
      status: Joi.string().valid(...Object.values(QuoteStatus)),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const data: any = request.body;
      const user: User = request.user;
      QuoteRequestService.update(user, id, data)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static delete(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
      force: Joi.boolean(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const force: boolean = request.body.force ?? false;
      const user: User = request.user;
      QuoteRequestService.delete(user, id, null, force)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static restore(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const user: User = request.user;
      QuoteRequestService.restore(user, id)
        .then((result) => {
          ServerResponse(request, response, 200, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            error.statusCode,
            error.payload,
            "Error",
            startTime
          );
        });
    } else {
      ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }
  }

  static findMyProfile(request: any, response: Response) {
    const startTime = new Date();
    let parsedQuery: any = ParseQuery(request.query, ["F", "I", "O", "P"]);

    parsedQuery.query.where = {
      ...parsedQuery.query.where,
      user_id: request.user.id,
    };

    parsedQuery.query.include = [
      ...(parsedQuery.query.include || []),
      { model: User },
    ];

    QuoteRequestService.findOne(parsedQuery.query, parsedQuery.paranoid)
      .then((result) => {
        ServerResponse(request, response, 200, result, "", startTime);
      })
      .catch((error) => {
        ServerResponse(
          request,
          response,
          error.statusCode,
          error.payload,
          "Error",
          startTime
        );
      });
  }

}

export default QuoteRequestController;
