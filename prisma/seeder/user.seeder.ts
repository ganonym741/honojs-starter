import bcrypt from 'bcrypt';
import { User } from '../generated/client';

async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

const UserSeeds: User[] = [
  {
    id: 'cmkerb3dx00002v75zq3qu6ow',
    email: 'admin@example.com',
    password: await hashPassword('admin123'),
    name: 'Admin User',
    phone: '+6281234567890',
    isActive: true,
    emailVerified: true,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cmkerbkd000012v75wb5billf',
    email: `user1@example.com`,
    password: await hashPassword('user123'),
    name: `Test User 1`,
    phone: `+628123456789`,
    isActive: true,
    emailVerified: true,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export { UserSeeds };
