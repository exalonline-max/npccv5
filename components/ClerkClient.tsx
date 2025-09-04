"use client";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

export default function ClerkClient({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  // If no publishable key is configured, don't initialize Clerk on the client
  if (!publishableKey) return <>{children}</>;

  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}
