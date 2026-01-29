import { DataTypes, Model, Sequelize } from "sequelize";

export enum AddressType {
  BILLING = "BILLING",
  SHIPPING = "SHIPPING",
}

export class Address extends Model {
  public id!: string;
  public user_id!: string;
  public type!: AddressType;
  public street!: string;
  public city!: string;
  public state!: string | null;
  public country!: string;
  public postal_code!: string | null;
  public is_default!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Address.init(
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
      type: {
        type: DataTypes.ENUM(...Object.values(AddressType)),
        defaultValue: AddressType.BILLING,
      },
      street: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postal_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "address",
      tableName: "addresses",
    }
  );
};
