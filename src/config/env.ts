import { getEnvVar } from '../utils/env-validator.js';

export const isProduction = () => (ENV.nodeEnv as string) === 'production';

export const isDevelopment = () => (ENV.nodeEnv as string) === 'development';

export const isTest = () => (ENV.nodeEnv as string) === 'test';

export const ENV = {
  nodeEnv: getEnvVar<string>('NODE_ENV', 'development'),
  port: getEnvVar<number>('PORT', 3000),
  apiVersion: getEnvVar<string>('API_VERSION', 'v1'),
} as const;

export const DB_CONFIG = {
  url: getEnvVar<string>('DATABASE_URL'),
} as const;

export const REDIS_CONFIG = {
  host: getEnvVar<string>('REDIS_HOST', 'localhost'),
  port: getEnvVar<number>('REDIS_PORT', 6379),
  password: getEnvVar<string>('REDIS_PASSWORD', ''),
  db: getEnvVar<number>('REDIS_DB', 0),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
} as const;

export const JWT_CONFIG = {
  secret: getEnvVar<string>('JWT_SECRET'),
  accessTokenExpiry: getEnvVar<number>('JWT_ACCESS_TOKEN_EXPIRY', 3600),
  refreshTokenExpiry: getEnvVar<number>('JWT_REFRESH_TOKEN_EXPIRY', 86400),
  issuer: 'honojs-boilerplate',
  audience: 'honojs-boilerplate-user',
} as const;

export const DOKU_CONFIG = {
  clientId: getEnvVar<string>('DOKU_CLIENT_ID', ''),
  secretKey: getEnvVar<string>('DOKU_SECRET_KEY', ''),
  environment: getEnvVar<string>('DOKU_ENVIRONMENT', 'sandbox'),
  webhookSecret: getEnvVar<string>('DOKU_WEBHOOK_SECRET', ''),
  baseUrl: isProduction() ? 'https://api.doku.com' : 'https://api-sandbox.doku.com',
  paymentExpiryHours: 24,
} as const;

export const CORS_CONFIG = {
  allowedOrigins: getEnvVar<string[]>('ALLOWED_ORIGINS', [
    'http://localhost:3000',
    'http://localhost:5173',
  ]),
} as const;

export const RATE_LIMIT_CONFIG = {
  windowMs: getEnvVar<number>('RATE_LIMIT_WINDOW_MS', 900000),
  maxRequests: getEnvVar<number>('RATE_LIMIT_MAX_REQUESTS', 100),
} as const;

export const LOG_CONFIG = {
  level: getEnvVar<string>('LOG_LEVEL', 'info'),
  format: getEnvVar<string>('LOG_FORMAT', 'json'),
} as const;
