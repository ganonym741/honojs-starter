/**
 * Sanitization Middleware
 * Input sanitization to prevent XSS and injection attacks
 */

import { MiddlewareHandler } from 'hono';

export interface SanitizeConfig {
  sanitizeBody?: boolean; // Sanitize request body
  sanitizeQuery?: boolean; // Sanitize query parameters
  sanitizeParams?: boolean; // Sanitize route parameters
  stripTags?: boolean; // Strip HTML tags
  encodeHtml?: boolean; // Encode HTML entities
  trimWhitespace?: boolean; // Trim whitespace
  removeNullBytes?: boolean; // Remove null bytes
  maxLength?: number; // Maximum string length
  allowedTags?: string[]; // Allowed HTML tags (if stripTags is false)
}

/**
 * Sanitization middleware
 * Sanitizes user input to prevent XSS and injection attacks
 */
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

  /**
   * Sanitize a string value
   */
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

    // Encode HTML entities
    if (encodeHtml) {
      sanitized = sanitized
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;');
    }

    // Truncate if too long
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  };

  /**
   * Sanitize an object recursively
   */
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
    // Sanitize request body
    if (sanitizeBody) {
      try {
        const contentType = c.req.header('content-type');
        if (contentType && contentType.includes('application/json')) {
          const body = await c.req.json();
          const sanitizedBody = sanitizeObject(body);
          // Store sanitized body in context
          c.set('sanitizedBody', sanitizedBody);
        }
      } catch (error) {
        // Body might not be JSON or already parsed
      }
    }

    // Sanitize query parameters
    if (sanitizeQuery) {
      const query = c.req.query();
      const sanitizedQuery = sanitizeObject(query);
      // Store sanitized query in context
      c.set('sanitizedQuery', sanitizedQuery);
    }

    // Sanitize route parameters
    if (sanitizeParams) {
      const params = c.req.param();
      const sanitizedParams = sanitizeObject(params);
      // Store sanitized params in context
      c.set('sanitizedParams', sanitizedParams);
    }

    await next();
  };
}

/**
 * Sanitization presets for common use cases
 */
export const SanitizePresets = {
  /**
   * Strict sanitization (maximum protection)
   */
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

  /**
   * Moderate sanitization (balanced protection)
   */
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

  /**
   * Permissive sanitization (minimal protection)
   */
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

  /**
   * Rich text sanitization (allows some HTML tags)
   */
  richText: {
    sanitizeBody: true,
    sanitizeQuery: true,
    sanitizeParams: false,
    stripTags: false,
    encodeHtml: false,
    trimWhitespace: true,
    removeNullBytes: true,
    maxLength: 50000, // 50KB max
    allowedTags: ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  },
};

/**
 * Sanitization helpers
 */
export const SanitizeHelpers = {
  /**
   * Apply sanitization middleware with environment-based configuration
   */
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

  /**
   * Apply sanitization middleware with custom configuration
   */
  custom: (config: SanitizeConfig) => sanitizeMiddleware(config),

  /**
   * Apply sanitization middleware with strict settings
   */
  strict: () => sanitizeMiddleware(SanitizePresets.strict),

  /**
   * Apply sanitization middleware with moderate settings
   */
  moderate: () => sanitizeMiddleware(SanitizePresets.moderate),

  /**
   * Apply sanitization middleware with permissive settings
   */
  permissive: () => sanitizeMiddleware(SanitizePresets.permissive),

  /**
   * Apply sanitization middleware with rich text settings
   */
  richText: () => sanitizeMiddleware(SanitizePresets.richText),

  /**
   * Get sanitized body from context
   */
  getSanitizedBody: (c: any): any => {
    return c.get('sanitizedBody');
  },

  /**
   * Get sanitized query from context
   */
  getSanitizedQuery: (c: any): any => {
    return c.get('sanitizedQuery');
  },

  /**
   * Get sanitized params from context
   */
  getSanitizedParams: (c: any): any => {
    return c.get('sanitizedParams');
  },
};
