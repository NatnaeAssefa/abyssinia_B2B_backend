import { DataTypes, Model, Sequelize } from "sequelize";

export class NewsletterSubscription extends Model {
  public id!: string;
  public email!: string;
  public is_active!: boolean;
  public subscribed_at!: Date;
  public unsubscribed_at!: Date | null;
  public source!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  NewsletterSubscription.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      subscribed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      unsubscribed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "newsletter_subscription",
      tableName: "newsletter_subscriptions",
    }
  );
};
