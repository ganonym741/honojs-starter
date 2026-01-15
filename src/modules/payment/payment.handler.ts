import { Context } from 'hono';
import { PaymentService } from './payment.service.js';
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
  paymentCallbackSchema,
  refundPaymentSchema,
} from '../../validators/payment.validator.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import logger from '../../utils/logger.js';

export class PaymentHandler {
  constructor() {}

  async handleCreatePayment(c: Context) {
    try {
      const paymentService = c.get('paymentService') as PaymentService;

      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const body = await c.req.json();

      // Validate request body
      const validationResult = createPaymentSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(errorResponse('Validation failed', validationResult.error.errors), 400);
      }

      const payment = await paymentService.createPayment(userId, validationResult.data);

      return c.json(successResponse(payment), 201);
    } catch (error) {
      logger.error('Create payment error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to create payment'),
        500
      );
    }
  }

  async handleGetPayment(c: Context) {
    try {
      const paymentService = c.get('paymentService') as PaymentService;
      const userId = c.get('userId') as string;
      const paymentId = c.req.param('id') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const payment = await paymentService.getPaymentById(paymentId, userId);

      return c.json(successResponse(payment), 200);
    } catch (error) {
      logger.error('Get payment error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to get payment'),
        500
      );
    }
  }

  async handleListPayments(c: Context) {
    try {
      const paymentService = c.get('paymentService') as PaymentService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');

      const filters: any = {};
      if (c.req.query('status')) {
        filters.status = c.req.query('status');
      }
      if (c.req.query('paymentMethod')) {
        filters.paymentMethod = c.req.query('paymentMethod');
      }
      if (c.req.query('startDate')) {
        filters.startDate = new Date(c.req.query('startDate') as string);
      }
      if (c.req.query('endDate')) {
        filters.endDate = new Date(c.req.query('endDate') as string);
      }

      const result = await paymentService.getPayments(userId, page, limit, filters);

      return c.json(successResponse(result), 200);
    } catch (error) {
      logger.error('List payments error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to list payments'),
        500
      );
    }
  }

  async handlePaymentCallback(c: Context) {
    try {
      const paymentService = c.get('paymentService') as PaymentService;
      const body = await c.req.json();

      const validationResult = paymentCallbackSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(errorResponse('Invalid callback data', validationResult.error.errors), 400);
      }

      const result = await paymentService.handlePaymentCallback(validationResult.data);

      return c.json(successResponse(result), 200);
    } catch (error) {
      logger.error('Payment callback error:', error);
      return c.json(
        errorResponse(
          error instanceof Error ? error.message : 'Failed to process payment callback'
        ),
        500
      );
    }
  }

  async handleUpdatePaymentStatus(c: Context) {
    try {
      const paymentService = c.get('paymentService') as PaymentService;
      const userId = c.get('userId') as string;
      const paymentId = c.req.param('id') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const body = await c.req.json();

      const validationResult = updatePaymentStatusSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(errorResponse('Validation failed', validationResult.error.errors), 400);
      }

      const result = await paymentService.updatePaymentStatus(
        paymentId,
        userId,
        validationResult.data
      );

      return c.json(successResponse(result), 200);
    } catch (error) {
      logger.error('Update payment status error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to update payment status'),
        500
      );
    }
  }

  async handleRefundPayment(c: Context) {
    try {
      const paymentService = c.get('paymentService') as PaymentService;
      const userId = c.get('userId') as string;
      const paymentId = c.req.param('id') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const body = await c.req.json();

      const validationResult = refundPaymentSchema.safeParse(body);

      if (!validationResult.success) {
        return c.json(errorResponse('Validation failed', validationResult.error.errors), 400);
      }

      const result = await paymentService.refundPayment(paymentId, userId, validationResult.data);

      return c.json(successResponse(result), 200);
    } catch (error) {
      logger.error('Refund payment error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to refund payment'),
        500
      );
    }
  }

  async handleGetPaymentStatistics(c: Context) {
    try {
      const paymentService = c.get('paymentService') as PaymentService;
      const userId = c.get('userId') as string;

      if (!userId) {
        return c.json(errorResponse('User not authenticated'), 401);
      }

      const filters: any = {};
      if (c.req.query('startDate')) {
        filters.startDate = c.req.query('startDate');
      }
      if (c.req.query('endDate')) {
        filters.endDate = c.req.query('endDate');
      }
      if (c.req.query('paymentMethod')) {
        filters.paymentMethod = c.req.query('paymentMethod');
      }

      const statistics = await paymentService.getPaymentStatistics(userId, filters);

      return c.json(successResponse(statistics), 200);
    } catch (error) {
      logger.error('Get payment statistics error:', error);
      return c.json(
        errorResponse(error instanceof Error ? error.message : 'Failed to get payment statistics'),
        500
      );
    }
  }
}
