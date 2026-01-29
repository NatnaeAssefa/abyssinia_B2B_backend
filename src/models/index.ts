import { Sequelize } from "sequelize";
// import first
import UserModels from "./User";
import SystemModels from "./System";
import MarketPlaceModels from "./MarketPlace"

export default (sequelize: Sequelize) => {
  SystemModels(sequelize);
  UserModels(sequelize);
  MarketPlaceModels(sequelize);
};
