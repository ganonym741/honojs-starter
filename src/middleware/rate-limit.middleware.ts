import { MiddlewareHandler } from 'hono';
import logger from '../utils/logger.js';
import { RedisService } from '@/infrastructure/cache/cache.service.js';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: any) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
}

export function rateLimit(config: RateLimitConfig): MiddlewareHandler {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100,
    keyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests, please try again later.',
  } = config;

  return async (c, next) => {
    const redisService = c.get('redisService') as RedisService;
    const key = keyGenerator
      ? keyGenerator(c)
      : `rate_limit:${c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'anonymous'}`;

    try {
      const current = await redisService.incr(key);

      if (current === 1) {
        await redisService.expire(key, Math.ceil(windowMs / 1000));
      }

      if (current > maxRequests) {
        logger.warn('Rate limit exceeded:', {
          key,
          current,
          maxRequests,
          path: c.req.path,
          method: c.req.method,
        });

        const ttl = await redisService.exists(key);
        const retryAfter = ttl ? Math.ceil(windowMs / 1000) : 0;

        return c.json(
          {
            success: false,
            error: message,
            details: {
              retryAfter,
              limit: maxRequests,
              remaining: 0,
            },
          },
          429
        );
      }

      const remaining = Math.max(0, maxRequests - current);
      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', remaining.toString());
      c.header('X-RateLimit-Reset', (Date.now() + windowMs).toString());

      await next();

      const responseStatus = c.res.status;
      if (
        skipSuccessfulRequests &&
        responseStatus &&
        responseStatus >= 200 &&
        responseStatus < 300
      ) {
        // Don't count successful requests
        redisService.del(key);
      } else if (skipFailedRequests && responseStatus && responseStatus >= 400) {
        // Don't count failed requests
        redisService.del(key);
      }
    } catch (error) {
      logger.error('Rate limit error:', { key, error });
      await next();
    }
  };
}

export const RateLimitPresets = {
  strict: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
  moderate: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 200,
  },
  lenient: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 500,
  },
  perMinute: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  perHour: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 1000,
  },
  perDay: {
    windowMs: 24 * 60 * 60 * 1000,
    maxRequests: 10000,
  },
  api: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 1000,
  },
  auth: {
    windowMs: 60 * 1000,
    maxRequests: 5,
  },
  upload: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  },
};

export const RateLimitKeyGenerators = {
  byIP: (c: any) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    return `rate_limit:ip:${ip}`;
  },

  byUser: (c: any) => {
    const userId = c.get('userId') || 'anonymous';
    return `rate_limit:user:${userId}`;
  },

  byIPAndEndpoint: (c: any) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const path = c.req.path;
    return `rate_limit:ip:${ip}:endpoint:${path}`;
  },

  byUserAndEndpoint: (c: any) => {
    const userId = c.get('userId') || 'anonymous';
    const path = c.req.path;
    return `rate_limit:user:${userId}:endpoint:${path}`;
  },

  byAPIKey: (c: any) => {
    const apiKey = c.req.header('x-api-key') || 'unknown';
    return `rate_limit:apikey:${apiKey}`;
  },
};

export const RateLimitHelpers = {
  public: (config?: Partial<RateLimitConfig>) =>
    rateLimit({
      ...RateLimitPresets.strict,
      ...config,
    }),

  authenticated: (config?: Partial<RateLimitConfig>) =>
    rateLimit({
      ...RateLimitPresets.api,
      ...config,
      keyGenerator: RateLimitKeyGenerators.byUser,
    }),

  auth: (config?: Partial<RateLimitConfig>) =>
    rateLimit({
      ...RateLimitPresets.auth,
      ...config,
      keyGenerator: RateLimitKeyGenerators.byIP,
    }),

  upload: (config?: Partial<RateLimitConfig>) =>
    rateLimit({
      ...RateLimitPresets.upload,
      ...config,
      keyGenerator: RateLimitKeyGenerators.byUser,
    }),
};
