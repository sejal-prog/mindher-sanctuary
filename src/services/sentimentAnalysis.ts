// src/services/sentimentAnalysis.ts
// Frontend service - NO API keys here, calls secure Supabase Edge Function

// Public Supabase credentials (safe to expose)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface SentimentResult {
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  sentimentScore: number;
  emotion: string;
  riskLevel: "low" | "medium" | "high" | "crisis";
  riskScore: number;
  shouldAlert: boolean;
  alertType: "CRISIS" | "HIGH_RISK" | null;
  message: string;
  analyzedAt: string;
  journalId?: string;
  userId?: string;
}

export interface AnalyzeJournalParams {
  journalText: string;
  journalId?: string;
  userId?: string;
}

/**
 * Analyze journal entry for sentiment and risk level
 */
export async function analyzeJournal(params: AnalyzeJournalParams): Promise<SentimentResult> {
  const { journalText, journalId, userId } = params;

  if (!journalText || journalText.trim().length === 0) {
    throw new Error("Journal text cannot be empty");
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase credentials not configured");
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-journal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        journalText,
        journalId,
        userId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Edge function error:", errorText);
      throw new Error(`Failed to analyze journal: ${response.status}`);
    }

    const data = await response.json();
    return data as SentimentResult;
  } catch (err) {
    console.error("Sentiment analysis error:", err);
    throw err;
  }
}

/**
 * Get risk level color for UI display
 */
export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case "crisis":
      return "text-red-600 bg-red-100";
    case "high":
      return "text-orange-600 bg-orange-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "low":
    default:
      return "text-green-600 bg-green-100";
  }
}

/**
 * Get risk level emoji for UI display
 */
export function getRiskLevelEmoji(riskLevel: string): string {
  switch (riskLevel) {
    case "crisis":
      return "🔴";
    case "high":
      return "🟠";
    case "medium":
      return "🟡";
    case "low":
    default:
      return "🟢";
  }
}

/**
 * Get sentiment emoji for UI display
 */
export function getSentimentEmoji(sentiment: string): string {
  switch (sentiment) {
    case "POSITIVE":
      return "😊";
    case "NEGATIVE":
      return "😔";
    case "NEUTRAL":
    default:
      return "😐";
  }
}

/**
 * Format emotion label for display
 */
export function formatEmotion(emotion: string): string {
  const emotionMap: Record<string, string> = {
    joy: "Joyful 😄",
    sadness: "Sad 😢",
    anger: "Angry 😠",
    fear: "Anxious 😰",
    surprise: "Surprised 😮",
    disgust: "Upset 😣",
    neutral: "Calm 😌",
    distress: "Distressed 😣",
  };
  return emotionMap[emotion.toLowerCase()] || emotion;
}