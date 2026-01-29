import { DataTypes, Model, Sequelize } from "sequelize";

export class ProductTargetMarket extends Model {
  public id!: string;
  public product_id!: string;
  public market!: string;
  public readonly createdAt!: Date;
}

export default (sequelize: Sequelize) => {
  ProductTargetMarket.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
      },
      market: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "product_target_market",
      tableName: "product_target_markets",
      indexes: [
        { fields: ["product_id"] },
      ],
    }
  );
};
