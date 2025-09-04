
"use client";
import { useState, useRef, useEffect } from "react";
import { SignIn, SignUp, SignedIn, SignedOut, UserProfile, useUser, useClerk } from "@clerk/nextjs";
// Custom user-menu dropdown
function CustomUserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && menuRef.current.contains && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!user) return null;
  return (
    <div className="relative" ref={menuRef}>
      <button
        className="focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <img
          src={user.imageUrl}
          alt="avatar"
          className="w-10 h-10 rounded-full border border-gray-300 shadow"
        />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border z-50">
          <div className="flex flex-col items-center py-4">
            <img src={user.imageUrl} alt="avatar" className="w-14 h-14 rounded-full mb-2" />
            <div className="font-bold text-lg">{user.fullName || user.username}</div>
            <div className="text-sm text-gray-500 mb-2">{user.primaryEmailAddress?.emailAddress || user.username}</div>
          </div>
          <div className="border-t">
            <button
              className="w-full text-left px-6 py-3 hover:bg-gray-100 flex items-center gap-2"
              onClick={() => window.location.href = '/campaigns'}
            >
              <span role="img" aria-label="campaigns">🗂️</span> Campaigns
            </button>
            <button
              className="w-full text-left px-6 py-3 hover:bg-gray-100 flex items-center gap-2"
              onClick={() => window.location.href = '/user'}
            >
              <span role="img" aria-label="account">⚙️</span> Manage account
            </button>
            <button
              className="w-full text-left px-6 py-3 hover:bg-gray-100 flex items-center gap-2 text-red-600"
              onClick={() => signOut()}
            >
              <span role="img" aria-label="sign out">↩️</span> Sign out
            </button>
          </div>
          <div className="text-xs text-gray-400 text-center py-2 border-t">Secured by Clerk<br /><span className="text-orange-500">Development mode</span></div>
        </div>
      )}
    </div>
  );
}


export default function Home() {
  const [campaigns, setCampaigns] = useState<Array<{id: string, name: string, avatar?: string, description?: string, slug?: string}>>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCampaigns(data);
          setCampaignsError(null);
        } else {
          setCampaigns([]);
          setCampaignsError(data?.error || 'Unknown error fetching campaigns');
        }
      })
      .catch(err => {
        setCampaigns([]);
        setCampaignsError(String(err));
      });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    let avatarUrl = avatar;
    if (!avatarUrl) {
      // Generate a random seed for DiceBear
      const seed = Math.random().toString(36).substring(2, 12);
      avatarUrl = `https://api.dicebear.com/7.x/rings/svg?seed=${seed}`;
    }
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, description, avatar: avatarUrl }),
    });
    const data = await res.json();
    setLoading(false);
    if (data?.error) {
      setCampaignsError(data.error);
      return;
    }
    setCampaigns([...campaigns, data]);
    setShowCreate(false);
    setName("");
    setSlug("");
    setDescription("");
    setAvatar("");
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#e6eaf3] font-sans">
      {/* Topbar for logged-in users */}
      <SignedIn>
        <div className="w-full flex items-center justify-between px-8 py-4 bg-white shadow z-20">
          <div className="text-xl font-bold text-[#1976d2]">NPCChatter</div>
          <CustomUserMenu />
        </div>
        <div className="flex-1 flex flex-col items-center py-12">
          <h1 className="text-3xl font-bold mb-6">Campaign Admin</h1>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold mb-8"
            onClick={() => setShowCreate(true)}
          >
            Create New Campaign
          </button>
          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
                  onClick={() => setShowCreate(false)}
                >
                  &times;
                </button>
                <h3 className="text-2xl font-extrabold mb-4 text-center text-gray-900">Create Campaign</h3>
                <div className="flex gap-8 items-center">
                  {/* Avatar preview on the left */}
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src={`https://api.dicebear.com/7.x/rings/svg?seed=${slug || 'campaign'}`}
                      alt="Campaign Avatar"
                      className="w-32 h-32 rounded-full border shadow mb-2"
                    />
                    <div className="text-xs text-gray-400">Randomly generated avatar</div>
                  </div>
                  {/* Form fields on the right */}
                  <form onSubmit={handleCreate} className="flex flex-col gap-4 flex-1">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Campaign Name" className="border p-2 rounded text-gray-900 placeholder-gray-500 bg-gray-50" required />
                    <input value={slug} onChange={e => setSlug(e.target.value.replace(/\s+/g, '-').toLowerCase())} placeholder="Campaign Slug (URL)" className="border p-2 rounded text-gray-900 placeholder-gray-500 bg-gray-50" required />
                    <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="border p-2 rounded text-gray-900 placeholder-gray-500 bg-gray-50" />
                    {/* Avatar URL input removed, avatar is now auto-generated */}
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold" disabled={loading}>
                      {loading ? "Creating..." : "Create Campaign"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
          <div className="w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Your Campaigns</h2>
            {campaignsError ? (
              <div className="text-red-500">Error: {campaignsError}</div>
            ) : campaigns.length === 0 ? (
              <div className="text-gray-500">No campaigns yet. Create one to get started!</div>
            ) : (
              <ul className="space-y-4">
                {Array.isArray(campaigns) && campaigns.map(c => (
                  <li key={c.id} className="border p-4 rounded shadow flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {c.avatar && <img src={c.avatar} alt="avatar" className="w-12 h-12 rounded-full" />}
                      <div>
                        <h3 className="font-bold text-lg">{c.name}</h3>
                        <p className="text-gray-600">{c.description}</p>
                        <span className="text-xs text-gray-400">URL: /{c.slug}</span>
                      </div>
                    </div>
                    <button
                      className="bg-green-600 text-white px-4 py-2 rounded"
                      onClick={() => window.location.href = `/${c.slug}`}
                    >
                      Go to Admin
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <SignIn afterSignInUrl="/" afterSignUpUrl="/" />
        </div>
      </SignedOut>
    </div>
  );
}
