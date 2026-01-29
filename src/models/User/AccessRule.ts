import { DataTypes, Model, Sequelize } from "sequelize";
import {AccessType, UserType} from "../../utilities/constants/Constants";

export class AccessRule extends Model {
  public id!: string;
  public name!: string;
  public description!: string;
  public group!: string;
  public type!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  AccessRule.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      group: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(AccessType)),
        allowNull: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "access_rule",
      tableName: "access_rules",
    }
  );
};
