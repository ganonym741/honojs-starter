/**
 * Rate Limit Middleware Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import {
  rateLimit,
  RateLimitPresets,
  RateLimitKeyGenerators,
  RateLimitHelpers,
} from '../../../src/middleware/rate-limit.middleware.js';

// Mock RedisService
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
};

vi.mock('../../../src/infrastructure/cache/redis.service.js', () => ({
  RedisService: {
    getInstance: vi.fn(() => mockRedis),
  },
}));

describe('Rate Limit Middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    vi.clearAllMocks();
  });

  describe('rateLimit', () => {
    it('should allow requests within limit', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(undefined);

      app.get(
        '/test',
        rateLimit({
          windowMs: 60000, // 1 minute
          maxRequests: 100,
          keyGenerator: () => 'test-key',
        }),
        (c) => {
          return c.json({ success: true });
        }
      );

      const response = await app.request('/test');

      expect(response.status).toBe(200);
      expect(mockRedis.get).toHaveBeenCalled();
      expect(mockRedis.incr).toHaveBeenCalled();
    });

    it('should block requests exceeding limit', async () => {
      mockRedis.get.mockResolvedValue('100'); // At limit

      app.get(
        '/test',
        rateLimit({
          windowMs: 60000,
          maxRequests: 100,
          keyGenerator: () => 'test-key',
        }),
        (c) => {
          return c.json({ success: true });
        }
      );

      const response = await app.request('/test');

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should set rate limit headers', async () => {
      mockRedis.get.mockResolvedValue('50');
      mockRedis.incr.mockResolvedValue(51);

      app.get(
        '/test',
        rateLimit({
          windowMs: 60000,
          maxRequests: 100,
          keyGenerator: () => 'test-key',
        }),
        (c) => {
          return c.json({ success: true });
        }
      );

      const response = await app.request('/test');

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('49');
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });
  });

  describe('RateLimitPresets', () => {
    it('should provide strict preset', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(undefined);

      app.get('/test', rateLimit(RateLimitPresets.strict), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
    });

    it('should provide moderate preset', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(undefined);

      app.get('/test', rateLimit(RateLimitPresets.moderate), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
    });
  });

  describe('RateLimitKeyGenerators', () => {
    it('should generate key by IP', () => {
      const mockC = {
        req: {
          header: vi.fn((name) => {
            if (name === 'x-forwarded-for') return '192.168.1.1';
            return null;
          }),
        },
      } as any;

      const key = RateLimitKeyGenerators.byIP(mockC);
      expect(key).toBe('192.168.1.1');
    });

    it('should generate key by user ID', () => {
      const mockC = {
        get: vi.fn((key) => {
          if (key === 'userId') return 'user-123';
          return null;
        }),
      } as any;

      const key = RateLimitKeyGenerators.byUser(mockC);
      expect(key).toBe('user-123');
    });
  });

  describe('RateLimitHelpers', () => {
    it('should provide public helper', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(undefined);

      app.get('/test', RateLimitHelpers.public(), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
    });

    it('should provide authenticated helper', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(undefined);

      app.use('*', (c: any, next) => {
        c.set('userId', 'user-123');
        return next();
      });

      app.get('/test', RateLimitHelpers.authenticated(), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
    });
  });
});
