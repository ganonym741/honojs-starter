import prisma from '../../infrastructure/database/database.service.js';
import jwt from 'jsonwebtoken';
import { hashPassword, verifyPassword } from '../../utils/crypto.js';
import {
  RegisterDTO,
  LoginDTO,
  AuthResponse,
  RefreshTokenDTO,
  JWTPayload,
} from './auth.interface.js';
import logger from '../../utils/logger.js';
import { Dependency } from 'hono-simple-di';
import { JWT_CONFIG } from '@/config/env.js';

export class AuthService {
  constructor() {}

  async register(dto: RegisterDTO): Promise<AuthResponse> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const hashedPassword = await hashPassword(dto.password);

      const user = await prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          phone: dto.phone,
          isActive: true,
          emailVerified: false,
        },
      });

      const tokens = this.generateTokens(user.id);

      await this.createSession(user.id, tokens);

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      logger.error('Registration failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async login(dto: LoginDTO): Promise<AuthResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: dto.email },
        select: {
          id: true,
          isActive: true,
          password: true,
          email: true,
          name: true,
          avatar: true,
          phone: true,
        },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (!user.isActive) {
        throw new Error('User account is deactivated');
      }

      const isValidPassword = await verifyPassword(dto.password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      const tokens = this.generateTokens(user.id);

      await this.createSession(user.id, tokens);

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      logger.error('Login failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await prisma.session.deleteMany({
        where: { userId },
      });

      logger.info('User logged out successfully', { userId });
    } catch (error) {
      logger.error('Logout failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async refreshToken(dto: RefreshTokenDTO): Promise<AuthResponse> {
    try {
      const session = await prisma.session.findUnique({
        where: { refreshToken: dto.refreshToken },
        include: { user: true },
      });

      if (!session) {
        throw new Error('Invalid refresh token');
      }

      if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { id: session.id } });
        throw new Error('Refresh token expired');
      }

      const tokens = this.generateTokens(session.userId);

      await prisma.session.update({
        where: { id: session.id },
        data: {
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      logger.info('Token refreshed successfully', { userId: session.userId });

      return {
        user: this.sanitizeUser(session.user),
        ...tokens,
      };
    } catch (error) {
      logger.error('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, JWT_CONFIG.secret) as JWTPayload;

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { emailVerified: true },
      });

      logger.info('Email verified successfully', { userId: decoded.userId });
    } catch (error) {
      logger.error('Email verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private generateTokens(userId: string) {
    const payload: JWTPayload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = jwt.sign(payload, JWT_CONFIG.secret, {
      expiresIn: JWT_CONFIG.accessTokenExpiry,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    });

    const refreshToken = jwt.sign(payload, JWT_CONFIG.secret!, {
      expiresIn: JWT_CONFIG.refreshTokenExpiry,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    });

    return { accessToken, refreshToken };
  }

  private async createSession(
    userId: string,
    tokens: { accessToken: string; refreshToken: string }
  ) {
    await prisma.session.create({
      data: {
        userId,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  private sanitizeUser(user: any) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}

export const authServiceDep = new Dependency(() => new AuthService());
