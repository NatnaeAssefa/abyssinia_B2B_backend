import { Transaction } from "sequelize";
import { Notification } from "../../models/System";
import async from "async";
import { createTransaction } from "../../utilities/database/sequelize";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../errors/Errors";
import { NullishPropertiesOf } from "sequelize/types/utils";
import { NotificationDAL } from "../../dals/System";
import { LogActions, EmailType, EmailTypeValues } from "../../utilities/constants/Constants";
import { ActionLogService } from "../User";
import { User } from "../../models/User";
import { EmailService } from "../../utilities/email/Email";
import { UserDAL } from "../../dals/User";
import LogService from "../Log/Log.service";
import { env } from "../../config";

const ModelName = "Notification";

class NotificationService {
  /**
   *
   *
   * @static
   * @param payload The notification payload including user_id, notification_title, notification_body, notification_type, notification_category
   * @param sendEmail Whether to send an email notification (default: false)
   * @param notificationType Type of email notification if sendEmail is true
   * @param oldPlan Previous subscription plan (for upgrade/downgrade emails)
   * @param newPlan New subscription plan (for upgrade/downgrade emails) 
   * @param url URL to include in the email
   * @param refundAmount Refund amount for refund emails
   * @memberof NotificationService
   */
  static create = (
    payload: Omit<Notification, NullishPropertiesOf<Notification>>,
    sendEmail: boolean = false,
    notificationType?: EmailTypeValues,
  ): Promise<Notification> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            NotificationDAL.create(payload, transaction)
              .then((result) => done(null, result, transaction))
              .catch((error) =>
                done(new InternalServerError(error), null, transaction)
              );
          },
          (notification: Notification, transaction: Transaction, done: Function) => {
            UserDAL.findById(payload.user_id)
              .then((user) => {
                if (user && sendEmail && notificationType) {
                  const emailOptions = NotificationService.getEmailOptions(
                    user,
                    notificationType
                  );

                  if (emailOptions) {
                    EmailService.getInstance()
                      .sendMail(emailOptions)
                      .then(() => LogService.LogInfo(`Email sent to ${user.email}`))
                      .catch((error) =>
                        LogService.LogError(
                          `Email sending failed: ${error}`,
                          new Date()
                        )
                      );
                  }
                } else {
                  LogService.LogInfo(
                    "User not found or email notification is disabled!",
                  );
                }
              })
              .catch(() => {
                LogService.LogError("User not found!", new Date());
              });

            done(null, notification, transaction);
          },
          (notification: Notification, transaction: Transaction, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.CREATE,
              object: ModelName,
              prev_data: {},
              new_data: notification,
            });
            done(null, { obj: notification, transaction });
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              resolve(result.obj);
              result.transaction.commit();
            } else {
              reject(new InternalServerError("Dead End"));
            }
          } else {
            reject(error);
          }
        }
      );
    });
  };



  static findMany = (
    options: any,
    paranoid?: boolean
  ): Promise<{ rows: Notification[]; count: number }> => {
    return new Promise((resolve, reject) => {
      NotificationDAL.findMany(options, paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(new InternalServerError(error));
        });
    });
  };

  static findById = (
    id: string,
    options?: any,
    paranoid?: boolean
  ): Promise<Notification | null> => {
    return new Promise((resolve, reject) => {
      NotificationDAL.findById(id, options, paranoid)
        .then((result) => {
          if (result) {
            NotificationDAL.update(
              result,
              {
                is_read: true
              }
            ).then((notification) => {
              ActionLogService.handleCreate({
                action: LogActions.CREATE,
                object: ModelName,
                prev_data: {},
                new_data: result,
                user_id: result.user_id,
              });
              resolve(notification)
            }).catch((e) => {
              reject(e)
            })
            resolve(result);
          } else {
            reject(new NotFoundError("Notification Not Found!"))
          }
        })
        .catch((error) => {
          reject(new InternalServerError(error))
        });
    });
  };

  static findOne = (
    options: any,
    paranoid?: boolean
  ): Promise<Notification | null> => {
    return new Promise((resolve, reject) => {
      NotificationDAL.findOne(options, paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  static update = (
    user: User,
    id: string,
    payload: Omit<Notification, NullishPropertiesOf<Notification>>,
    options?: any
  ): Promise<Notification> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            NotificationDAL.findById(id, options)
              .then((Notification) => {
                if (Notification) {
                  done(null, transaction, Notification);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              );
          },
          (transaction: Transaction, Notification: Notification, done: Function) => {
            const _Notification = { ...Notification.toJSON() };
            NotificationDAL.update(Notification, payload, transaction)
              .then((result) => {
                done(null, _Notification, { obj: result, transaction: transaction });
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              );
          },
          (obj: any, result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.UPDATE,
              object: ModelName,
              prev_data: obj,
              new_data: payload,
              user_id: user.id,
            });
            done(null, result);
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              resolve(result.obj);
              result.transaction.commit();
            } else {
              reject(new InternalServerError("Dead End"));
            }
          } else {
            reject(error);
            if (result && result.transaction) {
              result.transaction.rollback();
            } else {
              reject(new InternalServerError("Dead End"));
            }
          }
        }
      );
    });
  };

  static delete = (
    user: User,
    id: string,
    options?: any,
    force?: boolean
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            NotificationDAL.findById(id, options, force)
              .then((Notification) => {
                if (Notification) {
                  done(null, transaction, Notification);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, Notification: Notification, done: Function) => {
            NotificationDAL.delete({ id: Notification.id }, transaction, force)
              .then((result) => {
                done(null, Notification, { obj: result, transaction: transaction });
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              );
          },
          (obj: any, result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: force ? LogActions.HARD_DELETE : LogActions.SOFT_DELETE,
              object: ModelName,
              prev_data: { id: id, options: options },
              new_data: obj,
              user_id: user.id,
            });
            done(null, result);
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              resolve(result.obj);
              result.transaction.commit();
            } else {
              reject(new InternalServerError("Dead End"));
            }
          } else {
            reject(error);
            if (result && result.transaction) {
              result.transaction.rollback();
            } else {
              reject(new InternalServerError("Dead End"));
            }
          }
        }
      );
    });
  };

  static restore = (
    user: User,
    id: string,
    options?: any
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            NotificationDAL.findById(id, options, true)
              .then((Notification) => {
                if (Notification) {
                  done(null, transaction, Notification);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, Notification: Notification, done: Function) => {
            NotificationDAL.restore({ id: Notification.id }, transaction)
              .then((result) => {
                done(null, Notification, { obj: result, transaction: transaction });
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              );
          },
          (obj: any, result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.RESTORE,
              object: ModelName,
              prev_data: { id: id, options: options },
              new_data: obj,
              user_id: user.id,
            });
            done(null, result);
          },
        ],
        (error, result: { obj: any; transaction: Transaction } | undefined) => {
          if (!error) {
            if (result && result.transaction) {
              resolve(result.obj);
              result.transaction.commit();
            } else {
              reject(new InternalServerError("Dead End"));
            }
          } else {
            reject(error);
            if (result && result.transaction) {
              result.transaction.rollback();
            } else {
              reject(new InternalServerError("Dead End"));
            }
          }
        }
      );
    });
  };

  static sendDynamicEmail(user_id: string, notificationType: string) {
    UserDAL.findById(user_id)
      .then((user) => {
        if (!user) {
          LogService.LogError("User not found!", new Date());
          return;
        }

        const emailOptions = NotificationService.getEmailOptions(user, notificationType);
        if (!emailOptions) {
          LogService.LogError("Invalid notification type!", new Date());
          return;
        }

        EmailService.getInstance()
          .sendMail(emailOptions)
          .then(() => LogService.LogInfo(`Email sent to ${user.email}`))
          .catch((error) =>
            LogService.LogError(`Email sending failed: ${error}`, new Date())
          );
      })
      .catch(() => LogService.LogError("User fetch failed!", new Date()));
  }

  static getEmailOptions(user: User, notificationType: string) {
    switch (notificationType) {
      case EmailType.PASSWORD_RECOVERY:
        return {
          to: user.email,
          from: env.COMPANY_EMAIL as string,
          subject: "Password Recovery",
          html: EmailService.recoveryEmail(
            user.first_name,
            `${env.FRONTEND_URL}/reset-password?token=someToken`,
            env.COMPANY_NAME as string
          ),
        };
      case EmailType.EMAIL_VERIFICATION:
        return {
          to: user.email,
          from: env.COMPANY_EMAIL as string,
          subject: "Verify Your Email",
          html: EmailService.verificationEmail(
            user.first_name,
            `${env.FRONTEND_URL}/verify-email?token=someToken`,
            env.COMPANY_NAME as string
          ),
        };
      default:
        return null;
    }
  }



}

export default NotificationService;
