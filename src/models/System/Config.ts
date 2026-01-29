import { DataTypes, Model, Sequelize } from "sequelize";

export class Config extends Model {
  public id!: string;
  public key!: string;
  public object_type!: string;
  public type!: string;
  public value!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Config.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      key: {
        type: DataTypes.STRING,
        unique: true,
      },
      object_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "config",
      tableName: "configs",
    }
  );
};
