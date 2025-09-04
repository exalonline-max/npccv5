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
    if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
      return NextResponse.json({ error: 'Missing or invalid campaign name' }, { status: 400 });
    }
    if (!data.slug || typeof data.slug !== "string" || !/^[a-z0-9-]+$/.test(data.slug)) {
      return NextResponse.json({ error: 'Missing or invalid campaign slug (use only lowercase letters, numbers, and dashes)' }, { status: 400 });
    }
    // Check for duplicate slug
    const existing = await prisma.campaign.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Campaign slug already exists. Please choose another.' }, { status: 409 });
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
    // Prisma unique constraint error
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002' && (error as any).meta?.target?.includes('slug')) {
      return NextResponse.json({ error: 'Campaign slug already exists. Please choose another.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create campaign', details: String(error) }, { status: 500 });
  }
}
