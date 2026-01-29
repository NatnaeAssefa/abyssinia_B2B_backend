import { DataTypes, Model, Sequelize } from "sequelize";

export class BlogPost extends Model {
  public id!: string;
  public title!: string;
  public slug!: string;
  public excerpt!: string | null;
  public content!: string;
  public featured_image!: string | null;
  public author_name!: string;
  public author_email!: string | null;
  public category!: string | null;
  public tags!: string[];
  public is_published!: boolean;
  public published_at!: Date | null;
  public meta_title!: string | null;
  public meta_description!: string | null;
  public view_count!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  BlogPost.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      excerpt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      featured_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      author_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        get() {
          try {
            return JSON.parse(this.getDataValue("tags") ?? "[]");
          } catch (e) {
            return this.getDataValue("tags") ?? [];
          }
        },
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      published_at: {
        type: DataTypes.DATE,
        allowNull: true,
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
      modelName: "blog_post",
      tableName: "blog_posts",
      indexes: [
        { fields: ["slug"] },
        { fields: ["is_published"] },
        { fields: ["published_at"] },
      ],
    }
  );
};
