import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Send, Mic, MoreVertical } from "lucide-react";
import { getChats, saveChat, getMoods, type ChatMessage } from "@/lib/storage";
import { getAIResponse, getGreeting } from "@/lib/aiResponses";

const quickReplies = ["I want to vent", "I'd like to do an exercise", "Just want to chat"];

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const stored = getChats();
    if (stored.length > 0) {
      setMessages(stored);
    } else {
      const moods = getMoods();
      const recentBad = moods.length > 0 && moods[moods.length - 1].mood <= 2;
      const greeting: ChatMessage = {
        role: "assistant",
        content: getGreeting(stored.length === 0, recentBad),
        timestamp: new Date().toISOString(),
      };
      setMessages([greeting]);
      saveChat([greeting]);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim(), timestamp: new Date().toISOString() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    saveChat(updated);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: "assistant",
        content: getAIResponse(text),
        timestamp: new Date().toISOString(),
      };
      const withAI = [...updated, aiResponse];
      setMessages(withAI);
      saveChat(withAI);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="mindher-container bg-background min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate("/")} className="p-1 rounded-full hover:bg-muted">
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

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}>
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

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 px-4 py-2">
            <span className="text-xs">💜</span>
            <div className="bg-primary/15 rounded-2xl px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/50"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick replies after first Mira message */}
        {messages.length === 1 && messages[0].role === "assistant" && (
          <div className="flex flex-wrap gap-2 mt-2">
            {quickReplies.map((qr) => (
              <button
                key={qr}
                onClick={() => sendMessage(qr)}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium"
              >
                {qr}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3 pb-[env(safe-area-inset-bottom,12px)]">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Type a message..."
            className="mindher-input flex-1 py-2.5"
          />
          <button className="p-2.5 rounded-full hover:bg-muted">
            <Mic size={20} className="text-muted-foreground" />
          </button>
          <button
            onClick={() => sendMessage(input)}
            className="p-2.5 bg-primary rounded-full"
          >
            <Send size={18} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
