import 'dotenv/config';
import { Hono } from 'hono';
import { getMiddleware } from './middleware/index.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';
import { handleHealthCheck } from './modules/health.handler.js';
import { authRoutes } from './modules/auth/auth.router.js';
import { userRoutes } from './modules/user/user.router.js';
import { profileRoutes } from './modules/profile/profile.router.js';
import { orderRoutes } from './modules/order/order.router.js';
import { paymentRoutes } from './modules/payment/payment.router.js';
import { validateAllEnvVars } from './config/env.config.js';
import { ENV, isDevelopment } from './config/env.js';
import { SwaggerService } from './infrastructure/swagger/swagger.service.js';

const app = new Hono();

validateAllEnvVars();

const middleware = getMiddleware();
middleware.forEach((mw) => app.use('*', mw));

app.get('/health', handleHealthCheck);
app.get('/api/version', (c) => {
  return c.json({
    name: 'Hono.js Boilerplate',
    version: '1.0.0',
    api: 'v1',
  });
});

app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/profile', profileRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/payments', paymentRoutes);

if (isDevelopment()) {
  const swaggerService = new SwaggerService();
  app.get('/api/docs', swaggerService.handleSwaggerUI);
}

app.notFound(notFoundMiddleware());
app.onError(errorMiddleware());

console.log(`Server starting on port ${ENV.port}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

export default {
  port: ENV.port,
  fetch: app.fetch,
};
