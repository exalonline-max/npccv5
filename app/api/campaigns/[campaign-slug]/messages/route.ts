import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

import { prisma } from '../../../../../prisma/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: Request, context: unknown) {
  const rawParams = (context as { params?: unknown })?.params;
  const params = await (rawParams instanceof Promise ? rawParams : Promise.resolve(rawParams));
  const slug = params['campaign-slug'];
  if (!slug) return NextResponse.json({ error: 'Missing campaign slug' }, { status: 400 });
  const campaign = await prisma.campaign.findUnique({ where: { slug } });
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  const messages = await prisma.message.findMany({
    where: { campaignId: campaign.id },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });
  return NextResponse.json({ messages });
}

export async function POST(request: Request, context: unknown) {
  const rawParams = (context as { params?: unknown })?.params;
  const params = await (rawParams instanceof Promise ? rawParams : Promise.resolve(rawParams));
  const slug = params['campaign-slug'];
  if (!slug) return NextResponse.json({ error: 'Missing campaign slug' }, { status: 400 });
  const campaign = await prisma.campaign.findUnique({ where: { slug } });
  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  const { text, sender } = await request.json();
  // Requires Clerk middleware in ./middleware.ts
  // import { clerkMiddleware } from '@clerk/nextjs/server';
  // export default clerkMiddleware();
  // export const config = { matcher: ['/((?!_next|static|favicon.ico).*)'] };
  const user = await currentUser();
  if (!user || !user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const message = await prisma.message.create({
    data: {
      campaignId: campaign.id,
      userId: dbUser.id,
      text,
      sender,
    },
  });
  return NextResponse.json({ message });
}
