export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  accessTokenExpiry: +(process.env.JWT_ACCESS_TOKEN_EXPIRY || '900'),
  refreshTokenExpiry: +(process.env.JWT_REFRESH_TOKEN_EXPIRY || '86400'),
  issuer: 'honojs-boilerplate',
  audience: 'honojs-boilerplate-users',
};

export function validateJWTConfig(): void {
  if (!process.env.JWT_SECRET) {
    console.error('Please set a secure secret in production!');
  }
}
