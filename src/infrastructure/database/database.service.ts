import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../prisma/generated/client';
import { DB_CONFIG, isDevelopment } from '@/config/env';

const adapter = new PrismaPg({
  connectionString: DB_CONFIG.url,
});

const prisma = new PrismaClient({
  adapter,
  log: isDevelopment() ? ['query', 'error', 'warn'] : ['error'],
  omit: {
    user: {
      password: true,
    },
  },
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
