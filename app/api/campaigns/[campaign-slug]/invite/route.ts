import { NextResponse } from 'next/server';
import { prisma } from '../../../../../prisma/prisma';
import { nanoid } from 'nanoid';

export async function POST(request: Request, { params }: { params: { 'campaign-slug': string } }) {
  const slug = params['campaign-slug'];
  if (!slug) {
    return NextResponse.json({ error: 'Missing campaign slug' }, { status: 400 });
  }
  // Find campaign by slug
  const campaign = await prisma.campaign.findUnique({ where: { slug } });
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }
  // Generate unique token
  const token = nanoid(24);
  // Create invite
  const invite = await prisma.invite.create({
    data: {
      token,
      campaignId: campaign.id,
    },
  });
  // Return invite link
  return NextResponse.json({ inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invite/${token}` });
}

export async function GET(request: Request, { params }: { params: { 'campaign-slug': string } }) {
  const slug = params['campaign-slug'];
  if (!slug) {
    return NextResponse.json({ error: 'Missing campaign slug' }, { status: 400 });
  }
  const campaign = await prisma.campaign.findUnique({ where: { slug } });
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }
  // Find latest unused invite for this campaign
  const invite = await prisma.invite.findFirst({
    where: { campaignId: campaign.id, used: false },
    orderBy: { createdAt: 'desc' },
  });
  if (!invite) {
    return NextResponse.json({ inviteUrl: null });
  }
  return NextResponse.json({ inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invite/${invite.token}` });
}
