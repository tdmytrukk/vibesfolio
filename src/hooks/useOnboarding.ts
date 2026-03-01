import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ONBOARDING_KEY = "vibesfolio_onboarding_complete";

export function useOnboarding() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Already completed onboarding
    if (localStorage.getItem(`${ONBOARDING_KEY}_${user.id}`) === "true") {
      setIsNewUser(false);
      setLoading(false);
      return;
    }

    const checkCounts = async () => {
      const [ideas, prompts, resources] = await Promise.all([
        supabase.from("ideas").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("prompts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("resources").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      const total = (ideas.count ?? 0) + (prompts.count ?? 0) + (resources.count ?? 0);
      setIsNewUser(total === 0);
      setLoading(false);
    };

    checkCounts();
  }, [user]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`${ONBOARDING_KEY}_${user.id}`, "true");
    }
    setIsNewUser(false);
  };

  return { isNewUser, loading, completeOnboarding };
}
