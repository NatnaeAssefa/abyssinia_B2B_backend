import { Transaction } from "sequelize";
import { Cart, CartItem, Product, ProductImage } from "../../models/MarketPlace";
import { CartItemDAL } from "../../dals/MarketPlace";
import async from "async";
import { createTransaction } from "../../utilities/database/sequelize";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../errors/Errors";
import { NullishPropertiesOf } from "sequelize/types/utils";
import { CartDAL } from "../../dals/MarketPlace";
import { LogActions } from "../../utilities/constants/Constants";
import { ActionLogService } from "../User";
import { User } from "../../models/User";

const ModelName = "Cart";

class CartService {
  /**
   *
   *
   * @static
   * @param user
   * @param {Partial<Cart>} payload
   * @memberof CartService
   */
  static create = (
    user: User,
    payload: Omit<Cart, NullishPropertiesOf<Cart>>
  ): Promise<Cart> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            CartDAL.create(payload, transaction)
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
    options: any,
    paranoid?: boolean
  ): Promise<{ rows: Cart[]; count: number }> => {
    return new Promise((resolve, reject) => {
      CartDAL.findMany(options, paranoid)
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
  ): Promise<Cart | null> => {
    return new Promise((resolve, reject) => {
      CartDAL.findById(id, options, paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  static findOne = (
    options: any,
    paranoid?: boolean
  ): Promise<Cart | null> => {
    return new Promise((resolve, reject) => {
      CartDAL.findOne(options, paranoid)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };

  static update = (
    user: User,
    id: string,
    payload: Omit<Cart, NullishPropertiesOf<Cart>>,
    options?: any
  ): Promise<Cart> => {
    return new Promise((resolve, reject) => {
      async.waterfall(
        [
          (done: Function) => {
            createTransaction()
              .then((transaction) => done(null, transaction))
              .catch((error) => reject(new InternalServerError(error)));
          },
          (transaction: Transaction, done: Function) => {
            CartDAL.findById(id, options)
              .then((Cart) => {
                if (Cart) {
                  done(null, transaction, Cart);
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
          (transaction: Transaction, Cart: Cart, done: Function) => {
            const _Cart = { ...Cart.toJSON() };
            CartDAL.update(Cart, payload, transaction)
              .then((result) => {
                done(null, _Cart, { obj: result, transaction: transaction });
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
            CartDAL.findById(id, options, force)
              .then((Cart) => {
                if (Cart) {
                  done(null, transaction, Cart);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, Cart: Cart, done: Function) => {
            CartDAL.delete({ id: Cart.id }, transaction, force)
              .then((result) => {
                done(null, Cart, { obj: result, transaction: transaction });
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
            CartDAL.findById(id, options, true)
              .then((Cart) => {
                if (Cart) {
                  done(null, transaction, Cart);
                } else {
                  done(new NotFoundError(`${ModelName} Not Found`), {
                    obj: null,
                    transaction: transaction,
                  });
                }
              })
              .catch((error) => done(new InternalServerError(error)));
          },
          (transaction: Transaction, Cart: Cart, done: Function) => {
            CartDAL.restore({ id: Cart.id }, transaction)
              .then((result) => {
                done(null, Cart, { obj: result, transaction: transaction });
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

  /** Storefront: get or create cart for the authenticated user */
  static getOrCreateForUser = (userId: string): Promise<Cart> => {
    return CartDAL.findOne({ where: { user_id: userId } }).then((cart) => {
      if (cart) return cart;
      return CartDAL.create({ user_id: userId });
    });
  };

  /** Storefront: cart with line items and product details */
  static getWithItemsForUser = (userId: string): Promise<Cart & { items?: CartItem[] }> => {
    return CartDAL.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
              include: [{ model: ProductImage, as: "product_images", required: false }],
            },
          ],
        },
      ],
    }).then(async (cart) => {
      if (!cart) {
        const created = await CartDAL.create({ user_id: userId });
        const plain = created.toJSON() as Cart & { items?: CartItem[] };
        plain.items = [];
        return plain;
      }
      const json = cart.toJSON() as Cart & { cart_items?: CartItem[]; items?: CartItem[] };
      json.items = json.cart_items ?? json.items ?? [];
      return json;
    });
  };

  /** Storefront: add or update a line item */
  static addItemForUser = (
    user: User,
    productId: string,
    quantity: string,
    notes?: string | null
  ): Promise<CartItem> => {
    return new Promise((resolve, reject) => {
      createTransaction()
        .then(async (transaction) => {
          try {
            let cart = await CartDAL.findOne(
              { where: { user_id: user.id } },
              false
            );
            if (!cart) {
              cart = await CartDAL.create({ user_id: user.id }, transaction);
            }
            const existing = await CartItemDAL.findOne(
              {
                where: { cart_id: cart.id, product_id: productId },
              },
              false
            );
            let item: CartItem;
            if (existing) {
              item = await CartItemDAL.update(
                existing,
                {
                  quantity,
                  notes: notes ?? existing.notes,
                },
                transaction
              );
            } else {
              item = await CartItemDAL.create(
                {
                  cart_id: cart.id,
                  product_id: productId,
                  quantity,
                  notes: notes ?? null,
                },
                transaction
              );
            }
            await transaction.commit();
            resolve(item);
          } catch (error) {
            await transaction.rollback();
            reject(new InternalServerError(error as string));
          }
        })
        .catch((error) => reject(new InternalServerError(error)));
    });
  };
}

export default CartService;
