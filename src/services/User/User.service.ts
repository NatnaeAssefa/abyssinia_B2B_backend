import sequelize, { Op, Transaction } from "sequelize";
import { Role, User } from "../../models/User";
import async from "async";
import bcrypt from "bcrypt";
import { createTransaction } from "../../utilities/database/sequelize";
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../errors/Errors";
import { NullishPropertiesOf } from "sequelize/types/utils";
import { RoleDAL, UserDAL, UserProfileDAL } from "../../dals/User";
import {
  AccessType,
  EmailRegex,
  FacebookUserProfile,
  LogActions,
  UserStatus,
  UserType,
} from "../../utilities/constants/Constants";
import jwt from "jsonwebtoken";
import { constants, env } from "../../config";
import { ActionLogService, RoleService } from "./index";
import { randomUUID } from "crypto";
import { GlobalAuthOptionsNew } from "../../middleware/Auth/Auth";
import { EmailService } from "../../utilities/email/Email";
import { verifyCode } from "../../utilities/auth/googleAuth";
import { Cart } from "../../models/MarketPlace";

const ModelName = "User";

class UserService {
  static AuthOptions = (user: User, options: any, paranoid?: boolean) => {
    return GlobalAuthOptionsNew(user, options, null, null, paranoid);
  };

  /**
   *
   *
   * @static
   * @param user
   * @param {Partial<User>} payload
   * @memberof UserService
   */
  static create = (
    user: User,
    payload: Omit<User, NullishPropertiesOf<User>>
  ): Promise<User> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            RoleService.findById(user, payload.role_id)
              .then((role) => {
                if (role) {
                  done(null, transaction);
                } else {
                  done(new NotFoundError(`Role Not Found`), {
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
          (transaction: Transaction, done: Function) => {
            UserDAL.findOne({
              where: {
                email: payload.email.toLowerCase(),
              },
            })
              .then((_user) => {
                if (!_user) {
                  done(null, transaction);
                } else {
                  done(new BadRequestError([`Email Already Registered`]), {
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
          // (transaction: Transaction, done: Function) => {
          //   UserDAL.findOne({
          //     where: {
          //       phone_number: payload.phone_number,
          //     },
          //   })
          //     .then((_user) => {
          //       if (!_user) {
          //         done(null, transaction);
          //       } else {
          //         done(
          //           new BadRequestError([`Phone Number Already Registered`]),
          //           {
          //             obj: null,
          //             transaction: transaction,
          //           }
          //         );
          //       }
          //     })
          //     .catch((error) =>
          //       done(new InternalServerError(error), {
          //         obj: null,
          //         transaction: transaction,
          //       })
          //     );
          // },
          (transaction: Transaction, done: Function) => {
            bcrypt
              .hash(payload["password"], 10)
              .then((hashed) => {
                payload.email = payload.email.toLowerCase();
                payload.password = hashed;
                payload.last_used_key = randomUUID();
                payload.last_used_key = randomUUID();
                payload.verification_code = randomUUID();
                payload.verification_time = new Date();

                payload.status = UserStatus.PENDING;
                done(null, transaction);
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              );
          },
          (transaction: Transaction, done: Function) => {
            UserDAL.create(payload, transaction)
              .then((result) => {
                done(null, transaction, result);
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              );
          },
          (transaction: Transaction, user: User, done: Function) => {
            done(
              null,
              { status: "Skip Email verification" },
              { obj: user, transaction: transaction }
            );
            // EmailService.getInstance()
            //   .sendMail({
            //     from: env.COMPANY_EMAIL,
            //     subject: "Email Verification",
            //     to: user.email,
            //     html: EmailService.verificationEmail(
            //       user.first_name,
            //       `${env.BACKEND_URL}/auth/verify?email=${user.email}&code=${user.verification_code}`,
            //       env.COMPANY_NAME
            //     ),
            //   })
            //   .then((result) => {
            //     done(null, result, { obj: user, transaction: transaction });
            //   })
            //   .catch((error) =>
            //     done(new InternalServerError(error), {
            //       obj: null,
            //       transaction: transaction,
            //     })
            //   );
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

  /**
   *
   *
   * @static
   * @param user
   * @param {Partial<User>} payload
   * @memberof UserService
   */
  static verifyGoogle = (code: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            verifyCode(code)
              .then((decodedToken) => {
                if (decodedToken && typeof decodedToken !== "string") {
                  let is_valid = true;
                  for (let item of ["email", "sub", "given_name"]) {
                    if (!decodedToken[item]) {
                      is_valid = false;
                      break;
                    }
                  }
                  if (is_valid) {
                    done(null, decodedToken, transaction);
                  } else {
                    done(new BadRequestError(["Invalid code"]), {
                      obj: null,
                      transaction: transaction,
                    });
                  }
                } else {
                  done(new BadRequestError(["Invalid code"]), {
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
          (decodedToken: any, transaction: Transaction, done: Function) => {
            UserDAL.findOne({
              where: {
                email: decodedToken["email"],
              },
            })
              .then((_user) => {
                if (!_user) {
                  let payload = {
                    email: decodedToken["email"].toLowerCase(),
                    first_name: decodedToken["given_name"],
                    last_name: decodedToken["family_name"] ?? "",
                    social_login: "google",
                    social_login_id: decodedToken.sub,
                    phone_number: "",
                    password: "--",
                    last_used_key: randomUUID(),
                    verification_code: randomUUID(),
                    verification_time: new Date(),
                    status: UserStatus.ACTIVE,
                    type: UserType.USER,
                  };

                  UserDAL.create(payload, transaction)
                    .then((result) => {
                      let userData = result.toJSON();
                      // TODO use attribute exclude
                      delete userData.password;
                      delete userData.last_used_key;
                      ActionLogService.handleCreate({
                        action: LogActions.CREATE,
                        object: ModelName,
                        prev_data: {},
                        new_data: userData,
                      });
                      done(null, {
                        obj: userData,
                        transaction: transaction,
                      });
                    })
                    .catch((error) =>
                      done(new InternalServerError(error), {
                        obj: null,
                        transaction: transaction,
                      })
                    );
                } else {
                  try {
                    const token = jwt.sign(
                      { id: _user.id, key: _user.last_used_key },
                      env.AUTH_KEY,
                      {
                        expiresIn: env.AUTH_KEY_EXPIRY,
                      }
                    );
                    let userData = _user.toJSON();
                    // TODO use attribute exclude
                    delete userData.password;
                    delete userData.last_used_key;
                    done(null, {
                      obj: { token: token, user: userData },
                      transaction: transaction,
                    });
                  } catch (error: any) {
                    done(new InternalServerError(error));
                  }
                }
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              );
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
   *
   *
   * @static
   * @param user
   * @param {Partial<User>} payload
   * @memberof UserService
   */
  static verifyFacebook = (user?: FacebookUserProfile): Promise<User> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            if (!user) {
              done(new BadRequestError(["Unable to verify code"]), {
                obj: null,
                transaction: transaction,
              });
            } else {
              if (
                user.emails.length == 0 ||
                !user.emails.at(0) ||
                EmailRegex.test(user.emails.at(0)?.value ?? "")
              ) {
                done(
                  new BadRequestError([
                    "Failed to get a valid email from social login",
                  ]),
                  {
                    obj: null,
                    transaction: transaction,
                  }
                );
              } else {
                UserDAL.findOne({
                  where: {
                    email: user.emails.at(0)?.value,
                  },
                })
                  .then((_user) => {
                    if (!_user) {
                      let name_ = user.displayName.split(" ");
                      let payload = {
                        email: user.emails.at(0)?.value.toLowerCase(),
                        first_name: name_.at(0) ?? "User",
                        last_name: name_.length > 1 ? name_.at(1) : "",
                        social_login: "facebook",
                        social_login_id: user.id,
                        phone_number: "",
                        password: "--",
                        last_used_key: randomUUID(),
                        verification_code: randomUUID(),
                        verification_time: new Date(),
                        status: UserStatus.ACTIVE,
                        type: UserType.USER,
                      };

                      UserDAL.create(payload, transaction)
                        .then((result) => {
                          let userData = result.toJSON();
                          // TODO use attribute exclude
                          delete userData.password;
                          delete userData.last_used_key;
                          ActionLogService.handleCreate({
                            action: LogActions.CREATE,
                            object: ModelName,
                            prev_data: {},
                            new_data: userData,
                          });
                          done(null, {
                            obj: userData,
                            transaction: transaction,
                          });
                        })
                        .catch((error) =>
                          done(new InternalServerError(error), {
                            obj: null,
                            transaction: transaction,
                          })
                        );
                    } else {
                      try {
                        const token = jwt.sign(
                          { id: _user.id, key: _user.last_used_key },
                          env.AUTH_KEY,
                          {
                            expiresIn: env.AUTH_KEY_EXPIRY,
                          }
                        );
                        let userData = _user.toJSON();
                        // TODO use attribute exclude
                        delete userData.password;
                        delete userData.last_used_key;
                        done(null, {
                          obj: { token: token, user: userData },
                          transaction: transaction,
                        });
                      } catch (error: any) {
                        done(new InternalServerError(error));
                      }
                    }
                  })
                  .catch((error) =>
                    done(new InternalServerError(error), {
                      obj: null,
                      transaction: transaction,
                    })
                  );
              }
            }
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
   *
   *
   * @static
   * @param {Partial<User>} payload
   * @memberof UserService
   */
  static register = (
    payload: Omit<User, NullishPropertiesOf<User>>
  ): Promise<User> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            UserDAL.findOne({
              where: {
                email: payload.email.toLowerCase(),
              },
            })
              .then((_user) => {
                if (!_user) {
                  done(null, transaction);
                } else {
                  done(new BadRequestError([`Email Already Registered`]));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            bcrypt
              .hash(payload["password"], 10)
              .then(async (hashed) => {
                payload.email = payload.email.toLowerCase();
                payload.password = hashed;
                payload.last_used_key = randomUUID();
                payload.verification_code = randomUUID();
                payload.verification_time = new Date();
                payload.status = UserStatus.PENDING;

                const forbiddenTypes = [UserType.SUPER_ADMIN, UserType.ADMIN];

                if (typeof payload.role_id === "string") {
                  // Find role by ID
                  const role = await RoleDAL.findById(payload.role_id);
                  if (!role) return done(new BadRequestError(["Invalid role"]));
                  if (forbiddenTypes.includes(role.type)) {
                    return done(new BadRequestError(["You are not allowed to use this role"]));
                  }

                  payload.role_id = role.id;
                  payload.type = role.type; // Setting type based on the role
                } else {
                  const role = await RoleDAL.findById(payload.role_id);
                  if (!role) return done(new BadRequestError(["Invalid role"]));

                  if (forbiddenTypes.includes(role.name)) {
                    return done(new BadRequestError(["You are not allowed to use this role"]));
                  }

                  payload.type = role.type; // Setting type based on the role
                }

                done(null, transaction);
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              );
          },
          (transaction: Transaction, done: Function) => {
            UserDAL.create(payload, transaction)
              .then((result) => {
                done(null, transaction, result);
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              );
          },
          (transaction: Transaction, user: User, done: Function) => {
            UserProfileDAL.create({ user_id: user.id }, transaction)
              .then((result) => {
                if (result) {
                  ActionLogService.handleCreate({
                    action: LogActions.CREATE,
                    object: "UserProfile",
                    prev_data: {},
                    new_data: result,
                  });
                }
                done(null, transaction, user);
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              );
          },
          (transaction: Transaction, user: User, done: Function) => {
            EmailService.getInstance().sendMail({
              from: env.COMPANY_EMAIL,
              subject: "Email Verification",
              to: user.email,
              html: EmailService.verificationEmail(
                user.first_name,
                `${env.BACKEND_URL}/auth/verify?email=${user.email}&code=${user.verification_code}`,
                env.COMPANY_NAME
              ),
            });
            done(null, user, { obj: user, transaction: transaction });
          },
          (obj: any, result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.CREATE,
              object: ModelName,
              prev_data: {},
              new_data: obj,
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
   *
   *
   * @static
   * @memberof UserService
   * @param email
   * @param code
   */
  static verify = (email: string, code: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            UserDAL.findOne({
              where: {
                email: email.toLowerCase(),
                verification_code: code,
                status: UserStatus.PENDING,
              },
            })
              .then((user) => {
                if (user) {
                  const differenceMs: number =
                    new Date().getTime() -
                    (
                      user.verification_time ?? new Date("2000-01-01")
                    ).getTime();
                  const hourDifference = differenceMs / (1000 * 60 * 60);
                  if (hourDifference < env.VERIFICATION_EXPIRY) {
                    done(null, transaction, user);
                  } else {
                    done(
                      new BadRequestError([`Verification Link Has Expired`])
                    );
                  }
                } else {
                  done(new BadRequestError([`Failed To Verify User`]));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, user: User, done: Function) => {
            let userData: any = {
              status: UserStatus.ACTIVE,
              verification_time: new Date(),
            };
            UserDAL.update(user, userData)
              .then((_user) => {
                done(null, _user, { obj: user, transaction: transaction });
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (obj: any, result: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.UPDATE,
              object: ModelName,
              prev_data: obj,
              new_data: result.obj,
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
   *
   *
   * @static
   * @memberof UserService
   * @param email
   * @param code
   */
  static recover = (
    email: string,
    code: string
  ): Promise<{ email: string; code: string }> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            UserDAL.findOne({
              where: {
                email: email.toLowerCase(),
                verification_code: code,
              },
            })
              .then((user) => {
                if (user) {
                  const now = new Date().getTime();
                  const recovery_request_time = (
                    user.recovery_request_time ?? new Date("2000-01-01")
                  ).getTime();
                  const differenceMs: number = now - recovery_request_time;
                  const hourDifference = differenceMs / (1000 * 60 * 60);
                  if (hourDifference < env.RECOVERY_EXPIRY) {
                    done(null, {
                      obj: { email: user.email, code: user.verification_code },
                      transaction: transaction,
                    });
                  } else {
                    done(new BadRequestError([`Recovery Link Has Expired`]));
                  }
                } else {
                  done(new BadRequestError([`Failed To Verify User`]));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
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
   *
   *
   * @static
   * @memberof UserService
   * @param email
   * @param code
   * @param password
   */
  static changePasswordOnRecovery = (
    email: string,
    code: string,
    password: string
  ): Promise<User> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            UserDAL.findOne({
              where: {
                email: email.toLowerCase(),
                verification_code: code,
              },
            })
              .then((user) => {
                if (user) {
                  const differenceMs: number =
                    new Date().getTime() -
                    (
                      user.recovery_request_time ?? new Date("2000-01-01")
                    ).getTime();
                  const hourDifference = differenceMs / (1000 * 60 * 60);
                  if (hourDifference < env.RECOVERY_EXPIRY) {
                    done(null, transaction, user);
                  } else {
                    done(new BadRequestError([`Recovery Link Has Expired`]));
                  }
                } else {
                  done(new BadRequestError([`Failed To Verify User`]));
                }
              })
              .catch((error) =>
                done(new InternalServerError(error), {
                  obj: null,
                  transaction: transaction,
                })
              );
          },
          (transaction: Transaction, user: User, done: Function) => {
            bcrypt
              .hash(password, 10)
              .then((hashed) => {
                done(null, transaction, user, hashed);
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
            user: User,
            hashed: string,
            done: Function
          ) => {
            let userData: any = {
              password: hashed,
              recovery_time: new Date(),
              last_used_key: randomUUID(),
              verification_code: randomUUID(),
            };
            UserDAL.update(user, userData)
              .then((_user) => {
                done(null, _user, { obj: user, transaction: transaction });
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
              new_data: result.obj,
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
  ): Promise<{ rows: User[]; count: number }> => {
    return new Promise((resolve, reject) => {
      // let authOptions = UserService.AuthOptions(user, options, paranoid);
      const authOptions = this.AuthOptions(user, {
        ...options,
        where: {
          ...options.where,
          email: {
            [Symbol.for('notLike')]: '%@boingo.ai%',
          },
        },
      }, paranoid);
      UserDAL.findMany(authOptions.options, authOptions.paranoid)
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
  ): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      let authOptions = UserService.AuthOptions(user, options, paranoid);
      UserDAL.findById(id, {...authOptions.options, include: [{model: Cart}]}, authOptions.paranoid)
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
  ): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      let authOptions = UserService.AuthOptions(user, options, paranoid);
      UserDAL.findOne(authOptions.options, authOptions.paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  static login = (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            UserDAL.findOne({
              where: {
                [Op.or]: [
                  { email: email.toLowerCase() },
                  { phone_number: email.toLowerCase() },
                ],
              },
              include: [Role],
            })
              .then((user) => {
                if (user) {
                  if (user.status === UserStatus.ACTIVE) {
                    done(null, user);
                  } else if (user.status === UserStatus.PENDING) {
                    done(
                      new UnauthorizedError(
                        "Email not yet verified. Please verify your email to login"
                      )
                    );
                  } else {
                    done(
                      new ForbiddenError(
                        "User account has been deactivated!\n Please contact System Administrators"
                      )
                    );
                  }
                } else {
                  done(new UnauthorizedError("Invalid Login Credentials"));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (user: User, done: Function) => {
            bcrypt
              .compare(password, user.password)
              .then((result) => {
                if (result) {
                  done(null, user);
                } else {
                  done(new UnauthorizedError("Invalid Login Credentials"));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (user: User, done: Function) => {
            try {
              const token = jwt.sign(
                { id: user.id, key: user.last_used_key },
                env.AUTH_KEY,
                {
                  expiresIn: env.AUTH_KEY_EXPIRY,
                }
              );
              let userData = user.toJSON();
              // TODO use attribute exclude
              delete userData.password;
              delete userData.last_used_key;
              done(null, { token: token, user: userData });
            } catch (error: any) {
              done(new InternalServerError(error));
            }
          },
        ],
        (error, result: any) => {
          if (!error) {
            if (result) {
              resolve(result);
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

  static changePassword = (
    id: string,
    previous_password: string,
    new_password: string
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            UserDAL.findById(id)
              .then((user) => {
                if (user) {
                  if (user.status === UserStatus.ACTIVE) {
                    done(null, user);
                  } else {
                    done(
                      new ForbiddenError(
                        "User account has been deactivated!\n Please contact System Administrators"
                      )
                    );
                  }
                } else {
                  done(new NotFoundError("User Not Found"));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (user: User, done: Function) => {
            bcrypt
              .compare(previous_password, user.password)
              .then((result) => {
                if (result) {
                  done(null, user);
                } else {
                  done(new UnauthorizedError("Incorrect Password"));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (user: User, done: Function) => {
            bcrypt
              .hash(new_password, 10)
              .then((hashed) => {
                done(null, user, hashed);
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (user: User, hashed: string, done: Function) => {
            UserDAL.update(user, {
              password: hashed,
              last_used_key: randomUUID(),
              verification_code: randomUUID(),
            })
              .then((result) => {
                ActionLogService.handleCreate({
                  action: "Change Password",
                  object: ModelName,
                  prev_data: {},
                  new_data: result,
                  user_id: user.id,
                });
                done(null, true);
              })
              .catch((error) => done(new InternalServerError(error)));
          },
        ],
        (error, result: any) => {
          if (!error) {
            if (result) {
              resolve(result);
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

  static forgotPassword = (email: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            UserDAL.findOne({
              where: {
                email: email,
              },
            })
              .then((user) => {
                if (user) {
                  if (user.status === UserStatus.ACTIVE) {
                    if (user.password !== "--") {
                      done(null, user);
                    } else {
                      done(
                        new ForbiddenError(
                          "Access denied: This account is restricted to Single Sign-On (SSO) authentication only."
                        )
                      );
                    }
                  } else {
                    done(
                      new ForbiddenError(
                        "User account has been deactivated!\n Please contact System Administrators"
                      )
                    );
                  }
                } else {
                  done(new NotFoundError("User Not Found"));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (user: User, done: Function) => {
            UserDAL.update(user, {
              verification_code: randomUUID(),
              recovery_request_time: new Date(),
            })
              .then((result) => {
                EmailService.getInstance().sendMail({
                  from: env.COMPANY_EMAIL,
                  subject: "Password Recovery",
                  to: user.email,
                  html: EmailService.recoveryEmail(
                    user.first_name,
                    `${env.BACKEND_URL}/auth/recover?email=${user.email}&code=${result.verification_code}`,
                    env.COMPANY_NAME
                  ),
                });
                done(null, result);
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (user: User, done: Function) => {
            ActionLogService.handleCreate({
              action: "Password Recovery Request",
              object: ModelName,
              prev_data: {},
              new_data: user,
              user_id: user.id,
            });
            done(null, true);
          },
        ],
        (error, result: any) => {
          if (!error) {
            if (result) {
              resolve(result);
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

  static changeUserPassword = (
    user: User,
    user_id: string,
    password: string
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            UserDAL.findById(user_id)
              .then((_user) => {
                if (_user) {
                  done(null, _user);
                } else {
                  done(new NotFoundError("User Not Found"));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (_user: User, done: Function) => {
            bcrypt
              .hash(password, 10)
              .then((hashed) => {
                done(null, _user, hashed);
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (_user: User, hashed: string, done: Function) => {
            UserDAL.update(_user, {
              password: hashed,
              last_used_key: randomUUID(),
            })
              .then((result) => {
                ActionLogService.handleCreate({
                  action: "Change User Password",
                  object: ModelName,
                  prev_data: {},
                  new_data: result,
                  user_id: user.id,
                });
                done(null, true);
              })
              .catch((error) => done(new InternalServerError(error)));
          },
        ],
        (error, result: any) => {
          if (!error) {
            if (result) {
              resolve(result);
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

  static revokeTokens = (user: User, user_id: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            UserDAL.findById(user_id)
              .then((_user) => {
                if (_user) {
                  done(null, _user);
                } else {
                  done(new NotFoundError("User Not Found"));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (_user: User, done: Function) => {
            try {
              UserDAL.update(_user, { last_used_key: randomUUID() })
                .then((result) => {
                  ActionLogService.handleCreate({
                    action: "Revoke Token",
                    object: ModelName,
                    prev_data: {},
                    new_data: result,
                    user_id: user.id,
                  });
                  done(null, true);
                })
                .catch((error) => done(new InternalServerError(error)));
            } catch (error: any) {
              done(new InternalServerError(error));
            }
          },
        ],
        (error, result: any) => {
          if (!error) {
            if (result) {
              resolve(result);
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

  static update = (
    user: User,
    id: string,
    payload: Omit<User, NullishPropertiesOf<User>>,
    options?: any
  ): Promise<User> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            UserDAL.findById(id, options)
              .then((_user) => {
                if (_user) {
                  done(null, transaction, _user);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, _user: User, done: Function) => {
            if (payload.role_id) {
              RoleDAL.findById(payload.role_id)
                .then((role) => {
                  let _type = payload.type ?? _user.type;
                  if (role) {
                    done(null, transaction, _user);
                  } else {
                    done(new NotFoundError(`Role Not Found`), {
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
            } else {
              done(null, transaction, _user);
            }
          },
          (transaction: Transaction, _user: User, done: Function) => {
            const __user = { ..._user.toJSON() };
            UserDAL.update(_user, payload, transaction)
              .then((result) => {
                done(null, __user, { obj: result, transaction: transaction });
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
            UserDAL.findById(id, options, force)
              .then((_user) => {
                if (_user && _user.id !== user.id) {
                  done(null, transaction, _user);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, _user: User, done: Function) => {
            UserDAL.delete({ id: _user.id }, transaction, force)
              .then((result) => {
                done(null, _user, { obj: result, transaction: transaction });
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
            UserDAL.findById(id, options, true)
              .then((_user) => {
                if (_user) {
                  done(null, transaction, _user);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, _user: User, done: Function) => {
            UserDAL.restore({ id: _user.id }, transaction)
              .then((result) => {
                done(null, _user, { obj: result, transaction: transaction });
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

  static toggleIsVerified = (
    user: User,
    id: string,
    payload: { id: string; is_verified: boolean },
    options?: any
  ): Promise<User> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            UserDAL.findById(id, options)
              .then((_user) => {
                if (_user) {
                  done(null, transaction, _user);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, _user: User, done: Function) => {
            const updated_user: Partial<User> = {
              ..._user,
              is_verified: payload.is_verified
            }
            const __user = { ..._user.toJSON() };
            UserDAL.update(_user, updated_user, transaction)
              .then((result) => {
                done(null, __user, { obj: result, transaction: transaction });
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

}

export default UserService;