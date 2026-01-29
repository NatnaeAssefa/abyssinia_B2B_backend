import { Sequelize } from "sequelize";
import AccessRuleFactory, { AccessRule } from "./AccessRule";
import ActionLogFactory, { ActionLog } from "./ActionLog";
import RoleFactory, { Role } from "./Role";
import UserFactory, { User } from "./User";
import UserProfileFactory, { UserProfile } from "./UserProfile";
import { File } from "../System";

const UserModels = (sequelize: Sequelize) => {
  AccessRuleFactory(sequelize);
  ActionLogFactory(sequelize);
  RoleFactory(sequelize);
  UserFactory(sequelize);
  UserProfileFactory(sequelize);

  // ===========================================
  // User - Role
  Role.hasMany(User, {
    foreignKey: "role_id",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
  User.belongsTo(Role, {
    foreignKey: "role_id",
  });

  // User - Action Log
  User.hasMany(ActionLog, {
    foreignKey: "user_id",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
  ActionLog.belongsTo(User, {
    foreignKey: "user_id",
  });

  // User - User Profile
  User.hasOne(UserProfile, {
    foreignKey: "user_id",
  });
  UserProfile.belongsTo(User, {
    foreignKey: "user_id",
  });

  // File - UserProfile
  File.hasOne(UserProfile, {
    foreignKey: "file_id",
  });
  UserProfile.belongsTo(File, {
    foreignKey: "file_id",
  });

};

export default UserModels;
export { AccessRule, ActionLog, User, Role, UserProfile };
