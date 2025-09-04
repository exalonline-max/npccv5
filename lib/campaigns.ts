
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

export async function getCampaigns() {
  return prisma.campaign.findMany();
}

export async function createCampaign(data: { name: string; description?: string; avatar?: string }) {
  return prisma.campaign.create({
    data,
  });
}
