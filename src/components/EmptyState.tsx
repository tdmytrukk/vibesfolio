import { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
}

const EmptyState = ({ icon, title, subtitle }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="studio-card flex flex-col items-center justify-center px-8 py-16 text-center"
  >
    <div className="mb-4 text-4xl text-primary/40">{icon}</div>
    <h3 className="mb-2 text-lg font-heading text-foreground">{title}</h3>
    <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
  </motion.div>
);

export default EmptyState;
