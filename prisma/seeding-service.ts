import { PrismaClient } from './generated/client'
import { PrismaPg } from "@prisma/adapter-pg";
import { UserSeeds } from './seeder/user.seeder';
import { ProfileSeeds } from './seeder/profile.seeder';
import { OrderSeeds } from './seeder/order.seeder';
import { OrderItemSeeds } from './seeder/order-item.seeder';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seeding process...");

  console.log("📋 Phase 1");
  await Promise.all([
    prisma.user.createMany({ data: UserSeeds, skipDuplicates: true }),
  ])

  console.log("📋 Phase 2");
  await Promise.all([
    prisma.profile.createMany({ data: ProfileSeeds, skipDuplicates: true }),
    prisma.order.createMany({ data: OrderSeeds, skipDuplicates: true }),
  ])

  console.log("📋 Phase 3");
  await Promise.all([
    prisma.orderItem.createMany({ data: OrderItemSeeds, skipDuplicates: true }),
  ])

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  });