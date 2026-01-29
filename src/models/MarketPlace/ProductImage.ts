import { DataTypes, Model, Sequelize } from "sequelize";

export class ProductImage extends Model {
  public id!: string;
  public product_id!: string;
  public url!: string;
  public alt!: string | null;
  public order!: number;
  public is_primary!: boolean;
  public readonly createdAt!: Date;
}

export default (sequelize: Sequelize) => {
  ProductImage.init(
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
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "product_image",
      tableName: "product_images",
      indexes: [
        { fields: ["product_id"] },
      ],
    }
  );
};
