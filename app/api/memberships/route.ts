export const runtime = 'nodejs';

import { prisma } from '../../../prisma/prisma';
import { NextResponse } from 'next/server';

// Get all members for a campaign
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaignId');
  if (!campaignId) return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 });
  const members = await prisma.membership.findMany({
    where: { campaignId },
    include: { user: true },
  });
  return NextResponse.json(members);
}

// Add a user to a campaign
export async function POST(request: Request) {
  const data = await request.json();
  if (!data.userId || !data.campaignId || !data.role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const membership = await prisma.membership.create({
    data: {
      userId: data.userId,
      campaignId: data.campaignId,
      role: data.role,
    },
  });
  return NextResponse.json(membership);
}

// Remove a user from a campaign
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const membershipId = searchParams.get('membershipId');
  if (!membershipId) return NextResponse.json({ error: 'Missing membershipId' }, { status: 400 });
  await prisma.membership.delete({ where: { id: membershipId } });
  return NextResponse.json({ success: true });
}
