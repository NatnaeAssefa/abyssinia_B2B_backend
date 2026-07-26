import { Request, Response } from "express";
import { ProductService } from "../../services/MarketPlace";
import ServerResponse from "../../utilities/response/Response";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import Joi from "joi";
import { User } from "../../models/User";
import {
  Category,
  Subcategory,
  Supplier,
  ProductImage,
  ProductSpecification,
  ProductIncoterm,
  ProductTargetMarket,
  ProductUseCase,
} from "../../models/MarketPlace";

const ModelName = "Product";

/** Include every related model to Product for findMany/findById */
const productIncludes = [
  { model: Category },
  { model: Subcategory },
  { model: Supplier },
  { model: ProductImage, as: "product_images", required: false },
  { model: ProductSpecification, as: "specifications", required: false },
  { model: ProductIncoterm, as: "incoterms", required: false },
  { model: ProductTargetMarket, as: "target_markets", required: false },
  { model: ProductUseCase, as: "use_cases", required: false },
];

/** Merge common flat query params (e.g. ?category_id=...&limit=50) into Sequelize options */
const applyFlatProductFilters = (parsedQuery: any, requestQuery: Record<string, unknown>) => {
  const where: Record<string, unknown> = { ...(parsedQuery.query.where || {}) };

  if (requestQuery.category_id) {
    where.category_id = requestQuery.category_id;
  }
  if (requestQuery.subcategory_id) {
    where.subcategory_id = requestQuery.subcategory_id;
  }
  if (requestQuery.supplier_id) {
    where.supplier_id = requestQuery.supplier_id;
  }
  if (requestQuery.is_active !== undefined) {
    where.is_active =
      requestQuery.is_active === "true" || requestQuery.is_active === true;
  }
  if (requestQuery.is_featured !== undefined) {
    where.is_featured =
      requestQuery.is_featured === "true" || requestQuery.is_featured === true;
  }
  if (requestQuery.in_stock !== undefined) {
    where.in_stock =
      requestQuery.in_stock === "true" || requestQuery.in_stock === true;
  }

  if (Object.keys(where).length > 0) {
    parsedQuery.query.where = where;
  }

  if (requestQuery.limit !== undefined) {
    const limit = parseInt(String(requestQuery.limit), 10);
    if (!isNaN(limit) && limit > 0) {
      parsedQuery.query.limit = Math.min(limit, 100);
    }
  }
  if (requestQuery.offset !== undefined) {
    const offset = parseInt(String(requestQuery.offset), 10);
    if (!isNaN(offset) && offset >= 0) {
      parsedQuery.query.offset = offset;
    }
  }
};

class ProductController {
  static findMany(request: Request, response: Response) {
    const startTime = new Date();
    const parsedQuery: any = ParseQuery(request.query);
    applyFlatProductFilters(parsedQuery, request.query as Record<string, unknown>);
    parsedQuery.query.include = [
      ...(parsedQuery.query.include || []),
      ...productIncludes,
    ];

    ProductService.findMany(parsedQuery.query, parsedQuery.paranoid)
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

    ProductService.findOne(parsedQuery.query, parsedQuery.paranoid)
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
      parsedQuery.query.include = [
        ...(parsedQuery.query.include || []),
        ...productIncludes,
      ];
      ProductService.findById(id, parsedQuery.query, parsedQuery.paranoid)
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
      action: Joi.string().required().trim(),
      object: Joi.string().required().trim(),
      description: Joi.string().trim(),
      prev_data: Joi.any().required(),
      new_data: Joi.any().required(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      const user: User = request.user;
      ProductService.create(user, {
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
      ProductService.update(user, id, data)
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
      ProductService.delete(user, id, null, force)
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
      ProductService.restore(user, id)
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

export default ProductController;
