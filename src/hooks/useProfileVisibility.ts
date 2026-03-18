import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to check and update profile visibility.
 * Returns whether the profile is public, a function to make it public,
 * and a helper that gates a publish action behind the visibility check.
 */
export function useProfileVisibility() {
  const { user } = useAuth();
  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("is_public")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setIsPublic((data as any)?.is_public ?? false);
      });
  }, [user]);

  const makePublic = useCallback(async () => {
    if (!user) return false;
    const { error } = await supabase
      .from("profiles")
      .update({ is_public: true } as any)
      .eq("user_id", user.id);
    if (!error) {
      setIsPublic(true);
      return true;
    }
    return false;
  }, [user]);

  /**
   * Call this instead of directly publishing.
   * If profile is already public, runs the action immediately.
   * Otherwise shows the prompt dialog.
   */
  const guardPublish = useCallback(
    (action: () => void) => {
      if (isPublic) {
        action();
      } else {
        setPendingAction(() => action);
        setShowPrompt(true);
      }
    },
    [isPublic]
  );

  const handleConfirm = useCallback(async () => {
    const ok = await makePublic();
    if (ok && pendingAction) {
      pendingAction();
    }
    setPendingAction(null);
    setShowPrompt(false);
  }, [makePublic, pendingAction]);

  const handleCancel = useCallback(() => {
    setPendingAction(null);
    setShowPrompt(false);
  }, []);

  return {
    isProfilePublic: isPublic,
    showVisibilityPrompt: showPrompt,
    setShowVisibilityPrompt: setShowPrompt,
    guardPublish,
    handleVisibilityConfirm: handleConfirm,
    handleVisibilityCancel: handleCancel,
  };
}
