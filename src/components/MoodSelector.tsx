import { motion } from "framer-motion";

interface MoodSelectorProps {
  selected: number | null;
  onSelect: (mood: number) => void;
  size?: "sm" | "md";
}

const moods = [
  { emoji: "😢", label: "Awful", value: 1 },
  { emoji: "😕", label: "Bad", value: 2 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "🙂", label: "Good", value: 4 },
  { emoji: "😊", label: "Great", value: 5 },
];

const MoodSelector = ({ selected, onSelect, size = "md" }: MoodSelectorProps) => {
  const emojiSize = size === "sm" ? "text-2xl" : "text-[40px]";
  const btnSize = size === "sm" ? "w-12 h-12" : "w-14 h-14";

  return (
    <div className="flex justify-between gap-2">
      {moods.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onSelect(mood.value)}
          className="flex flex-col items-center gap-1"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            animate={selected === mood.value ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`${btnSize} rounded-full flex items-center justify-center transition-colors duration-200 ${
              selected === mood.value ? "bg-primary/20" : "bg-muted"
            }`}
          >
            <span className={emojiSize}>{mood.emoji}</span>
          </motion.div>
          <span className="text-xs text-muted-foreground font-medium">{mood.label}</span>
        </button>
      ))}
    </div>
  );
};

export default MoodSelector;
