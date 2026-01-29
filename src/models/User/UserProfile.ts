import { Model, Sequelize, DataTypes } from "sequelize";
import { File } from "../System";
import { User } from "./User";

export class UserProfile extends Model {
  public id!: string;
  public file_id!: string;
  public file!: File;
  public bio!: string;
  public website_url!: string;
  public social_media_links!: string[]; // Can be stored as a JSON string
  public address!: string;
  public city!: string;
  public country!: string;
  public date_of_birth!: Date;
  public gender!: string;
  public time_zone!: string;
  public preferred_contact_method!: string;
  public is_active!: boolean;
  public last_activity_time!: Date;
  public user_id!: string;
  public user!: User
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default (sequelize: Sequelize) => {
  UserProfile.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      website_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      social_media_links: {
        type: DataTypes.ARRAY(DataTypes.STRING), // Can store JSON string of multiple links
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      time_zone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      preferred_contact_method: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      last_activity_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      paranoid: true,
      modelName: "user_profile",
      tableName: "user_profiles",
    }
  );
};