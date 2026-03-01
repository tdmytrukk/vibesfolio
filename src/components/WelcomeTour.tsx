import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, FileText, Bookmark, Users, Sparkles, ArrowRight, ArrowLeft, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface WelcomeTourProps {
  onComplete: () => void;
  onRefresh: () => void;
}

const SEED_IDEAS = [
  { title: "Build a portfolio site", note: "Clean, minimal — showcase 3 projects max", tags: ["web", "portfolio"], links: [] },
  { title: "Learn prompt engineering", note: "Start with OpenAI's guide, then practice daily", tags: ["ai", "learning"], links: ["https://platform.openai.com/docs/guides/prompt-engineering"] },
  { title: "Try a new CSS framework", note: "Compare Tailwind, UnoCSS, and Panda CSS", tags: ["css", "frontend"], links: [] },
];

const SEED_PROMPTS = [
  { title: "Code Review Assistant", content: "Review the following code for bugs, performance issues, and readability. Suggest improvements with brief explanations.\n\n```\n[paste code here]\n```", tags: ["code", "review"] },
  { title: "Brainstorm Feature Ideas", content: "I'm building [describe app]. Generate 10 creative feature ideas that would delight users. For each, give a one-line description and difficulty rating (easy/medium/hard).", tags: ["brainstorm", "product"] },
];

const SEED_RESOURCES = [
  { title: "Tailwind CSS Documentation", url: "https://tailwindcss.com/docs", category: "tool", tags: ["css", "reference"] },
  { title: "Refactoring UI — Design Tips", url: "https://www.refactoringui.com", category: "article", tags: ["design", "ui"] },
];

const TOTAL_STEPS = 3;

const WelcomeTour = ({ onComplete, onRefresh }: WelcomeTourProps) => {
  const [step, setStep] = useState(0);
  const [seeding, setSeeding] = useState(false);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const seedExampleData = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      await Promise.all([
        supabase.from("ideas").insert(SEED_IDEAS.map((i) => ({ ...i, user_id: user.id }))),
        supabase.from("prompts").insert(SEED_PROMPTS.map((p) => ({ ...p, user_id: user.id }))),
        supabase.from("resources").insert(SEED_RESOURCES.map((r) => ({ ...r, user_id: user.id }))),
      ]);
      toast.success("Example data loaded! ✨");
      onRefresh();
    } catch {
      toast.error("Failed to load example data");
    }
    setSeeding(false);
    onComplete();
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="card-glass w-full max-w-md p-8 relative overflow-hidden"
      >
        <AnimatePresence mode="wait" custom={step}>
          {step === 0 && (
            <motion.div
              key="step-0"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent mb-4">
                  <Sparkles className="w-6 h-6 text-accent-foreground" />
                </div>
                <h2 className="text-2xl mb-2">Welcome to Vibesfolio</h2>
                <p className="text-sm text-muted-foreground">
                  Capture ideas, save prompts, curate resources — all in one place.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Lightbulb, label: "Ideas", desc: "Quick-capture sparks before they vanish" },
                  { icon: FileText, label: "Prompts", desc: "Store & refine your best AI prompts" },
                  { icon: Bookmark, label: "Resources", desc: "Curate tools, articles & references" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={() => setStep(1)} className="w-full gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent mb-4">
                  {theme === "dark" ? <Moon className="w-6 h-6 text-accent-foreground" /> : <Sun className="w-6 h-6 text-accent-foreground" />}
                </div>
                <h2 className="text-2xl mb-2">Pick your vibe</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a look. You can always change it later in Profile.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {/* Light card */}
                <button
                  onClick={() => setTheme("light")}
                  className={`relative rounded-xl border-2 p-4 transition-all duration-200 ${
                    theme === "light"
                      ? "border-foreground shadow-md scale-[1.02]"
                      : "border-border hover:border-foreground/30"
                  }`}
                  style={{ background: "linear-gradient(160deg, hsl(270 40% 92%), hsl(20 50% 93%))" }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Sun className="w-6 h-6 text-neutral-800" />
                    <span className="text-sm font-medium text-neutral-800">Light</span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2 w-full rounded-full bg-white/70" />
                    <div className="h-2 w-3/4 rounded-full bg-white/50" />
                  </div>
                </button>

                {/* Dark card */}
                <button
                  onClick={() => setTheme("dark")}
                  className={`relative rounded-xl border-2 p-4 transition-all duration-200 ${
                    theme === "dark"
                      ? "border-foreground shadow-md scale-[1.02]"
                      : "border-border hover:border-foreground/30"
                  }`}
                  style={{ background: "linear-gradient(160deg, hsl(240 10% 8%), hsl(260 12% 10%))" }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Moon className="w-6 h-6 text-neutral-200" />
                    <span className="text-sm font-medium text-neutral-200">Dark</span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-2 w-full rounded-full bg-white/10" />
                    <div className="h-2 w-3/4 rounded-full bg-white/5" />
                  </div>
                </button>
              </div>

              <Button onClick={() => setStep(2)} className="w-full gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>

              <button
                onClick={() => setStep(0)}
                className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent mb-4">
                  <Users className="w-6 h-6 text-accent-foreground" />
                </div>
                <h2 className="text-2xl mb-2">Discover &amp; Connect</h2>
                <p className="text-sm text-muted-foreground">
                  Browse shared prompts and resources from builders you follow in the Community tab.
                </p>
              </div>

              <div className="card-glass p-4 mb-8 text-center">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Follow other builders to see what they share — find new tools, learn prompt techniques, and get inspired.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={seedExampleData}
                  disabled={seeding}
                  className="w-full gap-2"
                >
                  {seeding ? "Loading…" : "Load example data"}
                  <Sparkles className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={onComplete}
                  className="w-full text-muted-foreground"
                >
                  Start empty
                </Button>
              </div>

              <button
                onClick={() => setStep(1)}
                className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? "bg-foreground" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeTour;
