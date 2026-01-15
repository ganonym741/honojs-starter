/**
 * User Handler
 * HTTP request handlers for user endpoints
 */

import { Context } from 'hono';
import { updateProfileSchema, updatePasswordSchema, deleteAccountSchema } from '../../validators/user.validator.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';
import { UserService } from './user.service.js';

export class UserHandler {
  constructor() {}

  async handleGetProfile(c: Context) {
    try {
      const userService = c.get('userService') as UserService;

      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(
          errorResponse('User not authenticated'),
          401
        );
      }

      const profile = await userService.getUserById(userId);

      return c.json(successResponse(profile), 200);
    } catch (error) {
      logger.error('Get profile error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to get profile'),
        500
      );
    }
  }

  async handleUpdateProfile(c: Context) {
    try {
      const userService = c.get('userService') as UserService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(
          errorResponse('User not authenticated'),
          401
        );
      }

      const body = await c.req.json();

      const validationResult = updateProfileSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          errorResponse('Validation failed', validationResult.error.errors),
          400
        );
      }

      const profile = await userService.updateProfile(userId, validationResult.data);

      return c.json(successResponse(profile), 200);
    } catch (error) {
      logger.error('Update profile error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to update profile'),
        500
      );
    }
  }

  async handleUpdatePassword(c: Context) {
    try {
      const userService = c.get('userService') as UserService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(
          errorResponse('User not authenticated'),
          401
        );
      }

      const body = await c.req.json();

      const validationResult = updatePasswordSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          errorResponse('Validation failed', validationResult.error.errors),
          400
        );
      }

      await userService.updatePassword(userId, validationResult.data);

      return c.json(
        successResponse({ message: 'Password updated successfully' }),
        200
      );
    } catch (error) {
      logger.error('Update password error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to update password'),
        500
      );
    }
  }

  async handleDeleteAccount(c: Context) {
    try {
      const userService = c.get('userService') as UserService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(
          errorResponse('User not authenticated'),
          401
        );
      }

      const body = await c.req.json();

      const validationResult = deleteAccountSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(
          errorResponse('Validation failed', validationResult.error.errors),
          400
        );
      }

      await userService.deleteAccount(userId, validationResult.data);

      return c.json(
        successResponse({ message: 'Account deleted successfully' }),
        200
      );
    } catch (error) {
      logger.error('Delete account error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to delete account'),
        500
      );
    }
  }

  async handleDeactivateAccount(c: Context) {
    try {
      const userService = c.get('userService') as UserService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(
          errorResponse('User not authenticated'),
          401
        );
      }

      await userService.deactivateAccount(userId);

      return c.json(
        successResponse({ message: 'Account deactivated successfully' }),
        200
      );
    } catch (error) {
      logger.error('Deactivate account error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to deactivate account'),
        500
      );
    }
  }

  async handleActivateAccount(c: Context) {
    try {
      const userService = c.get('userService') as UserService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(
          errorResponse('User not authenticated'),
          401
        );
      }

      await userService.activateAccount(userId);

      return c.json(
        successResponse({ message: 'Account activated successfully' }),
        200
      );
    } catch (error) {
      logger.error('Activate account error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to activate account'),
        500
      );
    }
  }
}
