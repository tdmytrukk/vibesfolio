import { motion } from "framer-motion";

type CockpitTab = "execute" | "log" | "decisions" | "debrief";

const steps: { key: CockpitTab; label: string }[] = [
  { key: "execute", label: "Execute" },
  { key: "log", label: "Ship" },
  { key: "decisions", label: "Decide" },
  { key: "debrief", label: "Reflect" },
];

const CockpitStepIndicator = ({ activeTab, hasUnfinishedDebrief }: { activeTab: CockpitTab; hasUnfinishedDebrief?: boolean }) => {
  const activeIndex = steps.findIndex((s) => s.key === activeTab);

  return (
    <div className="flex items-center justify-center gap-1 py-1">
      {steps.map((step, i) => {
        const isActive = step.key === activeTab;
        const isPast = i < activeIndex;
        const needsAttention = step.key === "debrief" && hasUnfinishedDebrief && !isActive;

        return (
          <div key={step.key} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-2 h-2 rounded-full transition-all ${
                  isActive
                    ? "bg-builder-accent shadow-[0_0_8px_hsl(var(--builder-glow))]"
                    : isPast
                    ? "bg-muted-foreground/40"
                    : needsAttention
                    ? "bg-builder-accent/50 animate-pulse"
                    : "bg-muted-foreground/20"
                }`}
                layoutId={isActive ? "active-step" : undefined}
              />
              <span className={`text-[9px] mt-0.5 ${isActive ? "text-foreground font-medium" : "text-muted-foreground/40"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-px mt-[-8px] ${i < activeIndex ? "bg-muted-foreground/30" : "bg-muted-foreground/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CockpitStepIndicator;
