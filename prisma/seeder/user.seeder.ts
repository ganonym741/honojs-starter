import { User } from "@prisma/client";
import bcrypt from 'bcrypt';

async function hashPassword (password: string) {
    return await bcrypt.hash(password, 10);
}

const UserSeeds: User[] = [
    {
        id: 'cmkerb3dx00002v75zq3qu6ow',
        email: 'admin@example.com',
        password: hashPassword('admin123'),
        name: 'Admin User',
        phone: '+6281234567890',
        isActive: true,
        emailVerified: true,
    },
    {
        id: 'cmkerbkd000012v75wb5billf',
        email: `user1@example.com`,
        password: hashPassword('user123'),
        name: `Test User 1`,
        phone: `+628123456789`,
        isActive: true,
        emailVerified: true,
    },
]

export { UserSeeds };