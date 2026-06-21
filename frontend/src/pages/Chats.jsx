import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/api.client";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import MessageInput from "../components/chat/MessageInput";
import { toast } from "react-toastify";

const socket = io("http://localhost:5000", {
  withCredentials: true,
  autoConnect: false,
});

const Chats = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sellerId = searchParams.get("sellerId");
  const productId = searchParams.get("productId");
  
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitiating, setIsInitiating] = useState(false);

  const [activeTab, setActiveTab] = useState("orders"); // 'orders' or 'sales'
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' && window.innerWidth >= 768));
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Fetch all chats for the user
  const fetchChats = useCallback(async () => {
    try {
      const response = await apiClient.get("/chat/all");
      setChats(response.data);
      
      // If we are initiating from a product, decide which tab to open
      if (productId) {
        // We'll handle tab switching in the initiation logic
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching chats:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const handleInitiateChat = useCallback(async (receiverId, pId) => {
    if (isInitiating) return;
    setIsInitiating(true);
    try {
      const response = await apiClient.post("/chat/create", { 
        receiverId, 
        productId: pId 
      });
      const newChat = response.data;
      
      // Decide tab based on whether user is seller
      if (newChat.productId?.seller === user?._id) {
        setActiveTab("sales");
      } else {
        setActiveTab("orders");
      }

      setChats(prev => {
        const filtered = prev.filter(c => c._id.toString() !== newChat._id.toString());
        return [newChat, ...filtered];
      });
      
      setActiveChat(newChat);
    } catch (error) {
      console.error("Initiate chat error:", error);
    } finally {
      setIsInitiating(false);
    }
  }, [isInitiating, user]);

  const fetchMessages = async (chatId) => {
    try {
      const response = await apiClient.get(`/chat/messages/${chatId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (user) {
      socket.connect();
      fetchChats();
    }
    return () => {
      socket.disconnect();
    };
  }, [user, fetchChats]);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const initiatedRef = useRef(null);

  // Handle sellerId from URL
  useEffect(() => {
    if (user && sellerId && !loading) {
      const initKey = `${sellerId}-${productId}`;
      if (initiatedRef.current === initKey) return;
      
      handleInitiateChat(sellerId, productId);
      initiatedRef.current = initKey;
    }
  }, [user, sellerId, productId, loading, handleInitiateChat]);

  // Reset chat window when switching tabs
  useEffect(() => {
    setActiveChat(null);
    setMessages([]);
  }, [activeTab]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
      socket.emit("join_chat", activeChat._id);
    }
  }, [activeChat]);

  useEffect(() => {
    const handleMessage = (message) => {
      // Use chatId.toString() for comparison
      const msgChatId = message.chatId?.toString() || message.chatId;
      
      if (activeChat && activeChat._id.toString() === msgChatId) {
        setMessages((prev) => {
          // Prevent duplicate if message already exists
          if (prev.some((m) => m._id === message._id)) return prev;

          // Try to find a temporary optimistic message to replace
          const tempIndex = prev.findIndex((m) =>
            m._id?.toString?.().startsWith?.("temp-") && m.text === message.text && (m.sender?._id?.toString() === message.sender?._id?.toString())
          );

          if (tempIndex !== -1) {
            const copy = [...prev];
            copy[tempIndex] = message;
            return copy;
          }

          return [...prev, message];
        });
      }
      
      // Update chats list with last message
      setChats((prev) => {
        const chatIndex = prev.findIndex((c) => c._id.toString() === msgChatId);
        if (chatIndex !== -1) {
          return prev.map((c) =>
            c._id.toString() === msgChatId ? { ...c, lastMessage: message, updatedAt: new Date() } : c
          ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } else {
          // If the chat isn't in our list (new chat initiated by someone else), refresh the list
          fetchChats();
          return prev;
        }
      });
    };


    socket.on("receive_message", handleMessage);
    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, [activeChat, fetchChats]); // Added fetchChats to dependencies


  const handleSendMessage = (text) => {
  if (!activeChat || !user) return;

  console.log("Current User:", user);
  console.log("User ID:", user?._id);

  const messageData = {
    chatId: activeChat._id,
    sender: user?._id,
    text,
  };

  console.log("Sending Message:", messageData);

  // Optimistically append a temporary message so the UI feels responsive
  const tempMessage = {
    _id: `temp-${Date.now()}`,
    chatId: activeChat._id,
    sender: { _id: user._id || user.id, userName: user.userName },
    text,
    createdAt: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, tempMessage]);

  socket.emit("send_message", messageData);
};

  const updateActiveChat = (updatedChat) => {
    setActiveChat(updatedChat);
    setChats((prev) =>
      prev.map((c) => (c._id.toString() === updatedChat._id.toString() ? updatedChat : c))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: "var(--mui-palette-background-default)" }}>
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const otherParticipant = activeChat?.participants.find(
    (p) => p._id?.toString() !== user?._id?.toString()
  );

  // Absolute deduplication logic: One entry per Person (preserving history)
  const conversationMap = new Map();

  chats.forEach(chat => {
    const otherP = chat.participants.find(p => p._id?.toString() !== user?._id?.toString());
    if (!otherP) return;

    const otherPId = otherP._id?.toString();
    const key = otherPId; // One thread per person

    const existing = conversationMap.get(key);
    // Keep the one with the most recent activity
    if (!existing || new Date(chat.updatedAt) > new Date(existing.updatedAt)) {
      conversationMap.set(key, chat);
    }
  });

  const uniqueChats = Array.from(conversationMap.values());

  // Filter unique chats by OTHER PARTICIPANT ID to be 100% sure we only see one entry per person
  // But now we filter by tab too
  const filteredByTab = uniqueChats.filter(chat => {
    // If productId.seller matches user._id, it's a 'sale'
    const isSeller = chat.productId?.seller?.toString() === user?._id?.toString();
    if (activeTab === "sales") return isSeller;
    return !isSeller;
  });

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden" style={{ backgroundColor: "var(--mui-palette-background-default)" }}>
      {(sidebarOpen || windowWidth >= 768) && (
        <ChatSidebar
          chats={filteredByTab}
          activeChat={activeChat}
          onSelectChat={(chat) => { setActiveChat(chat); if (windowWidth < 768) setSidebarOpen(false); }}
          currentUser={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobile={windowWidth < 768}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar: toggle sidebar */}
        {windowWidth < 768 && (
          <div className="p-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--mui-palette-divider)', backgroundColor: 'var(--mui-palette-background-paper)'}}>
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="p-2 rounded-lg bg-blue-600 text-white"
              aria-label="Toggle chats list"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="font-black uppercase tracking-tight">Chats</div>
          </div>
        )}
        <ChatWindow
          messages={messages}
          currentUser={user}
          otherParticipant={otherParticipant}
          activeChat={activeChat}
          updateActiveChat={updateActiveChat}
        />
        {activeChat && (
          <MessageInput onSendMessage={handleSendMessage} />
        )}
      </div>
    </div>
  );
};

export default Chats;