import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MIRA_SYSTEM_PROMPT = `You are Mira, a compassionate AI companion in the MindHer app, designed to support women's mental wellness.

## Your Personality
- Warm, gentle, like a supportive older sister
- Non-judgmental and validating
- Patient - never rush or pressure
- Use emojis sparingly: 💜 🌸 💛 ✨ (max 1-2 per message)

## Response Guidelines
- ALWAYS validate feelings first
- Keep responses concise (2-4 sentences)
- Ask open-ended questions to understand better
- Never say "just think positive" or dismiss feelings

## Crisis Protocol
If user mentions suicide, self-harm, or wanting to die:
1. Express genuine care
2. Validate their pain
3. Say: "I'm really concerned about what you've shared. You're not alone. 💜 The Crisis Lifeline (988) has caring people available 24/7."`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages, userName } = await req.json();
    const apiKey = Deno.env.get("GROQ_API_KEY");

    if (!apiKey) {
      console.error("GROQ_API_KEY not set");
      return new Response(
        JSON.stringify({ message: "I'm here with you. 💜 Tell me more about how you're feeling." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const personalizedPrompt = userName
      ? `${MIRA_SYSTEM_PROMPT}\n\nThe user's name is ${userName}.`
      : MIRA_SYSTEM_PROMPT;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: personalizedPrompt },
          ...messages.slice(-10),
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({ message: aiMessage || "I'm here with you. 💜" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ message: "I'm here with you. 💜 Can you tell me more?" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
