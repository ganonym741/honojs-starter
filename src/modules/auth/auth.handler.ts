import { Context } from 'hono';
import { AuthService } from './auth.service.js';
import { registerSchema, loginSchema, refreshTokenSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema } from '../../validators/auth.validator.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

export class AuthHandler {
  constructor() {}

  async handleRegister(c: Context) {
    try {
      const authService = c.get('authService') as AuthService;
      const body = await c.req.json();

      const validationResult = registerSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          errorResponse('Validation failed', validationResult.error.errors),
          400
        );
      }

      const result = await authService.register(validationResult.data);

      return c.json(successResponse(result), 201);
    } catch (error) {
      logger.error('Registration error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to register user'),
        400
      );
    }
  }

  async handleLogin(c: Context) {
    try {
      const authService = c.get('authService') as AuthService;
      const body = await c.req.json();

      const validationResult = loginSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          errorResponse('Validation failed', validationResult.error.errors),
          400
        );
      }

      const result = await authService.login(validationResult.data);

      return c.json(successResponse(result), 200);
    } catch (error) {
      logger.error('Login error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to login'),
        401
      );
    }
  }

  async handleLogout(c: Context) {
    try {
      const authService = c.get('authService') as AuthService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(
          errorResponse('User not authenticated'),
          401
        );
      }

      await authService.logout(userId);

      return c.json(successResponse({ message: 'Logged out successfully' }), 200);
    } catch (error) {
      logger.error('Logout error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to logout'),
        500
      );
    }
  }

  async handleRefreshToken(c: Context) {
    try {
      const authService = c.get('authService') as AuthService;
      const body = await c.req.json();

      const validationResult = refreshTokenSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          errorResponse('Validation failed', validationResult.error.errors),
          400
        );
      }

      const result = await authService.refreshToken(validationResult.data);

      return c.json(successResponse(result), 200);
    } catch (error) {
      logger.error('Token refresh error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to refresh token'),
        401
      );
    }
  }

  async handleVerifyEmail(c: Context) {
    try {
      const authService = c.get('authService') as AuthService;
      const body = await c.req.json();

      const validationResult = verifyEmailSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          errorResponse('Validation failed', validationResult.error.errors),
          400
        );
      }

      await authService.verifyEmail(validationResult.data.token);

      return c.json(successResponse({ message: 'Email verified successfully' }), 200);
    } catch (error) {
      logger.error('Email verification error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to verify email'),
        400
      );
    }
  }

  async handleForgotPassword(c: Context) {
    try {
      const body = await c.req.json();

      const validationResult = forgotPasswordSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          errorResponse('Validation failed', validationResult.error.errors),
          400
        );
      }

      // TODO: Implement email sending logic
      // For now, just return success
      logger.info('Password reset requested for email:', validationResult.data.email);

      return c.json(
        successResponse({ message: 'Password reset link sent to email' }),
        200
      );
    } catch (error) {
      logger.error('Forgot password error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to process forgot password'),
        500
      );
    }
  }

  async handleResetPassword(c: Context) {
    try {
      const body = await c.req.json();

      const validationResult = resetPasswordSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          errorResponse('Validation failed', validationResult.error.errors),
          400
        );
      }

      // TODO: Implement password reset logic
      // For now, just return success
      logger.info('Password reset requested with token:', validationResult.data.token);

      return c.json(
        successResponse({ message: 'Password reset successfully' }),
        200
      );
    } catch (error) {
      logger.error('Reset password error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to reset password'),
        500
      );
    }
  }
}
