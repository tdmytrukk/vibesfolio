import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import FeatureSteps from "@/components/FeatureSteps";

const features = [
  {
    step: "Step 1",
    title: "Idea Inbox",
    content: "One inbox for every raw idea — no more Apple Notes chaos. Tagged, searchable, there when you're ready to ship.",
    image: "/placeholder.svg",
  },
  {
    step: "Step 2",
    title: "Prompt Library",
    content: "The prompt that worked shouldn't live in your chat history. Save it once, find it instantly, copy in one click.",
    image: "/placeholder.svg",
  },
  {
    step: "Step 3",
    title: "Resource Vault",
    content: "Bookmarks you'll actually use again. Save tools and links with auto-fetched metadata — organized, not buried.",
    image: "/placeholder.svg",
  },
  {
    step: "Step 4",
    title: "Community",
    content: "See the exact prompts other builders are shipping with. Share yours. Real artifacts — not thought leadership.",
    image: "/placeholder.svg",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const LandingPage = () => {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const prev = theme;
    setTheme("light");
    return () => {
      if (prev) setTheme(prev);
    };
  }, []);

  return (
    <div className="bg-gradient-app bg-noise min-h-screen relative">
      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 md:py-6 max-w-6xl mx-auto">
        <span className="font-heading text-xl text-foreground tracking-tight select-none">
          Vibesfolio
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/auth?mode=signup"
            className="rounded-pill bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Start your library
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-16 md:pt-24 md:pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="inline-block rounded-pill bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
            Built for vibe-coders and AI learners ✦
          </span>
          <h1 className="font-heading text-4xl md:text-6xl text-foreground leading-tight tracking-tight mb-5">
            Your best prompts
            <br />
            <span className="text-muted-foreground">deserve a home.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            One place for the prompts, ideas, and resources you collect while
            building. Find them instantly. Share what ships.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth?mode=signup"
              className="rounded-pill bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-all flex items-center gap-2 shadow-sm"
            >
              Start building your library
              <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="rounded-pill border border-border bg-card/60 backdrop-blur-sm px-8 py-3 text-sm font-medium text-foreground hover:bg-card transition-colors"
            >
              See how it works
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
       <section id="features" className="relative z-10 max-w-4xl mx-auto px-6 pb-20 md:pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="card-glass p-6 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <f.icon size={20} className="text-foreground" strokeWidth={1.6} />
              </div>
              <h3 className="font-heading text-lg text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-20 md:pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="card-glass p-10 md:p-14"
        >
          <h2 className="font-heading text-2xl md:text-3xl text-foreground mb-3">
            Build on what worked last time.
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Join builders who keep their best work close — not scattered across tabs, chats, and bookmarks.
          </p>
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 rounded-pill bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-all shadow-sm"
          >
            Start building your library
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vibesfolio · Built for builders
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
