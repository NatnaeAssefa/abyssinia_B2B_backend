import winston from "winston";
import { env } from "../../config";

const transports = [
  new winston.transports.Console(),
];

// Only use file logging in NON-production
if (!env.PRODUCTION) {
  const DailyRotateFile = require("winston-daily-rotate-file");

  transports.push(
    new DailyRotateFile({
      filename: "xlogs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    })
  );
}

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports,
});

export default { logger };
