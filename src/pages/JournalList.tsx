import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { getJournals } from "@/lib/storage";
import { format, isToday, isYesterday } from "date-fns";

const moodEmojis = ["", "😢", "😕", "😐", "🙂", "😊"];

const JournalList = () => {
  const navigate = useNavigate();
  const journals = getJournals();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
    if (isYesterday(d)) return `Yesterday, ${format(d, "h:mm a")}`;
    return format(d, "MMM d, h:mm a");
  };

  // Group by month
  const grouped = journals.reduce<Record<string, typeof journals>>((acc, entry) => {
    const month = format(new Date(entry.createdAt), "MMMM yyyy");
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry);
    return acc;
  }, {});

  return (
    <div className="mindher-container bg-background min-h-screen pb-24">
      <PageHeader
        title="My Journal"
        backTo="/"
        rightAction={
          <button
            onClick={() => navigate("/journal/new")}
            className="p-2 -mr-2 rounded-full hover:bg-muted"
          >
            <Plus size={24} className="text-primary" />
          </button>
        }
      />

      <div className="px-5">
        {journals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-6">📝</div>
            <p className="text-foreground font-medium mb-2">Your journal is empty</p>
            <p className="text-muted-foreground text-sm mb-6">
              Start writing to capture your thoughts 💜
            </p>
            <button onClick={() => navigate("/journal/new")} className="mindher-btn-primary">
              Write First Entry
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([month, entries]) => (
              <div key={month}>
                <h3 className="text-sm font-bold font-heading text-muted-foreground mb-3">{month}</h3>
                <div className="space-y-3">
                  {entries.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="mindher-card cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</span>
                        <span className="text-xl">{moodEmojis[entry.mood]}</span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">{entry.content}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default JournalList;
