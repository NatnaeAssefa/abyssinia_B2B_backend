import { DataTypes, Model, Sequelize } from "sequelize";

export class Subcategory extends Model {
  public id!: string;
  public category_id!: string;
  public name!: string;
  public slug!: string;
  public description!: string | null;
  public image!: string | null;
  public order!: number;
  public is_active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Subcategory.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "subcategory",
      tableName: "subcategories",
      indexes: [
        {
          unique: true,
          fields: ["category_id", "slug"],
        },
      ],
    }
  );
};
