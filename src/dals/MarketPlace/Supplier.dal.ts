import { Transaction } from "sequelize";
import { Supplier as BaseModel } from "../../models/MarketPlace";
import BaseDAL from "../Base.dal";

class SupplierDAL {
  /**
   *
   *
   * @static
   * @param {Partial<BaseModel>} payload
   * @param {Transaction} t
   * @memberof SupplierDAL
   */
  static create = (
    payload: Partial<BaseModel>,
    t?: Transaction
  ): Promise<BaseModel> => {
    return BaseDAL.create<BaseModel>(BaseModel, payload, t);
  };

  /**
   *
   *
   * @static
   * @param {*} options
   * @param paranoid
   * @memberof SupplierDAL
   */
  static findMany = (
    options: any,
    paranoid = false
  ): Promise<{ rows: BaseModel[]; count: number }> => {
    return BaseDAL.findMany<BaseModel>(BaseModel, options, paranoid);
  };

  /**
   *
   *
   * @static
   * @param id
   * @param options
   * @param paranoid
   * @memberof SupplierDAL
   */
  static findById = (
    id: string,
    options?: any,
    paranoid = false
  ): Promise<BaseModel | null> => {
    return BaseDAL.findById<BaseModel>(BaseModel, id, options, paranoid);
  };

  /**
   *
   *
   * @static
   * @param {*} options
   * @param paranoid
   * @memberof SupplierDAL
   */
  static findOne = (
    options: any,
    paranoid = false
  ): Promise<BaseModel | null> => {
    return BaseDAL.findOne<BaseModel>(BaseModel, options, paranoid);
  };

  /**
   *
   *
   * @static
   * @param obj
   * @param {Partial<BaseModel>} payload
   * @param t
   * @memberof SupplierDAL
   */
  static update = (
    obj: BaseModel,
    payload: Partial<BaseModel>,
    t?: Transaction
  ): Promise<BaseModel> => {
    return BaseDAL.update<BaseModel>(BaseModel, obj, payload, t);
  };

  /**
   *
   *
   * @static
   * @param rule
   * @param {Partial<BaseModel>} payload
   * @param t
   * @memberof SupplierDAL
   */
  static bulk_update = (
    rule: any,
    payload: Partial<BaseModel>,
    t?: Transaction
  ): Promise<boolean> => {
    return BaseDAL.bulk_update<BaseModel>(BaseModel, rule, payload, t);
  };

  /**
   *
   *
   * @static
   * @param {*} query
   * @param t
   * @param force
   * @memberof SupplierDAL
   */
  static delete = (
    query: any,
    t?: Transaction,
    force = false
  ): Promise<boolean> => {
    return BaseDAL.delete<BaseModel>(BaseModel, query, t, force);
  };

  /**
   *
   *
   * @static
   * @param rule
   * @param t
   * @param force
   * @memberof SupplierDAL
   */
  static bulk_delete = (
    rule: any,
    t?: Transaction,
    force = false
  ): Promise<boolean> => {
    return BaseDAL.bulk_delete<BaseModel>(BaseModel, rule, t, force);
  };

  /**
   *
   *
   * @static
   * @param {*} query
   * @param t
   * @memberof SupplierDAL
   */
  static restore = (query: any, t?: Transaction): Promise<boolean> => {
    return BaseDAL.restore<BaseModel>(BaseModel, query, t);
  };

  /**
   *
   *
   * @static
   * @param rule
   * @param t
   * @memberof SupplierDAL
   */
  static bulk_restore = (rule: any, t?: Transaction): Promise<boolean> => {
    return BaseDAL.bulk_restore<BaseModel>(BaseModel, rule, t);
  };
}

export default SupplierDAL;
