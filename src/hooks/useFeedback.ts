import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useFeedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async (type: string, message: string, email: string) => {
    if (!user) return false;

    setIsSubmitting(true);
    try {
      const pageUrl = window.location.pathname;

      const { error } = await supabase.from("feedback" as any).insert({
        user_id: user.id,
        email,
        type,
        message,
        page_url: pageUrl,
      } as any);

      if (error) throw error;

      // Fire-and-forget notification
      supabase.functions.invoke("send-feedback-email", {
        body: { type, message, email, page_url: pageUrl },
      }).catch(() => {});

      toast({ title: "Feedback sent!", description: "Thanks for letting us know." });
      return true;
    } catch (err: any) {
      toast({ title: "Failed to send feedback", description: err.message, variant: "destructive" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitFeedback, isSubmitting };
}
