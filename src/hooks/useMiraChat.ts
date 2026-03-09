// src/hooks/useMiraChat.ts
// React hook for Mira chat - manages state, history, and API calls

import { useState, useCallback, useEffect } from "react";
import { chatWithMira, generateGreeting, detectCrisis } from "@/services/miraAI";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isCrisis?: boolean;
}

const STORAGE_KEY = "mindher_chat_history";
const MAX_STORED_MESSAGES = 50;

export function useMiraChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCrisisDetected, setIsCrisisDetected] = useState(false);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          const recentCrisis = parsed.slice(-5).some((m: ChatMessage) => m.isCrisis);
          setIsCrisisDetected(recentCrisis);
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  }, []);

  // Save chat history to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const toStore = messages.slice(-MAX_STORED_MESSAGES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      } catch (error) {
        console.error("Error saving chat history:", error);
      }
    }
  }, [messages]);

  // Get user name from localStorage
  const getUserName = useCallback((): string => {
    try {
      const userStr = localStorage.getItem("mindher_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.name || "friend";
      }
    } catch (error) {
      console.error("Error getting user name:", error);
    }
    return "friend";
  }, []);

  // Get last recorded mood from localStorage
  const getLastMood = useCallback((): number | undefined => {
    try {
      const moodsStr = localStorage.getItem("mindher_moods");
      if (moodsStr) {
        const moods = JSON.parse(moodsStr);
        if (Array.isArray(moods) && moods.length > 0) {
          return moods[moods.length - 1]?.mood;
        }
      }
    } catch (error) {
      console.error("Error getting last mood:", error);
    }
    return undefined;
  }, []);

  // Initialize chat with greeting
  const initializeChat = useCallback(() => {
    const userName = getUserName();
    const lastMood = getLastMood();

    const greeting: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: generateGreeting(userName, lastMood),
      timestamp: new Date().toISOString(),
    };

    setMessages([greeting]);
    setIsCrisisDetected(false);
  }, [getUserName, getLastMood]);

  // Send message to Mira
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim();
      if (!trimmedContent || isLoading) return;

      setIsLoading(true);

      const messageIsCrisis = detectCrisis(trimmedContent);

      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: "user",
        content: trimmedContent,
        timestamp: new Date().toISOString(),
        isCrisis: messageIsCrisis,
      };

      setMessages((prev) => [...prev, userMessage]);

      if (messageIsCrisis) {
        setIsCrisisDetected(true);
      }

      try {
        // Small delay to feel more natural
        await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await chatWithMira(trimmedContent, history, getUserName());

        const assistantMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: response.message,
          timestamp: new Date().toISOString(),
          isCrisis: response.isCrisis,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (response.isCrisis) {
          setIsCrisisDetected(true);
        }
      } catch (error) {
        console.error("Error sending message:", error);

        const fallbackMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: "I'm here with you. 💜 Can you tell me more about how you're feeling?",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, fallbackMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, getUserName]
  );

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setIsCrisisDetected(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  }, []);

  return {
    messages,
    isLoading,
    isCrisisDetected,
    sendMessage,
    initializeChat,
    clearChat,
  };
}

export default useMiraChat;