import { Hono } from 'hono';
import { ProfileHandler } from './profile.handler.js';
import { profileServiceDep } from './profile.service.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { redisServiceDep } from '@/infrastructure/cache/cache.service.js';

const profileRoutes = new Hono();
const profileHandler = new ProfileHandler();

profileRoutes.use('*', authMiddleware());
profileRoutes.use(redisServiceDep.middleware('redisService'));
profileRoutes.use(profileServiceDep.middleware('profileService'));

profileRoutes.get('/', profileHandler.handleGetProfile);
profileRoutes.post('/', profileHandler.handleCreateProfile);
profileRoutes.put('/', profileHandler.handleUpdateProfile);
profileRoutes.delete('/', profileHandler.handleDeleteProfile);

export { profileRoutes };
