import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Lightbulb, Sparkles, Archive, LogOut, User, Radio, Crown, Search, Shield } from "lucide-react";
import GlobalSearch from "@/components/GlobalSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useFollows } from "@/hooks/useFollows";
import UpgradeModal from "@/components/UpgradeModal";
import { useSubscription } from "@/hooks/useSubscription";
import { useIsAdmin } from "@/hooks/useAdminData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/prompts", label: "Prompts", icon: Sparkles },
  { to: "/vault", label: "Resources", icon: Archive },
  { to: "/community", label: "Community", icon: Radio },
  { to: "/ideas", label: "Ideas", icon: Lightbulb },
];

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, profile, subscription, subscriptionLoading } = useAuth();
  const { incomingRequests } = useFollows();
  const { startCheckout } = useSubscription();
  const { data: isAdmin } = useIsAdmin();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  const userInitial = (profile?.display_name || user?.email || "U").charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url;
  const pendingCount = incomingRequests.length;
  const showTrialBanner = !subscriptionLoading && !subscription.subscribed && subscription.trial_active && subscription.trial_days_left <= 7;

  return (
    <div className="bg-gradient-app bg-noise relative min-h-screen">
      {/* Desktop floating top nav */}
      <header
        className="nav-glass fixed top-4 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-1 rounded-full border border-white/30 dark:border-white/10 px-2 py-1.5"
      >
        <span className="font-heading text-sm text-foreground tracking-tight pl-4 pr-3 select-none">
          Vibesfolio
        </span>

        <div className="h-5 w-px bg-border/50 mx-1" />

        <button
          onClick={() => setSearchOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/25 dark:hover:bg-white/5 transition-colors"
          aria-label="Search (⌘K)"
        >
          <Search size={16} />
        </button>

        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/50 dark:bg-white/10 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/25 dark:hover:bg-white/5 active:scale-[0.97]"
                }`}
              >
                <item.icon size={16} strokeWidth={isActive ? 2.2 : 1.6} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="h-5 w-px bg-border/50 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground text-xs font-medium hover:bg-muted transition-colors mr-1 overflow-hidden"
              aria-label="Profile"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
                  {pendingCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
              <User size={14} />
              Profile
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate("/admin")} className="gap-2">
                <Shield size={14} />
                Admin
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={signOut} className="gap-2">
              <LogOut size={14} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Trial banner */}
      {showTrialBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 md:top-auto md:bottom-0 bg-accent/90 backdrop-blur-sm text-center py-1.5 px-4">
          <button
            onClick={() => setUpgradeOpen(true)}
            className="text-xs font-medium text-accent-foreground hover:underline"
          >
            <Crown size={12} className="inline mr-1 -mt-0.5" />
            {subscription.trial_days_left} day{subscription.trial_days_left !== 1 ? "s" : ""} left in trial — Upgrade to Pro
          </button>
        </div>
      )}

      {!subscriptionLoading && !subscription.can_write && !subscription.subscribed && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-destructive/90 backdrop-blur-sm text-center py-1.5 px-4">
          <button
            onClick={() => setUpgradeOpen(true)}
            className="text-xs font-medium text-destructive-foreground hover:underline"
          >
            Your trial has ended — Upgrade to keep creating
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 min-h-screen pb-24 md:pb-8 md:pt-24">
        {/* Mobile header - avatar only */}
        <header className={`sticky top-0 z-20 flex items-center justify-end gap-2 px-5 py-2 md:hidden ${location.pathname === "/profile" ? "hidden" : ""}`}>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <button
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium overflow-hidden"
                aria-label="Profile"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
                    {pendingCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
                <User size={14} />
                Profile
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate("/admin")} className="gap-2">
                  <Shield size={14} />
                  Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={signOut} className="gap-2">
                <LogOut size={14} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="px-5 pt-1 md:px-8 md:pt-0">{children}</div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="mobile-nav-glass fixed inset-x-0 bottom-0 z-30 flex items-center justify-evenly border-t border-white/30 dark:border-white/10 py-2 pb-[env(safe-area-inset-bottom)] md:hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        onCheckout={startCheckout}
        trialDaysLeft={subscription.trial_days_left}
      />

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};

export default AppShell;
