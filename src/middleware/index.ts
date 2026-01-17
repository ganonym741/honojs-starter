import { cors } from 'hono/cors';
import { MiddlewareHandler } from 'hono';

import {
  cacheMiddleware,
  invalidateCacheMiddleware,
  CacheKeyGenerators,
  CacheTTL,
  CachePatterns,
} from './cache.middleware.js';
import { validationMiddleware, ValidationHelpers, CommonSchemas } from './validation.middleware.js';
import {
  rateLimit,
  RateLimitPresets,
  RateLimitKeyGenerators,
  RateLimitHelpers,
} from './rate-limit.middleware.js';
import {
  loggerMiddleware as customLoggerMiddleware,
  LoggerPresets,
  LoggerHelpers,
} from './logger.middleware.js';
import { securityMiddleware, SecurityPresets, SecurityHelpers } from './security.middleware.js';
import { sanitizeMiddleware, SanitizePresets, SanitizeHelpers } from './sanitize.middleware.js';
import { CORS_CONFIG } from '@/config/env.js';

/**
 * CORS middleware
 */
export function corsMiddleware(): MiddlewareHandler {
  return cors({
    origin: CORS_CONFIG.allowedOrigins,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });
}

/**
 * Get default middleware stack
 */
export function getMiddleware(): MiddlewareHandler[] {
  return [
    corsMiddleware(),
    securityMiddleware(SecurityPresets.development),
    customLoggerMiddleware(LoggerPresets.debug),
  ];
}

/**
 * Get development middleware stack
 */
export function getDevelopmentMiddleware(): MiddlewareHandler[] {
  return [
    corsMiddleware(),
    securityMiddleware(SecurityPresets.development),
    customLoggerMiddleware(LoggerPresets.debug),
  ];
}

/**
 * Get production middleware stack
 */
export function getProductionMiddleware(): MiddlewareHandler[] {
  return [
    corsMiddleware(),
    securityMiddleware(SecurityPresets.strict),
    sanitizeMiddleware(SanitizePresets.strict),
    customLoggerMiddleware(LoggerPresets.production),
  ];
}

// Re-export cache middleware utilities
export { cacheMiddleware, invalidateCacheMiddleware, CacheKeyGenerators, CacheTTL, CachePatterns };

// Re-export validation middleware utilities
export { validationMiddleware, ValidationHelpers, CommonSchemas };

// Re-export rate limit middleware utilities
export { rateLimit, RateLimitPresets, RateLimitKeyGenerators, RateLimitHelpers };

// Re-export logger middleware utilities
export { customLoggerMiddleware, LoggerPresets, LoggerHelpers };

// Re-export security middleware utilities
export { securityMiddleware, SecurityPresets, SecurityHelpers };

// Re-export sanitization middleware utilities
export { sanitizeMiddleware, SanitizePresets, SanitizeHelpers };
