import { DataTypes, Model, Sequelize } from "sequelize";

export enum QuoteStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  QUOTED = "QUOTED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export class QuoteRequest extends Model {
  public id!: string;
  public product_id!: string;
  public user_id!: string | null;
  public quantity!: string;
  public packaging!: string | null;
  public destination!: string | null;
  public incoterm!: string | null;
  public name!: string | null;
  public email!: string;
  public company!: string | null;
  public phone!: string | null;
  public notes!: string | null;
  public status!: QuoteStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  QuoteRequest.init(
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
      quantity: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      packaging: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      destination: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      incoterm: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      company: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(QuoteStatus)),
        defaultValue: QuoteStatus.PENDING,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "quote_request",
      tableName: "quote_requests",
      indexes: [
        { fields: ["product_id"] },
        { fields: ["user_id"] },
        { fields: ["status"] },
      ],
    }
  );
};
