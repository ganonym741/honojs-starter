import { MiddlewareHandler } from 'hono';

export interface SanitizeConfig {
  sanitizeBody?: boolean;
  sanitizeQuery?: boolean;
  sanitizeParams?: boolean;
  stripTags?: boolean;
  encodeHtml?: boolean;
  trimWhitespace?: boolean;
  removeNullBytes?: boolean;
  maxLength?: number;
  allowedTags?: string[];
}

export function sanitizeMiddleware(config: SanitizeConfig = {}): MiddlewareHandler {
  const {
    sanitizeBody = true,
    sanitizeQuery = true,
    sanitizeParams = false,
    stripTags = true,
    encodeHtml = true,
    trimWhitespace = true,
    removeNullBytes = true,
    maxLength = 10000, // 10KB max string length
    allowedTags = [],
  } = config;

  const sanitizeString = (value: string): string => {
    let sanitized = value;

    // Remove null bytes
    if (removeNullBytes) {
      sanitized = sanitized.replace(/\0/g, '');
    }

    // Trim whitespace
    if (trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // Strip HTML tags
    if (stripTags && allowedTags.length === 0) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    } else if (allowedTags.length > 0) {
      // Strip all tags except allowed ones
      const allowedTagsPattern = allowedTags.join('|');
      sanitized = sanitized.replace(
        new RegExp(`<(?!\/?(?:${allowedTagsPattern})\\b)[^>]*>`, 'gi'),
        ''
      );
    }

    if (encodeHtml) {
      sanitized = sanitized
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;');
    }

    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  };

  return async (c, next) => {
    if (sanitizeBody) {
      const contentType = c.req.header('content-type');
      if (contentType && contentType.includes('application/json')) {
        const body = await c.req.json();
        const sanitizedBody = sanitizeObject(body);
        c.set('sanitizedBody', sanitizedBody);
      }
    }

    if (sanitizeQuery) {
      const query = c.req.query();
      const sanitizedQuery = sanitizeObject(query);
      c.set('sanitizedQuery', sanitizedQuery);
    }

    if (sanitizeParams) {
      const params = c.req.param();
      const sanitizedParams = sanitizeObject(params);
      c.set('sanitizedParams', sanitizedParams);
    }

    await next();
  };
}

export const SanitizePresets = {
  strict: {
    sanitizeBody: true,
    sanitizeQuery: true,
    sanitizeParams: true,
    stripTags: true,
    encodeHtml: true,
    trimWhitespace: true,
    removeNullBytes: true,
    maxLength: 5000, // 5KB max
  },
  moderate: {
    sanitizeBody: true,
    sanitizeQuery: true,
    sanitizeParams: false,
    stripTags: true,
    encodeHtml: true,
    trimWhitespace: true,
    removeNullBytes: true,
    maxLength: 10000, // 10KB max
  },
  permissive: {
    sanitizeBody: true,
    sanitizeQuery: false,
    sanitizeParams: false,
    stripTags: false,
    encodeHtml: true,
    trimWhitespace: true,
    removeNullBytes: true,
    maxLength: 50000, // 50KB max
  },
  richText: {
    sanitizeBody: true,
    sanitizeQuery: true,
    sanitizeParams: false,
    stripTags: false,
    encodeHtml: false,
    trimWhitespace: true,
    removeNullBytes: true,
    maxLength: 50000, // 50KB max
    allowedTags: [
      'p',
      'br',
      'b',
      'i',
      'u',
      'strong',
      'em',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ],
  },
};

export const SanitizeHelpers = {
  environmentBased: () => {
    const env = process.env.NODE_ENV || 'development';
    if (env === 'production') {
      return sanitizeMiddleware(SanitizePresets.strict);
    } else if (env === 'staging') {
      return sanitizeMiddleware(SanitizePresets.moderate);
    } else {
      return sanitizeMiddleware(SanitizePresets.permissive);
    }
  },

  custom: (config: SanitizeConfig) => sanitizeMiddleware(config),
  strict: () => sanitizeMiddleware(SanitizePresets.strict),
  moderate: () => sanitizeMiddleware(SanitizePresets.moderate),
  permissive: () => sanitizeMiddleware(SanitizePresets.permissive),
  richText: () => sanitizeMiddleware(SanitizePresets.richText),
  getSanitizedBody: (c: any): any => {
    return c.get('sanitizedBody');
  },
  getSanitizedQuery: (c: any): any => {
    return c.get('sanitizedQuery');
  },
  getSanitizedParams: (c: any): any => {
    return c.get('sanitizedParams');
  },
};
