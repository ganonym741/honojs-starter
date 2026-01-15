import { Hono } from 'hono';
import { UserHandler } from './user.handler.js';
import { userServiceDep } from './user.service.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const userRoutes = new Hono();
const userHandler = new UserHandler();

userRoutes.use('*', authMiddleware());
userRoutes.use(userServiceDep.middleware('userService'));

userRoutes.get('/me', userHandler.handleGetProfile);
userRoutes.put('/me', userHandler.handleUpdateProfile);
userRoutes.put('/me/password', userHandler.handleUpdatePassword);
userRoutes.delete('/me', userHandler.handleDeleteAccount);
userRoutes.patch('/me/deactivate', userHandler.handleDeactivateAccount);
userRoutes.patch('/me/activate', userHandler.handleActivateAccount);

export { userRoutes };
