"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinCampaignPage() {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // You'd validate/join campaign here via API
    // For now, just redirect
    router.push(`/${slug}`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e6eaf3]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Join a Campaign</h1>
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="Enter Campaign Slug or Invite Link" className="border p-2 rounded" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold" disabled={loading}>
            {loading ? "Joining..." : "Join Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
}
