import Decimal from 'decimal.js';
import { PaymentStatus } from '../../../prisma/generated/enums';

export interface PaymentDTO {
  orderId: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'ewallet' | 'qris' | 'virtual_account';
  amount: Decimal;
  currency?: string;
  customerDetails?: {
    name: string;
    email: string;
    phone?: string;
  };
  itemDetails?: Array<{
    name: string;
    price: Decimal;
    quantity: number;
  }>;
  expiryMinutes?: number;
  callbackUrl?: string;
  returnUrl?: string;
}

export interface PaymentResponse {
  paymentId: string;
  orderId: string;
  amount: Decimal;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  paymentUrl?: string;
  vaNumber?: string;
  vaName?: string;
  qrCode?: string;
  expiryDate?: Date;
  createdAt: Date;
}

export interface PaymentStatusUpdateDTO {
  paymentId: string;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate?: Date;
  failureReason?: string;
}

export interface PaymentCallbackDTO {
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  transactionId?: string;
  amount?: Decimal;
  currency?: string;
  paymentDate?: Date;
  signature?: string;
  rawResponse?: Record<string, any>;
}

export interface PaymentValidationDTO {
  paymentId: string;
  amount: Decimal;
  signature: string;
}

export interface PaymentRefundDTO {
  paymentId: string;
  amount?: Decimal;
  reason?: string;
}

export interface PaymentListResponse {
  data: PaymentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentStatistics {
  totalPayments: Decimal;
  totalAmount: Decimal;
  successfulPayments: Decimal;
  failedPayments: Decimal;
  pendingPayments: Decimal;
  refundedPayments: Decimal;
  averageAmount: Decimal;
}

export interface DokuConfig {
  clientId: string;
  secretKey: string;
  environment: 'sandbox' | 'production';
  apiVersion: string;
  baseUrl: string;
}

export interface DokuPaymentRequest {
  order: {
    amount: Decimal;
    invoice_number: string;
    currency: string;
  };
  payment: {
    payment_due_date: Decimal;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  payment_method_types: string[];
}

export interface DokuPaymentResponse {
  payment: {
    token_id: string;
    payment_url: string;
    expiry_date: string;
  };
  order: {
    invoice_number: string;
    amount: Decimal;
  };
}

export interface PaymentMethod {
  code: string;
  name: string;
  icon?: string;
  isActive: boolean;
  fee?: Decimal;
  feeType?: 'fixed' | 'percentage';
}

export interface VirtualAccountDetails {
  bankName: string;
  vaNumber: string;
  expiryDate: Date;
  instructions?: string[];
}

export interface QRISDetails {
  qrCode: string;
  expiryDate: Date;
  instructions?: string[];
}

export interface EWalletDetails {
  provider: string;
  redirectUrl: string;
  expiryDate: Date;
}

export interface CreditCardDetails {
  token: string;
  maskedCardNumber: string;
  expiryDate: Date;
}

export interface PaymentTransactionHistory {
  id: string;
  paymentId: string;
  orderId: string;
  type: 'payment' | 'refund' | 'void';
  amount: Decimal;
  status: string;
  transactionId?: string;
  createdAt: Date;
}
