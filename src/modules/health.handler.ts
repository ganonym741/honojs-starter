import prisma from '../config/database.js';
import redis from '../config/redis.js';
import logger from '../utils/logger.js';

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: string;
    redis: string;
  };
}

export async function handleHealthCheck(c: any) {
  const health: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch (error) {
    logger.error('Database health check failed:', error);
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  // Check Redis connection
  try {
    await redis.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    logger.error('Redis health check failed:', error);
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;

  return c.json(health, statusCode);
}
