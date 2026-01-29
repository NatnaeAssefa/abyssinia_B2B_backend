import { DataTypes, Model, Sequelize } from "sequelize";

export class ProductIncoterm extends Model {
  public id!: string;
  public product_id!: string;
  public term!: string;
  public readonly createdAt!: Date;
}

export default (sequelize: Sequelize) => {
  ProductIncoterm.init(
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
      term: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "product_incoterm",
      tableName: "product_incoterms",
      indexes: [
        { fields: ["product_id"] },
      ],
    }
  );
};
