/**
 * Security Middleware Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import {
  securityMiddleware,
  SecurityPresets,
  SecurityHelpers,
} from '../../../src/middleware/security.middleware.js';

describe('Security Middleware', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  describe('securityMiddleware', () => {
    it('should add security headers', async () => {
      app.get('/test', securityMiddleware(), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Security-Policy')).toBe("default-src 'self'");
      expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    });

    it('should add HSTS header when enabled', async () => {
      app.get('/test', securityMiddleware({ hsts: true, hstsMaxAge: 31536000 }), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=31536000');
    });

    it('should include subdomains in HSTS when configured', async () => {
      app.get(
        '/test',
        securityMiddleware({ hsts: true, hstsMaxAge: 31536000, hstsIncludeSubdomains: true }),
        (c) => {
          return c.json({ success: true });
        }
      );

      const response = await app.request('/test');

      expect(response.headers.get('Strict-Transport-Security')).toBe(
        'max-age=31536000; includeSubDomains'
      );
    });

    it('should include preload in HSTS when configured', async () => {
      app.get(
        '/test',
        securityMiddleware({ hsts: true, hstsMaxAge: 31536000, hstsPreload: true }),
        (c) => {
          return c.json({ success: true });
        }
      );

      const response = await app.request('/test');

      expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; preload');
    });

    it('should add all HSTS options when configured', async () => {
      app.get(
        '/test',
        securityMiddleware({
          hsts: true,
          hstsMaxAge: 31536000,
          hstsIncludeSubdomains: true,
          hstsPreload: true,
        }),
        (c) => {
          return c.json({ success: true });
        }
      );

      const response = await app.request('/test');

      expect(response.headers.get('Strict-Transport-Security')).toBe(
        'max-age=31536000; includeSubDomains; preload'
      );
    });

    it('should not add HSTS header when disabled', async () => {
      app.get('/test', securityMiddleware({ hsts: false }), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.headers.get('Strict-Transport-Security')).toBeNull();
    });

    it('should add Permissions-Policy header when configured', async () => {
      app.get(
        '/test',
        securityMiddleware({ permissionsPolicy: "geolocation 'self'; microphone 'none'" }),
        (c) => {
          return c.json({ success: true });
        }
      );

      const response = await app.request('/test');

      expect(response.headers.get('Permissions-Policy')).toBe(
        "geolocation 'self'; microphone 'none'"
      );
    });

    it('should use custom CSP when provided', async () => {
      const customCSP = "default-src 'self'; script-src 'self' 'unsafe-inline'";
      app.get('/test', securityMiddleware({ contentSecurityPolicy: customCSP }), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.headers.get('Content-Security-Policy')).toBe(customCSP);
    });

    it('should add Cross-Origin headers when configured', async () => {
      app.get(
        '/test',
        securityMiddleware({
          crossOriginEmbedderPolicy: 'require-corp',
          crossOriginOpenerPolicy: 'same-origin',
          crossOriginResourcePolicy: 'same-origin',
        }),
        (c) => {
          return c.json({ success: true });
        }
      );

      const response = await app.request('/test');

      expect(response.headers.get('Cross-Origin-Embedder-Policy')).toBe('require-corp');
      expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
      expect(response.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
    });
  });

  describe('SecurityPresets', () => {
    it('should apply strict preset', async () => {
      app.get('/test', securityMiddleware(SecurityPresets.strict), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
      expect(response.headers.get('Strict-Transport-Security')).toBe(
        'max-age=31536000; includeSubDomains; preload'
      );
      expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
    });

    it('should apply moderate preset', async () => {
      app.get('/test', securityMiddleware(SecurityPresets.moderate), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
      expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=31536000');
    });

    it('should apply permissive preset', async () => {
      app.get('/test', securityMiddleware(SecurityPresets.permissive), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
      expect(response.headers.get('Strict-Transport-Security')).toBeNull();
      expect(response.headers.get('X-Frame-Options')).toBeNull();
    });

    it('should apply development preset', async () => {
      app.get('/test', securityMiddleware(SecurityPresets.development), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
      expect(response.headers.get('Strict-Transport-Security')).toBeNull();
    });
  });

  describe('SecurityHelpers', () => {
    it('should provide custom helper', async () => {
      app.get('/test', SecurityHelpers.custom({ hsts: true, hstsMaxAge: 1800 }), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
      expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=1800');
    });

    it('should provide strict helper', async () => {
      app.get('/test', SecurityHelpers.strict(), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
      expect(response.headers.get('Strict-Transport-Security')).toBe(
        'max-age=31536000; includeSubDomains; preload'
      );
    });

    it('should provide moderate helper', async () => {
      app.get('/test', SecurityHelpers.moderate(), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
    });

    it('should provide permissive helper', async () => {
      app.get('/test', SecurityHelpers.permissive(), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
    });

    it('should provide development helper', async () => {
      app.get('/test', SecurityHelpers.development(), (c) => {
        return c.json({ success: true });
      });

      const response = await app.request('/test');

      expect(response.status).toBe(200);
    });
  });
});
