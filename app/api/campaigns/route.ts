// Update the import path to match your actual Prisma client location
// Update the import path to match your actual Prisma client location
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from 'next/server';


export async function GET() {
  const campaigns = await prisma.campaign.findMany();
  return NextResponse.json(campaigns);
}

export async function POST(request: Request) {
  const data = await request.json();
  const campaign = await prisma.campaign.create({
    data: {
      name: data.name,
      description: data.description,
      avatar: data.avatar,
    },
  });
  return NextResponse.json(campaign);
}
