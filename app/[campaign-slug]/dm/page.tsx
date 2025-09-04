"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Heading, Text, Button, Input, Flex, ChakraProvider, Link } from "@chakra-ui/react";
import { Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography, AppBar, IconButton, Menu, MenuItem, Avatar } from "@mui/material";
import { useClerk, useUser } from '@clerk/nextjs';
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
// ...existing code...


function WidgetPanel() {
  return (
  <Box display="flex" flexWrap="wrap" gap={3} p={3}>
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
  <Box p={5} minW="320px" maxW="400px" flex={1} bg="#f8ecd7" border="4px solid #c2a97f" boxShadow="0 4px 24px rgba(0,0,0,0.12)" borderRadius="xl" fontFamily="Cinzel,serif">
      <Heading size="md" mb={2} color="#7c4a03" fontFamily="Cinzel,serif">Invite User</Heading>
      <Text color="#7c4a03" mb={2}>Generate a unique invite link for this campaign. Share it with your players!</Text>
        <Button
          bg="#7c4a03"
          color="#f8ecd7"
          px={4}
          py={2}
          borderRadius="lg"
          fontWeight="bold"
          mb={4}
          border="2px solid #c2a97f"
          boxShadow="md"
          _hover={{ bg: '#a67c52' }}
          onClick={handleGenerate}
          loading={loading}
        >
          {loading ? "Generating..." : "Generate Invite Link"}
        </Button>
      {inviteUrl && (
        <Box mt={2}>
          <Text color="#7c4a03" fontWeight="bold">Invite Link:</Text>
          <Link href={inviteUrl} target="_blank" rel="noopener noreferrer" color="#a67c52" textDecoration="underline" wordBreak="break-all">{inviteUrl}</Link>
        </Box>
      )}
    </Box>
  );
};

// Placeholder Chat Widget for Ably
// ...existing code...
// ...existing code...

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
    channelRef.current.subscribe("message", (msg: { data: { text: string; sender: string; createdAt?: string } }) => {
      setMessages((prev: { text: string; sender: string; createdAt?: string }[]) => [...prev, msg.data]);
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
    <Box p={5} minW="320px" maxW="400px" flex={1} bg="#f8ecd7" border="4px solid #c2a97f" boxShadow="0 4px 24px rgba(0,0,0,0.12)" borderRadius="xl" fontFamily="Cinzel,serif">
      <Heading size="md" mb={2} color="#7c4a03" fontFamily="Cinzel,serif">Tavern Chat</Heading>
      <Box bg="#f3e3c3" border="2px solid #c2a97f" borderRadius="lg" mb={2} overflowY="auto" p={2} height="180px" boxShadow="inner">
        {messages.length === 0 ? (
          <Text color="#bfa76a" textAlign="center" mt={6} fontStyle="italic">[No messages yet]</Text>
        ) : (
          messages.map((msg: { text: string; sender: string; createdAt?: string }, idx: number) => (
            <Box key={idx} mb={1} textAlign={msg.sender === "DM" ? "right" : "left"}>
              <Text as="span" fontWeight="bold" color="#7c4a03">{msg.sender}: </Text>
              <Text as="span" color="#4b2e0e">{msg.text}</Text>
              {msg.createdAt && (
                <Text as="span" fontSize="xs" color="#bfa76a" ml={2}>{new Date(msg.createdAt).toLocaleTimeString()}</Text>
              )}
            </Box>
          ))
        )}
      </Box>
      <Flex w="full" mt={2}>
        <Input
          type="text"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="Speak, traveler..."
          border="2px solid #c2a97f"
          p={2}
          borderRadius="lg"
          flex={1}
          color="#4b2e0e"
          bg="#f8ecd7"
          fontFamily="Cinzel,serif"
        />
        <Button
          bg="#7c4a03"
          color="#f8ecd7"
          px={3}
          py={2}
          borderRadius="lg"
          fontWeight="bold"
          ml={2}
          border="2px solid #c2a97f"
          boxShadow="md"
          _hover={{ bg: '#a67c52' }}
          onClick={sendMessage}
        >
          Send
        </Button>
      </Flex>
    </Box>
  );
};
// ...existing code...

  return (
  <ChakraProvider>
      <Box display="flex" flexDirection="column" minHeight="100vh" bg="gray.50">
        <TopBar />
        <Box as="main" flexGrow={1} p={3} mt="64px">
          <WidgetPanel />
        </Box>
      </Box>
    </ChakraProvider>
  );
}
