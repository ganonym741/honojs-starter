import { MiddlewareHandler } from 'hono';
import { z } from 'zod';
import logger from '../utils/logger.js';

export interface ValidationConfig {
  body?: z.ZodSchema<any>;
  query?: z.ZodSchema<any>;
  params?: z.ZodSchema<any>;
  errorHandler?: (error: z.ZodError, c: any) => Response | void;
}

export function validationMiddleware(config: ValidationConfig): MiddlewareHandler {
  return async (c, next) => {
    try {
      // Validate request body
      if (config.body) {
        const body = await c.req.json();
        const validatedBody = config.body.parse(body);
        c.set('validatedBody', validatedBody);
      }

      // Validate query parameters
      if (config.query) {
        const validatedQuery = config.query.parse(c.req.query());
        c.set('validatedQuery', validatedQuery);
      }

      // Validate route parameters
      if (config.params) {
        const validatedParams = config.params.parse(c.req.param());
        c.set('validatedParams', validatedParams);
      }

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error:', {
          path: c.req.path,
          method: c.req.method,
          errors: error.errors,
        });

        if (config.errorHandler) {
          const response = config.errorHandler(error, c);
          if (response) {
            return c.json(response, 400);
          }
        }

        // Default error response
        return c.json(
          {
            success: false,
            error: 'Validation failed',
            details: error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
          400
        );
      }

      throw error;
    }
  };
}

export const ValidationHelpers = {
  body: <T>(schema: z.ZodSchema<T>) => validationMiddleware({ body: schema }),
  query: <T>(schema: z.ZodSchema<T>) => validationMiddleware({ query: schema }),
  params: <T>(schema: z.ZodSchema<T>) => validationMiddleware({ params: schema }),
  bodyAndQuery: <TBody, TQuery>(bodySchema: z.ZodSchema<TBody>, querySchema: z.ZodSchema<TQuery>) =>
    validationMiddleware({ body: bodySchema, query: querySchema }),
  all: <TBody, TQuery, TParams>(
    bodySchema: z.ZodSchema<TBody>,
    querySchema: z.ZodSchema<TQuery>,
    paramsSchema: z.ZodSchema<TParams>
  ) => validationMiddleware({ body: bodySchema, query: querySchema, params: paramsSchema }),
};

export const CommonSchemas = {
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
  id: z.object({
    id: z.string().cuid(),
  }),
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
  sort: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
  search: z.object({
    query: z.string().min(1).max(100).optional(),
    fields: z.array(z.string()).optional(),
  }),
};
