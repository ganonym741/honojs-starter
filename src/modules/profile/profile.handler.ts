import { Context } from 'hono';
import { createProfileSchema, updateProfileSchema } from '../../validators/profile.validator.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';
import { ProfileService } from './profile.service.js';

export class ProfileHandler {
  constructor() {}

  async handleGetProfile(c: Context) {
    try {
      const profileService = c.get('profileService') as ProfileService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const profile = await profileService.getProfile(userId);

      return c.json(successResponse(profile), 200);
    } catch (error) {
      logger.error('Get profile error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to get profile'),
        500
      );
    }
  }

  async handleCreateProfile(c: Context) {
    try {
      const profileService = c.get('profileService') as ProfileService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const body = await c.req.json();
      const validationResult = createProfileSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(errorResponse('Validation failed', validationResult.error.errors), 400);
      }

      const profile = await profileService.createProfile(userId, validationResult.data);

      return c.json(successResponse(profile), 201);
    } catch (error) {
      logger.error('Create profile error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to create profile'),
        500
      );
    }
  }

  async handleUpdateProfile(c: Context) {
    try {
      const profileService = c.get('profileService') as ProfileService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const body = await c.req.json();

      const validationResult = updateProfileSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(errorResponse('Validation failed', validationResult.error.errors), 400);
      }

      const profile = await profileService.updateProfile(userId, validationResult.data);

      return c.json(successResponse(profile), 200);
    } catch (error) {
      logger.error('Update profile error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to update profile'),
        500
      );
    }
  }

  async handleDeleteProfile(c: Context) {
    try {
      const profileService = c.get('profileService') as ProfileService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      await profileService.deleteProfile(userId);

      return c.json(successResponse({ message: 'Profile deleted successfully' }), 200);
    } catch (error) {
      logger.error('Delete profile error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to delete profile'),
        500
      );
    }
  }
}
