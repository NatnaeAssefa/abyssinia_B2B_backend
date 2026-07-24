import { Response } from "express";
import { BlogPostService } from "../../services/MarketPlace";
import ServerResponse from "../../utilities/response/Response";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import Joi from "joi";
import { User } from "../../models/User";
import { UserType } from "../../utilities/constants/Constants";

const ModelName = "BlogPost";

class BlogPostController {
  static findMany(request: any, response: Response) {
    const startTime = new Date();
    const parsedQuery: any = ParseQuery(request.query);

    BlogPostService.findMany(
      parsedQuery.query,
      parsedQuery.paranoid
    )
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
    const parsedQuery: any = ParseQuery(request.query, ["F", "I", "O", "P"]);

    BlogPostService.findOne(
      parsedQuery.query,
      parsedQuery.paranoid
    )
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

  static findBySlug(request: any, response: Response) {
    const startTime = new Date();
    const slug = request.params.slug;
    const parsedQuery: any = ParseQuery(request.query, ["I", "P"]);
    BlogPostService.findOne(
      {
        ...parsedQuery.query,
        where: { ...(parsedQuery.query?.where || {}), slug },
      },
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
  }

  static findById(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.params);

    if (!error) {
      const id: string = request.params.id;
      const parsedQuery: any = ParseQuery(request.query, ["I", "P"]);
      BlogPostService.findById(
        id,
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
      title: Joi.string()
        .min(3)
        .max(255)
        .required()
        .trim(),

      slug: Joi.string()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .required()
        .trim(),

      excerpt: Joi.string()
        .allow(null, "")
        .trim(),

      content: Joi.string()
        .min(10)
        .required(),

      featured_image: Joi.string()
        .uri()
        .allow(null, ""),

      author_name: Joi.string()
        .min(2)
        .max(255)
        .required()
        .trim(),

      author_email: Joi.string()
        .email()
        .allow(null, ""),

      category: Joi.string()
        .max(100)
        .allow(null, "")
        .trim(),

      tags: Joi.array()
        .items(Joi.string().trim())
        .default([]),

      is_published: Joi.boolean()
        .default(false),

      published_at: Joi.date()
        .allow(null),

      meta_title: Joi.string()
        .max(255)
        .allow(null, "")
        .trim(),

      meta_description: Joi.string()
        .allow(null, "")
        .trim(),

      view_count: Joi.number()
        .integer()
        .min(0)
        .default(0),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      const user: User = request.user;
      BlogPostService.create(user, data)
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
      title: Joi.string()
        .min(3)
        .max(255)
        .required()
        .trim(),

      slug: Joi.string()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .required()
        .trim(),

      excerpt: Joi.string()
        .allow(null, "")
        .trim(),

      content: Joi.string()
        .min(10)
        .required(),

      featured_image: Joi.string()
        .uri()
        .allow(null, ""),

      author_name: Joi.string()
        .min(2)
        .max(255)
        .required()
        .trim(),

      author_email: Joi.string()
        .email()
        .allow(null, ""),

      category: Joi.string()
        .max(100)
        .allow(null, "")
        .trim(),

      tags: Joi.array()
        .items(Joi.string().trim())
        .default([]),

      is_published: Joi.boolean()
        .default(false),

      published_at: Joi.date()
        .allow(null),

      meta_title: Joi.string()
        .max(255)
        .allow(null, "")
        .trim(),

      meta_description: Joi.string()
        .allow(null, "")
        .trim(),

      view_count: Joi.number()
        .integer()
        .min(0)
        .default(0),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const data: any = request.body;
      const user: User = request.user;
      BlogPostService.update(user, id, data)
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
      BlogPostService.delete(user, id, null, force)
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
      BlogPostService.restore(user, id)
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

export default BlogPostController;
