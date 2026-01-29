import { Request, Response } from "express";
import { CategoryService } from "../../services/MarketPlace";
import ServerResponse from "../../utilities/response/Response";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import Joi from "joi";
import { User } from "../../models/User";

const ModelName = "Category";

class CategoryController {
  static findMany(request: Request, response: Response) {
    const startTime = new Date();
    const parsedQuery: any = ParseQuery(request.query);

    CategoryService.findMany(parsedQuery.query, parsedQuery.paranoid)
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

  static findOne(request: Request, response: Response) {
    const startTime = new Date();
    const parsedQuery: any = ParseQuery(request.query, ["F", "I", "O", "P"]);

    CategoryService.findOne(parsedQuery.query, parsedQuery.paranoid)
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

  static findById(request: Request, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.params);

    if (!error) {
      const id: string = request.params.id;
      const parsedQuery: any = ParseQuery(request.query, ["I", "P"]);
      CategoryService.findById(id, parsedQuery.query, parsedQuery.paranoid)
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
      name: Joi.string()
        .required()
        .trim(),

      slug: Joi.string()
        .required()
        .trim(),

      description: Joi.string()
        .allow(null, "")
        .trim(),

      image: Joi.string()
        .uri()
        .allow(null, ""),

      icon: Joi.string()
        .allow(null, "")
        .trim(),

      color: Joi.string()
        .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
        .allow(null, ""),

      order: Joi.number()
        .integer()
        .min(0)
        .default(0),

      is_active: Joi.boolean()
        .default(true),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      const user: User = request.user;
      CategoryService.create(user, {
        ...data,
      })
        .then((result) => {
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
      action: Joi.string().trim(),
      object: Joi.string().trim(),
      description: Joi.string().trim(),
      prev_data: Joi.any(),
      new_data: Joi.any(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const data: any = request.body;
      const user: User = request.user;
      CategoryService.update(user, id, data)
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
      CategoryService.delete(user, id, null, force)
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
      CategoryService.restore(user, id)
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
}

export default CategoryController;
