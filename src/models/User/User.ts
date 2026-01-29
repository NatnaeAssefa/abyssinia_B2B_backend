import { DataTypes, Model, Sequelize } from "sequelize";
import { UserStatus, UserType } from "../../utilities/constants/Constants";
import { Role } from "./Role";

export class User extends Model {
  public id!: string;
  public social_login!: string;
  public social_login_id!: string;
  public email!: string;
  public phone_number!: string;
  public first_name!: string;
  public last_name!: string;
  public password!: string;
  public last_used_key!: string;
  public verification_code!: string;
  public verification_time!: Date;
  public recovery_request_time!: Date;
  public recovery_time!: Date;
  public status!: string;
  public pref_language!: string;
  public pref_currency!: string;
  public pref_unit!: string;
  public role_id!: string;
  public type!: string;
  public role!: Role;
  public is_verified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      social_login: {
        type: DataTypes.STRING,
      },
      social_login_id: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_used_key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      verification_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verification_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      recovery_request_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      recovery_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: UserStatus.ACTIVE,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(UserType)),
        allowNull: false,
        set(value) {
          if (this.isNewRecord) {
            this.setDataValue("type", value);
          }
        },
      },
      pref_language: {
        type: DataTypes.STRING,
        defaultValue: "EN",
      },
      pref_currency: {
        type: DataTypes.STRING,
        defaultValue: "USD",
      },
      pref_unit: {
        type: DataTypes.STRING,
        defaultValue: "m",
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      paranoid: true,
      modelName: "user",
      tableName: "users",
    }
  );
};