import ModelSync from "../../models/index";
import sequelize from "../../database/sequelize";
import { Transaction } from "sequelize";
import { env, DB_TYPES } from "../../config";
import LogService from "../../services/Log/Log.service";

// Use require here to avoid adding an extra @types dependency for pg in this project.
const { Client } = require("pg");

const isSafeDatabaseName = (dbName: string) => /^[a-zA-Z0-9_]+$/.test(dbName);

const ensureDatabaseExists = async () => {
  if (env.DB_TYPE !== DB_TYPES.POSTGRES) return;

  const dbName = env.DB_NAME as string;
  if (!isSafeDatabaseName(dbName)) {
    throw new Error(`Unsafe database name provided: ${dbName}`);
  }

  const adminClient = new Client({
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: "postgres",
  });

  await adminClient.connect();
  try {
    const result = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (result.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      LogService.LogInfo(`Database '${dbName}' created successfully.`);
    }
  } finally {
    await adminClient.end();
  }
};

export default async () => {
  try {
    await ensureDatabaseExists();
    ModelSync(sequelize);
    await sequelize.sync({ logging: false, alter: false });
    LogService.LogInfo("Database Connection has been established successfully.");
    return true;
  } catch (error: any) {
    LogService.LogError(`Database connection error: ${error}`);
    throw error;
  }
};

export const createTransaction = (): Promise<Transaction> => {
  return new Promise(async (resolve, reject) => {
    sequelize
      .transaction()
      .then((transaction) => resolve(transaction))
      .catch((error) => reject(error));
  });
};
