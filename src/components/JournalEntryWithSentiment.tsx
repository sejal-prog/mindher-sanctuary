// src/components/JournalEntryWithSentiment.tsx
// Example: How to integrate sentiment analysis into your Journal component

import { useState } from "react";
import { useSentimentAnalysis } from "@/hooks/useSentimentAnalysis";
import { 
  getRiskLevelColor, 
  getRiskLevelEmoji, 
  getSentimentEmoji,
  formatEmotion 
} from "@/services/sentimentAnalysis";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, AlertTriangle, Heart } from "lucide-react";

// Crisis resources component
const CrisisResources = () => (
  <Card className="border-red-300 bg-red-50 mt-4">
    <CardContent className="pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="h-5 w-5 text-red-500" />
        <span className="font-semibold text-red-700">You Matter. Help is Available.</span>
      </div>
      <div className="space-y-2 text-sm">
        <p className="text-red-700">
          If you're in crisis, please reach out:
        </p>
        <ul className="space-y-1 text-red-600">
          <li>🇺🇸 National Suicide Prevention: <strong>988</strong></li>
          <li>🇮🇳 iCall: <strong>9152987821</strong></li>
          <li>🇩🇪 Telefonseelsorge: <strong>0800 111 0 111</strong></li>
          <li>🌍 International: <strong>findahelpline.com</strong></li>
        </ul>
      </div>
    </CardContent>
  </Card>
);

export function JournalEntryWithSentiment() {
  const [journalText, setJournalText] = useState("");
  const { analyze, result, isAnalyzing, error } = useSentimentAnalysis();

  const handleSaveJournal = async () => {
    if (!journalText.trim()) return;

    // Analyze the journal entry
    const analysisResult = await analyze({
      journalText,
      // Add journalId and userId if you have them
      // journalId: "...",
      // userId: "...",
    });

    if (analysisResult) {
      // TODO: Save to your database with the sentiment data
      console.log("Journal analyzed:", analysisResult);
      
      // Clear the input after successful save
      // setJournalText("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Journal Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 How are you feeling today?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Write your thoughts here... This is your safe space. 💜"
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            className="min-h-[150px] resize-none"
            disabled={isAnalyzing}
          />
          
          <Button 
            onClick={handleSaveJournal} 
            disabled={isAnalyzing || !journalText.trim()}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Save Journal Entry
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mood Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Sentiment & Emotion */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Mood Detected:</span>
              <span className="text-lg">
                {getSentimentEmoji(result.sentiment)} {formatEmotion(result.emotion)}
              </span>
            </div>

            {/* Risk Level */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Wellness Check:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(result.riskLevel)}`}>
                {getRiskLevelEmoji(result.riskLevel)} {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)}
              </span>
            </div>

            {/* Alert Warning */}
            {result.shouldAlert && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-amber-700 text-sm">
                  A healthcare provider has been notified to check in with you. 💜
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Crisis Resources - Show when crisis detected */}
      {result?.riskLevel === "crisis" && <CrisisResources />}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-red-600 text-sm">
              ⚠️ {error} - Your journal was saved but analysis couldn't complete.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default JournalEntryWithSentiment;