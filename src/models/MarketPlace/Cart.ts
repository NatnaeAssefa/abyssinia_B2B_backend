import { DataTypes, Model, Sequelize } from "sequelize";

export class Cart extends Model {
  public id!: string;
  public user_id!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Cart.init(
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
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "cart",
      tableName: "carts",
    }
  );
};
