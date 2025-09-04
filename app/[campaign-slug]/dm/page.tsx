"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Toolbar, Typography, AppBar, IconButton, Menu, MenuItem, Avatar } from "@mui/material";
import { useClerk, useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import * as Ably from "ably";

function TopBar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handleClose = useCallback(() => setAnchorEl(null), []);
  const handleSignOut = useCallback(() => {
    signOut();
    setAnchorEl(null);
  }, [signOut]);

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Campaign Admin
        </Typography>
        {user && (
          <>
            <IconButton onClick={handleMenu} color="inherit" size="large">
              <Avatar src={user.imageUrl} alt={user.fullName || user.username || "User"} />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem disabled>{user.fullName || user.username}</MenuItem>
              <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

function OverviewWidget() {
  return (
    <div style={{ padding: 20, minWidth: 320, maxWidth: 400, flex: 1, background: '#f8ecd7', borderRadius: 12 }}>
      <h3 style={{ marginBottom: 8 }}>Campaign Overview</h3>
      <p style={{ color: '#7c4a03' }}>Basic campaign information appears here.</p>
    </div>
  );
}

function MembersWidget() {
  return (
    <div style={{ padding: 20, minWidth: 320, maxWidth: 400, flex: 1, background: '#f8ecd7', borderRadius: 12 }}>
      <h3 style={{ marginBottom: 8 }}>Members</h3>
      <p style={{ color: '#7c4a03' }}>Member list placeholder</p>
    </div>
  );
}

const ABLY_API_KEY = process.env.NEXT_PUBLIC_ABLY_KEY || "";
type ChatMessage = { text: string; sender: string; createdAt?: string };

function InviteWidget() {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const slug = typeof params === 'object' ? (params['campaign-slug'] as string | undefined) : undefined;

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/campaigns/${slug}/invite`);
      const data = await res.json();
      if (mounted) setInviteUrl(data.inviteUrl ?? null);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [slug]);

  async function handleGenerate() {
    if (!slug) return;
    setLoading(true);
    const res = await fetch(`/api/campaigns/${slug}/invite`, { method: 'POST' });
    const data = await res.json();
    setInviteUrl(data.inviteUrl ?? null);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20, minWidth: 320, maxWidth: 400, flex: 1, background: '#f8ecd7', borderRadius: 12 }}>
      <h3 style={{ marginBottom: 8 }}>Invite User</h3>
      <p style={{ marginBottom: 8 }}>Generate a unique invite link for this campaign.</p>
      <button onClick={handleGenerate} disabled={loading} style={{ marginBottom: 12 }}>
        {loading ? 'Generating...' : 'Generate Invite Link'}
      </button>
      {inviteUrl && (
        <div style={{ marginTop: 8 }}>
          <a href={inviteUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#7c4a03' }}>{inviteUrl}</a>
        </div>
      )}
    </div>
  );
}

function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const ablyRef = useRef<Ably.Realtime | null>(null);
  type MinimalChannel = { subscribe: (event: string, cb: (msg: { data: ChatMessage }) => void) => void; publish?: (event: string, data: unknown) => void; unsubscribe?: () => void };
  const channelRef = useRef<MinimalChannel | null>(null);
  const params = useParams();
  const slug = typeof params === 'object' ? (params['campaign-slug'] as string | undefined) : undefined;

  useEffect(() => {
    if (!slug || !ABLY_API_KEY) return;
    ablyRef.current = new Ably.Realtime(ABLY_API_KEY);
  // typed cast to avoid 'any' while accessing Ably channels
  const ablyTyped = ablyRef.current as unknown as { channels: { get: (name: string) => MinimalChannel } };
  const channel = ablyTyped.channels.get(`campaign-chat-${slug}`);
    channelRef.current = channel;
    channel.subscribe('message', (msg: { data: ChatMessage }) => {
      setMessages(prev => [...prev, msg.data]);
    });
    return () => {
      channelRef.current?.unsubscribe?.();
      ablyRef.current?.close?.();
    };
  }, [slug]);

  const sendMessage = async () => {
    if (!input.trim() || !slug) return;
    await fetch(`/api/campaigns/${slug}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input, sender: 'DM' }),
    });
    channelRef.current?.publish?.('message', { text: input, sender: 'DM' });
    setInput('');
  };

  return (
    <div style={{ padding: 20, minWidth: 320, maxWidth: 400, flex: 1, background: '#f8ecd7', borderRadius: 12 }}>
      <h3 style={{ marginBottom: 8 }}>Tavern Chat</h3>
      <div style={{ marginBottom: 8, height: 180, overflowY: 'auto', background: '#f3e3c3', padding: 8, borderRadius: 6 }}>
        {messages.length === 0 ? (
          <p style={{ color: '#bfa76a' }}>[No messages yet]</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong>{m.sender}:</strong> <span>{m.text}</span>
            </div>
          ))
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Speak, traveler..." />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'gray.50' }}>
      <TopBar />
      <main style={{ flexGrow: 1, padding: 12, marginTop: 64 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <OverviewWidget />
          <MembersWidget />
          <InviteWidget />
          <ChatWidget />
        </div>
      </main>
    </div>
  );
}
