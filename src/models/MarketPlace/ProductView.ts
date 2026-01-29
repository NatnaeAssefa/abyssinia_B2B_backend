import { DataTypes, Model, Sequelize } from "sequelize";

export class ProductView extends Model {
  public id!: string;
  public product_id!: string;
  public user_id!: string | null;
  public ip_address!: string | null;
  public user_agent!: string | null;
  public viewed_at!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  ProductView.init(
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      viewed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "product_view",
      tableName: "product_views",
      indexes: [
        { fields: ["product_id"] },
        { fields: ["user_id"] },
        { fields: ["viewed_at"] },
      ],
    }
  );
};
