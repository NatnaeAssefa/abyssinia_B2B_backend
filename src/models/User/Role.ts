import { DataTypes, Model, Sequelize } from "sequelize";
import { AccessType, UserType } from "../../utilities/constants/Constants";

export class Role extends Model {
  public id!: string;
  public name!: string;
  public description!: string;
  public access_rules!: string[];
  public type!: string;
  public company_id!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Role.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      access_rules: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
          try{
              return JSON.parse(this.getDataValue("access_rules") ?? []);
          }
          catch (e) {
              return this.getDataValue("access_rules") ?? []
          }
        },
      },
      type: {
        type: DataTypes.ENUM(...Object.values(AccessType)),
        allowNull: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "role",
      tableName: "roles",
    }
  );
};
