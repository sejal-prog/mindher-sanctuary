import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { completeOnboarding, saveConsent, type ConsentSettings } from "@/lib/storage";

const slides = [
  {
    emoji: "🌸",
    title: "Welcome to MindHer",
    subtitle: "A safe space where you're heard, never judged, and never alone.",
    buttonText: "Begin Your Journey",
  },
  {
    emoji: "🛡️💜",
    title: "Your Private Sanctuary",
    subtitle: "Express yourself freely here. Write, speak, or just breathe.",
    bullets: [
      { icon: "📝", text: "Write without fear of judgment" },
      { icon: "💬", text: "Talk to Mira, your AI companion" },
      { icon: "📊", text: "Track your emotional journey" },
    ],
    buttonText: "Next",
  },
  {
    emoji: "🤝",
    title: "Someone's Watching Over You",
    subtitle: "With your permission, caring professionals monitor your wellbeing. You're never truly alone.",
    bullets: [
      { icon: "👩‍⚕️", text: "Licensed counselors available" },
      { icon: "🔔", text: "AI detects when you need support" },
      { icon: "🆘", text: "Help is always one tap away" },
    ],
    buttonText: "Next",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState<ConsentSettings>({
    shareMoodData: true,
    shareJournalSummaries: true,
    crisisDetection: true,
    shareFullJournals: false,
  });

  const isConsentStep = step === 3;
  const totalSteps = 4;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleFinish = () => {
    saveConsent(consent);
    completeOnboarding();
    navigate("/", { replace: true });
  };

  const handleSkip = () => setStep(3);

  const toggleConsent = (key: keyof ConsentSettings) => {
    setConsent((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const consentItems = [
    { key: "shareMoodData" as const, label: "Share mood patterns with care team" },
    { key: "crisisDetection" as const, label: "Allow AI to detect crisis situations" },
    { key: "shareJournalSummaries" as const, label: "Share journal summaries" },
    { key: "shareFullJournals" as const, label: "Share full journal entries" },
  ];

  return (
    <div className="mindher-container flex flex-col min-h-screen bg-background px-6 py-8">
      {!isConsentStep && step < 3 && (
        <div className="flex justify-end">
          <button onClick={handleSkip} className="text-muted-foreground text-sm font-medium">
            Skip
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!isConsentStep ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="text-center w-full"
            >
              <div className="text-6xl mb-8">{slides[step].emoji}</div>
              <h2 className="text-2xl font-bold font-heading text-foreground mb-4">{slides[step].title}</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">{slides[step].subtitle}</p>
              {slides[step].bullets && (
                <div className="text-left space-y-4 mb-8 px-4">
                  {slides[step].bullets!.map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xl">{b.icon}</span>
                      <span className="text-foreground">{b.text}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={handleNext} className="mindher-btn-primary w-full">
                {slides[step].buttonText}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="consent"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="text-center mb-8">
                <div className="text-6xl mb-6">✓</div>
                <h2 className="text-2xl font-bold font-heading text-foreground mb-4">Your Data, Your Choice</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Choose what you're comfortable sharing with your care team.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {consentItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-card rounded-2xl"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <span className="text-foreground text-sm font-medium pr-4">{item.label}</span>
                    <button
                      onClick={() => toggleConsent(item.key)}
                      className={`w-12 h-7 rounded-full relative transition-colors duration-200 ${
                        consent[item.key] ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-card rounded-full absolute top-1 transition-transform duration-200 ${
                          consent[item.key] ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center mb-6">
                You can change these anytime in Settings
              </p>

              <button onClick={handleFinish} className="mindher-btn-primary w-full">
                I'm Ready
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              i === step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
