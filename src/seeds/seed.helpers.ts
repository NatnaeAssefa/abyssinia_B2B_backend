import dotenv from "dotenv";
import { QueryTypes } from "sequelize";
import ModelSync from "../models/index";
import sequelize from "../database/sequelize";
import LogService from "../services/Log/Log.service";

dotenv.config({ path: "./.env" });

/** Default password for seeded demo accounts. Override on Render via SEED_DEFAULT_PASSWORD. */
export const getSeedPassword = (): string =>
  process.env.SEED_DEFAULT_PASSWORD || "password123";

/**
 * Initialise models and sync schema (no alter — safe for production).
 * Also ensures quote_requests has all columns required by the current model.
 */
export const initSeedDatabase = async (): Promise<void> => {
  ModelSync(sequelize);
  await sequelize.sync({ alter: false, logging: false });
  await ensureQuoteRequestColumns();
  LogService.LogInfo("Database synced for seeding");
};

/** Add quote_requests columns that may be missing on an existing Render DB. */
const ensureQuoteRequestColumns = async (): Promise<void> => {
  const columns = [
    "payment_term VARCHAR(255)",
    "target_country VARCHAR(255)",
    "destination_port VARCHAR(255)",
    "shipping_method VARCHAR(255)",
    "lead_time VARCHAR(255)",
    "product_name VARCHAR(255)",
  ];

  for (const col of columns) {
    const [name] = col.split(" ");
    await sequelize.query(
      `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS ${col};`,
      { type: QueryTypes.RAW }
    ).catch(() => {
      LogService.LogInfo(`Column ${name} on quote_requests already exists or table not yet created`);
    });
  }

  // product_id was made nullable in a prior migration
  await sequelize.query(
    `ALTER TABLE quote_requests ALTER COLUMN product_id DROP NOT NULL;`,
    { type: QueryTypes.RAW }
  ).catch(() => {
    // Column may already be nullable or table not created yet
  });
};

/**
 * Upsert a child record: find by composite key, create if missing.
 * Safe to call on every seed run (Render re-deploys).
 */
export const upsertChild = async <T extends { findOrCreate: Function }>(
  Model: T,
  where: Record<string, unknown>,
  defaults: Record<string, unknown>
): Promise<void> => {
  await Model.findOrCreate({ where, defaults: { ...where, ...defaults } });
};

export const closeSeedConnection = async (exitCode = 0): Promise<void> => {
  await sequelize.close();
  process.exit(exitCode);
};
