import { z } from 'zod';
import { PaymentStatus } from '../../prisma/generated/enums';

export const createPaymentSchema = z.object({
  orderId: z.string().cuid('Invalid order ID format'),
  paymentMethod: z.enum(['credit_card', 'bank_transfer', 'ewallet', 'qris', 'virtual_account'], {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().default('IDR'),
  customerDetails: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().optional(),
  }).optional(),
  itemDetails: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    price: z.number().positive('Price must be greater than 0'),
    quantity: z.number().int().positive('Quantity must be greater than 0'),
  })).optional(),
  expiryMinutes: z.number().int().positive().optional(),
  callbackUrl: z.string().url('Invalid callback URL').optional(),
  returnUrl: z.string().url('Invalid return URL').optional(),
});

export const updatePaymentStatusSchema = z.object({
  paymentId: z.string().cuid('Invalid payment ID format'),
  status: z.nativeEnum(PaymentStatus, {
    errorMap: () => ({ message: 'Invalid payment status' }),
  }),
  transactionId: z.string().optional(),
  paymentDate: z.string().datetime().optional(),
  failureReason: z.string().optional(),
});

export const paymentCallbackSchema = z.object({
  paymentId: z.string().cuid('Invalid payment ID format'),
  orderId: z.string().cuid('Invalid order ID format'),
  status: z.nativeEnum(PaymentStatus, {
    errorMap: () => ({ message: 'Invalid payment status' }),
  }),
  transactionId: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  paymentDate: z.string().datetime().optional(),
  signature: z.string().optional(),
  rawResponse: z.record(z.any()).optional(),
});

export const validatePaymentSchema = z.object({
  paymentId: z.string().cuid('Invalid payment ID format'),
  amount: z.number().positive('Amount must be greater than 0'),
  signature: z.string().min(1, 'Signature is required'),
});

export const refundPaymentSchema = z.object({
  paymentId: z.string().cuid('Invalid payment ID format'),
  amount: z.number().positive('Optional refund amount').optional(),
  reason: z.string().optional(),
});

export const getPaymentSchema = z.object({
  paymentId: z.string().cuid('Invalid payment ID format'),
});

export const listPaymentsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  status: z.nativeEnum(PaymentStatus).optional(),
  paymentMethod: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const selectPaymentMethodSchema = z.object({
  paymentMethod: z.enum(['credit_card', 'bank_transfer', 'ewallet', 'qris', 'virtual_account'], {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
});

export const virtualAccountPaymentSchema = z.object({
  bankCode: z.string().min(1, 'Bank code is required'),
  customerName: z.string().min(1, 'Customer name is required'),
});

export const creditCardPaymentSchema = z.object({
  cardNumber: z.string().min(13).max(19),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date format (MM/YY)'),
  cardCvv: z.string().length(3, 'CVV must be 3 digits'),
  cardHolderName: z.string().min(1, 'Card holder name is required'),
  saveCard: z.boolean().optional(),
});

export const ewalletPaymentSchema = z.object({
  provider: z.enum(['gopay', 'ovo', 'dana', 'linkaja', 'shopeepay'], {
    errorMap: () => ({ message: 'Invalid e-wallet provider' }),
  }),
  phone: z.string().min(10, 'Phone number is required'),
});

export const qrisPaymentSchema = z.object({
  acquirer: z.string().optional(),
});

export const paymentStatisticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  paymentMethod: z.string().optional(),
});


export type CreatePaymentDTO = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusDTO = z.infer<typeof updatePaymentStatusSchema>;
export type PaymentCallbackDTO = z.infer<typeof paymentCallbackSchema>;
export type ValidatePaymentDTO = z.infer<typeof validatePaymentSchema>;
export type RefundPaymentDTO = z.infer<typeof refundPaymentSchema>;
export type ListPaymentsQueryDTO = z.infer<typeof listPaymentsQuerySchema>;
export type SelectPaymentMethodDTO = z.infer<typeof selectPaymentMethodSchema>;
export type VirtualAccountPaymentDTO = z.infer<typeof virtualAccountPaymentSchema>;
export type CreditCardPaymentDTO = z.infer<typeof creditCardPaymentSchema>;
export type EWalletPaymentDTO = z.infer<typeof ewalletPaymentSchema>;
export type QRISPaymentDTO = z.infer<typeof qrisPaymentSchema>;
export type PaymentStatisticsQueryDTO = z.infer<typeof paymentStatisticsQuerySchema>;
