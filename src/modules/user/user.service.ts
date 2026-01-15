import prisma from '../../config/database.js';
import {
  RedisService,
  redisServiceDep,
} from '../../infrastructure/cache/redis.service.js';
import { hashPassword, verifyPassword } from '../../utils/crypto.js';
import {
  UpdateProfileDTO,
  UpdatePasswordDTO,
  DeleteAccountDTO,
  UserProfile,
} from './user.interface.js';
import logger from '../../utils/logger.js';
import { Dependency } from 'hono-simple-di';

const USER_CACHE_PREFIX = 'user:';
const USER_CACHE_TTL = 3600; // 1 hour

export class UserService {
  private redisService: RedisService;

  constructor(redisService: RedisService) {
    this.redisService = redisService;
  }

  async getUserById(userId: string): Promise<UserProfile> {
    try {
      const cached = await this.redisService.get(`${USER_CACHE_PREFIX}${userId}`);
      if (cached) {
        return cached as UserProfile;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profiles: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      await this.redisService.set(`${USER_CACHE_PREFIX}${userId}`, user, { ttl: USER_CACHE_TTL });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profiles?.[0],
      };
    } catch (error) {
      logger.error('Get user failed:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<UserProfile> {
    try {
      await Promise.all([
        prisma.user.update({
          where: { id: userId },
          data: {
            name: dto.name,
            phone: dto.phone,
            avatar: dto.avatar,
          },
        }),
        this.redisService.del(`${USER_CACHE_PREFIX}${userId}`),
      ]);

      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { profiles: true },
      });

      if (!updatedUser) {
        throw new Error('Update failed, user not found!');
      }

      await this.redisService.set(`${USER_CACHE_PREFIX}${userId}`, updatedUser, { ttl: USER_CACHE_TTL });

      logger.info('Profile updated successfully', { userId });
      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        isActive: updatedUser.isActive,
        emailVerified: updatedUser.emailVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        profile: updatedUser.profiles?.[0],
      };
    } catch (error) {
      logger.error('Update profile failed:', error);
      throw error;
    }
  }

  async updatePassword(userId: string, dto: UpdatePasswordDTO): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await verifyPassword(dto.currentPassword, user.password);

      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      const hashedPassword = await hashPassword(dto.newPassword);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      logger.info('Password updated successfully', { userId });
    } catch (error) {
      logger.error('Update password failed:', error);
      throw error;
    }
  }

  async deleteAccount(userId: string, dto: DeleteAccountDTO): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await verifyPassword(dto.password, user.password);

      if (!isValidPassword) {
        throw new Error('Incorrect password');
      }

      await prisma.user.delete({
        where: { id: userId },
      });

      await this.redisService.del(`${USER_CACHE_PREFIX}${userId}`);

      logger.info('Account deleted successfully', { userId });
    } catch (error) {
      logger.error('Delete account failed:', error);
      throw error;
    }
  }

  async deactivateAccount(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      await this.redisService.del(`${USER_CACHE_PREFIX}${userId}`);

      logger.info('Account deactivated', { userId });
    } catch (error) {
      logger.error('Deactivate account failed:', error);
      throw error;
    }
  }

  async activateAccount(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      });

      await this.redisService.del(`${USER_CACHE_PREFIX}${userId}`);

      logger.info('Account activated', { userId });
    } catch (error) {
      logger.error('Activate account failed:', error);
      throw error;
    }
  }
}

export const userServiceDep = new Dependency(
  async (c) => new UserService(await redisServiceDep.resolve(c))
);
