import { v4Fallback } from "./utils";

// Simple UUID fallback
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const NAMES = ["Luna", "Rose", "Sage", "Ivy", "Pearl", "Willow", "Aurora", "Meadow", "Fern", "Dahlia"];

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
}

export interface ConsentSettings {
  shareMoodData: boolean;
  shareJournalSummaries: boolean;
  crisisDetection: boolean;
  shareFullJournals: boolean;
}

export interface JournalEntry {
  id: string;
  content: string;
  mood: number;
  createdAt: string;
  voiceRecorded: boolean;
}

export interface MoodEntry {
  id: string;
  mood: number;
  createdAt: string;
}

export interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

export interface AppSettings {
  theme: "light" | "auto" | "dark";
  reminderTime: string;
  reminderEnabled: boolean;
  weeklyInsights: boolean;
  miraNudges: boolean;
}

// Onboarding
export const isOnboardingComplete = (): boolean =>
  localStorage.getItem("mindher_onboarding_complete") === "true";

export const completeOnboarding = () =>
  localStorage.setItem("mindher_onboarding_complete", "true");

// User
export const getUser = (): UserProfile => {
  const stored = localStorage.getItem("mindher_user");
  if (stored) return JSON.parse(stored);
  const user: UserProfile = {
    id: generateId(),
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("mindher_user", JSON.stringify(user));
  return user;
};

export const updateUserName = (name: string) => {
  const user = getUser();
  user.name = name;
  localStorage.setItem("mindher_user", JSON.stringify(user));
};

// Consent
export const getConsent = (): ConsentSettings => {
  const stored = localStorage.getItem("mindher_consent");
  if (stored) return JSON.parse(stored);
  return { shareMoodData: true, shareJournalSummaries: true, crisisDetection: true, shareFullJournals: false };
};

export const saveConsent = (consent: ConsentSettings) =>
  localStorage.setItem("mindher_consent", JSON.stringify(consent));

// Journals
export const getJournals = (): JournalEntry[] => {
  const stored = localStorage.getItem("mindher_journals");
  return stored ? JSON.parse(stored) : [];
};

export const saveJournal = (entry: Omit<JournalEntry, "id">) => {
  const journals = getJournals();
  journals.unshift({ ...entry, id: generateId() });
  localStorage.setItem("mindher_journals", JSON.stringify(journals));
};

// Moods
export const getMoods = (): MoodEntry[] => {
  const stored = localStorage.getItem("mindher_moods");
  return stored ? JSON.parse(stored) : [];
};

export const saveMood = (mood: number) => {
  const moods = getMoods();
  moods.push({ id: generateId(), mood, createdAt: new Date().toISOString() });
  localStorage.setItem("mindher_moods", JSON.stringify(moods));
};

// Chat
export const getChats = (): ChatMessage[] => {
  const stored = localStorage.getItem("mindher_chats");
  return stored ? JSON.parse(stored) : [];
};

export const saveChat = (messages: ChatMessage[]) =>
  localStorage.setItem("mindher_chats", JSON.stringify(messages));

// Settings
export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem("mindher_settings");
  if (stored) return JSON.parse(stored);
  return { theme: "auto", reminderTime: "20:00", reminderEnabled: true, weeklyInsights: true, miraNudges: true };
};

export const saveSettings = (settings: AppSettings) =>
  localStorage.setItem("mindher_settings", JSON.stringify(settings));

// Clear all
export const clearAllData = () => {
  const keys = ["mindher_onboarding_complete", "mindher_user", "mindher_consent", "mindher_journals", "mindher_moods", "mindher_chats", "mindher_settings"];
  keys.forEach((k) => localStorage.removeItem(k));
};

// Export data
export const exportData = () => {
  const data = {
    user: localStorage.getItem("mindher_user"),
    consent: localStorage.getItem("mindher_consent"),
    journals: localStorage.getItem("mindher_journals"),
    moods: localStorage.getItem("mindher_moods"),
    chats: localStorage.getItem("mindher_chats"),
    settings: localStorage.getItem("mindher_settings"),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mindher_data.json";
  a.click();
  URL.revokeObjectURL(url);
};

// Helper: get moods for a specific week
export const getWeekMoods = (): (MoodEntry | null)[] => {
  const moods = getMoods();
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const weekMoods: (MoodEntry | null)[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const dayMoods = moods.filter((m) => {
      const d = new Date(m.createdAt);
      return d >= day && d <= dayEnd;
    });

    if (dayMoods.length > 0) {
      // Use last mood of the day
      weekMoods.push(dayMoods[dayMoods.length - 1]);
    } else {
      weekMoods.push(null);
    }
  }
  return weekMoods;
};
