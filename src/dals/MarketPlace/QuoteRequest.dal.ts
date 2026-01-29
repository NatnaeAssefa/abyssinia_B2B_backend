import { Transaction } from "sequelize";
import { QuoteRequest as BaseModel } from "../../models/MarketPlace";
import BaseDAL from "../Base.dal";

class QuoteRequestDAL {
  /**
   *
   *
   * @static
   * @param {Partial<BaseModel>} payload
   * @param {Transaction} t
   * @memberof QuoteRequestDAL
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
   * @memberof QuoteRequestDAL
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
   * @memberof QuoteRequestDAL
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
   * @memberof QuoteRequestDAL
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
   * @memberof QuoteRequestDAL
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
   * @memberof QuoteRequestDAL
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
   * @memberof QuoteRequestDAL
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
   * @memberof QuoteRequestDAL
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
   * @memberof QuoteRequestDAL
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
   * @memberof QuoteRequestDAL
   */
  static bulk_restore = (rule: any, t?: Transaction): Promise<boolean> => {
    return BaseDAL.bulk_restore<BaseModel>(BaseModel, rule, t);
  };
}

export default QuoteRequestDAL;
