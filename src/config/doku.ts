export const DOKU_CONFIG = {
  clientId: process.env.DOKU_CLIENT_ID || '',
  secretKey: process.env.DOKU_SECRET_KEY || '',
  environment: (process.env.DOKU_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  webhookSecret: process.env.DOKU_WEBHOOK_SECRET || '',
  baseUrl: process.env.DOKU_ENVIRONMENT === 'production'
    ? 'https://api.doku.com'
    : 'https://api-sandbox.doku.com',
  paymentExpiryHours: 24, // Payment link expiry in hours
};

export function validateDokuConfig(): void {
  if (!DOKU_CONFIG.clientId) {
    throw new Error('DOKU_CLIENT_ID must be set');
  }

  if (!DOKU_CONFIG.secretKey) {
    throw new Error('DOKU_SECRET_KEY must be set');
  }

  if (!DOKU_CONFIG.webhookSecret && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  DOKU_WEBHOOK_SECRET should be set in production');
  }
}
