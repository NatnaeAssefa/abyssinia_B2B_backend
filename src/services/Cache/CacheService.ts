import AsyncLock from "async-lock";

interface CacheAdapter {
  set(key: string, value: any, ttl: number): Promise<void>;
  get(key: string): Promise<any | null>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  gracefulShutdown?(): void;
}

interface CacheServiceOptions {
  defaultTTL?: number;
}

type RefreshCallback<T> = () => Promise<T>;

class CacheService {
  private adapter: CacheAdapter;
  private lock: AsyncLock;
  private defaultTTL: number;
  private refreshCallbacks: Map<string, RefreshCallback<any>>;

  constructor(adapter: CacheAdapter, options: CacheServiceOptions = {}) {
    if (!adapter) {
      throw new Error("An adapter is required to initialize the cache service.");
    }

    this.adapter = adapter;
    this.lock = new AsyncLock();
    this.defaultTTL = options.defaultTTL || 3600; // Default TTL is 1 hour
    this.refreshCallbacks = new Map();
  }

  async set(
    key: string,
    value: any,
    ttl: number = this.defaultTTL,
    refreshCallback?: RefreshCallback<any>
  ): Promise<boolean> {
    try {
      await this.adapter.set(key, value, ttl);
      if (refreshCallback) {
        this.refreshCallbacks.set(key, refreshCallback);
      }
      return true;
    } catch (err) {
      console.error("Error setting cache:", err);
      throw err;
    }
  }

  async get<T>(key: string, fallback: (() => Promise<T>) | null = null): Promise<T | null> {
    try {
      const data = await this.adapter.get(key);
      if (data !== null) {
        return data as T;
      }

      if (typeof fallback === "function") {
        const freshData = await fallback();
        await this.set(key, freshData);
        return freshData;
      }

      return null;
    } catch (err) {
      console.error("Error retrieving cache:", err);
      throw err;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.adapter.delete(key);
      this.refreshCallbacks.delete(key);
      return true;
    } catch (err) {
      console.error("Error deleting cache:", err);
      throw err;
    }
  }

  async clear(): Promise<boolean> {
    try {
      await this.adapter.clear();
      this.refreshCallbacks.clear();
      return true;
    } catch (err) {
      console.error("Error clearing cache:", err);
      throw err;
    }
  }

  async autoRefreshOnExpiry(key: string): Promise<void> {
    const refreshCallback = this.refreshCallbacks.get(key);
    if (refreshCallback) {
      this.lock.acquire(key, async () => {
        const currentData = await this.adapter.get(key);
        if (currentData === null) {
          try {
            const refreshedData = await refreshCallback();
            await this.set(key, refreshedData);
            console.log(`Cache for key "${key}" refreshed.`);
          } catch (err) {
            console.error(`Error refreshing cache for key "${key}":`, err);
          }
        }
      });
    }
  }

  gracefulShutdown(): void {
    if (this.adapter.gracefulShutdown) {
      this.adapter.gracefulShutdown();
    }
    console.log("Cache service shut down gracefully.");
  }
}

export default CacheService;
