"use client";
import { useState } from "react";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, AppBar, IconButton, Menu, MenuItem, Avatar } from "@mui/material";
import { useClerk, useUser } from '@clerk/nextjs';
import { useCallback } from 'react';
function TopBar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
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
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem disabled>{user.fullName || user.username || (user.emailAddresses && user.emailAddresses[0]?.emailAddress)}</MenuItem>
              <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}


function WidgetPanel() {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, p: 3 }}>
  <OverviewWidget />
  <MembersWidget />
  <InviteWidget />
  <ChatWidget />
    </Box>
  );
}

const parchment = "bg-[#f8ecd7] border-4 border-[#c2a97f] shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-xl font-[Cinzel,serif]";
const fantasyTitle = "font-[Cinzel,serif] text-[#7c4a03] text-2xl mb-2 tracking-wide drop-shadow";

const OverviewWidget = () => {
  return (
    <div className={`${parchment} p-5 min-w-[320px] max-w-[400px] flex-1`}>
      <div className={fantasyTitle}>Campaign Overview</div>
      <div className="text-[#7c4a03] font-bold">Name: <span className="font-normal">[Campaign Name]</span></div>
      <div className="text-[#7c4a03] font-bold">Description: <span className="font-normal">[Campaign Description]</span></div>
      <div className="mt-4 text-[#bfa76a] italic">[Avatar Placeholder]</div>
    </div>
  );
}

const MembersWidget = () => {
  return (
    <div className={`${parchment} p-5 min-w-[320px] max-w-[400px] flex-1`}>
      <div className={fantasyTitle}>Members</div>
      <div className="text-[#7c4a03]">List of members and roles will appear here.</div>
    </div>
  );
}

import { useRef, useEffect } from "react";
import { useParams } from "next/navigation";

// Placeholder Chat Widget for Ably
// ...existing code...
const InviteWidget = () => {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const slug = typeof params === 'object' ? params["campaign-slug"] : undefined;

  useEffect(() => {
    async function fetchInvite() {
      if (!slug) return;
      setLoading(true);
      const res = await fetch(`/api/campaigns/${slug}/invite`);
      const data = await res.json();
      setInviteUrl(data.inviteUrl);
      setLoading(false);
    }
    fetchInvite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleGenerate() {
    if (!slug) return;
    setLoading(true);
    const res = await fetch(`/api/campaigns/${slug}/invite`, { method: "POST" });
    const data = await res.json();
    setInviteUrl(data.inviteUrl);
    setLoading(false);
  }

  return (
    <div className={`${parchment} p-5 min-w-[320px] max-w-[400px] flex-1`}>
      <div className={fantasyTitle}>Invite User</div>
      <div className="text-[#7c4a03] mb-2">Generate a unique invite link for this campaign. Share it with your players!</div>
      <button
        className="bg-[#7c4a03] text-[#f8ecd7] px-4 py-2 rounded-lg font-bold mb-4 border-2 border-[#c2a97f] shadow hover:bg-[#a67c52] transition"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Invite Link"}
      </button>
      {inviteUrl && (
        <div className="mt-2">
          <div className="text-[#7c4a03] font-bold">Invite Link:</div>
          <a href={inviteUrl} target="_blank" rel="noopener noreferrer" className="text-[#a67c52] underline break-all">{inviteUrl}</a>
        </div>
      )}
    </div>
  );
};

// Placeholder Chat Widget for Ably
// ...existing code...
import * as Ably from "ably";

const ABLY_API_KEY = "cY1nHQ.kA73tw:mi5Kx3xI_7HVOhbIynKoSmvQUfKxzW-DlYvTI2FPcMo";

const ChatWidget = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string; createdAt?: string }[]>([]);
  const [input, setInput] = useState("");
  const ablyRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const params = useParams();
  const slug = typeof params === 'object' ? params["campaign-slug"] : undefined;

  // Load messages from API on mount
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/campaigns/${slug}/messages`)
      .then(res => res.json())
      .then(data => {
        if (data.messages) setMessages(data.messages);
      });
  }, [slug]);

  // Ably real-time subscription
  useEffect(() => {
    ablyRef.current = new Ably.Realtime(ABLY_API_KEY);
    channelRef.current = ablyRef.current.channels.get(`campaign-chat-${slug}`);
    channelRef.current.subscribe("message", (msg: any) => {
      setMessages((prev) => [...prev, msg.data]);
    });
    return () => {
      channelRef.current?.unsubscribe();
      ablyRef.current?.close();
    };
  }, [slug]);

  const sendMessage = async () => {
    if (!input.trim() || !slug) return;
    // Save to DB
    await fetch(`/api/campaigns/${slug}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, sender: "DM" }),
    });
    // Publish to Ably
    channelRef.current?.publish("message", { text: input, sender: "DM" });
    setInput("");
  };

  return (
    <div className={`${parchment} p-5 min-w-[320px] max-w-[400px] flex-1`}>
      <div className={fantasyTitle}>Tavern Chat</div>
      <div className="bg-[#f3e3c3] border-2 border-[#c2a97f] rounded-lg mb-2 overflow-y-auto p-2 h-[180px] shadow-inner">
        {messages.length === 0 ? (
          <div className="text-[#bfa76a] text-center mt-6 italic">[No messages yet]</div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`mb-1 ${msg.sender === "DM" ? "text-right" : "text-left"}`}>
              <span className="font-bold text-[#7c4a03]">{msg.sender}: </span>
              <span className="text-[#4b2e0e]">{msg.text}</span>
              {msg.createdAt && (
                <span className="text-xs text-[#bfa76a] ml-2">{new Date(msg.createdAt).toLocaleTimeString()}</span>
              )}
            </div>
          ))
        )}
      </div>
      <div className="flex w-full mt-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Speak, traveler..."
          className="border-2 border-[#c2a97f] p-2 rounded-lg flex-1 text-[#4b2e0e] bg-[#f8ecd7] font-[Cinzel,serif]"
        />
        <button
          className="bg-[#7c4a03] text-[#f8ecd7] px-3 py-2 rounded-lg font-bold ml-2 border-2 border-[#c2a97f] shadow hover:bg-[#a67c52] transition"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};
// ...existing code...

export default function CampaignAdmin() {
  return (
    <Box sx={{ display: "flex", flexDirection: 'column', minHeight: '100vh', bgcolor: "background.default" }}>
      <TopBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginTop: '64px' }}>
        <WidgetPanel />
      </Box>
    </Box>
  );
}
