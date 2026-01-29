import ModelSync from "../models/index";
import sequelize from "../database/sequelize";
import { seedSystem } from "./system.seed";
import { seedUser } from "./user.seed";
import { seedMarketPlace } from "./marketplace.seed";
import LogService from "../services/Log/Log.service";

export const runSeeds = async () => {
  try {
    // Initialize models
    ModelSync(sequelize);
    
    // Sync database
    await sequelize.sync({ alter: false, logging: false });
    LogService.LogInfo("Database synced successfully");

    // Run seeds in order (respecting dependencies)
    LogService.LogInfo("Starting seed process...");
    
    // 1. System seeds (no dependencies)
    await seedSystem();
    
    // 2. User seeds (depends on System for File)
    await seedUser();
    
    // 3. MarketPlace seeds (depends on User)
    await seedMarketPlace();
    
    LogService.LogInfo("All seeds completed successfully!");
    
    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    LogService.LogError(`Seed error: ${error.message}`);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSeeds();
}
