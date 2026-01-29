import { DataTypes, Model, Sequelize } from "sequelize";

export class Product extends Model {
  public id!: string;
  public name!: string;
  public slug!: string;
  public description!: string | null;
  public short_description!: string | null;
  public category_id!: string;
  public subcategory_id!: string | null;
  public supplier_id!: string;
  public origin!: string | null;
  public grade!: string | null;
  public purity!: string | null;
  public moisture!: string | null;
  public form!: string | null;
  public packaging!: string | null;
  public moq!: string | null;
  public availability!: string | null;
  public price!: number | null;
  public currency!: string | null;
  public is_featured!: boolean;
  public is_active!: boolean;
  public in_stock!: boolean;
  public meta_title!: string | null;
  public meta_description!: string | null;
  public view_count!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Product.init(
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
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      short_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
      },
      subcategory_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "subcategories",
          key: "id",
        },
      },
      supplier_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "suppliers",
          key: "id",
        },
      },
      origin: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      grade: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      purity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      moisture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      form: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      packaging: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      moq: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      availability: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: "USD",
        allowNull: true,
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      in_stock: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      meta_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "product",
      tableName: "products",
      indexes: [
        { fields: ["category_id"] },
        { fields: ["subcategory_id"] },
        { fields: ["supplier_id"] },
        { fields: ["is_featured"] },
        { fields: ["is_active"] },
        { fields: ["slug"] },
      ],
    }
  );
};
