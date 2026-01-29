import { DataTypes, Model, Sequelize } from "sequelize";

export class ProductSpecification extends Model {
  public id!: string;
  public product_id!: string;
  public label!: string;
  public value!: string;
  public order!: number;
  public readonly createdAt!: Date;
}

export default (sequelize: Sequelize) => {
  ProductSpecification.init(
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
      label: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "product_specification",
      tableName: "product_specifications",
      indexes: [
        { fields: ["product_id"] },
      ],
    }
  );
};
