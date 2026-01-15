import { MiddlewareHandler } from 'hono';
import logger from '../utils/logger.js';
import { randomUUID } from 'crypto';

export interface LoggerConfig {
  skipPaths?: string[];
  skipMethods?: string[];
  logHeaders?: boolean;
  logBody?: boolean;
  logQuery?: boolean;
  logResponse?: boolean;
  slowRequestThreshold?: number;
}

export function loggerMiddleware(config: LoggerConfig = {}): MiddlewareHandler {
  const {
    skipPaths = [],
    skipMethods = [],
    logHeaders = false,
    logBody = false,
    logQuery = true,
    logResponse = true,
    slowRequestThreshold = 3000, // 3 seconds
  } = config;

  return async (c, next) => {
    const startTime = Date.now();
    const requestId = randomUUID();

    // Add request ID to context
    c.set('requestId', requestId);

    // Add request ID to response headers
    c.header('X-Request-ID', requestId);

    const path = c.req.path;
    const method = c.req.method;

    // Skip logging for configured paths/methods
    if (skipPaths.includes(path) || skipMethods.includes(method)) {
      await next();
      return;
    }

    // Log request details
    const logData: any = {
      requestId,
      method,
      path,
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
      userAgent: c.req.header('user-agent'),
    };

    // Add user ID if authenticated
    const userId = c.get('userId');
    if (userId) {
      logData.userId = userId;
    }

    // Add query parameters
    if (logQuery) {
      const query = c.req.query();
      if (Object.keys(query).length > 0) {
        logData.query = query;
      }
    }

    // Add headers if configured
    if (logHeaders) {
      const headers: any = {};
      for (const [key, value] of Object.entries(c.req.header())) {
        // Don't log sensitive headers
        if (!['authorization', 'cookie'].includes(key.toLowerCase())) {
          headers[key] = value;
        }
      }
      if (Object.keys(headers).length > 0) {
        logData.headers = headers;
      }
    }

    // Add body if configured (for non-GET requests)
    if (logBody && method !== 'GET') {
      try {
        const body = await c.req.json();
        if (body && Object.keys(body).length > 0) {
          // Sanitize body - remove sensitive fields
          const sanitizedBody: any = { ...body };
          delete sanitizedBody.password;
          delete sanitizedBody.currentPassword;
          delete sanitizedBody.newPassword;
          delete sanitizedBody.token;
          delete sanitizedBody.refreshToken;
          logData.body = sanitizedBody;
        }
      } catch (error) {}
    }

    logger.info('Incoming request', logData);

    // Capture response
    await next();

    // Log response details
    if (logResponse) {
      const duration = Date.now() - startTime;
      const status = c.res.status;
      const responseLogData: any = {
        requestId,
        method,
        path,
        status,
        duration,
      };

      // Add user ID if available
      if (userId) {
        responseLogData.userId = userId;
      }

      // Log slow requests
      if (duration > slowRequestThreshold) {
        logger.warn('Slow request detected', {
          ...responseLogData,
          threshold: slowRequestThreshold,
        });
      } else {
        logger.info('Request completed', responseLogData);
      }

      // Add performance headers
      c.header('X-Response-Time', duration.toString());
    }
  };
}

export const LoggerPresets = {
  basic: {
    logHeaders: false,
    logBody: false,
    logQuery: true,
    logResponse: true,
  },

  detailed: {
    logHeaders: true,
    logBody: false,
    logQuery: true,
    logResponse: true,
  },

  debug: {
    logHeaders: true,
    logBody: true,
    logQuery: true,
    logResponse: true,
    slowRequestThreshold: 1000, // 1 second
  },

  production: {
    logHeaders: false,
    logBody: false,
    logQuery: false,
    logResponse: true,
    slowRequestThreshold: 5000, // 5 seconds
  },

  skipHealthCheck: {
    skipPaths: ['/health', '/api/version'],
  },
};

export const LoggerHelpers = {
  logError: (error: Error, c: any, message?: string) => {
    const requestId = c.get('requestId') || 'unknown';
    const userId = c.get('userId');
    const path = c.req.path;
    const method = c.req.method;

    logger.error('Request error', {
      requestId,
      userId,
      method,
      path,
      error: error.message,
      stack: error.stack,
      message,
    });
  },

  logWarning: (message: string, c: any, data?: any) => {
    const requestId = c.get('requestId') || 'unknown';
    const userId = c.get('userId');
    const path = c.req.path;
    const method = c.req.method;

    logger.warn('Request warning', {
      requestId,
      userId,
      method,
      path,
      message,
      ...data,
    });
  },

  logInfo: (message: string, c: any, data?: any) => {
    const requestId = c.get('requestId') || 'unknown';
    const userId = c.get('userId');
    const path = c.req.path;
    const method = c.req.method;

    logger.info('Request info', {
      requestId,
      userId,
      method,
      path,
      message,
      ...data,
    });
  },

  getRequestId: (c: any): string => {
    return c.get('requestId') || 'unknown';
  },
};
