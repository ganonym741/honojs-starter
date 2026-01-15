import { Hono } from 'hono';
import { AuthHandler } from './auth.handler.js';
import { authServiceDep } from './auth.service.js';

const authRoutes = new Hono();
const authHandler = new AuthHandler();

authRoutes.use(authServiceDep.middleware('authService'));

authRoutes.post('/register', authHandler.handleRegister);
authRoutes.post('/login', authHandler.handleLogin);
authRoutes.post('/logout', authHandler.handleLogout);
authRoutes.post('/refresh', authHandler.handleRefreshToken);
authRoutes.post('/verify-email', authHandler.handleVerifyEmail);
authRoutes.post('/forgot-password', authHandler.handleForgotPassword);
authRoutes.post('/reset-password', authHandler.handleResetPassword);

export { authRoutes };
