import { NavLink, useLocation } from "react-router-dom";
import { Lightbulb, Sparkles, Archive, Rocket, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/", label: "Ideas", icon: Lightbulb },
  { to: "/prompts", label: "Prompts", icon: Sparkles },
  { to: "/vault", label: "Resources", icon: Archive },
  { to: "/log", label: "Projects", icon: Rocket },
];

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="bg-gradient-app bg-noise relative min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-white/30 dark:border-white/10 md:flex" style={{ background: 'linear-gradient(135deg, hsla(0,0%,100%,0.45) 0%, hsla(270,30%,96%,0.35) 50%, hsla(0,0%,100%,0.4) 100%)', backdropFilter: 'blur(40px) saturate(1.6)', WebkitBackdropFilter: 'blur(40px) saturate(1.6)', boxShadow: '0 8px 32px -4px hsla(240,10%,10%,0.08), inset 0 1px 2px 0 hsla(0,0%,100%,0.5)' }}>
        <div className="px-6 py-8">
          <h1 className="font-heading text-xl text-foreground tracking-tight">
            Vibesfolio
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">Capture. Organize. Ship.</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4">
          <button
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-pill py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="relative z-10 min-h-screen pb-24 md:pb-8 md:pl-56">
        {/* Mobile header - avatar only */}
        <header className="sticky top-0 z-20 flex items-center justify-end px-5 py-4 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium"
                aria-label="Profile"
              >
                {userInitial}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={signOut} className="gap-2">
                <LogOut size={14} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="px-5 pt-4 md:px-8 md:pt-8">{children}</div>
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
