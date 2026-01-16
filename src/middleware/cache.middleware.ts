import { MiddlewareHandler } from 'hono';
import logger from '../utils/logger.js';
import { RedisService } from '@/infrastructure/cache/cache.service.js';

export interface CacheConfig {
  ttl?: number;
  keyGenerator?: (c: any) => string;
  skipCache?: (c: any) => boolean;
}

export function cacheMiddleware(config: CacheConfig = {}): MiddlewareHandler {
  const defaultTTL = config.ttl || 300; // 5 minutes default

  return async (c, next) => {
    const redisService = c.get('redisService') as RedisService;
    // Only cache GET requests
    if (c.req.method !== 'GET') {
      return next();
    }

    // Check if cache should be skipped
    if (config.skipCache && config.skipCache(c)) {
      return next();
    }

    // Generate cache key
    const cacheKey = config.keyGenerator
      ? config.keyGenerator(c)
      : `cache:${c.req.method}:${c.req.path}:${JSON.stringify(c.req.query())}`;

    // Try to get from cache
    const cached = await redisService.get(cacheKey);

    if (cached) {
      logger.debug('Cache hit:', { key: cacheKey });
      c.header('X-Cache', 'HIT');
      return c.json(cached);
    }

    logger.debug('Cache miss:', { key: cacheKey });

    await next();

    if (c.res.status === 200 && c.res.headers.get('Content-Type')?.includes('application/json')) {
      try {
        const body = await c.res.clone().json();
        await redisService.set(cacheKey, body, { ttl: defaultTTL });
        c.header('X-Cache', 'MISS');
        logger.debug('Response cached:', { key: cacheKey, ttl: defaultTTL });
      } catch (error) {
        logger.error('Failed to cache response:', { key: cacheKey, error });
      }
    }
  };
}

export function invalidateCacheMiddleware(patterns: string[]): MiddlewareHandler {
  return async (c, next) => {
    const redisService = c.get('redisService') as RedisService;
    await next();

    if (c.res.status >= 200 && c.res.status < 300) {
      for (const pattern of patterns) {
        await redisService.delPattern(pattern);
        logger.debug('Cache invalidated:', { pattern });
      }
    }
  };
}

export const CacheKeyGenerators = {
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  order: (orderId: string) => `order:${orderId}`,
  userOrders: (userId: string, page: number, limit: number) =>
    `user:${userId}:orders:page:${page}:limit:${limit}`,
  payment: (paymentId: string) => `payment:${paymentId}`,
  userPayments: (userId: string, page: number, limit: number) =>
    `user:${userId}:payments:page:${page}:limit:${limit}`,
  fromRequest: (c: any) => {
    const userId = c.get('userId') || 'anonymous';
    const path = c.req.path;
    const query = JSON.stringify(c.req.query());
    return `request:${userId}:${path}:${query}`;
  },
};


export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DAY: 86400, // 1 day
};


export const CachePatterns = {
  USER: (userId: string) => `user:${userId}*`,
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  USER_ORDERS: (userId: string) => `user:${userId}:orders*`,
  USER_PAYMENTS: (userId: string) => `user:${userId}:payments*`,
  ORDER: (orderId: string) => `order:${orderId}`,
  PAYMENT: (paymentId: string) => `payment:${paymentId}`,
  ALL_USERS: 'user:*',
  ALL_ORDERS: 'order:*',
  ALL_PAYMENTS: 'payment:*',
};
