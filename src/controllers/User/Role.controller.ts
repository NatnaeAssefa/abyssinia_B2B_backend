import { Response } from "express";
import { RoleService } from "../../services/User";
import ServerResponse from "../../utilities/response/Response";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import Joi from "joi";
import { User } from "../../models/User";
import { AccessType, UserType } from "../../utilities/constants/Constants";
import { Op } from "sequelize";

const ModelName = "Role";

class RoleController {
  static findMany(request: any, response: Response) {
    const startTime = new Date();
    let parsedQuery: any = ParseQuery(request.query);

    RoleService.findMany(request.user, parsedQuery.query, parsedQuery.paranoid)
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

  static findSelectedRole(request: any, response: Response) {
    const startTime = new Date();
    let parsedQuery: any = ParseQuery(request.query);
    const excludeRoles = ["Admin", "Super Admin"];
    parsedQuery.query.where = {
      ...parsedQuery.query.where,
      name: { [Op.notIn]: excludeRoles },
    };
  
    RoleService.findMany(request.user, parsedQuery.query, parsedQuery.paranoid)
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

    RoleService.findOne(request.user, parsedQuery.query, parsedQuery.paranoid)
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
      RoleService.findById(
        request.user,
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
      name: Joi.string().required().trim(),
      description: Joi.string().trim(),
      type: Joi.string()
        .valid(...Object.values(AccessType))
        .required(),
      access_rules: Joi.any().required(),
      company_id: Joi.alternatives().conditional("type", {
        is: AccessType.SUPER_ADMIN,
        then: Joi.string().required(),
      }),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      const user: User = request.user;
      RoleService.create(user, data)
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
      name: Joi.string().trim(),
      description: Joi.string().trim(),
      access_rules: Joi.any(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const data: any = request.body;
      const user: User = request.user;
      RoleService.update(user, id, data)
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
      RoleService.delete(user, id, null, force)
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
      RoleService.restore(user, id)
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

export default RoleController;
