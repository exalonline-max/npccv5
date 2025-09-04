"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCampaignPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, description, avatar }),
    });
    const campaign = await res.json();
    setLoading(false);
    router.push(`/${campaign.slug}`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e6eaf3]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Your Campaign</h1>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Campaign Name" className="border p-2 rounded" required />
          <input value={slug} onChange={e => setSlug(e.target.value.replace(/\s+/g, '-').toLowerCase())} placeholder="Campaign Slug (URL)" className="border p-2 rounded" required />
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border p-2 rounded" />
          <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Avatar URL" className="border p-2 rounded" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold" disabled={loading}>
            {loading ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
}
