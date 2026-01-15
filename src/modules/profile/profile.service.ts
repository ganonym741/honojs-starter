import prisma from '../../config/database.js';
import { CreateProfileDTO, UpdateProfileDTO, UserProfile } from './profile.interface.js';
import logger from '../../utils/logger.js';
import { Dependency } from 'hono-simple-di';
import { RedisService, redisServiceDep } from '@/infrastructure/cache/redis.service.js';

const PROFILE_CACHE_PREFIX = 'profile:';
const PROFILE_CACHE_TTL = 3600; // 1 hour

export class ProfileService {
  private redisService: RedisService;

  constructor(redisService: RedisService) {
    this.redisService = redisService;
  }

  async getProfile(userId: string): Promise<UserProfile> {
    try {
      const cached = await this.redisService.get(`${PROFILE_CACHE_PREFIX}${userId}`);
      if (cached) {
        return JSON.parse(cached as any);
      }

      const profile = await prisma.profile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new Error('Profile not found');
      }

      await this.redisService.set(`${PROFILE_CACHE_PREFIX}${userId}`, JSON.stringify(profile), {
        ttl: PROFILE_CACHE_TTL,
      });

      return profile;
    } catch (error) {
      logger.error('Get profile failed:', error);
      throw error;
    }
  }

  async createProfile(userId: string, dto: CreateProfileDTO): Promise<UserProfile> {
    try {
      const profile = await prisma.profile.create({
        data: {
          userId,
          bio: dto.bio,
          address: dto.address,
          city: dto.city,
          country: dto.country,
          postalCode: dto.postalCode,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        },
      });

      await this.redisService.del(`${PROFILE_CACHE_PREFIX}${userId}`);

      logger.info('Profile created successfully', { userId });
      return profile;
    } catch (error) {
      logger.error('Create profile failed:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<UserProfile> {
    try {
      await prisma.profile.update({
        where: { userId },
        data: {
          bio: dto.bio,
          address: dto.address,
          city: dto.city,
          country: dto.country,
          postalCode: dto.postalCode,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        },
      });

      await this.redisService.del(`${PROFILE_CACHE_PREFIX}${userId}`);

      const updatedProfile = await prisma.profile.findUnique({
        where: { userId },
      });

      if (!updatedProfile) {
        throw new Error('Update failed, profile not found!');
      }

      await this.redisService.set(
        `${PROFILE_CACHE_PREFIX}${userId}`,
        JSON.stringify(updatedProfile),
        { ttl: PROFILE_CACHE_TTL }
      );

      logger.info('Profile updated successfully', { userId });
      return updatedProfile;
    } catch (error) {
      logger.error('Update profile failed:', error);
      throw error;
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    try {
      await prisma.profile.delete({
        where: { userId },
      });

      await this.redisService.del(`${PROFILE_CACHE_PREFIX}${userId}`);

      logger.info('Profile deleted successfully', { userId });
    } catch (error) {
      logger.error('Delete profile failed:', error);
      throw error;
    }
  }
}

export const profileServiceDep = new Dependency(
  async (c) => new ProfileService(await redisServiceDep.resolve(c))
);
