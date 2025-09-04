import pkg from '@prisma/client';

const PrismaClient = (pkg as any).PrismaClient;
type PrismaClientAny = any;

const globalForPrisma = global as unknown as { prisma?: PrismaClientAny };

export const prisma: PrismaClientAny =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
