import sequelize, { Op, Transaction } from "sequelize";
import { AccessRule, User } from "../../models/User";
import async, { reject } from "async";
import { createTransaction } from "../../utilities/database/sequelize";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../errors/Errors";
import { NullishPropertiesOf } from "sequelize/types/utils";
import { AccessRuleDAL } from "../../dals/User";
import { AccessType, LogActions } from "../../utilities/constants/Constants";
import { ActionLogService } from "./index";
import { AccessRules } from "../../config";
import { GlobalAuthOptionsNew } from "../../middleware/Auth/Auth";

const ModelName = "Access Rule";

class AccessRuleService {
  static AuthOptions = (user: User, options: any, paranoid?: boolean) => {
    let where = {
      type: AccessType.ADMIN,
    };
    return GlobalAuthOptionsNew(user, options, null, where, paranoid);
  };
  /**
   *
   *
   * @static
   * @memberof AccessRuleService
   * @param access_rules
   */
  static createIfNotExist = (access_rules: AccessRules[]): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      async.eachSeries(
        access_rules,
        (item, _callback) => {
          async.eachSeries(
            item.rules,
            (rule, callback) => {
              AccessRuleDAL.findOne({
                where: { name: rule.name },
              }).then((_rule) => {
                if (_rule) {
                  AccessRuleDAL.update(_rule, {
                    name: rule.name,
                    group: item.group,
                    type: rule.type,
                  })
                    .then(() => {
                      callback();
                    })
                    .catch((error) => callback());
                } else {
                  AccessRuleDAL.create({
                    name: rule.name,
                    group: item.group,
                    type: rule.type,
                  })
                    .then(() => {
                      callback();
                    })
                    .catch((error) => callback(error));
                }
              });
            },
            (error: any) => {
              _callback(error);
            }
          );
        },
        (error: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        }
      );
    });
  };

  /**
   *
   *
   * @static
   * @param user
   * @param {Partial<AccessRule>} payload
   * @memberof AccessRuleService
   */
  static create = (
    user: User,
    payload: Omit<AccessRule, NullishPropertiesOf<AccessRule>>
  ): Promise<AccessRule> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            AccessRuleService.findOne(user, {
              where: {
                name: payload.name,
              },
            })
              .then((result) => {
                if (result) {
                  done(new BadRequestError(["Access Rule Already Registered"]));
                } else {
                  done(null);
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (done: Function) => {
            AccessRuleDAL.create(payload)
              .then((result) => {
                done(null, result);
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.CREATE,
              object: ModelName,
              prev_data: {},
              new_data: result,
              user_id: user.id,
            });
            done(null, result);
          },
        ],
        (error, result: any) => {
          if (!error) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
    });
  };

  static findMany = (
    user: User,
    options: any,
    paranoid?: boolean
  ): Promise<{ rows: AccessRule[]; count: number }> => {
    return new Promise((resolve, reject) => {
      let authOptions = AccessRuleService.AuthOptions(user, options, paranoid);
      AccessRuleDAL.findMany(authOptions.options, authOptions.paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(new InternalServerError(error));
        });
    });
  };

  static findById = (
    user: User,
    id: string,
    options?: any,
    paranoid?: boolean
  ): Promise<AccessRule | null> => {
    return new Promise((resolve, reject) => {
      let authOptions = AccessRuleService.AuthOptions(user, options, paranoid);
      AccessRuleDAL.findById(id, authOptions.options, authOptions.paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  static findOne = (
    user: User,
    options: any,
    paranoid?: boolean
  ): Promise<AccessRule | null> => {
    return new Promise((resolve, reject) => {
      let authOptions = AccessRuleService.AuthOptions(user, options, paranoid);
      AccessRuleDAL.findOne(authOptions.options, authOptions.paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  static update = (
    user: User,
    id: string,
    payload: Omit<AccessRule, NullishPropertiesOf<AccessRule>>,
    options?: any
  ): Promise<AccessRule> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            AccessRuleService.findById(user, id, options)
              .then((access_rule) => {
                if (access_rule) {
                  done(null, transaction, access_rule);
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
          (
            transaction: Transaction,
            access_rule: AccessRule,
            done: Function
          ) => {
            const _access_rule = { ...access_rule.toJSON() };
            AccessRuleDAL.update(access_rule, payload, transaction)
              .then((result) => {
                done(null, _access_rule, {
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
            AccessRuleService.findById(user, id, options, force)
              .then((access_rule) => {
                if (access_rule) {
                  done(null, transaction, access_rule);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (
            transaction: Transaction,
            access_rule: AccessRule,
            done: Function
          ) => {
            AccessRuleDAL.delete({ id: access_rule.id }, transaction, force)
              .then((result) => {
                done(null, access_rule, {
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
            AccessRuleService.findById(user, id, options, true)
              .then((access_rule) => {
                if (access_rule) {
                  done(null, transaction, access_rule);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (
            transaction: Transaction,
            access_rule: AccessRule,
            done: Function
          ) => {
            AccessRuleDAL.restore({ id: access_rule.id }, transaction)
              .then((result) => {
                done(null, access_rule, {
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

export default AccessRuleService;
