"use client";
// ...existing code...
import { useState, useEffect } from 'react';
import CampaignMembers from './CampaignMembers';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(setCampaigns);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description, avatar }),
    });
    const newCampaign = await res.json();
    setCampaigns([...campaigns, newCampaign]);
    setName('');
    setDescription('');
    setAvatar('');
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Campaigns</h1>
      <form onSubmit={handleCreate} className="mb-6 flex flex-col gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="border p-2 rounded" required />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border p-2 rounded" />
        <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Avatar URL" className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Campaign</button>
      </form>
      <ul className="space-y-4">
        {campaigns.map(c => (
          <li key={c.id} className="border p-4 rounded shadow">
            <div className="flex items-center gap-4">
              {c.avatar && <img src={c.avatar} alt="avatar" className="w-12 h-12 rounded-full" />}
              <div>
                <h2 className="font-bold text-lg">{c.name}</h2>
                <p className="text-gray-600">{c.description}</p>
              </div>
            </div>
            <CampaignMembers campaignId={c.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
