import Decimal from 'decimal.js';
import { Order } from '../generated/client';
import { UserSeeds } from './user.seeder';

const OrderSeeds: Order[] = [
  {
    id: 'cmkesg6sd00052v759f1yfymz',
    userId: UserSeeds[1].id,
    orderNumber: `ORD-${Date.now()}-1`,
    totalAmount: Decimal(1500000),
    status: 'COMPLETED',
    paymentStatus: 'PENDING',
    paymentMethod: 'DOKU',
    notes: `Sample order 1`,
  },
];

export { OrderSeeds };
