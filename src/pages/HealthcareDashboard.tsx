import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Activity,
  Users,
  CheckCircle,
  Clock,
  LogOut,
  Filter,
  TrendingUp,
  Heart,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import HealthcareLogin from "./HealthcareLogin";

// Mock data for prototype - in production, fetch from Supabase
const generateMockAlerts = () => [
  {
    id: "1",
    userId: "MH-7829",
    content: "I feel so hopeless today. Nobody understands what I'm going through...",
    riskLevel: "high",
    emotion: "sadness",
    sentiment: "NEGATIVE",
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    reviewed: false,
  },
  {
    id: "2",
    userId: "MH-4156",
    content: "I can't stop crying. Everything feels so overwhelming.",
    riskLevel: "high",
    emotion: "sadness",
    sentiment: "NEGATIVE",
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    reviewed: false,
  },
  {
    id: "3",
    userId: "MH-9283",
    content: "Feeling anxious about tomorrow. Can't sleep well.",
    riskLevel: "medium",
    emotion: "fear",
    sentiment: "NEGATIVE",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    reviewed: true,
  },
  {
    id: "4",
    userId: "MH-5047",
    content: "Work stress is getting to me. Need to take a break.",
    riskLevel: "medium",
    emotion: "anger",
    sentiment: "NEGATIVE",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    reviewed: false,
  },
  {
    id: "5",
    userId: "MH-3621",
    content: "Had a rough day but journaling helps me process.",
    riskLevel: "low",
    emotion: "neutral",
    sentiment: "NEUTRAL",
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    reviewed: true,
  },
  {
    id: "6",
    userId: "MH-8194",
    content: "Grateful for small moments of peace today.",
    riskLevel: "low",
    emotion: "joy",
    sentiment: "POSITIVE",
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    reviewed: true,
  },
];

const mockTrendData = [
  { day: "Mon", crisis: 0, high: 2, medium: 5, low: 12 },
  { day: "Tue", crisis: 1, high: 3, medium: 4, low: 15 },
  { day: "Wed", crisis: 0, high: 1, medium: 6, low: 18 },
  { day: "Thu", crisis: 0, high: 4, medium: 3, low: 14 },
  { day: "Fri", crisis: 1, high: 2, medium: 7, low: 20 },
  { day: "Sat", crisis: 0, high: 1, medium: 4, low: 22 },
  { day: "Sun", crisis: 0, high: 2, medium: 5, low: 19 },
];

const mockMoodDistribution = [
  { emotion: "Joy", count: 45, color: "#22c55e" },
  { emotion: "Neutral", count: 32, color: "#94a3b8" },
  { emotion: "Sadness", count: 18, color: "#3b82f6" },
  { emotion: "Anxiety", count: 15, color: "#f59e0b" },
  { emotion: "Anger", count: 8, color: "#ef4444" },
];

type RiskFilter = "all" | "crisis" | "high" | "medium" | "low";

const HealthcareDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [alerts, setAlerts] = useState(generateMockAlerts());
  const [filter, setFilter] = useState<RiskFilter>("all");
  const [showReviewed, setShowReviewed] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem("healthcare_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("healthcare_auth");
    setIsAuthenticated(false);
  };

  const toggleReviewed = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, reviewed: !alert.reviewed } : alert
    ));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (!showReviewed && alert.reviewed) return false;
    if (filter === "all") return true;
    return alert.riskLevel === filter;
  });

  const stats = {
    crisis: alerts.filter(a => a.riskLevel === "crisis").length,
    high: alerts.filter(a => a.riskLevel === "high").length,
    medium: alerts.filter(a => a.riskLevel === "medium").length,
    low: alerts.filter(a => a.riskLevel === "low").length,
    unreviewed: alerts.filter(a => !a.reviewed).length,
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
    return date.toLocaleDateString();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "crisis": return "bg-red-100 text-red-700 border-red-200";
      case "high": return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getRiskEmoji = (level: string) => {
    switch (level) {
      case "crisis": return "🔴";
      case "high": return "🟠";
      case "medium": return "🟡";
      default: return "🟢";
    }
  };

  if (!isAuthenticated) {
    return <HealthcareLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">MindHer Healthcare</h1>
              <p className="text-xs text-gray-500">Provider Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🔴</span>
              <span className="text-xs text-gray-400">Crisis</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.crisis}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🟠</span>
              <span className="text-xs text-gray-400">High Risk</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.high}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🟡</span>
              <span className="text-xs text-gray-400">Medium</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.medium}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">🟢</span>
              <span className="text-xs text-gray-400">Low</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.low}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm col-span-2 md:col-span-1"
          >
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-gray-400">Pending</span>
            </div>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.unreviewed}</p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" />
                Weekly Risk Trends
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316" }} />
                <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} dot={{ fill: "#eab308" }} />
                <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Mood Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Activity size={18} className="text-purple-500" />
                Mood Distribution
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockMoodDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="emotion" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Alerts Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm"
        >
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Journal Alerts
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-gray-100 rounded-lg p-1 text-sm">
                {(["all", "crisis", "high", "medium", "low"] as RiskFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-md transition-colors capitalize ${
                      filter === f
                        ? "bg-white text-gray-800 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {f === "all" ? "All" : getRiskEmoji(f)}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showReviewed}
                  onChange={() => setShowReviewed(!showReviewed)}
                  className="rounded"
                />
                Show reviewed
              </label>
            </div>
          </div>

          {/* Alerts List */}
          <div className="divide-y divide-gray-50">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
                <p>No alerts matching filter</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    alert.reviewed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(alert.riskLevel)}`}>
                          {getRiskEmoji(alert.riskLevel)} {alert.riskLevel}
                        </span>
                        <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {alert.userId}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(alert.createdAt)}
                        </span>
                        {alert.reviewed && (
                          <span className="text-xs text-green-500 flex items-center gap-1">
                            <CheckCircle size={12} /> Reviewed
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        "{alert.content}"
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Emotion: {alert.emotion} • Sentiment: {alert.sentiment}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleReviewed(alert.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        alert.reviewed
                          ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                    >
                      {alert.reviewed ? "Undo" : "Mark Reviewed"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Footer Note */}
        <div className="text-center text-xs text-gray-400 py-4">
          <p>🔒 All user data is anonymized. Only anonymous IDs are shown to protect privacy.</p>
          <p className="mt-1">MindHer Healthcare Dashboard • Prototype v1.0</p>
        </div>
      </main>
    </div>
  );
};

export default HealthcareDashboard;