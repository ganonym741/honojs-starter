import Decimal from 'decimal.js';
import { Order, OrderStatus } from '../generated/client';
import { UserSeeds } from './user.seeder';

const OrderSeeds: Order[] = [
  {
    id: 'cmkesg6sd00052v759f1yfymz',
    userId: UserSeeds[1].id,
    orderNumber: `ORD-${Date.now()}-1`,
    totalAmount: Decimal(1500000),
    status: OrderStatus.DELIVERED,
    paymentStatus: 'PENDING',
    paymentMethod: 'DOKU',
    notes: `Sample order 1`,
    paymentId: null,
    paymentData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export { OrderSeeds };
