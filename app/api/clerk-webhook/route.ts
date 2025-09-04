export const runtime = 'nodejs';

import { prisma } from "../../../prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  // Clerk sends user.created event
  if (body.type === "user.created") {
    const user = body.data;
    // Use email or username for campaign slug
    const email = user.email_addresses?.[0]?.email_address || user.username;
    const slug = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    // Create campaign and membership
    await prisma.campaign.create({
      data: {
        name: `${user.first_name || slug}'s Campaign`,
        slug,
        members: {
          create: [{
            user: {
              connect: { clerkId: user.id }
            },
            role: "DM"
          }]
        }
      }
    });
  }
  return NextResponse.json({ success: true });
}
