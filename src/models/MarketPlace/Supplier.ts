import { DataTypes, Model, Sequelize } from "sequelize";

export class Supplier extends Model {
  public id!: string;
  public user_id!: string;
  public company_name!: string;
  public business_license!: string | null;
  public tax_id!: string | null;
  public experience!: string | null;
  public capacity!: string | null;
  public description!: string | null;
  public website!: string | null;
  public is_verified!: boolean;
  public verification_date!: Date | null;
  public is_active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Supplier.init(
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
      company_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      business_license: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tax_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      experience: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      capacity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verification_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "supplier",
      tableName: "suppliers",
    }
  );
};
