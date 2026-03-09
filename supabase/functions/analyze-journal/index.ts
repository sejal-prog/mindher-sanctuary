// supabase/functions/analyze-journal/index.ts
// Sentiment Analysis Edge Function using HuggingFace API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Crisis keywords for immediate detection
const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end my life", "want to die", "better off dead",
  "self-harm", "hurt myself", "cutting", "overdose", "no reason to live",
  "goodbye forever", "final goodbye", "can't go on", "ending it all"
];

// High-risk keywords
const HIGH_RISK_KEYWORDS = [
  "hopeless", "worthless", "nobody cares", "alone forever", "give up",
  "can't take it anymore", "exhausted", "trapped", "no way out", "burden"
];

// Medium-risk keywords  
const MEDIUM_RISK_KEYWORDS = [
  "anxious", "stressed", "worried", "sad", "lonely", "overwhelmed",
  "frustrated", "angry", "tired", "can't sleep", "no appetite", "crying"
];

function detectCrisisKeywords(text: string): { hasCrisis: boolean; hasHighRisk: boolean; hasMediumRisk: boolean } {
  const lowerText = text.toLowerCase();
  
  const hasCrisis = CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
  const hasHighRisk = HIGH_RISK_KEYWORDS.some(keyword => lowerText.includes(keyword));
  const hasMediumRisk = MEDIUM_RISK_KEYWORDS.some(keyword => lowerText.includes(keyword));
  
  return { hasCrisis, hasHighRisk, hasMediumRisk };
}

function calculateRiskLevel(
  sentiment: string, 
  score: number, 
  keywordDetection: { hasCrisis: boolean; hasHighRisk: boolean; hasMediumRisk: boolean }
): { level: string; score: number; shouldAlert: boolean } {
  
  // Crisis keywords override everything
  if (keywordDetection.hasCrisis) {
    return { level: "crisis", score: 1.0, shouldAlert: true };
  }
  
  // High risk: negative sentiment + high risk keywords
  if (keywordDetection.hasHighRisk && sentiment === "NEGATIVE") {
    return { level: "high", score: 0.8, shouldAlert: true };
  }
  
  // High risk: very negative sentiment (score > 0.85)
  if (sentiment === "NEGATIVE" && score > 0.85) {
    return { level: "high", score: 0.75, shouldAlert: true };
  }
  
  // Medium risk: negative sentiment or medium risk keywords
  if (sentiment === "NEGATIVE" || keywordDetection.hasMediumRisk) {
    return { level: "medium", score: 0.5, shouldAlert: false };
  }
  
  // Low risk: positive or neutral
  return { level: "low", score: 0.1, shouldAlert: false };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { journalText, journalId, userId } = await req.json();

    if (!journalText) {
      return new Response(
        JSON.stringify({ error: "Journal text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const HUGGINGFACE_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
    
    if (!HUGGINGFACE_API_KEY) {
      console.error("HUGGINGFACE_API_KEY not found in secrets");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // First, check for crisis keywords (fast, no API call needed)
    const keywordDetection = detectCrisisKeywords(journalText);
    
    // If crisis detected, return immediately with alert
    if (keywordDetection.hasCrisis) {
      return new Response(
        JSON.stringify({
          sentiment: "NEGATIVE",
          sentimentScore: 0.99,
          emotion: "distress",
          riskLevel: "crisis",
          riskScore: 1.0,
          shouldAlert: true,
          alertType: "CRISIS",
          message: "Crisis indicators detected. Immediate support recommended.",
          analyzedAt: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call HuggingFace Sentiment Analysis API
    // Using distilbert-base-uncased-finetuned-sst-2-english (fast & accurate)
    const sentimentResponse = await fetch(
      "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: journalText.slice(0, 512) }), // Limit to 512 chars
      }
    );

    if (!sentimentResponse.ok) {
      const errorText = await sentimentResponse.text();
      console.error("HuggingFace API error:", errorText);
      
      // Fallback to keyword-based analysis if API fails
      const riskLevel = calculateRiskLevel("NEUTRAL", 0.5, keywordDetection);
      return new Response(
        JSON.stringify({
          sentiment: "NEUTRAL",
          sentimentScore: 0.5,
          emotion: "unknown",
          riskLevel: riskLevel.level,
          riskScore: riskLevel.score,
          shouldAlert: riskLevel.shouldAlert,
          alertType: riskLevel.shouldAlert ? "HIGH_RISK" : null,
          message: "Analysis completed with fallback method",
          analyzedAt: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sentimentResult = await sentimentResponse.json();
    
    // HuggingFace returns array of [{label, score}] sorted by score
    // Example: [[{label: "NEGATIVE", score: 0.9}, {label: "POSITIVE", score: 0.1}]]
    const topSentiment = sentimentResult[0]?.[0] || sentimentResult[0];
    const sentiment = topSentiment?.label || "NEUTRAL";
    const sentimentScore = topSentiment?.score || 0.5;

    // Calculate risk level
    const riskLevel = calculateRiskLevel(sentiment, sentimentScore, keywordDetection);

    // Optional: Call emotion detection model for more detail
    let emotion = "neutral";
    try {
      const emotionResponse = await fetch(
        "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: journalText.slice(0, 512) }),
        }
      );
      
      if (emotionResponse.ok) {
        const emotionResult = await emotionResponse.json();
        emotion = emotionResult[0]?.[0]?.label || "neutral";
      }
    } catch (emotionError) {
      console.log("Emotion detection skipped:", emotionError);
    }

    const response = {
      sentiment,
      sentimentScore,
      emotion,
      riskLevel: riskLevel.level,
      riskScore: riskLevel.score,
      shouldAlert: riskLevel.shouldAlert,
      alertType: riskLevel.shouldAlert ? (riskLevel.level === "crisis" ? "CRISIS" : "HIGH_RISK") : null,
      message: riskLevel.shouldAlert 
        ? "Elevated risk detected. Healthcare provider will be notified."
        : "Journal analyzed successfully.",
      analyzedAt: new Date().toISOString(),
      journalId,
      userId
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-journal function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});