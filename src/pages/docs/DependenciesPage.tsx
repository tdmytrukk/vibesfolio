const deps = [
  {
    category: "Core Framework",
    items: [
      { name: "react / react-dom", version: "^18.3.1", why: "UI framework. Everything renders through React.", breaks: "Everything." },
      { name: "vite", version: "—", why: "Build tool and dev server. Fast HMR, ESM-first.", breaks: "Build pipeline, dev server, all imports." },
      { name: "typescript", version: "—", why: "Type safety across the codebase.", breaks: "Type checking, IDE support." },
    ],
  },
  {
    category: "Styling & UI",
    items: [
      { name: "tailwindcss", version: "—", why: "Utility-first CSS framework. All styling uses Tailwind classes.", breaks: "All visual styling." },
      { name: "tailwindcss-animate", version: "^1.0.7", why: "Animation utilities for Tailwind (fade-in, slide-up, etc.).", breaks: "CSS animations on modals, toasts." },
      { name: "class-variance-authority", version: "^0.7.1", why: "Type-safe component variants (used by shadcn Button, etc.).", breaks: "Button, Badge, and other variant-based components." },
      { name: "clsx + tailwind-merge", version: "^2.6.0", why: "Conditional class merging via cn() utility.", breaks: "Dynamic class composition everywhere." },
      { name: "framer-motion", version: "^12.34.3", why: "Animations: page transitions, card stagger, modal entry.", breaks: "All animated transitions." },
      { name: "lucide-react", version: "^0.462.0", why: "Icon library. Used for all UI icons.", breaks: "All icons disappear." },
    ],
  },
  {
    category: "shadcn/ui Components",
    items: [
      { name: "@radix-ui/* (multiple)", version: "Various", why: "Headless UI primitives powering all shadcn components (Dialog, Dropdown, Tabs, etc.).", breaks: "All modals, dropdowns, tooltips, menus." },
      { name: "sonner", version: "^1.7.4", why: "Toast notification system.", breaks: "Success/error feedback toasts." },
      { name: "vaul", version: "^0.9.9", why: "Drawer component (mobile-friendly bottom sheets).", breaks: "Mobile drawer interactions." },
      { name: "cmdk", version: "^1.1.1", why: "Command palette component.", breaks: "Command/search UI." },
      { name: "embla-carousel-react", version: "^8.6.0", why: "Carousel component.", breaks: "Any carousel/slider UI." },
      { name: "react-day-picker", version: "^8.10.1", why: "Calendar/date picker component.", breaks: "Date selection UI." },
      { name: "input-otp", version: "^1.4.2", why: "OTP input component.", breaks: "OTP verification flows." },
      { name: "react-resizable-panels", version: "^2.1.9", why: "Resizable split-pane layouts.", breaks: "Resizable panel UIs." },
    ],
  },
  {
    category: "Data & State",
    items: [
      { name: "@tanstack/react-query", version: "^5.83.0", why: "Server state management: caching, refetching, optimistic updates.", breaks: "All data fetching, loading states, cache invalidation." },
      { name: "@supabase/supabase-js", version: "^2.97.0", why: "Supabase SDK: auth, database queries, storage, edge function calls.", breaks: "All backend communication." },
      { name: "react-hook-form", version: "^7.61.1", why: "Form state management with validation.", breaks: "Form handling in modals." },
      { name: "@hookform/resolvers + zod", version: "^3.25.76", why: "Schema validation for forms.", breaks: "Form validation rules." },
    ],
  },
  {
    category: "Routing",
    items: [
      { name: "react-router-dom", version: "^6.30.1", why: "Client-side routing. Nested routes, protected routes, navigation.", breaks: "All page navigation." },
    ],
  },
  {
    category: "Drag & Drop",
    items: [
      { name: "@dnd-kit/core + sortable + utilities", version: "Various", why: "Drag-and-drop for task board reordering (deferred Build module).", breaks: "Task board drag-and-drop." },
    ],
  },
  {
    category: "Misc",
    items: [
      { name: "date-fns", version: "^3.6.0", why: "Date formatting and manipulation.", breaks: "All date displays (relative time, formatting)." },
      { name: "recharts", version: "^2.15.4", why: "Charting library (for future analytics dashboard).", breaks: "Charts and data visualizations." },
      { name: "next-themes", version: "^0.3.0", why: "Theme management (light/dark mode).", breaks: "Theme toggling." },
      { name: "@lovable.dev/cloud-auth-js", version: "^0.0.3", why: "Lovable Cloud auth integration.", breaks: "Cloud authentication flow." },
    ],
  },
];

const DependenciesPage = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-3xl mb-3">Dependencies</h1>
      <p className="text-muted-foreground text-lg">Every third-party library, why it's used, and what breaks if removed.</p>
    </div>

    {deps.map((cat) => (
      <section key={cat.category} className="space-y-3">
        <h2 className="text-xl">{cat.category}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Package</th>
                <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Why</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Breaks if removed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {cat.items.map((d) => (
                <tr key={d.name}>
                  <td className="py-2 pr-4 font-mono text-foreground whitespace-nowrap">{d.name}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{d.why}</td>
                  <td className="py-2 text-muted-foreground">{d.breaks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    ))}
  </div>
);

export default DependenciesPage;
