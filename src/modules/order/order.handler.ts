import { Context } from 'hono';
import { OrderService } from './order.service.js';
import {
  createOrderSchema,
  updateOrderSchema,
  cancelOrderSchema,
} from '../../validators/order.validator.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

export class OrderHandler {
  constructor() {}

  async handleCreateOrder(c: Context) {
    try {
      const orderService = c.get('orderService') as OrderService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const body = await c.req.json();

      const validationResult = createOrderSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(errorResponse('Validation failed', validationResult.error.errors), 400);
      }

      const order = await orderService.createOrder(userId, validationResult.data);

      return c.json(successResponse(order), 201);
    } catch (error) {
      logger.error('Create order error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to create order'),
        500
      );
    }
  }

  async handleListOrders(c: Context) {
    try {
      const orderService = c.get('orderService') as OrderService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');

      const result = await orderService.getOrders(userId, page, limit);

      return c.json(successResponse(result), 200);
    } catch (error) {
      logger.error('List orders error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to list orders'),
        500
      );
    }
  }

  async handleGetOrder(c: Context) {
    try {
      const orderService = c.get('orderService') as OrderService;
      const userId = c.get('userId') as string;
      const orderId = c.req.param('id') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const order = await orderService.getOrderById(orderId, userId);

      return c.json(successResponse(order), 200);
    } catch (error) {
      logger.error('Get order error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to get order'),
        500
      );
    }
  }

  async handleUpdateOrder(c: Context) {
    try {
      const orderService = c.get('orderService') as OrderService;
      const userId = c.get('userId') as string;
      const orderId = c.req.param('id') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const body = await c.req.json();

      const validationResult = updateOrderSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(errorResponse('Validation failed', validationResult.error.errors), 400);
      }

      const order = await orderService.updateOrder(orderId, userId, validationResult.data);

      return c.json(successResponse(order), 200);
    } catch (error) {
      logger.error('Update order error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to update order'),
        500
      );
    }
  }

  async handleCancelOrder(c: Context) {
    try {
      const orderService = c.get('orderService') as OrderService;
      const userId = c.get('userId') as string;
      const orderId = c.req.param('id') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const body = await c.req.json();

      const validationResult = cancelOrderSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(errorResponse('Validation failed', validationResult.error.errors), 400);
      }

      const order = await orderService.cancelOrder(orderId, userId);

      return c.json(successResponse(order), 200);
    } catch (error) {
      logger.error('Cancel order error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to cancel order'),
        500
      );
    }
  }

  async handleDeleteOrder(c: Context) {
    try {
      const orderService = c.get('orderService') as OrderService;
      const userId = c.get('userId') as string;
      const orderId = c.req.param('id') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      await orderService.deleteOrder(orderId, userId);

      return c.json(successResponse({ message: 'Order deleted successfully' }), 200);
    } catch (error) {
      logger.error('Delete order error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to delete order'),
        500
      );
    }
  }
}
