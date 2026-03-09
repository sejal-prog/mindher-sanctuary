import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, MessageSquare, AlertCircle, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { getConsent } from "@/lib/storage";

const Crisis = () => {
  const navigate = useNavigate();
  const consent = getConsent();

  const handleAlert = () => {
    if (confirm("This will alert your care team. A counselor will reach out to you. Continue?")) {
      toast("Alert sent to your care team. Someone will reach out soon. 💜");
    }
  };

  return (
    <div className="mindher-container bg-background min-h-screen pb-8">
      <PageHeader title="Crisis Support" backTo="/" />

      <div className="px-5 space-y-6">
        {/* Reassurance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mindher-card bg-gradient-to-br from-primary/20 to-primary/5 text-center py-8"
        >
          <div className="text-5xl mb-4">💜</div>
          <h2 className="text-xl font-bold font-heading text-foreground mb-2">You Are Not Alone</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            It's okay to ask for help. These feelings will pass. Support is available 24/7.
          </p>
        </motion.div>

        {/* Immediate Help */}
        <div>
          <h2 className="font-bold font-heading text-foreground mb-3">Get Help Now</h2>
          <div className="space-y-3">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="mindher-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <Phone size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">Crisis Helpline</h3>
                  <p className="text-xs text-muted-foreground">988 (Suicide & Crisis Lifeline)</p>
                </div>
                <a href="tel:988" className="mindher-btn-crisis text-sm py-2 px-4">Call Now</a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="mindher-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <MessageSquare size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">Crisis Text Line</h3>
                  <p className="text-xs text-muted-foreground">Text HOME to 741741</p>
                </div>
                <a href="sms:741741&body=HOME" className="mindher-btn-secondary text-sm py-2 px-4">Text</a>
              </div>
            </motion.div>

            {consent.crisisDetection && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="mindher-card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-crisis/15 flex items-center justify-center">
                    <AlertCircle size={18} className="text-crisis" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm">Alert My Care Team</h3>
                    <p className="text-xs text-muted-foreground">A counselor will reach out</p>
                  </div>
                  <button onClick={handleAlert} className="mindher-btn-crisis text-sm py-2 px-4">Alert</button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Calming */}
        <div>
          <h2 className="font-bold font-heading text-foreground mb-3">Calm Yourself</h2>
          <div className="space-y-3">
            {[
              { icon: "🫁", title: "Breathing Exercise", subtitle: "4-7-8 calming breath", path: "/crisis/breathing" },
              { icon: "🖐️", title: "Grounding (5-4-3-2-1)", subtitle: "Connect with your senses", path: null },
              { icon: "💬", title: "Talk to Mira", subtitle: "Your AI companion is here", path: "/chat" },
            ].map((item, i) => (
              <motion.button
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                onClick={() => item.path && navigate(item.path)}
                className="mindher-card w-full flex items-center gap-4 text-left"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Crisis;
