import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Inbox, Sparkles, Archive, Rocket, Plus } from "lucide-react";
import QuickAddModal from "./QuickAddModal";

const navItems = [
  { to: "/", label: "Inbox", icon: Inbox },
  { to: "/prompts", label: "Library", icon: Sparkles },
  { to: "/vault", label: "Vault", icon: Archive },
  { to: "/log", label: "Log", icon: Rocket },
];

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="bg-gradient-app bg-noise relative min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border/40 bg-card/60 backdrop-blur-md md:flex">
        <div className="px-6 py-8">
          <h1 className="font-heading text-xl text-foreground tracking-tight">
            Builder Journal
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
            onClick={() => setQuickAddOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-pill bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Quick Add
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="relative z-10 min-h-screen pb-24 md:pb-8 md:pl-56">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 md:hidden">
          <h1 className="font-heading text-lg text-foreground">Builder Journal</h1>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
            aria-label="Quick Add"
          >
            <Plus size={18} />
          </button>
        </header>

        {/* Desktop header with Quick Add */}
        <header className="sticky top-0 z-20 hidden md:flex items-center justify-end px-8 py-4">
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-2 rounded-pill bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus size={16} />
            Quick Add
          </button>
        </header>

        <div className="px-5 md:px-8">{children}</div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border/40 bg-card/80 backdrop-blur-md py-2 pb-[env(safe-area-inset-bottom)] md:hidden">
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

      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  );
};

export default AppShell;
