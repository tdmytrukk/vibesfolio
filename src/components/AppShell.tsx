import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Lightbulb, Sparkles, Archive, Rocket, LogOut, User, Radio } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFollows } from "@/hooks/useFollows";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/log", label: "Projects", icon: Rocket },
  { to: "/ideas", label: "Ideas", icon: Lightbulb },
  { to: "/prompts", label: "Prompts", icon: Sparkles },
  { to: "/vault", label: "Resources", icon: Archive },
  { to: "/community", label: "Community", icon: Radio },
];

interface AppShellProps {
  children: React.ReactNode;
}

const glassStyle = {
  background: 'linear-gradient(135deg, hsla(0,0%,100%,0.45) 0%, hsla(270,30%,96%,0.35) 50%, hsla(0,0%,100%,0.4) 100%)',
  backdropFilter: 'blur(40px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
  boxShadow: '0 8px 32px -4px hsla(240,10%,10%,0.08), inset 0 1px 2px 0 hsla(0,0%,100%,0.5)',
};

const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, profile } = useAuth();
  const { incomingRequests } = useFollows();

  const userInitial = (profile?.display_name || user?.email || "U").charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url;
  const pendingCount = incomingRequests.length;

  return (
    <div className="bg-gradient-app bg-noise relative min-h-screen">
      {/* Desktop floating top nav */}
      <header
        className="fixed top-4 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-1 rounded-full border border-white/30 dark:border-white/10 px-2 py-1.5"
        style={glassStyle}
      >
        <span className="font-heading text-sm text-foreground tracking-tight pl-4 pr-3 select-none">
          Vibesfolio
        </span>

        <div className="h-5 w-px bg-border/50 mx-1" />

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
                    : "text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-white/5"
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
            <DropdownMenuItem onClick={signOut} className="gap-2">
              <LogOut size={14} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main content */}
      <main className="relative z-10 min-h-screen pb-24 md:pb-8 md:pt-24">
        {/* Mobile header - avatar only */}
        <header className="sticky top-0 z-20 flex items-center justify-end px-5 py-4 md:hidden">
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
              <DropdownMenuItem onClick={signOut} className="gap-2">
                <LogOut size={14} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="px-5 pt-4 md:px-8 md:pt-0">{children}</div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/30 dark:border-white/10 py-2 pb-[env(safe-area-inset-bottom)] md:hidden" style={{ background: 'linear-gradient(135deg, hsla(0,0%,100%,0.4) 0%, hsla(270,30%,96%,0.3) 50%, hsla(0,0%,100%,0.35) 100%)', backdropFilter: 'blur(40px) saturate(1.8)', WebkitBackdropFilter: 'blur(40px) saturate(1.8)', boxShadow: '0 -4px 24px -4px hsla(240,10%,10%,0.06), inset 0 1px 2px 0 hsla(0,0%,100%,0.4)' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default AppShell;
