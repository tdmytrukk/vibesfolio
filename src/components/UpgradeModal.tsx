import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/hooks/useSubscription";
import { Crown, Loader2, Sparkles, Check } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: (priceId: string) => Promise<void>;
  trialDaysLeft?: number;
}

export default function UpgradeModal({ open, onOpenChange, onCheckout, trialDaysLeft }: UpgradeModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, key: string) => {
    setLoadingPlan(key);
    try {
      await onCheckout(priceId);
    } catch {
      // error handled upstream
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="card-glass max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-2">
            <Crown className="h-5 w-5 text-accent-foreground" />
          </div>
          <DialogTitle className="font-heading text-xl">Upgrade to Pro</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {trialDaysLeft !== undefined && trialDaysLeft <= 0
              ? "Your free trial has ended. Upgrade to keep creating."
              : "Unlock unlimited access to ideas, prompts & resources."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          {/* Features */}
          <div className="space-y-1.5 text-sm">
            {["Unlimited ideas, prompts & resources", "Full community access", "AI-powered tag suggestions", "Priority support"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-foreground shrink-0" />
                <span className="text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>

          {/* Plans */}
          <div className="grid grid-cols-2 gap-2 pt-3">
            {Object.entries(PLANS).map(([key, plan]) => (
              <Button
                key={key}
                variant={key === "yearly" ? "default" : "outline"}
                className="h-auto py-3 flex flex-col gap-0.5 relative"
                disabled={loadingPlan !== null}
                onClick={() => handleCheckout(plan.price_id, key)}
              >
                {loadingPlan === key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span className="font-medium text-sm">{plan.price}/{key === "yearly" ? "yr" : "mo"}</span>
                    <span className="text-xs opacity-70">{plan.label}</span>
                    {"savings" in plan && (
                      <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Sparkles className="h-2.5 w-2.5" />
                        {plan.savings}
                      </span>
                    )}
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
