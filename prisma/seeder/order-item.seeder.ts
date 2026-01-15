import Decimal from "decimal.js";
import { OrderItem } from "../generated/client";
import { OrderSeeds } from "./order.seeder";

const OrderItemSeeds: OrderItem[] = [
    {
        id: 'cmkesfvdk00032v75zyig61sp',
        orderId: OrderSeeds[0].id,
        productName: `Product 1`,
        quantity: 2,
        price: Decimal(1500000),
        metadata: {
          category: 'Electronics',
          brand: 'Sample Brand',
        },
    }
]

export { OrderItemSeeds }