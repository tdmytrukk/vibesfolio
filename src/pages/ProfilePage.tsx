import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useFollows } from "@/hooks/useFollows";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, KeyRound, Trash2, CreditCard, Link2, Camera, Check, Eye, EyeOff, UserCheck, UserX, Bell, Crown } from "lucide-react";
import UpgradeModal from "@/components/UpgradeModal";
import { useSubscription, PLANS } from "@/hooks/useSubscription";

const ProfilePage = () => {
  const { user, signOut, refreshProfile, subscription } = useAuth();
  const { toast } = useToast();
  const { incomingRequests, acceptRequest, declineRequest, refetchRequests } = useFollows();
  const { startCheckout, openCustomerPortal, checkSubscription } = useSubscription();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Change password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Delete account state
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Google connect state
  const [googleLoading, setGoogleLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const isGoogleLinked = user?.app_metadata?.providers?.includes("google") ?? false;

  // Handle checkout success/cancel redirect
  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      toast({ title: "Subscription activated! 🎉", description: "Welcome to Pro." });
      checkSubscription();
      setSearchParams({}, { replace: true });
    } else if (checkout === "canceled") {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Load profile
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, is_public")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || null);
        setIsPublic((data as any).is_public ?? false);
      }
    };
    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Image must be under 2MB", variant: "destructive" });
      return;
    }

    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: newUrl })
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      setAvatarUrl(newUrl);
      await refreshProfile();
      toast({ title: "Avatar updated" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/profile",
      });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "Google connection failed", description: err.message, variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await signOut();
      toast({
        title: "Account deletion requested",
        description: "Please contact support to complete account deletion.",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setDeleteLoading(false);
    }
  };

  const userInitial = displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="mx-auto max-w-3xl pb-8">
      {/* Profile header with avatar + name */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass p-4 mb-3"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative group flex-shrink-0"
            disabled={avatarUploading}
          >
            <div className="h-16 w-16 rounded-full bg-muted overflow-hidden flex items-center justify-center text-xl font-medium text-muted-foreground">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
              {avatarUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-background" />
              ) : (
                <Camera size={16} className="text-background opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </button>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                className="h-9 text-sm font-medium border-transparent bg-transparent hover:bg-secondary/50 focus:bg-background transition-colors"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className="h-9 px-2 flex-shrink-0"
              >
                {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check size={16} />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 px-3">{user?.email}</p>
          </div>
        </div>
      </motion.section>

      {/* Profile Visibility */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02 }}
        className="card-glass p-4 mb-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPublic ? <Eye size={16} className="text-foreground" /> : <EyeOff size={16} className="text-muted-foreground" />}
            <div>
              <h2 className="font-heading text-base text-foreground">Profile Visibility</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPublic ? "Others can follow your profile and see the prompts & resources you share publicly." : "Your profile is hidden. Go public so others can follow you and discover your shared prompts & resources."}
              </p>
            </div>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={async (checked) => {
              if (!user) return;
              setIsPublic(checked);
              const { error } = await supabase
                .from("profiles")
                .update({ is_public: checked } as any)
                .eq("user_id", user.id);
              if (error) {
                setIsPublic(!checked);
                toast({ title: "Failed to update visibility", variant: "destructive" });
              } else {
                toast({ title: checked ? "Profile is now public" : "Profile is now private" });
              }
            }}
          />
        </div>
      </motion.section>

      {/* Incoming Follow Requests */}
      {incomingRequests.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
          className="card-glass p-4 mb-3 space-y-3"
        >
          <div className="flex items-center gap-2 text-foreground">
            <Bell size={16} />
            <h2 className="font-heading text-base">Follow Requests</h2>
            <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">{incomingRequests.length}</span>
          </div>
          <div className="space-y-2">
            {incomingRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                {req.requester_avatar ? (
                  <img src={req.requester_avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                    {(req.requester_name || "B").charAt(0).toUpperCase()}
                  </div>
                )}
                <p className="flex-1 text-sm text-foreground truncate">{req.requester_name}</p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={async () => {
                      await acceptRequest(req.id, req.requester_id);
                      toast({ title: `Accepted ${req.requester_name}'s request.` });
                    }}
                  >
                    <UserCheck size={12} /> Accept
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-muted-foreground hover:text-destructive"
                    onClick={async () => {
                      await declineRequest(req.id);
                      toast({ title: "Request declined." });
                    }}
                  >
                    <UserX size={12} /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Two-column grid on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Change Password */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="card-glass p-4 space-y-3"
        >
          <div className="flex items-center gap-2 text-foreground">
            <KeyRound size={16} />
            <h2 className="font-heading text-base">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-2">
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="h-9 text-sm"
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="h-9 text-sm"
            />
            <Button type="submit" disabled={passwordLoading} size="sm" className="w-full">
              {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </motion.section>

        {/* Connected Accounts */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="card-glass p-4 space-y-2"
        >
          <div className="flex items-center gap-2 text-foreground">
            <Link2 size={16} />
            <h2 className="font-heading text-base">Connected Accounts</h2>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm text-foreground">Google</span>
            </div>
            {!isGoogleLinked ? (
              <Button variant="outline" size="sm" onClick={handleConnectGoogle} disabled={googleLoading} className="h-8 text-xs">
                {googleLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Connect"}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Linked</span>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2.5">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span className="text-sm text-foreground">LinkedIn</span>
              <span className="text-[10px] text-muted-foreground">Soon</span>
            </div>
            <Button variant="outline" size="sm" disabled className="h-8 text-xs">Connect</Button>
          </div>
        </motion.section>

        {/* Subscription */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
          className="card-glass p-4"
        >
          <div className="flex items-center gap-2 text-foreground mb-2">
            <CreditCard size={16} />
            <h2 className="font-heading text-base">Subscription</h2>
          </div>
          {subscription.subscribed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Crown size={14} className="text-accent-foreground" />
                    Pro {subscription.plan_interval === "year" ? "Yearly" : "Monthly"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Renews {subscription.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString() : "—"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={async () => {
                    try {
                      await openCustomerPortal();
                    } catch (err: any) {
                      toast({ title: "Error", description: err.message, variant: "destructive" });
                    }
                  }}
                >
                  Manage
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {subscription.trial_active ? "Free Trial" : "Trial Ended"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {subscription.trial_active
                      ? `${subscription.trial_days_left} day${subscription.trial_days_left !== 1 ? "s" : ""} left`
                      : "Upgrade to keep creating"}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setUpgradeOpen(true)}
                >
                  Upgrade
                </Button>
              </div>
            </div>
          )}
        </motion.section>

        {/* Danger Zone */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="card-glass border-destructive/20 p-4"
        >
          <div className="flex items-center gap-2 text-destructive mb-2">
            <Trash2 size={16} />
            <h2 className="font-heading text-base">Danger Zone</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Permanently delete your account and all data. This cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="w-full">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, all projects, ideas, prompts, and resources.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, delete my account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.section>
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        onCheckout={startCheckout}
        trialDaysLeft={subscription.trial_days_left}
      />
    </div>
  );
};

export default ProfilePage;
