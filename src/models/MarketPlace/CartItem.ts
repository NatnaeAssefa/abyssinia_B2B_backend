import { DataTypes, Model, Sequelize } from "sequelize";

export class CartItem extends Model {
  public id!: string;
  public cart_id!: string;
  public product_id!: string;
  public quantity!: string;
  public notes!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  CartItem.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      cart_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "carts",
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
      quantity: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "cart_item",
      tableName: "cart_items",
      indexes: [
        { fields: ["cart_id"] },
        { fields: ["product_id"] },
        {
          unique: true,
          fields: ["cart_id", "product_id"],
        },
      ],
    }
  );
};
