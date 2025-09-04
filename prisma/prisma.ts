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

// Fail fast in production if DATABASE_URL is missing to avoid obscure runtime errors
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('Missing required environment variable DATABASE_URL for Prisma in production');
}
