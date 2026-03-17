import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

interface SubscriptionInfo {
  subscribed: boolean;
  can_write: boolean;
  trial_active: boolean;
  trial_days_left: number;
  trial_ends_at: string | null;
  subscription_end: string | null;
  plan_interval: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  subscription: SubscriptionInfo;
  subscriptionLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

// TEMPORARY: Free for all users until 100 active users reached
const defaultSubscription: SubscriptionInfo = {
  subscribed: true,
  can_write: true,
  trial_active: false,
  trial_days_left: 0,
  trial_ends_at: null,
  subscription_end: null,
  plan_interval: "free",
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  subscription: defaultSubscription,
  subscriptionLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(defaultSubscription);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(data ?? null);
  };

  const fetchSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscription(data as SubscriptionInfo);
    } catch (err) {
      console.error("Failed to check subscription:", err);
      // Default to allowing writes on error
      setSubscription({ ...defaultSubscription, can_write: true });
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
          setTimeout(() => fetchSubscription(), 0);
        } else {
          setProfile(null);
          setSubscription(defaultSubscription);
          setSubscriptionLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchSubscription();
      } else {
        setSubscriptionLoading(false);
      }
    });

    return () => authSub.unsubscribe();
  }, [fetchSubscription]);

  // Re-check subscription every 60s
  useEffect(() => {
    if (!session?.user) return;
    const interval = setInterval(fetchSubscription, 60_000);
    return () => clearInterval(interval);
  }, [session?.user, fetchSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      loading,
      subscription,
      subscriptionLoading,
      signOut,
      refreshProfile,
      refreshSubscription: fetchSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
