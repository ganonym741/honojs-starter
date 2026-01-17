import logger from '../utils/logger.js';

export function errorMiddleware() {
  return (err: any, c: any) => {
    logger.error('Server error:', {
      error: err.message,
      stack: err.stack,
      path: c.req.path,
      method: c.req.method,
    });

    const response = {
      success: false,
      error:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message || 'Unknown error',
    };

    return c.json(response, 500);
  };
}

export function notFoundMiddleware() {
  return (c: any) => {
    logger.warn('Endpoint not found:', {
      path: c.req.path,
      method: c.req.method,
    });

    const response = {
      success: false,
      error: 'Endpoint not found',
    };

    return c.json(response, 404);
  };
}
