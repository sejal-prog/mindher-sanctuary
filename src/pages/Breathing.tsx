import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type Phase = "inhale" | "hold" | "exhale";
const INHALE = 4;
const HOLD = 7;
const EXHALE = 8;
const TOTAL_ROUNDS = 5;

const Breathing = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("inhale");
  const [timer, setTimer] = useState(INHALE);
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<number>();

  useEffect(() => {
    if (done) return;
    intervalRef.current = window.setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setPhase((p) => {
            if (p === "inhale") {
              setTimer(HOLD);
              return "hold";
            }
            if (p === "hold") {
              setTimer(EXHALE);
              return "exhale";
            }
            // exhale done
            setRound((r) => {
              if (r >= TOTAL_ROUNDS) {
                setDone(true);
                return r;
              }
              return r + 1;
            });
            setTimer(INHALE);
            return "inhale";
          });
          return t;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [done]);

  const getPhaseText = () => {
    if (phase === "inhale") return "Breathe In";
    if (phase === "hold") return "Hold";
    return "Breathe Out";
  };

  const circleScale = phase === "inhale" ? 1.3 : phase === "hold" ? 1.3 : 0.7;
  const phaseDuration = phase === "inhale" ? INHALE : phase === "hold" ? HOLD : EXHALE;

  if (done) {
    return (
      <div className="mindher-container min-h-screen bg-gradient-to-b from-primary/20 to-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center px-8">
          <div className="text-6xl mb-6">💜</div>
          <h1 className="text-2xl font-bold font-heading text-foreground mb-3">Well done</h1>
          <p className="text-muted-foreground mb-8">You completed the breathing exercise. Take a moment to notice how you feel.</p>
          <button onClick={() => navigate(-1)} className="mindher-btn-primary">Return</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mindher-container min-h-screen bg-gradient-to-b from-primary/20 to-background flex flex-col items-center justify-center relative">
      <button onClick={() => navigate(-1)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50">
        <X size={24} className="text-foreground" />
      </button>

      <div className="text-center">
        <motion.div
          animate={{ scale: circleScale }}
          transition={{ duration: phaseDuration, ease: "easeInOut" }}
          className="w-48 h-48 rounded-full bg-primary/25 flex items-center justify-center mx-auto mb-8 border-4 border-primary/30"
        >
          <div className="text-center">
            <p className="text-lg font-bold font-heading text-foreground">{getPhaseText()}</p>
            <p className="text-3xl font-bold text-primary mt-1">{timer}</p>
          </div>
        </motion.div>

        <p className="text-sm text-muted-foreground mb-2">Round {round} of {TOTAL_ROUNDS}</p>
        <p className="text-xs text-muted-foreground">Inhale (4s) → Hold (7s) → Exhale (8s)</p>

        <button onClick={() => navigate(-1)} className="mindher-btn-secondary mt-12">
          End Exercise
        </button>
      </div>
    </div>
  );
};

export default Breathing;
