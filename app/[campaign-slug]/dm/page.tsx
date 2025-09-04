"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Box, Heading, Text, Button, Input, Flex, Link } from "@chakra-ui/react";
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
    <Box p={5} minW="320px" maxW="400px" flex={1} bg="#f8ecd7" borderRadius="xl">
      <Heading size="md" mb={2}>Campaign Overview</Heading>
      <Text color="#7c4a03">Basic campaign information appears here.</Text>
    </Box>
  );
}

function MembersWidget() {
  return (
    <Box p={5} minW="320px" maxW="400px" flex={1} bg="#f8ecd7" borderRadius="xl">
      <Heading size="md" mb={2}>Members</Heading>
      <Text color="#7c4a03">Member list placeholder</Text>
    </Box>
  );
}

const ABLY_API_KEY = process.env.NEXT_PUBLIC_ABLY_KEY || "";
type ChatMessage = { text: string; sender: string; createdAt?: string };

function InviteWidget() {
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const slug = typeof params === 'object' ? params['campaign-slug'] : undefined;

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
    <Box p={5} minW="320px" maxW="400px" flex={1} bg="#f8ecd7" borderRadius="xl">
      <Heading size="md" mb={2}>Invite User</Heading>
      <Text mb={2}>Generate a unique invite link for this campaign.</Text>
      <Button onClick={handleGenerate} disabled={loading} mb={3}>
        {loading ? 'Generating...' : 'Generate Invite Link'}
      </Button>
      {inviteUrl && (
        <Box mt={2}>
          <Link href={inviteUrl} target="_blank" rel="noopener noreferrer" color="#7c4a03">{inviteUrl}</Link>
        </Box>
      )}
    </Box>
  );
}

function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const ablyRef = useRef<Ably.Realtime | null>(null);
  type MinimalChannel = { subscribe: (name: string, cb: (msg: { data: ChatMessage }) => void) => void; publish?: (name: string, data: unknown) => void; unsubscribe?: () => void };
  const channelRef = useRef<MinimalChannel | null>(null);
  const params = useParams();
  const slug = typeof params === 'object' ? params['campaign-slug'] : undefined;

  useEffect(() => {
    if (!slug || !ABLY_API_KEY) return;
    ablyRef.current = new Ably.Realtime(ABLY_API_KEY);
    channelRef.current = ((ablyRef.current as unknown) as { channels: { get: (name: string) => MinimalChannel } }).channels.get(`campaign-chat-${slug}`);
    channelRef.current.subscribe('message', (msg: { data: ChatMessage }) => {
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
    <Box p={5} minW="320px" maxW="400px" flex={1} bg="#f8ecd7" borderRadius="xl">
      <Heading size="md" mb={2}>Tavern Chat</Heading>
      <Box mb={2} height="180px" overflowY="auto" bg="#f3e3c3" p={2} borderRadius="md">
        {messages.length === 0 ? (
          <Text color="#bfa76a">[No messages yet]</Text>
        ) : (
          messages.map((m, i) => (
            <Box key={i} mb={2}>
              <Text fontWeight="bold">{m.sender}: <Text as="span" fontWeight="normal">{m.text}</Text></Text>
            </Box>
          ))
        )}
      </Box>
      <Flex>
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Speak, traveler..." />
        <Button ml={2} onClick={sendMessage}>Send</Button>
      </Flex>
    </Box>
  );
}

export default function Page() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" bg="gray.50">
      <TopBar />
      <Box as="main" flexGrow={1} p={3} mt="64px">
        <Box display="flex" gap={3} flexWrap="wrap">
          <OverviewWidget />
          <MembersWidget />
          <InviteWidget />
          <ChatWidget />
        </Box>
      </Box>
    </Box>
  );
}
