// src/hooks/useSentimentAnalysis.ts
// React hook for sentiment analysis with loading states and error handling

import { useState, useCallback } from "react";
import { 
  analyzeJournal, 
  SentimentResult, 
  AnalyzeJournalParams 
} from "@/services/sentimentAnalysis";
import { useToast } from "@/hooks/use-toast";

interface UseSentimentAnalysisReturn {
  analyze: (params: AnalyzeJournalParams) => Promise<SentimentResult | null>;
  result: SentimentResult | null;
  isAnalyzing: boolean;
  error: string | null;
  reset: () => void;
}

export function useSentimentAnalysis(): UseSentimentAnalysisReturn {
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyze = useCallback(async (params: AnalyzeJournalParams): Promise<SentimentResult | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const analysisResult = await analyzeJournal(params);
      setResult(analysisResult);

      // Show toast based on risk level
      if (analysisResult.riskLevel === "crisis") {
        toast({
          title: "🔴 We're Here For You",
          description: "We noticed you might be going through a really tough time. Help is available.",
          variant: "destructive",
          duration: 10000,
        });
      } else if (analysisResult.riskLevel === "high") {
        toast({
          title: "🟠 Checking In",
          description: "It sounds like things are difficult right now. Remember, you're not alone.",
          duration: 7000,
        });
      } else if (analysisResult.riskLevel === "medium") {
        toast({
          title: "🟡 Journal Saved",
          description: "Thank you for sharing. Writing helps process emotions.",
          duration: 5000,
        });
      } else {
        toast({
          title: "🟢 Journal Saved",
          description: "Great job taking time for self-reflection!",
          duration: 3000,
        });
      }

      return analysisResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze journal";
      setError(errorMessage);
      toast({
        title: "Analysis Error",
        description: "Couldn't analyze your entry, but it's been saved.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    analyze,
    result,
    isAnalyzing,
    error,
    reset,
  };
}