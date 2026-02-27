import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No auth header, returning default (allow writes to avoid false lockout)");
      return new Response(JSON.stringify({
        subscribed: false, trial_active: true, trial_days_left: 14,
        trial_ends_at: null, can_write: true,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      logStep("Auth failed, returning permissive default (stale token)", { error: userError?.message });
      return new Response(JSON.stringify({
        subscribed: false, trial_active: true, trial_days_left: 14,
        trial_ends_at: null, can_write: true,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get trial_started_at from profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("trial_started_at")
      .eq("user_id", user.id)
      .single();

    const trialStartedAt = profile?.trial_started_at ? new Date(profile.trial_started_at) : new Date();
    const trialEndsAt = new Date(trialStartedAt.getTime() + 14 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const trialActive = now < trialEndsAt;
    const trialDaysLeft = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    logStep("Trial status", { trialStartedAt: trialStartedAt.toISOString(), trialActive, trialDaysLeft });

    // Check Stripe subscription
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer, returning trial status");
      return new Response(JSON.stringify({
        subscribed: false,
        trial_active: trialActive,
        trial_days_left: trialDaysLeft,
        trial_ends_at: trialEndsAt.toISOString(),
        can_write: trialActive,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = null;
    let planInterval = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      planInterval = subscription.items.data[0]?.price?.recurring?.interval || null;
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd, planInterval });
    } else {
      logStep("No active subscription found");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_end: subscriptionEnd,
      plan_interval: planInterval,
      trial_active: trialActive,
      trial_days_left: trialDaysLeft,
      trial_ends_at: trialEndsAt.toISOString(),
      can_write: hasActiveSub || trialActive,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
