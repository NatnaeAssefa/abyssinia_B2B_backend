import { Sequelize } from "sequelize";
import { env } from "../config";

function logEnvVariables() {
  console.log("Env Vars: DB Name, DB Username", env.DB_NAME, env.DB_USERNAME);
}

logEnvVariables();

const sequelize = new Sequelize({
  database: env.DB_NAME,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  dialect: "postgres",
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

export default sequelize;
