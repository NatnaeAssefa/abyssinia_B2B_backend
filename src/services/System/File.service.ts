import { Transaction } from "sequelize";
import { File } from "../../models/System";
import async from "async";
import { createTransaction } from "../../utilities/database/sequelize";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../errors/Errors";
import { NullishPropertiesOf } from "sequelize/types/utils";
import { FileDAL } from "../../dals/System";
import { LogActions } from "../../utilities/constants/Constants";
import { ActionLogService } from "../User";
import { User } from "../../models/User";
import fs from "fs"

const ModelName = "File";

class FileService {
  /**
   *
   *
   * @static
   * @param user
   * @param {Partial<File>} payload
   * @memberof FileService
   */
  static create = (
    user: User,
    payload: Omit<File, NullishPropertiesOf<File>>
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            FileDAL.create(payload, transaction)
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
              user_id: user?.id,
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

  static async saveFileFromUrl(
    user: User,
    fileUrl: string,
    originalPath: string,
    watermarkedPath: string
  ) {
    return new Promise(async (resolve, reject) => {
      const transaction = await createTransaction();

      try {
        // Store original file
        const originalFile = {
          name: originalPath.split('/').pop(),
          type: 'image/jpeg',
          size: fs.statSync(originalPath).size,
          path: originalPath,
          source: fileUrl
        };

        const savedOriginal = await FileDAL.create(originalFile, transaction);

        // Store watermarked file
        const watermarkedFile = {
          ...originalFile,
          path: watermarkedPath
        };

        const savedWatermarked = await FileDAL.create(watermarkedFile, transaction);

        await transaction.commit();
        resolve({ original: savedOriginal, watermarked: savedWatermarked });
      } catch (error) {
        await transaction.rollback();
        reject(error);
      }
    });
  }

  // static saveFileFromUrl = (
  //   user: User,
  //   fileUrl: string,
  //   originalPath: string,
  //   watermarkedPath: string
  // ): Promise<{ status: number; message: string; data: any }> => {
  //   return new Promise((resolve, reject) => {
  //     async.waterfall(
  //       [
  //         (done: Function) => {
  //           createTransaction()
  //             .then((transaction) => done(null, transaction))
  //             .catch((error) => done(new InternalServerError(error)));
  //         },
  //         (transaction: Transaction, done: Function) => {
  //           const originalFile = {
  //             name: originalPath.split('/').pop(),
  //             type: 'image/jpeg',
  //             size: fs.statSync(originalPath).size,
  //             path: originalPath,
  //             source: fileUrl
  //           };

  //           FileDAL.create(originalFile, transaction)
  //             .then((savedOriginal) => {
  //               const watermarkedFile = {
  //                 ...originalFile,
  //                 path: watermarkedPath
  //               };

  //               FileDAL.create(watermarkedFile, transaction)
  //                 .then((savedWatermarked) => {
  //                   done(null, savedOriginal, savedWatermarked, transaction);
  //                 })
  //                 .catch((error) =>
  //                   done(new InternalServerError(error), null, null, transaction)
  //                 );
  //             })
  //             .catch((error) =>
  //               done(new InternalServerError(error), null, null, transaction)
  //             );
  //         },
  //         (savedOriginal: any, savedWatermarked: any, transaction: Transaction, done: Function) => {
  //           ActionLogService.handleCreate({
  //             action: LogActions.CREATE,
  //             object: ModelName,
  //             prev_data: {},
  //             new_data: { original: savedOriginal, watermarked: savedWatermarked },
  //             user_id: user?.id,
  //           });
  //           done(null, savedOriginal, savedWatermarked, transaction);
  //         },
  //       ],
  //       (error, result: { obj: any; transaction: Transaction } | undefined) => {
  //         if (!error) {
  //           if (result && result.transaction) {
  //             resolve(result.obj);
  //             result.transaction.commit();
  //           } else {
  //             reject(new InternalServerError("Dead End"));
  //           }
  //         } else {
  //           reject(error);
  //           if (result && result.transaction) {
  //             result.transaction.rollback();
  //           } else {
  //             reject(new InternalServerError("Dead End"));
  //           }
  //         }

  //       }
  //     );
  //   });
  // };


  static createBulk = (
    user: User,
    payload: Omit<File, NullishPropertiesOf<File>>[]
  ): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            let files: any[] = [];
            async.eachSeries(
              payload,
              (file: Partial<File>, callback) => {
                FileDAL.create(file)
                  .then((file) => {
                    // Convert Sequelize model to plain object to avoid circular references
                    files.push(file.get({ plain: true }));
                    callback(null);
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
                  done(null, {
                    obj: files,
                    transaction: transaction,
                  });
                }
              }
            );
          },
          (obj: any, done: Function) => {
            ActionLogService.handleCreate({
              action: LogActions.CREATE,
              object: ModelName,
              prev_data: {},
              new_data: obj,
              user_id: user.id,
            });
            done(null, obj);
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
    options: any,
    paranoid?: boolean
  ): Promise<{ rows: File[]; count: number }> => {
    return new Promise((resolve, reject) => {
      FileDAL.findMany(options, paranoid)
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
  ): Promise<File | null> => {
    return new Promise((resolve, reject) => {
      FileDAL.findById(id, options, paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  static findOne = (options: any, paranoid?: boolean): Promise<File | null> => {
    return new Promise((resolve, reject) => {
      FileDAL.findOne(options, paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  static update = (
    user: User,
    id: string,
    payload: Omit<File, NullishPropertiesOf<File>>,
    options?: any
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            FileDAL.findById(id, options)
              .then((file) => {
                if (file) {
                  done(null, transaction, file);
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
          (transaction: Transaction, file: File, done: Function) => {
            const _file = { ...file.toJSON() };
            FileDAL.update(file, payload, transaction)
              .then((result) => {
                done(null, _file, { obj: result, transaction: transaction });
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
            FileDAL.findById(id, options, force)
              .then((file) => {
                if (file) {
                  done(null, transaction, file);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, file: File, done: Function) => {
            FileDAL.delete({ id: file.id }, transaction, force)
              .then((result) => {
                done(null, file, { obj: result, transaction: transaction });
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
            FileDAL.findById(id, options, true)
              .then((file) => {
                if (file) {
                  done(null, transaction, file);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, file: File, done: Function) => {
            FileDAL.restore({ id: file.id }, transaction)
              .then((result) => {
                done(null, file, { obj: result, transaction: transaction });
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

export default FileService;
