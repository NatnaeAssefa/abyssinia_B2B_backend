import async from "async";
import { RoleDAL, UserDAL } from "../../dals/User";
import { InternalServerError } from "../../errors/Errors";
import { Role, User } from "../../models/User";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { ActionLogService } from "../User";
import { AccessType, LogActions } from "../../utilities/constants/Constants";
import { access_rules, constants } from "../../config";
import { ConfigDAL } from "../../dals/System";

class SystemService {
  /**
   * Initialize System
   *
   * @static
   * @memberof SystemService
   */
  static initSystem = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            RoleDAL.findOne({
              where: {
                name: constants.BROKER_ROLE,
              },
            })
              .then((role) => {
                if (role) {
                  done(null);
                } else {
                  let _access_rules: string[] = [];
                  access_rules.map((item) => {
                    for (let rule of item.rules) {
                      if (rule.type === AccessType.ADMIN) {
                        _access_rules.push(rule.name);
                      }
                    }
                  });
                  RoleDAL.create({
                    name: constants.BROKER_ROLE,
                    access_rules: _access_rules,
                    type: AccessType.ADMIN,
                  })
                    .then(() => {
                      done(null);
                    })
                    .catch((error) => done(new InternalServerError(error)));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (done: Function) => {
            RoleDAL.findOne({
              where: {
                name: constants.BASE_ROLE,
              },
            })
              .then((role) => {
                if (role) {
                  done(null, role);
                } else {
                  let _access_rules: string[] = [];
                  access_rules.map((item) => {
                    for (let rule of item.rules) {
                      _access_rules.push(rule.name);
                    }
                  });
                  RoleDAL.create({
                    name: constants.BASE_ROLE,
                    access_rules: _access_rules,
                    type: AccessType.SUPER_ADMIN,
                    id: constants.BASE_ROLE_ID,
                  })
                    .then((result) => {
                      done(null, result);
                    })
                    .catch((error) => done(new InternalServerError(error)));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (role: Role, done: Function) => {
            bcrypt
              .hash(constants.BASE_PASSWORD, 10)
              .then((hashed) => {
                done(null, role, hashed);
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (role: Role, hashed: string, done: Function) => {
            UserDAL.findOne({
              where: {
                email: constants.BASE_EMAIL,
              },
            })
              .then((user) => {
                if (user) {
                  done(null, user, false);
                } else {
                  UserDAL.create({
                    email: constants.BASE_EMAIL,
                    password: hashed,
                    last_used_key: randomUUID(),
                    first_name: constants.BASE_FIRST_NAME,
                    last_name: constants.BASE_LAST_NAME,
                    phone_number: constants.BASE_PHONE_NUMBER,
                    type: constants.BASE_TYPE,
                    role_id: role.id,
                  })
                    .then((result) => {
                      done(null, result, true);
                    })
                    .catch((error) => done(new InternalServerError(error)));
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (user: User, _new: boolean, done: Function) => {
            ConfigDAL.findOne({
              where: {
                key: constants.SYSTEM_CONFIG_KEY,
              },
            })
              .then((config) => {
                if (config) {
                  ConfigDAL.update(config, {
                    object_type: constants.SYSTEM_CONFIG_TYPE,
                    value: constants.SYSTEM_CONFIG_VALUE,
                  })
                    .then((update) => {
                      done(null, user, _new);
                    })
                    .catch((error) => done(new InternalServerError(error)));
                } else {
                  ConfigDAL.create({
                    key: constants.SYSTEM_CONFIG_KEY,
                    object_type: constants.SYSTEM_CONFIG_TYPE,
                    value: constants.SYSTEM_CONFIG_VALUE,
                  })
                    .then((update) => {
                      done(null, user, _new);
                    })
                    .catch((error) => done(new InternalServerError(error)));
                }
              })
              .catch((error) => done(new InternalServerError()));
          },
          (user: User, _new: boolean, done: Function) => {
            if (_new) {
              ActionLogService.handleCreate({
                action: LogActions.CREATE,
                object: "System",
                prev_data: {},
                new_data: user,
                user_id: user.id,
              });
            }
            done(null, true);
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
}

export default SystemService;
