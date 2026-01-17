import prisma from '../../infrastructure/database/database.service.js';
import { RedisService, redisServiceDep } from '../../infrastructure/cache/cache.service.js';
import { CreateOrderDTO, UpdateOrderDTO, Order, OrderListResponse } from './order.interface.js';
import logger from '../../utils/logger.js';
import { Dependency } from 'hono-simple-di';
import Decimal from 'decimal.js';

const ORDER_CACHE_PREFIX = 'order:';
const ORDER_CACHE_TTL = 1800; // 30 minutes

export class OrderService {
  private redisService: RedisService;

  constructor(redisService: RedisService) {
    this.redisService = redisService;
  }

  async createOrder(userId: string, dto: CreateOrderDTO): Promise<Order> {
    try {
      const totalAmount = dto.items.reduce(
        (sum, item) => item.price.times(item.quantity).add(sum),
        Decimal(0)
      );

      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      const order = await prisma.order.create({
        data: {
          userId,
          orderNumber,
          totalAmount,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          notes: dto.notes,
        },
      });

      const orderItems = await Promise.all(
        dto.items.map((item) =>
          prisma.orderItem.create({
            data: {
              orderId: order.id,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              metadata: item.metadata,
            },
          })
        )
      );

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      await this.redisService.del(`user:${userId}`);

      logger.info('Order created successfully', { orderId: order.id, orderNumber });

      return {
        id: order.id,
        userId,
        orderNumber,
        totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: null,
        paymentId: null,
        paymentData: null,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: orderItems,
        user,
      };
    } catch (error) {
      logger.error('Create order failed:', error);
      throw error;
    }
  }

  async getOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<OrderListResponse> {
    try {
      const cacheKey = `${ORDER_CACHE_PREFIX}${userId}:page:${page}:limit:${limit}`;
      const cached = await this.redisService.get<OrderListResponse>(cacheKey);

      if (cached) {
        return cached;
      }

      const total = await prisma.order.count({
        where: { userId },
      });

      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: true,
          user: true,
        },
      });

      const response = {
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };

      await this.redisService.set(cacheKey, response, { ttl: ORDER_CACHE_TTL });

      logger.info('Orders retrieved successfully', { userId, count: orders.length });
      return response;
    } catch (error) {
      logger.error('Get orders failed:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string, userId: string): Promise<Order> {
    try {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
        include: {
          items: true,
          user: true,
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      logger.error('Get order failed:', error);
      throw error;
    }
  }

  async updateOrder(orderId: string, userId: string, dto: UpdateOrderDTO): Promise<Order> {
    try {
      const existingOrder = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
      });

      if (!existingOrder) {
        throw new Error('Order not found');
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: dto.status,
          notes: dto.notes,
        },
      });

      await Promise.all([
        this.redisService.del(`${ORDER_CACHE_PREFIX}${orderId}`),
        this.redisService.del(`user:${userId}`),
      ]);

      logger.info('Order updated successfully', { orderId });
      return order;
    } catch (error) {
      logger.error('Update order failed:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, userId: string): Promise<Order> {
    try {
      const existingOrder = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
      });

      if (!existingOrder) {
        throw new Error('Order not found');
      }

      if (existingOrder.status === 'SHIPPED' || existingOrder.status === 'DELIVERED') {
        throw new Error('Order cannot be cancelled');
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
        },
      });

      await Promise.all([
        this.redisService.del(`${ORDER_CACHE_PREFIX}${orderId}`),
        this.redisService.del(`user:${userId}`),
      ]);

      logger.info('Order cancelled successfully', { orderId });
      return order;
    } catch (error) {
      logger.error('Cancel order failed:', error);
      throw error;
    }
  }

  async deleteOrder(orderId: string, userId: string): Promise<void> {
    try {
      const existingOrder = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
      });

      if (!existingOrder) {
        throw new Error('Order not found');
      }

      if (existingOrder.status === 'CONFIRMED' || existingOrder.status === 'PROCESSING') {
        throw new Error('Order cannot be deleted');
      }

      await Promise.all([
        prisma.order.delete({ where: { id: orderId } }),
        this.redisService.del(`${ORDER_CACHE_PREFIX}${orderId}`),
        this.redisService.del(`user:${userId}`),
      ]);

      logger.info('Order deleted successfully', { orderId });
    } catch (error) {
      logger.error('Delete order failed:', error);
      throw error;
    }
  }
}

export const orderServiceDep = new Dependency(
  async (c) => new OrderService(await redisServiceDep.resolve(c))
);
