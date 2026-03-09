const empathetic = [
  "That sounds really difficult. I'm here with you. Would you like to tell me more about what's been weighing on you? 💜",
  "I hear you, and your feelings are completely valid. You don't have to face this alone. 🌸",
  "It takes courage to share how you're feeling. I'm proud of you for opening up. What would help you feel a little better right now? 💛",
  "I'm sorry you're going through this. Remember, it's okay to not be okay. Would you like to try a calming exercise together? 💜",
  "Your pain is real and it matters. I'm right here, listening without judgment. Take your time. 🌸",
];

const celebratory = [
  "I'm so glad to hear that! 🌸 What's been bringing you joy lately?",
  "That's wonderful! You deserve every bit of happiness. Tell me more! ✨",
  "Hearing this makes me so happy for you! What made today special? 💜",
  "You're glowing! Keep embracing these beautiful moments. 🌸",
];

const crisisResponse = "I can hear you're in a lot of pain right now, and I want you to know that you matter deeply. Please reach out to the Crisis Lifeline at 988 or text HOME to 741741. You can also tap the Crisis Support button below. You are not alone. 💜🆘";

const followUp = [
  "Thank you for sharing that with me. Your feelings are valid. Is there anything specific you'd like to talk about? 💛",
  "I appreciate you trusting me with this. Would you like to explore what you're feeling a bit more? 🌸",
  "That's really interesting. How does that make you feel? 💜",
  "I'm here for you. Would you like to talk more about this, or shall we try something to help you feel better? 🌸",
  "Thank you for being so open. What would be most helpful for you right now? 💛",
];

const ventResponses = [
  "Go ahead, I'm all ears. Let it all out — no judgment here. 💜",
  "This is your safe space. Say whatever you need to say. I'm listening. 🌸",
];

const exerciseResponses = [
  "Great idea! Let's try a grounding exercise. Name 5 things you can see right now. Take your time. 🌿",
  "How about we start with some deep breathing? Try breathing in for 4 counts, hold for 7, and exhale for 8. I'll wait. 🫁💜",
];

const chatResponses = [
  "I'd love that! Tell me about your day — anything at all. 🌸",
  "I'm here! What's been on your mind lately? 💜",
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const getAIResponse = (userMessage: string): string => {
  const lower = userMessage.toLowerCase();

  // Crisis detection
  if (
    lower.includes("hurt myself") ||
    lower.includes("suicide") ||
    lower.includes("kill myself") ||
    lower.includes("die") ||
    lower.includes("end it") ||
    lower.includes("self harm")
  ) {
    return crisisResponse;
  }

  // Sad/negative
  if (
    lower.includes("sad") ||
    lower.includes("depressed") ||
    lower.includes("lonely") ||
    lower.includes("anxious") ||
    lower.includes("worried") ||
    lower.includes("stressed") ||
    lower.includes("scared") ||
    lower.includes("hopeless") ||
    lower.includes("overwhelmed") ||
    lower.includes("crying")
  ) {
    return pickRandom(empathetic);
  }

  // Happy/positive
  if (
    lower.includes("happy") ||
    lower.includes("good") ||
    lower.includes("better") ||
    lower.includes("excited") ||
    lower.includes("great") ||
    lower.includes("amazing") ||
    lower.includes("wonderful")
  ) {
    return pickRandom(celebratory);
  }

  // Vent
  if (lower.includes("vent") || lower.includes("rant") || lower.includes("let it out")) {
    return pickRandom(ventResponses);
  }

  // Exercise
  if (lower.includes("exercise") || lower.includes("breathing") || lower.includes("calm")) {
    return pickRandom(exerciseResponses);
  }

  // Chat
  if (lower.includes("chat") || lower.includes("talk") || lower.includes("just want")) {
    return pickRandom(chatResponses);
  }

  return pickRandom(followUp);
};

export const getGreeting = (isFirstTime: boolean, recentMoodBad: boolean): string => {
  if (isFirstTime) {
    return "Hi there! I'm Mira, your companion here at MindHer. I'm so glad you're here. How are you feeling today? 🌸";
  }
  if (recentMoodBad) {
    return "I noticed you've been having a tough time lately. I'm here if you want to talk about it. 💛";
  }
  return "Welcome back! I've been thinking about you. How have you been? 💜";
};
