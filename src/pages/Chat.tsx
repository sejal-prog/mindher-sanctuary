// src/pages/Chat.tsx
// Chat page using secure Supabase AI backend

import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Send, Mic, MoreVertical, AlertCircle } from "lucide-react";
import { useMiraChat } from "@/hooks/useMiraChat";
import { getQuickReplies } from "@/services/miraAI";

const Chat = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Use the secure Mira chat hook
  const {
    messages,
    isLoading,
    isCrisisDetected,
    sendMessage,
    initializeChat,
  } = useMiraChat();

  // Initialize chat with greeting on first load
  useEffect(() => {
    if (messages.length === 0) {
      initializeChat();
    }
  }, [messages.length, initializeChat]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // Handle sending message
  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return;
    sendMessage(text);
    setInput("");
  };

  // Format timestamp
  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  // Get quick replies based on crisis state
  const quickReplies = getQuickReplies(isCrisisDetected);

  return (
    <div className="mindher-container bg-background min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button
          onClick={() => navigate("/")}
          className="p-1 rounded-full hover:bg-muted"
        >
          <ChevronLeft size={22} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold font-heading text-foreground">Mira 💜</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
        <button className="p-1 rounded-full hover:bg-muted">
          <MoreVertical size={20} className="text-muted-foreground" />
        </button>
      </header>

      {/* Crisis Alert Banner */}
      {isCrisisDetected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" />
            <span className="text-sm text-red-700">
              If you're in crisis, help is available 24/7
            </span>
          </div>
          <button
            onClick={() => navigate("/crisis")}
            className="px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-medium hover:bg-red-600 transition-colors"
          >
            Get Help
          </button>
        </motion.div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] ${
                msg.role === "user" ? "order-1" : ""
              }`}
            >
              {msg.role === "assistant" && (
                <span className="text-xs mb-1 block">💜</span>
              )}
              <div
                className={`px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-secondary/30 rounded-2xl rounded-br-md text-foreground"
                    : "bg-primary/15 rounded-2xl rounded-bl-md text-foreground"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 px-4 py-2"
          >
            <span className="text-xs">💜</span>
            <div className="bg-primary/15 rounded-2xl px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/50"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick replies after first message */}
        {messages.length === 1 && messages[0].role === "assistant" && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 mt-2"
          >
            {quickReplies.map((qr) => (
              <button
                key={qr}
                onClick={() => handleSend(qr)}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                {qr}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3 pb-[env(safe-area-inset-bottom,12px)]">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend(input)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="mindher-input flex-1 py-2.5 disabled:opacity-50"
          />
          <button className="p-2.5 rounded-full hover:bg-muted">
            <Mic size={20} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => handleSend(input)}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-primary rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;