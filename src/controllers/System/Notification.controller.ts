import { Response } from "express";
import ServerResponse from "../../utilities/response/Response";
import { ParseQuery } from "../../utilities/pagination/Pagination";
import Joi from "joi";
import { User } from "../../models/User";
import { NotificationService } from "../../services/System";
import { NotificationType, NotificationCategory } from "../../utilities/constants/Constants";
import { Notification } from "../../models/System";
import { Op } from "sequelize";

const ModelName = "Notification";

class NotificationController {

  static findMany(request: any, response: Response) {
    const startTime = new Date();
    let parsedQuery: any = ParseQuery(request.query);

    NotificationService.findMany(
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
    let parsedQuery: any = ParseQuery(request.query, ["F", "I", "O", "P"]);
    NotificationService.findOne(
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

  static findById(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      id: Joi.string().guid().required(),
    });

    const { error } = schema.validate(request.params);

    if (!error) {
      let id: string = request.params.id;
      let parsedQuery: any = ParseQuery(request.query, ["I", "P"]);
      NotificationService.findById(
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
      user_id: Joi.string().guid().required(),  // The user receiving the notification
      notification_title: Joi.string().required(),  // Notification title (required)
      notification_body: Joi.string().required(),  // Notification message (required)
      notification_type: Joi.string().valid(...Object.values(NotificationType)).required(),  // Enum validation
      notification_category: Joi.string().valid(...Object.values(NotificationCategory)).default(NotificationCategory.INFO),  // Category with default
      is_read: Joi.boolean(),  // Default to unread
      notification_date: Joi.date().iso(),
      notification_url: Joi.string().uri().optional(),  // Link to the relevant action (if any)
    });


    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const data: any = request.body;
      const user: User = request.user;
      NotificationService.create(data)
        .then((result) => {
          ServerResponse(request, response, 201, result, "Success", startTime);
        })
        .catch((error) => {
          ServerResponse(
            request,
            response,
            500,
            error || "Internal Server Error!",
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
      user_id: Joi.string().guid().optional(),  // The user receiving the notification
      notification_title: Joi.string(),  // Notification title (required)
      notification_body: Joi.string(),  // Notification message (required)
      notification_type: Joi.string().valid(...Object.values(NotificationType)),  // Enum validation
      notification_category: Joi.string().valid(...Object.values(NotificationCategory)),  // Category validation
      is_read: Joi.boolean(),  // Default to unread
      notification_date: Joi.date().iso(),
      notification_url: Joi.string().uri().optional(),  // Link to the relevant action (if any)
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (!error) {
      const id: string = request.body.id;
      const data: any = request.body;
      const user: User = request.user;
      NotificationService.update(user, id, data)
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
      NotificationService.delete(user, id, null, force)
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
      NotificationService.restore(user, id)
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

  static findMy(request: any, response: Response) {
    const startTime = new Date();
    let parsedQuery: any = ParseQuery(request.query);

    const user: User = request.user;
    NotificationService.findMany(
      {
        ...parsedQuery.query,
        where: {
          user_id: user.id
        },
        order: [["createdAt", "DESC"]],
      },
      parsedQuery.paranoid
    )
      .then((result) => {
        ServerResponse(request, response, 200, result, "User's Notifications", startTime);
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

  static async getClassifiedNotifications(request: any, response: Response) {
    const startTime = new Date();
    const schema = Joi.object({
      is_read: Joi.boolean().optional(),
    });

    const { error } = schema.validate(request.body, { abortEarly: false });

    if (error) {
      return ServerResponse(
        request,
        response,
        400,
        { details: error.details },
        "Input validation error",
        startTime
      );
    }

    const { is_read } = request.body;
    let parsedQuery: any = ParseQuery(request.query);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const queryCondition: any = {
      user_id: request.user.id,
      createdAt: { [Op.gte]: thirtyDaysAgo },
    };

    if (is_read !== undefined) {
      queryCondition.is_read = is_read;
    }

    try {
      // Get paginated notifications
      const notifications = await NotificationService.findMany(
        {
          ...parsedQuery.query,
          where: queryCondition,
          order: [["createdAt", "DESC"]],
        },
        parsedQuery.paranoid
      );

      // Get total count of newer notifications (today and yesterday) without pagination
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0)).getTime();
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);

      const newerCountQuery = {
        where: {
          ...queryCondition,
          createdAt: {
            [Op.gte]: yesterdayStart
          }
        }
      };

      const newerCountResult = await NotificationService.findMany(
        newerCountQuery,
        parsedQuery.paranoid
      );

      interface NotificationClass {
        today: Notification[];
        yesterday: Notification[];
        older: Notification[];
        count: number;
        newer_count: number;
      }

      const classifiedNotifications: NotificationClass = {
        today: [],
        yesterday: [],
        older: [],
        count: notifications.count || 0,
        newer_count: newerCountResult.count || 0 // Use the total count of newer notifications
      };

      notifications.rows.forEach((notification: Notification) => {
        const createdAt = new Date(notification.createdAt).getTime();

        if (createdAt >= todayStart) {
          classifiedNotifications.today.push(notification);
        } else if (createdAt >= yesterdayStart.getTime()) {
          classifiedNotifications.yesterday.push(notification);
        } else {
          classifiedNotifications.older.push(notification);
        }
      });

      ServerResponse(request, response, 200, classifiedNotifications, "", startTime);
    } catch (error) {
      ServerResponse(
        request,
        response,
        500,
        error || "Internal Server Error",
        "Error",
        startTime
      );
    }
  }




}

export default NotificationController;
