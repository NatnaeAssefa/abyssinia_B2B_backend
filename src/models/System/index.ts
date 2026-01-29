import { Sequelize } from "sequelize";
import ConfigFactory, { Config } from "./Config";
import FileFactory, { File } from "./File";
import NotificationFactory, {Notification} from "./Notification";

const SystemModels = (sequelize: Sequelize) => {
  ConfigFactory(sequelize);
  FileFactory(sequelize);
  NotificationFactory(sequelize)
};

export default SystemModels;
export { Config, File, Notification };
