import { Hono } from 'hono';
import { OrderHandler } from './order.handler.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { orderServiceDep } from './order.service.js';

export const orderRoutes = new Hono();
const orderHandler = new OrderHandler();

orderRoutes.use(orderServiceDep.middleware('orderService'));

orderRoutes.post('/', authMiddleware, orderHandler.handleCreateOrder);
orderRoutes.get('/', authMiddleware, orderHandler.handleListOrders);
orderRoutes.get('/:id', authMiddleware, orderHandler.handleGetOrder);
orderRoutes.put('/:id', authMiddleware, orderHandler.handleUpdateOrder);
orderRoutes.post('/:id/cancel', authMiddleware, orderHandler.handleCancelOrder);
orderRoutes.delete('/:id', authMiddleware, orderHandler.handleDeleteOrder);
