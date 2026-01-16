import { MiddlewareHandler } from 'hono';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { JWT_CONFIG } from '@/config/env.js';

export interface AuthContext {
  userId: string;
}

export function authMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      logger.warn('Missing authorization header', {
        path: c.req.path,
        method: c.req.method,
      });
      return c.json(
        {
          success: false,
          error: 'Authorization header is required',
        },
        401
      );
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, JWT_CONFIG.secret) as unknown as AuthContext;

      // Add user ID to context
      c.set('userId', decoded.userId);

      await next();
    } catch (error) {
      logger.warn('Invalid token', {
        path: c.req.path,
        method: c.req.method,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return c.json(
        {
          success: false,
          error: 'Invalid or expired token',
        },
        401
      );
    }
  };
}

export function optionalAuthMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader) {
      await next();
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, JWT_CONFIG.secret) as AuthContext;
      c.set('userId', decoded.userId);
    } catch (error) {
      // Token is invalid, but we don't block the request
      logger.debug('Optional auth: Invalid token', {
        path: c.req.path,
        method: c.req.method,
      });
    }

    await next();
  };
}
