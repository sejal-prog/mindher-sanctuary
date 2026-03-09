import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Mic, MicOff, Lock, Loader2, AlertTriangle, Heart } from "lucide-react";
import { toast } from "sonner";
import MoodSelector from "@/components/MoodSelector";
import { saveJournal, getConsent } from "@/lib/storage";
import { format } from "date-fns";
import { analyzeJournal, getRiskLevelEmoji, formatEmotion } from "@/services/sentimentAnalysis";
import type { SentimentResult } from "@/services/sentimentAnalysis";

const prompts = [
  "What made you smile today?",
  "What's worrying you?",
  "How do you feel right now?",
  "What do you need today?",
  "What are you grateful for?",
];

// Crisis resources component
const CrisisResources = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4"
  >
    <div className="flex items-center gap-2 mb-3">
      <Heart className="h-5 w-5 text-red-500" />
      <span className="font-semibold text-red-700">You Matter. Help is Available.</span>
    </div>
    <div className="space-y-2 text-sm">
      <p className="text-red-700">If you're in crisis, please reach out:</p>
      <ul className="space-y-1 text-red-600">
        <li>🇺🇸 National Suicide Prevention: <strong>988</strong></li>
        <li>🇮🇳 iCall: <strong>9152987821</strong></li>
        <li>🇩🇪 Telefonseelsorge: <strong>0800 111 0 111</strong></li>
        <li>🌍 International: <strong>findahelpline.com</strong></li>
      </ul>
    </div>
  </motion.div>
);

const JournalNew = () => {
  const navigate = useNavigate();
  const [mood, setMood] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SentimentResult | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number>();
  const consent = getConsent();
  const now = new Date();

  const handleSave = async () => {
    if (!content.trim() && !mood) {
      toast("Please write something or select a mood");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Analyze the journal entry if there's content
      let analysis: SentimentResult | null = null;
      
      if (content.trim()) {
        analysis = await analyzeJournal({ journalText: content.trim() });
        setAnalysisResult(analysis);
      }

      // Save the journal with sentiment data
      saveJournal({
        content: content.trim(),
        mood: mood || 3,
        createdAt: new Date().toISOString(),
        voiceRecorded: false,
        // Add sentiment analysis data
      });

      // Show appropriate toast based on risk level
      if (analysis?.riskLevel === "crisis") {
        toast.error("We're here for you 💜", {
          description: "We noticed you might be going through a tough time. Help is available.",
          duration: 10000,
        });
      } else if (analysis?.riskLevel === "high") {
        toast.warning("Checking in 💜", {
          description: "It sounds like things are difficult. You're not alone.",
          duration: 7000,
        });
      } else if (analysis?.riskLevel === "medium") {
        toast.success("Journal saved 💜", {
          description: "Thank you for sharing. Writing helps process emotions.",
        });
      } else {
        toast.success("Journal saved 💜", {
          description: "Great job taking time for self-reflection!",
        });
      }

      // If crisis, stay on page to show resources. Otherwise navigate.
      if (analysis?.riskLevel !== "crisis") {
        setTimeout(() => navigate("/journal"), 1500);
      }

    } catch (error) {
      console.error("Error saving journal:", error);
      // Still save locally even if analysis fails
      saveJournal({
        content: content.trim(),
        mood: mood || 3,
        createdAt: new Date().toISOString(),
        voiceRecorded: false,
      });
      toast.success("Journal saved 💜", {
        description: "Entry saved (analysis unavailable)",
      });
      navigate("/journal");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addPrompt = (prompt: string) => {
    setContent((prev) => (prev ? prev + "\n\n" + prompt + "\n" : prompt + "\n"));
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast("Speech recognition not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e: any) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setContent((prev) => {
        const base = prev.split("\n\n🎤 ")[0];
        return base + (base ? "\n\n" : "") + "🎤 " + transcript;
      });
    };
    recognition.onerror = () => {
      setIsRecording(false);
      toast("Recording error occurred");
    };
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => setRecordingTime((t) => t + 1), 1000);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => () => { recognitionRef.current?.stop(); if (timerRef.current) clearInterval(timerRef.current); }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="mindher-container bg-background min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 bg-background/95 backdrop-blur-sm z-40">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted" disabled={isAnalyzing}>
          <X size={24} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold font-heading text-foreground">New Entry</h1>
        <button 
          onClick={handleSave} 
          className="text-primary font-semibold text-sm disabled:opacity-50 flex items-center gap-1"
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            "Save"
          )}
        </button>
      </header>

      <div className="px-5 space-y-6 pb-8">
        {/* Date */}
        <div className="text-center">
          <p className="text-foreground font-medium">{format(now, "EEEE, MMMM d, yyyy")}</p>
          <p className="text-muted-foreground text-sm">{format(now, "h:mm a")}</p>
        </div>

        {/* Mood */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">How are you feeling?</p>
          <MoodSelector selected={mood} onSelect={setMood} size="sm" />
        </div>

        {/* Prompts */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => addPrompt(p)}
              className="flex-shrink-0 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium whitespace-nowrap"
              disabled={isAnalyzing}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Text area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write what's on your mind... This is your safe space. No one will judge you."
          className="mindher-input min-h-[200px] resize-none text-foreground"
          style={{ fontFamily: "var(--font-primary)" }}
          disabled={isAnalyzing}
        />

        {/* Voice */}
        {isRecording ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-crisis animate-recording-pulse" />
              <span className="text-sm text-crisis font-medium">REC {formatTime(recordingTime)}</span>
            </div>
            <p className="text-sm text-muted-foreground">Listening... speak freely</p>
            <button onClick={stopRecording} className="mindher-btn-secondary inline-flex items-center gap-2">
              <MicOff size={16} /> Stop Recording
            </button>
          </motion.div>
        ) : (
          <button
            onClick={startRecording}
            className="mindher-btn-secondary w-full inline-flex items-center justify-center gap-2"
            disabled={isAnalyzing}
          >
            <Mic size={16} /> Tap to speak instead
          </button>
        )}

        {/* Analysis Result - Show after save if there's a result */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/50 rounded-xl p-4 space-y-2"
          >
            <p className="text-sm font-medium text-foreground">Mood Insights</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Detected mood:</span>
              <span>{getRiskLevelEmoji(analysisResult.riskLevel)} {formatEmotion(analysisResult.emotion)}</span>
            </div>
            {analysisResult.shouldAlert && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 mt-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-amber-700 text-xs">
                  A healthcare provider will check in with you 💜
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Crisis Resources - Show when crisis detected */}
        {analysisResult?.riskLevel === "crisis" && <CrisisResources />}

        {/* Privacy */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock size={12} />
          <span>
            {consent.shareJournalSummaries ? "Shared with your care team" : "Private — only visible to you"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JournalNew;