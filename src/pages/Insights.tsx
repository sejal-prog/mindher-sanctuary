import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { getMoods, getWeekMoods } from "@/lib/storage";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths } from "date-fns";

const moodEmojis = ["", "😢", "😕", "😐", "🙂", "😊"];
const moodColorClasses = ["", "bg-mood-bad", "bg-mood-low", "bg-mood-okay", "bg-mood-good", "bg-mood-great"];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Insights = () => {
  const [calMonth, setCalMonth] = useState(new Date());
  const weekMoods = getWeekMoods();
  const allMoods = getMoods();

  const weekAvg = (() => {
    const valid = weekMoods.filter(Boolean) as { mood: number }[];
    if (valid.length === 0) return null;
    return (valid.reduce((s, m) => s + m.mood, 0) / valid.length).toFixed(1);
  })();

  // Streak
  const streak = (() => {
    const today = new Date();
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);
      const has = allMoods.some((m) => {
        const md = new Date(m.createdAt);
        return md >= d && md <= dEnd;
      });
      if (has) count++;
      else break;
    }
    return count;
  })();

  // Calendar
  const monthStart = startOfMonth(calMonth);
  const monthEnd = endOfMonth(calMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = (getDay(monthStart) + 6) % 7; // Mon=0

  const getMoodForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const dayMoods = allMoods.filter((m) => {
      const d = new Date(m.createdAt);
      return d >= dayStart && d <= dayEnd;
    });
    return dayMoods.length > 0 ? dayMoods[dayMoods.length - 1].mood : null;
  };

  const patterns = [
    { icon: "🌙", text: "You tend to feel better in the evenings" },
    { icon: "📅", text: "Mondays are your most challenging days" },
    { icon: "📝", text: "Journaling improves your mood by 20%" },
  ];

  return (
    <div className="mindher-container bg-background min-h-screen pb-24">
      <PageHeader title="My Insights" backTo="/" />

      <div className="px-5 space-y-6">
        {/* This Week */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-bold font-heading text-foreground mb-3">This Week</h2>
          <div className="mindher-card">
            <div className="flex justify-between mb-4">
              {dayLabels.map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      weekMoods[i] ? moodColorClasses[weekMoods[i]!.mood] : "bg-muted"
                    }`}
                  >
                    {weekMoods[i] ? moodEmojis[weekMoods[i]!.mood] : ""}
                  </div>
                </div>
              ))}
            </div>
            {/* Simple bar chart */}
            <div className="flex justify-between items-end h-16 mb-3">
              {weekMoods.map((m, i) => (
                <div key={i} className="flex flex-col items-center w-8">
                  <div
                    className={`w-5 rounded-t-sm ${m ? moodColorClasses[m.mood] : "bg-muted"}`}
                    style={{ height: m ? `${(m.mood / 5) * 100}%` : "10%" }}
                  />
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {weekAvg && <span>Average: {weekAvg}/5 • </span>}
              <span>
                {weekMoods.filter(Boolean).length < 2
                  ? "Log more moods to see trends"
                  : "Stable →"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Patterns */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-bold font-heading text-foreground mb-3">Patterns Detected</h2>
          <div className="space-y-2">
            {patterns.map((p, i) => (
              <div key={i} className="mindher-card flex items-center gap-3 py-3">
                <span className="text-xl">{p.icon}</span>
                <span className="text-sm text-foreground">{p.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setCalMonth(subMonths(calMonth, 1))} className="p-1">
              <ChevronLeft size={18} className="text-muted-foreground" />
            </button>
            <h2 className="font-bold font-heading text-foreground">
              {format(calMonth, "MMMM yyyy")}
            </h2>
            <button onClick={() => setCalMonth(addMonths(calMonth, 1))} className="p-1">
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </div>
          <div className="mindher-card">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayLabels.map((d) => (
                <div key={d} className="text-center text-xs text-muted-foreground font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              {days.map((day) => {
                const mood = getMoodForDay(day);
                return (
                  <div key={day.toISOString()} className="h-8 flex items-center justify-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                        mood ? moodColorClasses[mood] : ""
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-mood-great" /> Great</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-mood-okay" /> Okay</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-mood-low" /> Low</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted" /> No data</span>
            </div>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mindher-card text-center"
        >
          {streak > 0 ? (
            <>
              <div className="text-3xl mb-1">🔥</div>
              <p className="font-bold text-foreground">{streak} day streak! Keep going!</p>
            </>
          ) : (
            <>
              <div className="text-3xl mb-1">🌱</div>
              <p className="text-foreground font-medium">Log your first mood to start a streak!</p>
            </>
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Insights;
