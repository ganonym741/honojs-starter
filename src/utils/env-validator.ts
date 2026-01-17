export interface EnvVarConfig {
  name: string;
  required: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array';
  description?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Record<string, any>;
}

export function validateEnvVars(configs: EnvVarConfig[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config: Record<string, any> = {};

  for (const envConfig of configs) {
    const envValue = process.env[envConfig.name];
    const hasValue = envValue !== undefined && envValue !== '';

    // Check if required variable is missing
    if (envConfig.required && !hasValue) {
      errors.push(
        `❌ Required environment variable '${envConfig.name}' is missing. ${envConfig.description || ''}`
      );
      continue;
    }

    // Handle optional variables
    if (!envConfig.required) continue;

    const value = envValue!;
    let convertedValue: any = value;

    switch (envConfig.type) {
      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors.push(
            `❌ Environment variable '${envConfig.name}' must be a number. Got: '${value}'`
          );
          continue;
        }
        convertedValue = numValue;
        break;

      case 'boolean':
        if (value.toLowerCase() === 'true') {
          convertedValue = true;
        } else if (value.toLowerCase() === 'false') {
          convertedValue = false;
        } else {
          errors.push(
            `❌ Environment variable '${envConfig.name}' must be 'true' or 'false'. Got: '${value}'`
          );
          continue;
        }
        break;

      case 'array':
        convertedValue = value.split(',').map((item) => item.trim());
        break;

      case 'string':
      default:
        convertedValue = value;
        break;
    }

    config[envConfig.name] = convertedValue;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

export function validateEnvVarsOrThrow(configs: EnvVarConfig[]): Record<string, any> {
  const result = validateEnvVars(configs);

  if (!result.isValid) {
    throw new Error('Environment variable validation failed');
  }

  return result.config;
}

export function getEnvVar<T = string>(name: string, defaultValue?: T): T {
  const value = process.env[name];

  if (!value) return defaultValue as T;

  if (Array.isArray(defaultValue)) {
    return value.split(',').map((item) => item.trim()) as T;
  }

  switch (typeof defaultValue) {
    case 'number':
      const numValue = Number(value);
      if (isNaN(numValue)) {
        throw new Error(`Environment variable '${name}' must be a number. Got: '${value}'`);
      }
      return numValue as T;

    case 'boolean':
      if (value.toLowerCase() === 'true') {
        return true as T;
      } else if (value.toLowerCase() === 'false') {
        return false as T;
      }
      throw new Error(`Environment variable '${name}' must be 'true' or 'false'. Got: '${value}'`);

    case 'string':
    default:
      return value as T;
  }
}
