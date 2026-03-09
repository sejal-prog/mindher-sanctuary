import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { isOnboardingComplete } from "@/lib/storage";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isOnboardingComplete() ? "/" : "/onboarding", { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="mindher-container flex items-center justify-center min-h-screen bg-gradient-to-b from-primary/30 via-primary/10 to-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-7xl mb-6"
        >
          🌸
        </motion.div>
        <h1 className="text-4xl font-bold font-heading text-foreground mb-3">MindHer</h1>
        <p className="text-muted-foreground text-lg font-primary">Your safe space to breathe</p>
      </motion.div>
    </div>
  );
};

export default Splash;
