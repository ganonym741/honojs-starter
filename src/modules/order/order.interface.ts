import Decimal from "decimal.js";
import { OrderStatus, PaymentStatus } from "../../../prisma/generated/enums";
import { User } from "../../../prisma/generated/client";

export interface CreateOrderDTO {
  items: Array<{
    productName: string;
    quantity: number;
    price: Decimal;
    metadata?: any;
  }>;
  notes?: string;
}

export interface UpdateOrderDTO {
  status?: OrderStatus;
  notes?: string;
}

export interface CancelOrderDTO {
  reason?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  price: Decimal;
  metadata?: any;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  totalAmount: Decimal;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  paymentId: string | null;
  paymentData: any;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  user?: Omit<User, 'password'> | null;
}

export interface OrderListResponse {
  success: boolean;
  data: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}
