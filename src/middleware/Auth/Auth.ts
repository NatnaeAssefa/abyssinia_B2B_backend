import { UserDAL } from "../../dals/User";
import jwt from "jsonwebtoken";
import { constants, env } from "../../config";
import { UserStatus, UserType } from "../../utilities/constants/Constants";
import { Role, User } from "../../models/User";
import { UnauthorizedError } from "../../errors/Errors";
import ServerResponse from "../../utilities/response/Response";
import { Op } from "sequelize";

export const VerifyJWT = (auth: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!auth || auth.split(" ").length !== 2) {
      return reject(new UnauthorizedError("Invalid Authorization Header"));
    }
    const token = auth.split(" ")[1];
    jwt.verify(token, env.AUTH_KEY, function (err: any, decoded: any) {
      if (err) {
        reject(new UnauthorizedError("Invalid Token"));
      } else {
        resolve(decoded);
      }
    });
  });
};

export const AuthenticateUser = (req: any, res: any, next: any) => {
  try {
    const startTime = new Date();
    const token = req.headers["authorization"];
    VerifyJWT(token)
      .then((data) => {
        UserDAL.findOne({
          where: {
            id: data.id,
          },
          include: [Role],
        })
          .then((user) => {
            if (user) {
              if (user.status === UserStatus.ACTIVE) {
                if (user.last_used_key === data.key) {
                  let userData = user.toJSON();
                  delete userData.password; // TODO use attribute exclude
                  delete userData.last_used_key;
                  req.user = userData;
                  next();
                } else {
                  ServerResponse(
                    req,
                    res,
                    401,
                    ["Token has been revoked!"],
                    "Revoked Token",
                    startTime
                  );
                }
              } else {
                ServerResponse(
                  req,
                  res,
                  401,
                  [
                    "User account has been deactivated! Please contact System Administrators",
                  ],
                  "User Inactive",
                  startTime
                );
              }
            } else {
              ServerResponse(req, res, 401, null, "Invalid Token", startTime);
            }
          })
          .catch((error) => {
            ServerResponse(req, res, 401, error, "Invalid Token", startTime);
          });
      })
      .catch((error) => {
        ServerResponse(req, res, 401, error, "Authorization Error", startTime);
      });
  } catch (e) {
    res
      .status(500)
      .send({ status: 500, data: null, message: "Internal Server Error" });
  }
};

export const AuthenticatePossibleUser = (req: any, res: any, next: any) => {
  try {
    const startTime = new Date();
    const token = req.headers["authorization"];
    if (token) {
      VerifyJWT(token)
        .then((data) => {
          UserDAL.findOne({
            where: {
              id: data.id,
            },
            include: [Role],
          })
            .then((user) => {
              if (user) {
                if (user.status === UserStatus.ACTIVE) {
                  if (user.last_used_key === data.key) {
                    let userData = user.toJSON();
                    delete userData.password; // TODO use attribute exclude
                    delete userData.last_used_key;
                    req.user = userData;
                    next();
                  } else {
                    ServerResponse(
                      req,
                      res,
                      401,
                      ["Token has been revoked!"],
                      "Revoked Token",
                      startTime
                    );
                  }
                } else {
                  ServerResponse(
                    req,
                    res,
                    401,
                    [
                      "User account has been deactivated! Please contact System Administrators",
                    ],
                    "User Inactive",
                    startTime
                  );
                }
              } else {
                ServerResponse(req, res, 401, null, "Invalid Token", startTime);
              }
            })
            .catch((error) => {
              ServerResponse(req, res, 401, error, "Invalid Token", startTime);
            });
        })
        .catch((error) => {
          ServerResponse(
            req,
            res,
            401,
            error,
            "Authorization Error",
            startTime
          );
        });
    } else {
      next();
    }
  } catch (e) {
    res
      .status(500)
      .send({ status: 500, data: null, message: "Internal Server Error" });
  }
};

export const VerifyAccess = (access_rules: string[], role: Role): boolean => {
  try {
    for (let access_rule of access_rules) {
      if (role.access_rules.indexOf(access_rule) === -1) {
        return false;
      }
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const GlobalAuthOptions = (
  user: User,
  options: any,
  include: any,
  paranoid?: boolean
) => {
  include = user.type !== UserType.SUPER_ADMIN ? include : null;
  if (include) {
    options.include = options.include
      ? [...options.include, include]
      : [include];
  }

  if (include) {
    options.include = options.include
      ? [...options.include, include]
      : [include];
  }

  if (paranoid) {
    paranoid = VerifyAccess(["access_paranoid"], user.role);
  }

  return { options: options, paranoid: paranoid ?? false };
};

export const GlobalAuthOptionsNew = (
  user: User,
  options: any,
  include: any,
  where?: any,
  paranoid?: boolean
) => {
  if (!options) {
    options = {};
  }

  if (!user) {
    return { options: options, paranoid: true };
  }

  include = user.type !== UserType.SUPER_ADMIN ? include : null;
  if (include) {
    options.include = options.include
      ? [...options.include, include]
      : [include];
  }

  where = user.type !== UserType.SUPER_ADMIN ? where : null;
  if (where) {
    options.where = options.where
      ? {
          [Op.and]: [options.where, where],
        }
      : where;
  }

  if (paranoid) {
    paranoid = VerifyAccess(["access_paranoid"], user.role);
  }

  return { options: options, paranoid: paranoid ?? false };
};

export const AuthorizeAccess = (access_rules: string[]) => {
  return (req: any, res: any, next: any) => {
    try {
      let user: User = req.user;
      if (
        user.role_id &&
        (user.role_id === constants.BASE_ROLE_ID ||
          VerifyAccess(access_rules, user.role))
      ) {
        next();
      } else {
        res
          .status(403)
          .send({ status: 403, data: null, message: "Unauthorized Access" });
      }
    } catch (e) {
      res
        .status(500)
        .send({ status: 500, data: null, message: "Internal Server Error" });
    }
  };
};

export default { AuthenticateUser, AuthorizeAccess };
