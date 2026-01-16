import { EnvVarConfig, validateEnvVarsOrThrow } from '../utils/env-validator.js';

export const ENV_VAR_CONFIGS: EnvVarConfig[] = [
  // Server Configuration
  {
    name: 'NODE_ENV',
    required: false,
    type: 'string',
    description: 'Application environment (development, production, test)',
  },
  {
    name: 'PORT',
    required: false,
    type: 'number',
    description: 'Server port number',
  },
  {
    name: 'API_VERSION',
    required: false,
    type: 'string',
    description: 'API version prefix',
  },

  // Database Configuration
  {
    name: 'DATABASE_URL',
    required: true,
    type: 'string',
    description: 'PostgreSQL database connection string',
  },

  // Redis Configuration
  {
    name: 'REDIS_HOST',
    required: false,
    type: 'string',
    description: 'Redis server host',
  },
  {
    name: 'REDIS_PORT',
    required: false,
    type: 'number',
    description: 'Redis server port',
  },
  {
    name: 'REDIS_PASSWORD',
    required: false,
    type: 'string',
    description: 'Redis server password (leave empty if no password)',
  },
  {
    name: 'REDIS_DB',
    required: false,
    type: 'number',
    description: 'Redis database number',
  },

  // JWT Configuration
  {
    name: 'JWT_SECRET',
    required: true,
    type: 'string',
    description: 'Secret key for JWT token signing',
  },
  {
    name: 'JWT_ACCESS_TOKEN_EXPIRY',
    required: false,
    type: 'string',
    description: 'Access token expiry time (e.g., 15m, 1h, 7d)',
  },
  {
    name: 'JWT_REFRESH_TOKEN_EXPIRY',
    required: false,
    type: 'string',
    description: 'Refresh token expiry time (e.g., 15m, 1h, 7d)',
  },

  // Doku Payment Gateway Configuration
  {
    name: 'DOKU_CLIENT_ID',
    required: true,
    type: 'string',
    description: 'Doku payment gateway client ID',
  },
  {
    name: 'DOKU_SECRET_KEY',
    required: true,
    type: 'string',
    description: 'Doku payment gateway secret key',
  },
  {
    name: 'DOKU_ENVIRONMENT',
    required: false,
    type: 'string',
    description: 'Doku environment (sandbox or production)',
  },
  {
    name: 'DOKU_WEBHOOK_SECRET',
    required: false,
    type: 'string',
    description: 'Doku webhook secret for callback verification',
  },

  // CORS Configuration
  {
    name: 'ALLOWED_ORIGINS',
    required: false,
    type: 'array',
    description: 'Comma-separated list of allowed CORS origins',
  },

  // Rate Limiting Configuration
  {
    name: 'RATE_LIMIT_WINDOW_MS',
    required: false,
    type: 'number',
    description: 'Rate limit time window in milliseconds',
  },
  {
    name: 'RATE_LIMIT_MAX_REQUESTS',
    required: false,
    type: 'number',
    description: 'Maximum requests per rate limit window',
  },

  // Logging Configuration
  {
    name: 'LOG_LEVEL',
    required: false,
    type: 'string',
    description: 'Logging level (error, warn, info, debug)',
  },
  {
    name: 'LOG_FORMAT',
    required: false,
    type: 'string',
    description: 'Log format (json or text)',
  },
];

export function validateAllEnvVars() {
  return validateEnvVarsOrThrow(ENV_VAR_CONFIGS);
}
