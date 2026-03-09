// src/services/miraAI.ts
// Frontend service - NO API keys here, calls secure Supabase Edge Function

// Public Supabase credentials (safe to expose)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Crisis detection keywords - runs locally, no API needed
const CRISIS_KEYWORDS = [
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "want to die",
  "don't want to live",
  "better off dead",
  "no reason to live",
  "self-harm",
  "hurt myself",
  "cutting",
  "hopeless",
  "worthless",
  "can't go on",
  "end it all",
];

/**
 * Detect crisis keywords in user message
 */
export const detectCrisis = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));
};

/**
 * Chat with Mira via secure Supabase Edge Function
 */
export const chatWithMira = async (
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userName: string = "friend"
): Promise<{ message: string; isCrisis: boolean }> => {
  const isCrisis = detectCrisis(userMessage);

  // Validate Supabase configuration
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase not configured - using fallback responses");
    return {
      message: getFallbackResponse(userMessage, isCrisis, userName),
      isCrisis,
    };
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/chat-with-mira`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            ...conversationHistory.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: "user", content: userMessage },
          ],
          userName,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      message: data.message || "I'm here with you. 💜",
      isCrisis,
    };
  } catch (error) {
    console.error("Error calling Mira API:", error);
    return {
      message: getFallbackResponse(userMessage, isCrisis, userName),
      isCrisis,
    };
  }
};

/**
 * Fallback responses when API is unavailable
 */
function getFallbackResponse(
  userMessage: string,
  isCrisis: boolean,
  userName: string
): string {
  if (isCrisis) {
    return `I'm really concerned about what you've shared, ${userName}. You're not alone, and you don't have to go through this by yourself. 💜 The Crisis Lifeline (988) has caring people available 24/7 who want to help. Would you like to talk more about what's going on?`;
  }

  const lower = userMessage.toLowerCase();

  if (lower.includes("sad") || lower.includes("depressed") || lower.includes("down") || lower.includes("crying")) {
    return `That sounds really difficult, ${userName}. I'm here with you. 💜 Would you like to tell me more about what's been weighing on you?`;
  }

  if (lower.includes("anxious") || lower.includes("anxiety") || lower.includes("worried") || lower.includes("stress") || lower.includes("panic")) {
    return `Anxiety can feel so overwhelming. Thank you for sharing that with me. 🌸 What's been triggering these feelings?`;
  }

  if (lower.includes("alone") || lower.includes("lonely") || lower.includes("isolated")) {
    return `Feeling alone is so hard. I want you to know I'm here, ${userName}, and your feelings matter. 💜 What's been making you feel this way?`;
  }

  if (lower.includes("angry") || lower.includes("frustrated") || lower.includes("mad")) {
    return `It sounds like you're carrying a lot of frustration. That's completely valid. 💜 What happened?`;
  }

  if (lower.includes("happy") || lower.includes("good") || lower.includes("great") || lower.includes("better")) {
    return `I'm so glad to hear that, ${userName}! 🌸 What's been bringing you joy?`;
  }

  if (lower.includes("tired") || lower.includes("exhausted") || lower.includes("drained")) {
    return `It sounds like you've been carrying a lot. It's okay to feel tired. 💛 What's been taking your energy?`;
  }

  const defaults = [
    `Thank you for sharing that with me, ${userName}. I'm here to listen. 💜 Can you tell me more?`,
    `I hear you. Your feelings are valid. 🌸 What else is on your mind?`,
    `I'm here with you. Would you like to share more about how you're feeling? 💜`,
  ];

  return defaults[Math.floor(Math.random() * defaults.length)];
}

/**
 * Generate greeting based on time of day and user's last mood
 */
export const generateGreeting = (userName: string, lastMood?: number): string => {
  if (lastMood && lastMood <= 2) {
    return `Hey ${userName}, I've been thinking about you. How are you holding up? 💜`;
  }

  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return `Good morning, ${userName} ☀️ How are you feeling today?`;
  } else if (hour >= 12 && hour < 17) {
    return `Good afternoon, ${userName} 💜 How's your day going?`;
  } else if (hour >= 17 && hour < 21) {
    return `Good evening, ${userName} 🌙 How was your day?`;
  } else {
    return `Hey ${userName} ✨ Can't sleep? I'm here if you want to talk.`;
  }
};

/**
 * Get quick reply suggestions based on context
 */
export const getQuickReplies = (isCrisis: boolean): string[] => {
  if (isCrisis) {
    return [
      "Yes, show me resources",
      "I just need someone to listen",
      "I'm feeling a bit better now",
    ];
  }

  return ["I want to vent", "Help me feel calmer", "Just want to chat"];
};