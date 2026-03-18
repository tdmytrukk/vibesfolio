import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Book, Layers, Component, ArrowRightLeft, Server, Package, ChevronLeft, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const docsNav = [
  { to: "/docs", label: "Overview", icon: Book, end: true },
  { to: "/docs/architecture", label: "Architecture", icon: Layers },
  { to: "/docs/components", label: "Components", icon: Component },
  { to: "/docs/data-flow", label: "Data Flow", icon: ArrowRightLeft },
  { to: "/docs/api", label: "API", icon: Server },
  { to: "/docs/dependencies", label: "Dependencies", icon: Package },
];

const DocsLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-sm px-4 py-3 md:hidden">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground">
          <Menu size={20} />
        </button>
        <span className="font-heading text-lg">Docs</span>
        <NavLink to="/" className="ml-auto text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ChevronLeft size={14} /> Back to app
        </NavLink>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-card/80 backdrop-blur-sm transform transition-transform md:relative md:translate-x-0 md:z-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <NavLink to="/" className="hover:text-muted-foreground transition-colors flex items-center gap-2">
              <ChevronLeft size={16} />
              <Logo size="small" />
            </NavLink>
          </div>
          <nav className="px-3 py-4 space-y-1">
            {docsNav.map((item) => {
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon size={16} strokeWidth={isActive ? 2.2 : 1.6} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="flex-1 min-w-0 px-6 py-8 md:px-12 md:py-10 max-w-4xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DocsLayout;
