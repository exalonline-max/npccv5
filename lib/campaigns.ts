
import { prisma } from '../prisma/prisma';

export async function getCampaigns() {
  return prisma.campaign.findMany();
}

export async function createCampaign(data: { name: string; description?: string; avatar?: string }) {
  return prisma.campaign.create({
    data,
  });
}
