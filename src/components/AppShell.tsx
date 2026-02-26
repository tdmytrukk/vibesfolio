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
    <div className="relative min-h-screen">
      {/* Abstract gradient canvas */}
      <div className="canvas-bg" aria-hidden="true" />
      <div className="canvas-grain" aria-hidden="true" />

      {/* Desktop sidebar */}
      <aside className="sidebar-glass fixed inset-y-0 left-0 z-30 hidden w-56 flex-col md:flex">
        <div className="px-6 py-8">
          <h1 className="font-heading text-xl text-foreground tracking-tight">
            Vibesfolio
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground/80 tracking-wide">Capture. Organize. Ship.</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={isActive ? { background: 'hsla(259, 80%, 63%, 0.08)' } : undefined}
              >
                {/* Active accent line */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full"
                    style={{ background: 'hsl(259, 80%, 63%)' }}
                  />
                )}
                <item.icon
                  size={18}
                  className={`transition-transform duration-300 ${!isActive ? 'group-hover:translate-x-1' : ''}`}
                />
                <span className={`transition-transform duration-300 ${!isActive ? 'group-hover:translate-x-1' : ''}`}>
                  {item.label}
                </span>
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
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center justify-end px-5 py-4 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium"
                style={{ background: 'hsla(259, 80%, 63%, 0.12)', color: 'hsl(259, 80%, 63%)' }}
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
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom)] md:hidden"
        style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.4)',
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
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
