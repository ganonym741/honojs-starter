import { Dependency } from 'hono-simple-di';
import redis from '../../config/redis.js';
import logger from '../../utils/logger.js';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

export class RedisService {
  constructor() {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis get error:', { key, error });
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (options?.ttl) {
        await redis.setex(key, options.ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
      logger.debug('Cache set:', { key, ttl: options?.ttl });
    } catch (error) {
      logger.error('Redis set error:', { key, error });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
      logger.debug('Cache deleted:', { key });
    } catch (error) {
      logger.error('Redis delete error:', { key, error });
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug('Cache pattern deleted:', { pattern, count: keys.length });
      }
    } catch (error) {
      logger.error('Redis delete pattern error:', { pattern, error });
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error:', { key, error });
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await redis.incr(key);
    } catch (error) {
      logger.error('Redis increment error:', { key, error });
      return 0;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await redis.expire(key, ttl);
      logger.debug('Cache expiration set:', { key, ttl });
    } catch (error) {
      logger.error('Redis expire error:', { key, error });
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await redis.mget(...keys);
      return values.map((value) => (value ? JSON.parse(value) : null));
    } catch (error) {
      logger.error('Redis mget error:', { keys, error });
      return keys.map(() => null);
    }
  }

  async mset<T>(keyValuePairs: [string, T][]): Promise<void> {
    try {
      const flattened = keyValuePairs.flatMap(([key, value]) => [key, JSON.stringify(value)]);
      await redis.mset(...flattened);
      logger.debug('Cache mset:', { count: keyValuePairs.length });
    } catch (error) {
      logger.error('Redis mset error:', { count: keyValuePairs.length, error });
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await redis.keys(pattern);
    } catch (error) {
      logger.error('Redis keys error:', { pattern, error });
      return [];
    }
  }

  async flushDb(): Promise<void> {
    try {
      await redis.flushdb();
      logger.warn('Redis database flushed');
    } catch (error) {
      logger.error('Redis flushdb error:', error);
    }
  }

  async getStats(): Promise<{
    keyCount: number;
    memoryUsage: string;
    hitRate: number;
  }> {
    try {
      const keyCount = await redis.dbsize();
      const info = await redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : 'unknown';

      return {
        keyCount,
        memoryUsage,
        hitRate: 0, // Would need to track hits/misses
      };
    } catch (error) {
      logger.error('Redis get stats error:', error);
      return {
        keyCount: 0,
        memoryUsage: 'unknown',
        hitRate: 0,
      };
    }
  }

  async disconnect(): Promise<void> {
    try {
      await redis.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Redis disconnect error:', error);
    }
  }
}

export const redisServiceDep = new Dependency(() => new RedisService());
