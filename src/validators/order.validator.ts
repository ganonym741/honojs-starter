import Decimal from 'decimal.js';
import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productName: z.string().min(1, 'Product name is required'),
      quantity: z.number().int().positive('Quantity must be positive'),
      price: z.number().positive('Price must be positive').transform((val) => Decimal(val)),
    }),
  ),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'], {
    message: 'Invalid order status',
  }).optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500, 'Reason must be less than 500 characters'),
});
