import { DataTypes, Model, Sequelize } from "sequelize";
import { User } from "../User/User";
import { NotificationType, NotificationCategory } from "../../utilities/constants/Constants";

export class Notification extends Model {
  public id!: string;
  public notification_title!: string;
  public notification_body!: string;
  public notification_type!: string;
  public notification_category!: string;
  public is_read!: boolean;
  public user_id!: string;
  public notification_date!: Date;
  public notification_url!: string;
  public user!: User;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  Notification.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      notification_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notification_body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      notification_type: {
        type: DataTypes.ENUM(...Object.values(NotificationType)),
        allowNull: false,
        defaultValue: NotificationType.SUCCESS
      },
      notification_category: {
        type: DataTypes.ENUM(...Object.values(NotificationCategory)),
        allowNull: false,
        defaultValue: NotificationCategory.INFO
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      notification_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      notification_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "notification",
      tableName: "notifications",
    }
  );
};
