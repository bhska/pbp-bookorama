import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '@/generated/client';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

export default prisma;
