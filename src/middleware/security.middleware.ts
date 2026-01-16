import { MiddlewareHandler } from 'hono';

export interface SecurityConfig {
  contentSecurityPolicy?: string; // Content-Security-Policy header
  contentSecurityPolicyReportOnly?: string; // Content-Security-Policy-Report-Only header
  crossOriginEmbedderPolicy?: string; // Cross-Origin-Embedder-Policy header
  crossOriginOpenerPolicy?: string; // Cross-Origin-Opener-Policy header
  crossOriginResourcePolicy?: string; // Cross-Origin-Resource-Policy header
  dnsPrefetchControl?: string; // DNS-Prefetch-Control header
  frameguard?: boolean; // X-Frame-Options header
  hsts?: boolean; // Strict-Transport-Security header
  hstsMaxAge?: number; // Max age for HSTS (seconds)
  hstsIncludeSubdomains?: boolean; // Include subdomains in HSTS
  hstsPreload?: boolean; // Preload HSTS
  ieNoOpen?: boolean; // X-Content-Type-Options header
  noSniff?: boolean; // X-Content-Type-Options header
  noReferrer?: boolean; // Referrer-Policy header
  referrerPolicy?: string; // Referrer-Policy header
  xssProtection?: boolean; // X-XSS-Protection header
  permissionsPolicy?: string; // Permissions-Policy header
}

export function securityMiddleware(config: SecurityConfig = {}): MiddlewareHandler {
  const {
    contentSecurityPolicy = "default-src 'self'", // Only allow resources from same origin
    contentSecurityPolicyReportOnly = "default-src 'self'",
    crossOriginEmbedderPolicy = "require-corp", // Require corporate embedding
    crossOriginOpenerPolicy = "same-origin", // Only allow same origin
    crossOriginResourcePolicy = "same-origin", // Only allow same origin
    dnsPrefetchControl = "off", // Disable DNS prefetching
    frameguard = true, // Prevent clickjacking
    hsts = true, // Enable HSTS
    hstsMaxAge = 31536000, // 1 year (31536000 seconds)
    hstsIncludeSubdomains = false, // Don't include subdomains
    hstsPreload = false, // Don't preload HSTS
    ieNoOpen = true, // Prevent IE from opening files
    noSniff = true, // Prevent MIME type sniffing
    noReferrer = true, // Hide referrer
    referrerPolicy = "no-referrer",
    xssProtection = true, // Enable XSS protection
    permissionsPolicy = "geolocation 'self'; microphone 'none'", // Only allow geolocation from same origin
  } = config;

  return async (c, next) => {
    // Content Security Policy
    if (contentSecurityPolicy) {
      c.header("Content-Security-Policy", contentSecurityPolicy);
    }
    if (contentSecurityPolicyReportOnly) {
      c.header("Content-Security-Policy-Report-Only", contentSecurityPolicyReportOnly);
    }

    // Cross Origin policies
    if (crossOriginEmbedderPolicy) {
      c.header("Cross-Origin-Embedder-Policy", crossOriginEmbedderPolicy);
    }
    if (crossOriginOpenerPolicy) {
      c.header("Cross-Origin-Opener-Policy", crossOriginOpenerPolicy);
    }
    if (crossOriginResourcePolicy) {
      c.header("Cross-Origin-Resource-Policy", crossOriginResourcePolicy);
    }

    // DNS Prefetch Control
    if (dnsPrefetchControl) {
      c.header("DNS-Prefetch-Control", dnsPrefetchControl);
    }

    // Frameguard (prevent clickjacking)
    if (frameguard) {
      c.header("X-Frame-Options", "SAMEORIGIN");
    }

    // HSTS (HTTP Strict Transport Security)
    if (hsts) {
      let hstsValue = `max-age=${hstsMaxAge}`;
      if (hstsIncludeSubdomains) {
        hstsValue += "; includeSubDomains";
      }
      if (hstsPreload) {
        hstsValue += "; preload";
      }
      c.header("Strict-Transport-Security", hstsValue);
    }

    // IE protections
    if (ieNoOpen) {
      c.header("X-Content-Type-Options", "nosniff");
    }
    if (noSniff) {
      c.header("X-Content-Type-Options", "nosniff");
    }

    // Referrer Policy
    if (noReferrer) {
      c.header("Referrer-Policy", referrerPolicy);
    }

    // XSS Protection
    if (xssProtection) {
      c.header("X-XSS-Protection", "1; mode=block");
    }

    // Permissions Policy
    if (permissionsPolicy) {
      c.header("Permissions-Policy", permissionsPolicy);
    }

    await next();
  };
}


export const SecurityPresets = {
  strict: {
    contentSecurityPolicy: "default-src 'self'",
    frameguard: true,
    hsts: true,
    hstsMaxAge: 31536000,
    hstsIncludeSubdomains: true,
    hstsPreload: true,
    ieNoOpen: true,
    noSniff: true,
    noReferrer: true,
    xssProtection: true,
    permissionsPolicy: "geolocation 'self'; microphone 'none'",
  },
  moderate: {
    contentSecurityPolicy: "default-src 'self'",
    frameguard: true,
    hsts: true,
    hstsMaxAge: 31536000,
    ieNoOpen: true,
    noSniff: true,
    noReferrer: true,
    xssProtection: true,
  },
  permissive: {
    contentSecurityPolicy: "default-src *",
    frameguard: false,
    hsts: false,
    ieNoOpen: true,
    noSniff: true,
    noReferrer: false,
    xssProtection: false,
  },
  development: {
    contentSecurityPolicy: "default-src 'self' http://localhost:*",
    frameguard: false,
    hsts: false,
    ieNoOpen: true,
    noSniff: true,
    noReferrer: false,
    xssProtection: false,
  },
};


export const SecurityHelpers = {
  environmentBased: () => {
    const env = process.env.NODE_ENV || "development";
    if (env === "production") {
      return securityMiddleware(SecurityPresets.strict);
    } else if (env === "staging") {
      return securityMiddleware(SecurityPresets.moderate);
    } else {
      return securityMiddleware(SecurityPresets.development);
    }
  },
  custom: (config: SecurityConfig) => securityMiddleware(config),
  strict: () => securityMiddleware(SecurityPresets.strict),
  moderate: () => securityMiddleware(SecurityPresets.moderate),
  permissive: () => securityMiddleware(SecurityPresets.permissive),
  development: () => securityMiddleware(SecurityPresets.development),
};
