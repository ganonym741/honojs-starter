import { DOKU_CONFIG as dokuConfig } from '../../config/doku.js';
import logger from '../../utils/logger.js';
import crypto from 'crypto';
import axios from 'axios';
import prisma from '@/config/database.js';
import { Dependency } from 'hono-simple-di';
import { RedisService, redisServiceDep } from '@/infrastructure/cache/redis.service.js';
import { PaymentStatus, OrderStatus } from '../../../prisma/generated/enums.js';

const PAYMENT_CACHE_PREFIX = 'payment:';
const PAYMENT_CACHE_TTL = 30 * 60; // 30 minutes

export class PaymentService {
  private redisService: RedisService;

  constructor(redisService: RedisService) {
    this.redisService = redisService;
  }

  async createPayment(userId: string, dto: any): Promise<any> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: dto.orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.userId !== userId) {
        throw new Error('You do not have permission to access this order');
      }

      if (order.paymentStatus !== PaymentStatus.PENDING) {
        throw new Error('Order has already been paid or processed');
      }

      const orderTotal = parseFloat(order.totalAmount.toString());
      if (dto.amount !== orderTotal) {
        throw new Error('Payment amount does not match order total');
      }

      const paymentId = crypto.randomUUID();

      const expiryMinutes = dto.expiryMinutes ?? 60;
      const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);

      const payment = await prisma.payment.create({
        data: {
          id: paymentId,
          orderId: dto.orderId,
          amount: dto.amount,
          currency: dto.currency || 'IDR',
          paymentMethod: dto.paymentMethod,
          status: PaymentStatus.PENDING,
          expiryDate,
          paymentData: dto.customerDetails ? { customerDetails: dto.customerDetails } : {},
        },
      });

      let dokuResponse;
      try {
        dokuResponse = await this.createDokuPayment({
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: dto.amount,
          currency: dto.currency || 'IDR',
          paymentMethod: dto.paymentMethod,
          customerDetails: dto.customerDetails,
          itemDetails: order.items.map((item: any) => ({
            name: item.name,
            price: parseFloat(item.price.toString()),
            quantity: item.quantity,
          })),
          expiryMinutes,
          callbackUrl: dto.callbackUrl,
          returnUrl: dto.returnUrl,
        });

        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            paymentId: dokuResponse.payment.token_id,
            paymentUrl: dokuResponse.payment.payment_url,
            paymentData: {
              ...(payment.paymentData as Record<string, any>),
              dokuResponse,
            },
          },
        });
      } catch (dokuError) {
        logger.error('Doku payment creation failed:', dokuError);
        // Continue even if Doku fails, payment is still created
      }

      let paymentDetails: any = {
        paymentId: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        expiryDate: payment.expiryDate,
        createdAt: payment.createdAt,
      };

      // Add payment method specific details
      if (dokuResponse) {
        paymentDetails.paymentUrl = dokuResponse.payment.payment_url;
        paymentDetails.tokenId = dokuResponse.payment.token_id;
      }

      // Generate method-specific details
      switch (dto.paymentMethod) {
        case 'virtual_account':
          paymentDetails.vaNumber = dokuResponse?.payment?.va_number;
          paymentDetails.vaName = dokuResponse?.payment?.va_name;
          break;
        case 'qris':
          paymentDetails.qrCode = dokuResponse?.payment?.qr_code;
          break;
        case 'ewallet':
          paymentDetails.redirectUrl = dokuResponse?.payment?.payment_url;
          break;
      }

      return paymentDetails;
    } catch (error) {
      logger.error('Create payment error:', error);
      throw error;
    }
  }

  async getPaymentById(paymentId: string, userId: string): Promise<any> {
    try {
      const cacheKey = `${PAYMENT_CACHE_PREFIX}${paymentId}`;
      const cached = await this.redisService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.order.userId !== userId) {
        throw new Error('You do not have permission to access this payment');
      }

      const paymentDetails = {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        orderNumber: payment.order.orderNumber,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentUrl: payment.paymentUrl,
        expiryDate: payment.expiryDate,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };

      await this.redisService.set(cacheKey, paymentDetails, { ttl: PAYMENT_CACHE_TTL });

      return paymentDetails;
    } catch (error) {
      logger.error('Get payment error:', error);
      throw error;
    }
  }

  async getPayments(
    userId: string,
    page: number,
    limit: number,
    filters?: {
      status?: PaymentStatus;
      paymentMethod?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<any> {
    try {
      const cacheKey = `${PAYMENT_CACHE_PREFIX}${userId}:page:${page}:limit:${limit}:${JSON.stringify(filters)}`;
      const cached = await this.redisService.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      const where: any = {
        order: { userId },
      };

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.paymentMethod) {
        where.paymentMethod = filters.paymentMethod;
      }

      if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.createdAt.lte = filters.endDate;
        }
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          include: { order: true },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.payment.count({ where }),
      ]);

      const result = {
        data: payments.map((payment) => ({
          paymentId: payment.id,
          orderId: payment.orderId,
          orderNumber: payment.order.orderNumber,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          expiryDate: payment.expiryDate,
          createdAt: payment.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      await this.redisService.set(cacheKey, result, { ttl: PAYMENT_CACHE_TTL });

      return result;
    } catch (error) {
      logger.error('List payments error:', error);
      throw error;
    }
  }

  async handlePaymentCallback(callbackData: any): Promise<any> {
    try {
      const isValid = await this.verifyCallbackSignature(callbackData);
      if (!isValid) {
        throw new Error('Invalid callback signature');
      }

      const payment = await prisma.payment.findUnique({
        where: { paymentId: callbackData.paymentId },
        include: { order: true },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: callbackData.status,
          transactionId: callbackData.transactionId,
          paymentData: {
            ...(payment.paymentData as Record<string, any>),
            callbackData,
          },
        },
      });

      let orderStatus: OrderStatus;
      if (callbackData.status === PaymentStatus.PAID) {
        orderStatus = OrderStatus.PROCESSING;
      } else if (callbackData.status === PaymentStatus.FAILED) {
        orderStatus = OrderStatus.CANCELLED;
      } else {
        orderStatus = payment.order.status;
      }

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: callbackData.status,
          status: orderStatus,
          paymentId: callbackData.transactionId,
          paymentData: {
            ...(payment.order.paymentData as Record<string, any>),
            callbackData,
          },
        },
      });

      // Invalidate cache
      await this.invalidatePaymentCache(payment.id);

      return {
        paymentId: updatedPayment.id,
        orderId: updatedPayment.orderId,
        status: updatedPayment.status,
        transactionId: updatedPayment.transactionId,
      };
    } catch (error) {
      logger.error('Handle payment callback error:', error);
      throw error;
    }
  }

  async updatePaymentStatus(paymentId: string, userId: string, dto: any): Promise<any> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.order.userId !== userId) {
        throw new Error('You do not have permission to update this payment');
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: dto.status,
          transactionId: dto.transactionId,
          paymentData: {
            ...(payment.paymentData as Record<string, any>),
            manualUpdate: true,
            updateReason: dto.failureReason,
          },
        },
      });

      let orderStatus: OrderStatus;
      if (dto.status === PaymentStatus.PAID) {
        orderStatus = OrderStatus.PROCESSING;
      } else if (dto.status === PaymentStatus.FAILED) {
        orderStatus = OrderStatus.CANCELLED;
      } else {
        orderStatus = payment.order.status;
      }

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: dto.status,
          status: orderStatus,
          paymentId: dto.transactionId,
        },
      });

      await this.invalidatePaymentCache(paymentId);

      return {
        paymentId: updatedPayment.id,
        orderId: updatedPayment.orderId,
        status: updatedPayment.status,
        transactionId: updatedPayment.transactionId,
      };
    } catch (error) {
      logger.error('Update payment status error:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, userId: string, dto: any): Promise<any> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.order.userId !== userId) {
        throw new Error('You do not have permission to refund this payment');
      }

      if (payment.status !== PaymentStatus.PAID) {
        throw new Error('Only paid payments can be refunded');
      }

      // Call Doku refund API
      if (!payment.paymentId) {
        throw new Error('Payment does not have a valid payment ID from payment gateway');
      }
      try {
        await this.createDokuRefund(payment.paymentId, dto.amount || payment.amount);
      } catch (dokuError) {
        logger.error('Doku refund failed:', dokuError);
        throw new Error('Refund request failed');
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
          paymentData: {
            ...(payment.paymentData as Record<string, any>),
            refund: {
              amount: dto.amount || payment.amount,
              reason: dto.reason,
              refundedAt: new Date(),
            },
          },
        },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: PaymentStatus.REFUNDED,
          status: OrderStatus.CANCELLED,
        },
      });

      await this.invalidatePaymentCache(paymentId);

      return {
        paymentId: updatedPayment.id,
        orderId: updatedPayment.orderId,
        status: updatedPayment.status,
        refundAmount: dto.amount || payment.amount,
      };
    } catch (error) {
      logger.error('Refund payment error:', error);
      throw error;
    }
  }

  async getPaymentStatistics(userId: string, filters?: any): Promise<any> {
    try {
      const where: any = {
        order: { userId },
      };

      if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte =
            filters.startDate instanceof Date ? filters.startDate : new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.createdAt.lte =
            filters.endDate instanceof Date ? filters.endDate : new Date(filters.endDate);
        }
      }

      if (filters?.paymentMethod) {
        where.paymentMethod = filters.paymentMethod;
      }

      const payments = await prisma.payment.findMany({ where });

      const totalPayments = payments.length;
      const totalAmount = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
      const successfulPayments = payments.filter((p) => p.status === PaymentStatus.PAID).length;
      const failedPayments = payments.filter((p) => p.status === PaymentStatus.FAILED).length;
      const pendingPayments = payments.filter((p) => p.status === PaymentStatus.PENDING).length;
      const refundedPayments = payments.filter((p) => p.status === PaymentStatus.REFUNDED).length;
      const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;

      return {
        totalPayments,
        totalAmount,
        successfulPayments,
        failedPayments,
        pendingPayments,
        refundedPayments,
        averageAmount,
      };
    } catch (error) {
      logger.error('Get payment statistics error:', error);
      throw error;
    }
  }

  private async createDokuPayment(data: any): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const requestId = crypto.randomUUID();

      const requestBody = {
        order: {
          amount: data.amount,
          invoice_number: data.orderNumber,
          currency: data.currency,
        },
        payment: {
          payment_due_date: data.expiryMinutes * 60,
        },
        customer: {
          name: data.customerDetails?.name || 'Customer',
          email: data.customerDetails?.email || '',
          phone: data.customerDetails?.phone || '',
        },
        payment_method_types: this.getPaymentMethodTypes(data.paymentMethod),
      };

      const digest = crypto.createHash('sha256').update(JSON.stringify(requestBody)).digest('hex');

      const signature = crypto
        .createHmac('sha256', dokuConfig.secretKey)
        .update(`${dokuConfig.clientId}:${timestamp}:${requestId}:${digest}`)
        .digest('hex');

      const response = await axios.post(`${dokuConfig.baseUrl}/payments/v1`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Client-Id': dokuConfig.clientId,
          'Request-Id': requestId,
          'Request-Timestamp': timestamp,
          Signature: signature,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Doku payment creation error:', error);
      throw new Error('Failed to create payment with Doku');
    }
  }

  /**
   * Create refund with Doku
   */
  private async createDokuRefund(paymentId: string, amount: number): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const requestId = crypto.randomUUID();

      const requestBody = {
        payment_id: paymentId,
        amount: amount,
      };

      const digest = crypto.createHash('sha256').update(JSON.stringify(requestBody)).digest('hex');

      const signature = crypto
        .createHmac('sha256', dokuConfig.secretKey)
        .update(`${dokuConfig.clientId}:${timestamp}:${requestId}:${digest}`)
        .digest('hex');

      const response = await axios.post(`${dokuConfig.baseUrl}/payments/v1/refund`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Client-Id': dokuConfig.clientId,
          'Request-Id': requestId,
          'Request-Timestamp': timestamp,
          Signature: signature,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Doku refund error:', error);
      throw new Error('Failed to create refund with Doku');
    }
  }

  private async verifyCallbackSignature(callbackData: any): Promise<boolean> {
    try {
      if (!callbackData.signature) {
        return false;
      }

      // Create a copy of callbackData without the signature field for verification
      const { signature, ...dataToVerify } = callbackData;

      const digest = crypto.createHash('sha256').update(JSON.stringify(dataToVerify)).digest('hex');

      const expectedSignature = crypto
        .createHmac('sha256', dokuConfig.secretKey)
        .update(digest)
        .digest('hex');

      return callbackData.signature === expectedSignature;
    } catch (error) {
      logger.error('Verify callback signature error:', error);
      return false;
    }
  }

  private getPaymentMethodTypes(method: string): string[] {
    const methodMap: Record<string, string[]> = {
      credit_card: ['CREDIT_CARD'],
      bank_transfer: ['VIRTUAL_ACCOUNT'],
      ewallet: ['EWALLET'],
      qris: ['QRIS'],
      virtual_account: ['VIRTUAL_ACCOUNT'],
    };

    return methodMap[method] || ['VIRTUAL_ACCOUNT'];
  }

  private async invalidatePaymentCache(paymentId: string): Promise<void> {
    try {
      await this.redisService.delPattern(`${PAYMENT_CACHE_PREFIX}${paymentId}`);
    } catch (error) {
      logger.error('Invalidate payment cache error:', error);
    }
  }
}

export const paymentServiceDep = new Dependency(
  async (c) => new PaymentService(await redisServiceDep.resolve(c))
);
