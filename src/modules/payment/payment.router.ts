import { Hono } from 'hono';
import { PaymentHandler } from './payment.handler.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { paymentServiceDep } from './payment.service.js';

export const paymentRoutes = new Hono();
const paymentHandler = new PaymentHandler();

paymentRoutes.use(paymentServiceDep.middleware('paymentService'));

paymentRoutes.post('/', paymentHandler.handleCreatePayment);
paymentRoutes.get('/', authMiddleware, paymentHandler.handleListPayments);
paymentRoutes.get('/statistics', authMiddleware, paymentHandler.handleGetPaymentStatistics);
paymentRoutes.get('/:id', authMiddleware, paymentHandler.handleGetPayment);
paymentRoutes.put('/:id/status', authMiddleware, paymentHandler.handleUpdatePaymentStatus);
paymentRoutes.post('/:id/refund', authMiddleware, paymentHandler.handleRefundPayment);
paymentRoutes.post('/callback', paymentHandler.handlePaymentCallback);
