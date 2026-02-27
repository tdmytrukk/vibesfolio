import { useState } from "react";
import { Plus, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import UpgradeModal from "@/components/UpgradeModal";
import { useSubscription } from "@/hooks/useSubscription";

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

const FloatingActionButton = ({ onClick, label = "Add new" }: FloatingActionButtonProps) => {
  const { subscription } = useAuth();
  const { startCheckout } = useSubscription();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const handleClick = () => {
    if (!subscription.can_write) {
      setUpgradeOpen(true);
    } else {
      onClick();
    }
  };

  const showLock = !subscription.can_write;

  return (
    <>
      {/* Mobile: above bottom nav */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleClick}
        aria-label={label}
        className="fab-glass fixed z-40 flex h-16 w-16 items-center justify-center rounded-full md:hidden"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)",
          right: "20px",
        }}
      >
        {showLock ? (
          <Crown size={24} strokeWidth={2.5} className="text-foreground/80" />
        ) : (
          <Plus size={28} strokeWidth={2.5} className="text-foreground/80" />
        )}
      </motion.button>

      {/* Desktop: bottom-right corner */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleClick}
        aria-label={label}
        className="fab-glass fixed z-40 hidden md:flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          bottom: "32px",
          right: "32px",
        }}
      >
        {showLock ? (
          <Crown size={24} strokeWidth={2.5} className="text-foreground/80" />
        ) : (
          <Plus size={28} strokeWidth={2.5} className="text-foreground/80" />
        )}
      </motion.button>

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        onCheckout={startCheckout}
        trialDaysLeft={subscription.trial_days_left}
      />
    </>
  );
};

export default FloatingActionButton;
