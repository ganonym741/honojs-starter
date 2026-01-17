/**
 * Validation Middleware Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import {
  validationMiddleware,
  ValidationHelpers,
  CommonSchemas,
} from '../../../src/middleware/validation.middleware.js';
import { z } from 'zod';

describe('Validation Middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  describe('validationMiddleware', () => {
    it('should validate request body', async () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });

      app.post('/test', validationMiddleware({ body: schema }), (c) => {
        const body = c.get('validatedBody') as any;
        return c.json({ success: true, data: body });
      });

      const validResponse = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
      });

      expect(validResponse.status).toBe(200);
      const validData = await validResponse.json();
      expect(validData.success).toBe(true);
      expect(validData.data).toEqual({ name: 'John Doe', email: 'john@example.com' });
    });

    it('should reject invalid request body', async () => {
      const schema = z.object({
        name: z.string(),
        email: z.string().email(),
      });

      app.post('/test', validationMiddleware({ body: schema }), (c) => {
        return c.json({ success: true });
      });

      const invalidResponse = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe', email: 'invalid-email' }),
      });

      expect(invalidResponse.status).toBe(400);
      const invalidData = await invalidResponse.json();
      expect(invalidData.error).toBeDefined();
    });

    it('should validate query parameters', async () => {
      const schema = z.object({
        page: z.string().transform(Number),
        limit: z.string().transform(Number),
      });

      app.get('/test', validationMiddleware({ query: schema }), (c) => {
        const query = c.get('validatedQuery') as any;
        return c.json({ success: true, data: query });
      });

      const response = await app.request('/test?page=1&limit=10');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual({ page: 1, limit: 10 });
    });

    it('should validate route parameters', async () => {
      const schema = z.object({
        id: z.string().uuid(),
      });

      app.get('/test/:id', validationMiddleware({ params: schema }), (c) => {
        const params = c.get('validatedParams') as any;
        return c.json({ success: true, data: params });
      });

      const validId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await app.request(`/test/${validId}`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual({ id: validId });
    });
  });

  describe('ValidationHelpers', () => {
    it('should provide body helper', async () => {
      const schema = z.object({
        name: z.string(),
      });

      app.post('/test', ValidationHelpers.body(schema), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      });

      expect(response.status).toBe(200);
    });

    it('should provide query helper', async () => {
      const schema = z.object({
        search: z.string(),
      });

      app.get('/test', ValidationHelpers.query(schema), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test?search=test');

      expect(response.status).toBe(200);
    });

    it('should provide params helper', async () => {
      const schema = z.object({
        id: z.string(),
      });

      app.get('/test/:id', ValidationHelpers.params(schema), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test/123');

      expect(response.status).toBe(200);
    });
  });

  describe('CommonSchemas', () => {
    it('should provide pagination schema', async () => {
      app.get('/test', validationMiddleware({ query: CommonSchemas.pagination }), (c) => {
        const query = c.get('validatedQuery') as any;
        return c.json({ success: true, data: query });
      });

      const response = await app.request('/test?page=1&limit=10');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.page).toBe(1);
      expect(data.data.limit).toBe(10);
    });

    it('should provide id schema', async () => {
      app.get('/test/:id', validationMiddleware({ params: CommonSchemas.id }), (c) => {
        const params = c.get('validatedParams') as any;
        return c.json({ success: true, data: params });
      });

      const response = await app.request('/test/123');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.id).toBe(123);
    });

    it('should provide search schema', async () => {
      app.get('/test', validationMiddleware({ query: CommonSchemas.search }), (c) => {
        const query = c.get('validatedQuery') as any;
        return c.json({ success: true, data: query });
      });

      const response = await app.request('/test?q=test&page=1&limit=10');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.q).toBe('test');
    });
  });
});
