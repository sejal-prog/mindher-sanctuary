import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Settings, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import MoodSelector from "@/components/MoodSelector";
import { getUser, saveMood, getWeekMoods } from "@/lib/storage";

const quotes = [
  "You are stronger than you know",
  "It's okay to not be okay",
  "This feeling will pass",
  "You deserve kindness, especially from yourself",
  "One day at a time",
  "Your feelings are valid",
  "Be gentle with yourself today",
  "You are worthy of love and belonging",
];

const moodColors = ["", "bg-mood-bad", "bg-mood-low", "bg-mood-okay", "bg-mood-good", "bg-mood-great"];
const moodEmojis = ["", "😢", "😕", "😐", "🙂", "😊"];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Good morning, ${name} ☀️`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${name} 🌤️`;
  if (hour >= 17 && hour < 21) return `Good evening, ${name} 🌙`;
  return `Hey there, ${name} ✨`;
};

const Home = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const user = getUser();
  const weekMoods = getWeekMoods();
  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
    saveMood(mood);
    toast("Mood saved 💜");
  };

  const weekAvg = (() => {
    const valid = weekMoods.filter(Boolean) as { mood: number }[];
    if (valid.length === 0) return null;
    return valid.reduce((s, m) => s + m.mood, 0) / valid.length;
  })();

  const trend = (() => {
    const valid = weekMoods.filter(Boolean) as { mood: number }[];
    if (valid.length < 2) return "Stable →";
    const recent = valid.slice(-3);
    const earlier = valid.slice(0, Math.max(1, valid.length - 3));
    const recentAvg = recent.reduce((s, m) => s + m.mood, 0) / recent.length;
    const earlierAvg = earlier.reduce((s, m) => s + m.mood, 0) / earlier.length;
    if (recentAvg > earlierAvg + 0.3) return "Improving ↗️";
    if (recentAvg < earlierAvg - 0.3) return "Needs attention 💜";
    return "Stable →";
  })();

  const actionCards = [
    { icon: "📝", title: "Write in Journal", subtitle: "Express your thoughts freely", path: "/journal", variant: "default" },
    { icon: "💬", title: "Talk to Mira", subtitle: "Your AI companion", path: "/chat", variant: "default" },
    { icon: "🆘", title: "I Need Help Now", subtitle: "Crisis resources & support", path: "/crisis", variant: "crisis" },
  ];

  return (
    <div className="mindher-container bg-background min-h-screen pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <button className="p-2 rounded-full hover:bg-muted">
          <Menu size={22} className="text-foreground" />
        </button>
        <button onClick={() => navigate("/settings")} className="p-2 rounded-full hover:bg-muted">
          <Settings size={22} className="text-foreground" />
        </button>
      </header>

      <div className="px-5 space-y-6">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-heading text-foreground">{getGreeting(user.name)}</h1>
          <p className="text-muted-foreground mt-1">How are you feeling right now?</p>
        </motion.div>

        {/* Mood Check-in */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <MoodSelector selected={selectedMood} onSelect={handleMoodSelect} />
        </motion.div>

        {/* Action Cards */}
        <div className="space-y-3">
          {actionCards.map((card, i) => (
            <motion.button
              key={card.path}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => navigate(card.path)}
              className={`mindher-card w-full flex items-center gap-4 text-left ${
                card.variant === "crisis" ? "border border-crisis/20 bg-accent-pink/30" : ""
              }`}
            >
              <span className="text-3xl">{card.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.subtitle}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </motion.button>
          ))}
        </div>

        {/* Weekly Mood */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold font-heading text-foreground">Your Week</h2>
            <button onClick={() => navigate("/insights")} className="text-sm text-primary font-medium">
              See more
            </button>
          </div>
          <div className="flex justify-between mb-2">
            {dayLabels.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">{day}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    weekMoods[i] ? moodColors[weekMoods[i]!.mood] : "bg-muted"
                  }`}
                >
                  {weekMoods[i] ? moodEmojis[weekMoods[i]!.mood] : ""}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Trend: {trend}
          </p>
        </motion.div>

        {/* Daily Quote */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mindher-card bg-gradient-to-br from-primary/10 to-accent-pink/20 text-center py-6"
        >
          <p className="text-foreground font-medium italic">"{dailyQuote}"</p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
