import sequelize, { Op, Transaction } from "sequelize";
import { Role, User } from "../../models/User";
import async from "async";
import { createTransaction } from "../../utilities/database/sequelize";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../errors/Errors";
import { NullishPropertiesOf } from "sequelize/types/utils";
import { AccessRuleDAL, RoleDAL } from "../../dals/User";
import { AccessType, LogActions } from "../../utilities/constants/Constants";
import { ActionLogService } from "./index";
import { GlobalAuthOptionsNew } from "../../middleware/Auth/Auth";

const ModelName = "Role";

class RoleService {
  static AuthOptions = (user: User, options: any, paranoid?: boolean) => {
    return GlobalAuthOptionsNew(user, options, null, null, paranoid);
  };

  /**
   *
   *
   * @static
   * @param user
   * @param {Partial<Role>} payload
   * @memberof RoleService
   */
  static create = (
    user: User,
    payload: Omit<Role, NullishPropertiesOf<Role>>
  ): Promise<Role> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            let whereOption: any = {
              name: payload.name,
              type: payload.type,
            };
            RoleService.findOne(user, {
              where: whereOption,
            })
              .then((role) => {
                if (!role) {
                  done(null, transaction);
                } else {
                  done(new BadRequestError([`Name Already Exist`]));
                }
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              );
          },
          (transaction: Transaction, done: Function) => {
            async.eachSeries(
              payload.access_rules,
              (rule, callback) => {
                AccessRuleDAL.findOne({
                  where: { name: rule },
                })
                  .then((_rule) => {
                    if (_rule) {
                      callback()
                    } else {
                      callback(
                        new NotFoundError(`Access Rule '${rule}' not found`)
                      );
                    }
                  })
                  .catch((error) => callback(new InternalServerError(error)));
              },
              (error: any) => {
                if (error) {
                  done(error, {
                    obj: null,
                    transaction: transaction,
                  });
                } else {
                  done(null, transaction);
                }
              }
            );
          },
          (transaction: Transaction, done: Function) => {
            RoleDAL.create(payload)
              .then((result) => {
                done(null, result, { obj: result, transaction: transaction });
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
              action: LogActions.CREATE,
              object: ModelName,
              prev_data: {},
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

  static findMany = (
    user: User,
    options: any,
    paranoid?: boolean
  ): Promise<{ rows: Role[]; count: number }> => {
    return new Promise((resolve, reject) => {
      let authOptions = RoleService.AuthOptions(user, options, paranoid);
      RoleDAL.findMany(authOptions.options, authOptions.paranoid)
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
  ): Promise<Role | null> => {
    return new Promise((resolve, reject) => {
      let authOptions = RoleService.AuthOptions(user, options, paranoid);
      RoleDAL.findById(id, authOptions.options, authOptions.paranoid)
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
  ): Promise<Role | null> => {
    return new Promise((resolve, reject) => {
      let authOptions = RoleService.AuthOptions(user, options, paranoid);
      RoleDAL.findOne(authOptions.options, authOptions.paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  static update = (
    user: User,
    id: string,
    payload: Omit<Role, NullishPropertiesOf<Role>>,
    options?: any
  ): Promise<Role> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            RoleService.findById(user, id, options)
              .then((role) => {
                if (role) {
                  done(null, transaction, role);
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
          (transaction: Transaction, role: Role, done: Function) => {
            async.eachSeries(
              payload.access_rules,
              (rule, callback) => {
                AccessRuleDAL.findOne({
                  where: { name: rule },
                })
                  .then((_rule) => {
                    if (_rule) {
                      callback();
                    } else {
                      callback(
                        new NotFoundError(`Access Rule '${rule}' not found`)
                      );
                    }
                  })
                  .catch((error) => callback(new InternalServerError(error)));
              },
              (error: any) => {
                if (error) {
                  done(error, {
                    obj: null,
                    transaction: transaction,
                  });
                } else {
                  done(null, transaction, role);
                }
              }
            );
          },
          (transaction: Transaction, role: Role, done: Function) => {
            const _role = { ...role.toJSON() };
            RoleDAL.update(role, payload, transaction)
              .then((result) => {
                done(null, _role, { obj: result, transaction: transaction });
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
            RoleService.findById(user, id, options, force)
              .then((role) => {
                if (role) {
                  done(null, transaction, role);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, role: Role, done: Function) => {
            RoleDAL.delete({ id: role.id }, transaction, force)
              .then((result) => {
                done(null, role, { obj: result, transaction: transaction });
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
            RoleService.findById(user, id, options, true)
              .then((role) => {
                if (role) {
                  done(null, transaction, role);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, role: Role, done: Function) => {
            RoleDAL.restore({ id: role.id }, transaction)
              .then((result) => {
                done(null, role, { obj: result, transaction: transaction });
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

  /**
   * Creates or updates a Super Admin role with all available Super Admin permissions
   * 
   * @static
   * @param {string} name - The name for the Super Admin role
   * @param {string} [description] - Optional description for the role
   * @returns {Promise<Role>} - The created or updated Super Admin role
   * @memberof RoleService
   */
  static createSuperAdminRole = (
    name: string,
    description?: string
  ): Promise<Role> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            // Import the Super Admin access rules
            import("../../utilities/constants/SuperAdminAccessRules")
              .then(({ default: superAdminAccessRules }) => {
                // Check if a role with this name already exists
                RoleDAL.findOne({
                  where: { name }
                })
                  .then((existingRole) => {
                    if (existingRole) {
                      // If role exists and is already a Super Admin role, check for new rules
                      if (existingRole.type === AccessType.SUPER_ADMIN) {
                        // Find new rules that aren't in the existing role
                        const existingRules = existingRole.access_rules || [];
                        const newRules = superAdminAccessRules.filter(rule => !existingRules.includes(rule));
                        
                        if (newRules.length > 0) {
                          console.log(`Found ${newRules.length} new access rules to add to Super Admin role`);
                          // Update the role with all rules if new ones were found
                          const updatedRules = [...existingRules, ...newRules];
                          
                          // Update the role directly here instead of passing to next step
                          const payload = {
                            access_rules: updatedRules
                          };
                          
                          RoleDAL.update(existingRole, payload, transaction)
                            .then((updatedRole) => {
                              console.log(`Updated Super Admin role with new permissions`);
                              done(null, updatedRole, { 
                                obj: updatedRole, 
                                transaction: transaction,
                                isNew: false,
                                isUpdated: true
                              });
                            })
                            .catch((error) => {
                              done(new InternalServerError(`Error updating role with new permissions: ${error.message}`), {
                                obj: null,
                                transaction: transaction
                              });
                            });
                        } else {
                          // No new rules, return existing role
                          console.log(`Super Admin role already has all required permissions`);
                          done(null, existingRole, { 
                            obj: existingRole, 
                            transaction: transaction,
                            isNew: false,
                            isUpdated: false
                          });
                        }
                      } else {
                        // If role exists but is not Super Admin, reject
                        done(new BadRequestError([`Role "${name}" exists but is not a Super Admin role. Please use a different name.`]));
                      }
                    } else {
                      // Role doesn't exist, create it
                      const payload = {
                        name,
                        description: description || `Role with Super Admin permissions: ${name}`,
                        access_rules: superAdminAccessRules,
                        type: AccessType.SUPER_ADMIN
                      };
                      
                      RoleDAL.create(payload, transaction)
                        .then((newRole) => {
                          console.log(`Created new Super Admin role: ${name}`);
                          done(null, newRole, { 
                            obj: newRole, 
                            transaction: transaction,
                            isNew: true,
                            isUpdated: false
                          });
                        })
                        .catch((error) => {
                          done(new InternalServerError(`Error creating new Super Admin role: ${error.message}`), {
                            obj: null,
                            transaction: transaction
                          });
                        });
                    }
                  })
                  .catch((error) => 
                    done(new InternalServerError(`Error finding existing role: ${error.message}`), {
                      obj: null,
                      transaction: transaction
                    })
                  );
              })
              .catch((error) => 
                done(new InternalServerError(`Failed to import SuperAdminAccessRules: ${error.message}`), {
                  obj: null,
                  transaction: transaction
                })
              );
          }
        ],
        (error, result?: Role, info?: { obj: Role; transaction: Transaction; isNew: boolean; isUpdated: boolean }) => {
          if (!error) {
            if (info && info.transaction) {
              const status = info.isNew ? "created" : (info.isUpdated ? "updated with new permissions" : "already up-to-date");
              console.log(`Super Admin role '${name}' ${status}`);
              resolve(result!);
              info.transaction.commit();
            } else {
              reject(new InternalServerError("Transaction or result object is missing"));
            }
          } else {
            reject(error);
            if (info && info.transaction) {
              info.transaction.rollback();
            } else {
              console.error("Failed to rollback transaction: Transaction object is missing");
            }
          }
        }
      );
    });
  };
}

export default RoleService;
