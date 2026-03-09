import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import {
  getUser, updateUserName,
  getConsent, saveConsent, type ConsentSettings,
  getSettings, saveSettings, type AppSettings,
  clearAllData, exportData,
} from "@/lib/storage";

const NAMES = ["Luna", "Rose", "Sage", "Ivy", "Pearl", "Willow", "Aurora", "Meadow", "Fern", "Dahlia"];

const SettingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [consent, setConsent] = useState(getConsent());
  const [settings, setSettings] = useState(getSettings());
  const [showNamePicker, setShowNamePicker] = useState(false);

  const toggleConsent = (key: keyof ConsentSettings) => {
    const updated = { ...consent, [key]: !consent[key] };
    setConsent(updated);
    saveConsent(updated);
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleClearData = () => {
    if (confirm("This will delete all your data and restart the app. Are you sure?")) {
      clearAllData();
      window.location.href = "/splash";
    }
  };

  const changeName = (name: string) => {
    updateUserName(name);
    setUser({ ...user, name });
    setShowNamePicker(false);
    toast(`Name changed to ${name} 💜`);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full relative transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-border"
      }`}
    >
      <div
        className={`w-5 h-5 bg-card rounded-full absolute top-1 transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="mindher-container bg-background min-h-screen pb-24">
      <PageHeader title="Settings" backTo="/" />

      <div className="px-5 space-y-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mindher-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-2xl">🌸</div>
            <div className="flex-1">
              <p className="font-bold text-foreground">{user.name}</p>
              <button onClick={() => setShowNamePicker(true)} className="text-sm text-primary font-medium">
                Change my name →
              </button>
            </div>
          </div>
        </motion.div>

        {/* Name Picker Modal */}
        {showNamePicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mindher-card">
            <p className="text-sm font-medium text-foreground mb-3">Choose your name:</p>
            <div className="flex flex-wrap gap-2">
              {NAMES.map((n) => (
                <button
                  key={n}
                  onClick={() => changeName(n)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    n === user.name ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Data & Privacy */}
        <div>
          <h2 className="font-bold font-heading text-foreground mb-3 text-sm">Data & Privacy</h2>
          <div className="mindher-card space-y-4">
            {[
              { key: "shareMoodData" as const, label: "Share mood data" },
              { key: "shareJournalSummaries" as const, label: "Share journal summaries" },
              { key: "crisisDetection" as const, label: "Crisis detection" },
              { key: "shareFullJournals" as const, label: "Share full journals" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.label}</span>
                <Toggle checked={consent[item.key]} onChange={() => toggleConsent(item.key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="font-bold font-heading text-foreground mb-3 text-sm">Notifications</h2>
          <div className="mindher-card space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Daily check-in reminder</span>
              <Toggle checked={settings.reminderEnabled} onChange={() => updateSettings({ reminderEnabled: !settings.reminderEnabled })} />
            </div>
            {settings.reminderEnabled && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reminder time</span>
                <input
                  type="time"
                  value={settings.reminderTime}
                  onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                  className="text-sm text-foreground bg-muted rounded-lg px-2 py-1"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Weekly insights</span>
              <Toggle checked={settings.weeklyInsights} onChange={() => updateSettings({ weeklyInsights: !settings.weeklyInsights })} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Mira's gentle nudges</span>
              <Toggle checked={settings.miraNudges} onChange={() => updateSettings({ miraNudges: !settings.miraNudges })} />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h2 className="font-bold font-heading text-foreground mb-3 text-sm">Appearance</h2>
          <div className="mindher-card">
            <div className="flex gap-3">
              {(["light", "auto", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateSettings({ theme: t })}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                    settings.theme === t ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h2 className="font-bold font-heading text-foreground mb-3 text-sm">Data Management</h2>
          <div className="mindher-card space-y-3">
            <button onClick={exportData} className="text-sm text-foreground w-full text-left">
              Export my data →
            </button>
            <div className="border-t border-border" />
            <button onClick={handleClearData} className="text-sm text-crisis w-full text-left">
              Clear all data →
            </button>
          </div>
        </div>

        {/* About */}
        <div>
          <h2 className="font-bold font-heading text-foreground mb-3 text-sm">About</h2>
          <div className="mindher-card space-y-3">
            <p className="text-sm text-foreground">About MindHer →</p>
            <div className="border-t border-border" />
            <p className="text-sm text-foreground">Privacy Policy →</p>
            <div className="border-t border-border" />
            <p className="text-sm text-foreground">Terms of Service →</p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">Version 1.0.0</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
