import { DataTypes, Model, Sequelize } from "sequelize";

export class RecentlyViewed extends Model {
  public id!: string;
  public user_id!: string;
  public product_id!: string;
  public viewed_at!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  RecentlyViewed.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
      },
      viewed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "recently_viewed",
      tableName: "recently_viewed",
      indexes: [
        { fields: ["user_id"] },
        { fields: ["product_id"] },
        { fields: ["viewed_at"] },
        {
          unique: true,
          fields: ["user_id", "product_id"],
        },
      ],
    }
  );
};
