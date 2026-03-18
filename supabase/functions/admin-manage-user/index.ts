import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) throw new Error("Not authenticated");

    const { data: roleCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleCheck) throw new Error("Not authorized");

    const { action, targetUserId } = await req.json();
    if (!targetUserId) throw new Error("Missing targetUserId");

    // Prevent self-actions
    if (targetUserId === caller.id) throw new Error("Cannot perform this action on yourself");

    if (action === "ban") {
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: true })
        .eq("user_id", targetUserId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "unban") {
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: false })
        .eq("user_id", targetUserId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      // Delete user from auth (cascades to profiles via FK, other tables via user_id)
      // First delete data from tables without FK cascade
      await Promise.all([
        supabase.from("ideas").delete().eq("user_id", targetUserId),
        supabase.from("prompts").delete().eq("user_id", targetUserId),
        supabase.from("resources").delete().eq("user_id", targetUserId),
        supabase.from("builds").delete().eq("user_id", targetUserId),
        supabase.from("public_artifacts").delete().eq("user_id", targetUserId),
        supabase.from("saved_artifacts").delete().eq("user_id", targetUserId),
        supabase.from("feedback").delete().eq("user_id", targetUserId),
        supabase.from("follows").delete().eq("follower_id", targetUserId),
        supabase.from("follows").delete().eq("following_id", targetUserId),
        supabase.from("follow_requests").delete().eq("requester_id", targetUserId),
        supabase.from("follow_requests").delete().eq("target_id", targetUserId),
        supabase.from("user_roles").delete().eq("user_id", targetUserId),
        supabase.from("profiles").delete().eq("user_id", targetUserId),
      ]);

      // Delete from auth
      const { error } = await supabase.auth.admin.deleteUser(targetUserId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action. Use: ban, unban, delete");
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
