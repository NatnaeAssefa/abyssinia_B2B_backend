import { createPool, Pool } from "generic-pool";
import { Redis } from "ioredis";
import { env } from "../../config";
import LogService from "../../services/Log/Log.service";

const REDIS_CONFIG = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  // Add other Redis configuration options if necessary
};

const REDIS_POOL_CONFIG = {
  max: 25, // Maximum number of resources to create at a given time
  min: 5, // Minimum number of resources to keep in pool at any given time
};

const factory = {
  create: function () {
    return new Promise<Redis>((resolve) => {
      const client = new Redis(REDIS_CONFIG);
      resolve(client);
    })
  },
  destroy: function (client: Redis) {
    return new Promise<void>((resolve) => {
      client.quit().then(() => resolve()).catch((e) => resolve());
    });
  },
};

const redisPool: Pool<Redis> = createPool(factory, REDIS_POOL_CONFIG);

export default redisPool;
