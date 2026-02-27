import { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="card-glass flex flex-col items-center justify-center px-8 py-16 text-center"
  >
    <div className="mb-4 text-4xl text-muted-foreground/60">{icon}</div>
    <h3 className="mb-2 text-lg font-heading text-foreground">{title}</h3>
    <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-5 rounded-pill bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
      >
        {actionLabel}
      </button>
    )}
  </motion.div>
);

export default EmptyState;
