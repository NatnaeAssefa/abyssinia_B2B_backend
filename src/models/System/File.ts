import { DataTypes, Model, Sequelize } from "sequelize";

export class File extends Model {
  public id!: string;
  public name!: string;
  public type!: string;
  public size!: number;
  public path!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  File.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
      },
      size: {
        type: DataTypes.DOUBLE,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "file",
      tableName: "files",
    }
  );
};
