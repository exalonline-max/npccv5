// Update the import path to match your actual Prisma client location
// Update the import path to match your actual Prisma client location
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from 'next/server';



export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany();
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('GET /api/campaigns error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns', details: String(error) }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Missing campaign name' }, { status: 400 });
    }
    if (!data.slug) {
      return NextResponse.json({ error: 'Missing campaign slug' }, { status: 400 });
    }
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        avatar: data.avatar,
      },
    });
    return NextResponse.json(campaign);
  } catch (error) {
    console.error('POST /api/campaigns error:', error);
    return NextResponse.json({ error: 'Failed to create campaign', details: String(error) }, { status: 500 });
  }
}
