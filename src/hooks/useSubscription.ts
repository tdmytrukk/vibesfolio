import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_end: string | null;
  plan_interval: string | null;
  trial_active: boolean;
  trial_days_left: number;
  trial_ends_at: string | null;
  can_write: boolean;
}

const DEFAULT_STATUS: SubscriptionStatus = {
  subscribed: false,
  subscription_end: null,
  plan_interval: null,
  trial_active: true,
  trial_days_left: 14,
  trial_ends_at: null,
  can_write: true,
};

export const PLANS = {
  monthly: {
    price_id: "price_1T5WeZCHvPXo2B0Msix4sbbJ",
    label: "Monthly",
    price: "$5",
    interval: "month",
  },
  yearly: {
    price_id: "price_1T5WevCHvPXo2B0MOVkrzFH8",
    label: "Yearly",
    price: "$50",
    interval: "year",
    savings: "Save $10",
  },
} as const;

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setStatus(DEFAULT_STATUS);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setStatus(data as SubscriptionStatus);
    } catch (err) {
      console.error("Failed to check subscription:", err);
      // Default to allowing writes on error so we don't block users
      setStatus({ ...DEFAULT_STATUS, can_write: true });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    // Re-check every 60 seconds
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const startCheckout = async (priceId: string) => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
    });
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  const openCustomerPortal = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error) throw error;
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  return {
    ...status,
    loading,
    checkSubscription,
    startCheckout,
    openCustomerPortal,
  };
}
