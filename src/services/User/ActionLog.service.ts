import { Transaction } from "sequelize";
import { ActionLog, User } from "../../models/User";
import async from "async";
import { createTransaction } from "../../utilities/database/sequelize";
import { InternalServerError, NotFoundError } from "../../errors/Errors";
import { NullishPropertiesOf } from "sequelize/types/utils";
import { ActionLogDAL } from "../../dals/User";
import { LogActions } from "../../utilities/constants/Constants";
import LogService from "../Log/Log.service";

const ModelName = "Action Log";

class ActionLogService {
  static handleCreate(data: any) {
    ActionLogService.create(data).catch((error) => {
      LogService.LogError(error);
    });
  }

  /**
   *
   *
   * @static
   * @param {Partial<ActionLog>} payload
   * @memberof ActionLogService
   */
  static create = (payload: any): Promise<ActionLog> => {
    return new Promise((resolve, reject) => {
      ActionLogDAL.create(payload)
        .then((result) => {
          resolve(result);
          LogService.LogAction(
            payload["action"],
            payload["object"],
            { prev_data: payload["prev_data"], new_data: payload["new_data"] },
            new Date()
          );
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  static findMany = (
    options: any,
    paranoid?: boolean
  ): Promise<{ rows: ActionLog[]; count: number }> => {
    return new Promise((resolve, reject) => {
      ActionLogDAL.findMany(options, paranoid)
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
  ): Promise<ActionLog | null> => {
    return new Promise((resolve, reject) => {
      ActionLogDAL.findById(id, options, paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  static findOne = (
    options: any,
    paranoid?: boolean
  ): Promise<ActionLog | null> => {
    return new Promise((resolve, reject) => {
      ActionLogDAL.findOne(options, paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  static update = (
    user: User,
    id: string,
    payload: Omit<ActionLog, NullishPropertiesOf<ActionLog>>,
    options?: any
  ): Promise<ActionLog> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            ActionLogDAL.findById(id, options)
              .then((action_log) => {
                if (action_log) {
                  done(null, transaction, action_log);
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
          (transaction: Transaction, action_log: ActionLog, done: Function) => {
            const _action_log = { ...action_log.toJSON() };
            ActionLogDAL.update(action_log, payload, transaction)
              .then((result) => {
                done(null, _action_log, {
                  obj: result,
                  transaction: transaction,
                });
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
            ActionLogDAL.findById(id, options, force)
              .then((action_log) => {
                if (action_log) {
                  done(null, transaction, action_log);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, action_log: ActionLog, done: Function) => {
            ActionLogDAL.delete({ id: action_log.id }, transaction, force)
              .then((result) => {
                done(null, action_log, {
                  obj: result,
                  transaction: transaction,
                });
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
              new_data: { obj: obj },
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
            ActionLogDAL.findById(id, options, true)
              .then((action_log) => {
                if (action_log) {
                  done(null, transaction, action_log);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, action_log: ActionLog, done: Function) => {
            ActionLogDAL.restore({ id: action_log.id }, transaction)
              .then((result) => {
                done(null, action_log, {
                  obj: result,
                  transaction: transaction,
                });
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
}

export default ActionLogService;
