"use client";
import { useState, useEffect } from 'react';

export default function CampaignMembers({ campaignId }: { campaignId: string }) {
  const [members, setMembers] = useState<Array<{id: string, user?: {email?: string}, userId?: string, role?: string}>>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Player');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/memberships?campaignId=${campaignId}`)
      .then(res => res.json())
      .then(setMembers);
  }, [campaignId]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // You'd look up userId by email in a real app
    const res = await fetch('/api/memberships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: email, campaignId, role }),
    });
    const newMember = await res.json();
    setMembers([
      ...members,
      { id: newMember.id || `${email}-${role}-${Date.now()}`, user: { email }, role }
    ]);
    setEmail('');
    setRole('Player');
    setLoading(false);
  }

  async function handleRemove(membershipId: string) {
    setLoading(true);
    await fetch(`/api/memberships?membershipId=${membershipId}`, { method: 'DELETE' });
    setMembers(members.filter(m => m.id !== membershipId));
    setLoading(false);
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Members</h2>
      <form onSubmit={handleInvite} className="flex gap-2 mb-4">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="User Email or ID" className="border p-2 rounded" required />
        <select value={role} onChange={e => setRole(e.target.value)} className="border p-2 rounded">
          <option value="Player">Player</option>
          <option value="DM">DM</option>
        </select>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>Invite</button>
      </form>
      <ul className="space-y-2">
        {members.map(m => (
          <li key={m.id} className="flex items-center justify-between border p-2 rounded">
            <span>{m.user?.email || m.userId} ({m.role})</span>
            <button onClick={() => handleRemove(m.id)} className="text-red-600" disabled={loading}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
