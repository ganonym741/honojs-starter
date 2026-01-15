import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { getMiddleware } from './middleware/index.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';
import { handleHealthCheck } from './modules/health.handler.js';
import { authRoutes } from './modules/auth/auth.router.js';
import { userRoutes } from './modules/user/user.router.js';
import { profileRoutes } from './modules/profile/profile.router.js';
import { orderRoutes } from './modules/order/order.router.js';
import { paymentRoutes } from './modules/payment/payment.router.js';

const app = new Hono();

const middleware = getMiddleware();
middleware.forEach(mw => app.use('*', mw));

app.get('/health', handleHealthCheck);
app.get('/api/version', (c) => {
  return c.json({
    name: 'Hono.js Boilerplate',
    version: '1.0.0',
    api: 'v1'
  });
});

app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/profile', profileRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/payments', paymentRoutes);

app.notFound(notFoundMiddleware());
app.onError(errorMiddleware());

const PORT = parseInt(process.env.PORT || '3000');

console.log(`Server starting on port ${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

serve({
  fetch: app.fetch,
  port: PORT
});

export default app;
