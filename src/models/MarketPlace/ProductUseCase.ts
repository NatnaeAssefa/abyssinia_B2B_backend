import { DataTypes, Model, Sequelize } from "sequelize";

export class ProductUseCase extends Model {
  public id!: string;
  public product_id!: string;
  public use_case!: string;
  public readonly createdAt!: Date;
}

export default (sequelize: Sequelize) => {
  ProductUseCase.init(
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
      use_case: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "product_use_case",
      tableName: "product_use_cases",
      indexes: [
        { fields: ["product_id"] },
      ],
    }
  );
};
