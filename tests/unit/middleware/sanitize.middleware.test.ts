/**
 * Sanitization Middleware Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import {
  sanitizeMiddleware,
  SanitizePresets,
  SanitizeHelpers,
} from '../../../src/middleware/sanitize.middleware.js';

describe('Sanitization Middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  describe('sanitizeMiddleware', () => {
    it('should sanitize request body', async () => {
      app.post('/test', sanitizeMiddleware({ sanitizeBody: true }), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '<script>alert("xss")</script>John',
          email: 'john@example.com',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.name).not.toContain('<script>');
      expect(data.data.name).toContain('John');
    });

    it('should sanitize query parameters', async () => {
      app.get('/test', sanitizeMiddleware({ sanitizeQuery: true }), (c: any) => {
        const sanitizedQuery = c.get('sanitizedQuery');
        return c.json({ success: true, data: sanitizedQuery });
      });

      const response = await app.request('/test?search=<script>alert("xss")</script>test');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.search).not.toContain('<script>');
    });

    it('should sanitize route parameters', async () => {
      app.get('/test/:id', sanitizeMiddleware({ sanitizeParams: true }), (c: any) => {
        const sanitizedParams = c.get('sanitizedParams');
        return c.json({ success: true, data: sanitizedParams });
      });

      const response = await app.request('/test/<script>alert("xss")</script>123');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.id).not.toContain('<script>');
    });

    it('should trim whitespace', async () => {
      app.post('/test', sanitizeMiddleware({ trimWhitespace: true }), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '  John Doe  ',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.name).toBe('John Doe');
    });

    it('should remove null bytes', async () => {
      app.post('/test', sanitizeMiddleware({ removeNullBytes: true }), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John\u0000Doe',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.name).not.toContain('\u0000');
    });

    it('should truncate strings exceeding max length', async () => {
      app.post('/test', sanitizeMiddleware({ maxLength: 10 }), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'This is a very long string',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.name.length).toBeLessThanOrEqual(10);
    });

    it('should allow allowed HTML tags', async () => {
      app.post(
        '/test',
        sanitizeMiddleware({
          stripTags: false,
          allowedTags: ['p', 'b', 'i'],
        }),
        (c: any) => {
          const sanitizedBody = c.get('sanitizedBody');
          return c.json({ success: true, data: sanitizedBody });
        }
      );

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '<p><b>Bold</b> and <i>italic</i></p><script>alert("xss")</script>',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.content).toContain('<p>');
      expect(data.data.content).toContain('<b>');
      expect(data.data.content).not.toContain('<script>');
    });

    it('should encode HTML entities', async () => {
      app.post('/test', sanitizeMiddleware({ encodeHtml: true }), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '<div>Test & "quotes"</div>',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.content).toContain('<');
      expect(data.data.content).toContain('>');
      expect(data.data.content).toContain('&');
      expect(data.data.content).toContain('"');
    });
  });

  describe('SanitizePresets', () => {
    it('should apply strict preset', async () => {
      app.post('/test', sanitizeMiddleware(SanitizePresets.strict), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '<script>alert("xss")</script>John',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.name).not.toContain('<script>');
    });

    it('should apply moderate preset', async () => {
      app.post('/test', sanitizeMiddleware(SanitizePresets.moderate), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '<script>alert("xss")</script>John',
        }),
      });

      expect(response.status).toBe(200);
    });

    it('should apply permissive preset', async () => {
      app.post('/test', sanitizeMiddleware(SanitizePresets.permissive), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '<script>alert("xss")</script>John',
        }),
      });

      expect(response.status).toBe(200);
    });

    it('should apply rich text preset', async () => {
      app.post('/test', sanitizeMiddleware(SanitizePresets.richText), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '<p><b>Bold</b> text</p><script>alert("xss")</script>',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.content).toContain('<p>');
      expect(data.data.content).toContain('<b>');
      expect(data.data.content).not.toContain('<script>');
    });
  });

  describe('SanitizeHelpers', () => {
    it('should provide custom helper', async () => {
      app.post('/test', SanitizeHelpers.custom({ maxLength: 20 }), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'This is a very long string',
        }),
      });

      expect(response.status).toBe(200);
    });

    it('should provide strict helper', async () => {
      app.post('/test', SanitizeHelpers.strict(), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '<script>alert("xss")</script>John',
        }),
      });

      expect(response.status).toBe(200);
    });

    it('should provide moderate helper', async () => {
      app.post('/test', SanitizeHelpers.moderate(), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '<script>alert("xss")</script>John',
        }),
      });

      expect(response.status).toBe(200);
    });

    it('should provide permissive helper', async () => {
      app.post('/test', SanitizeHelpers.permissive(), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '<script>alert("xss")</script>John',
        }),
      });

      expect(response.status).toBe(200);
    });

    it('should provide rich text helper', async () => {
      app.post('/test', SanitizeHelpers.richText(), (c: any) => {
        const sanitizedBody = c.get('sanitizedBody');
        return c.json({ success: true, data: sanitizedBody });
      });

      const response = await app.request('/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '<p><b>Bold</b> text</p>',
        }),
      });

      expect(response.status).toBe(200);
    });
  });
});
