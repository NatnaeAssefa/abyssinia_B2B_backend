import Redis, { RedisOptions } from 'ioredis';

export default class RedisAdapter {
  private client: Redis;

  constructor(options: RedisOptions) {
    this.client = new Redis(options);
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    await this.client.flushall();
  }

  gracefulShutdown(): void {
    this.client.quit();
  }
}
