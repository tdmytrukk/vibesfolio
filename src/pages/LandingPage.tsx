import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lightbulb, Sparkles, Archive, Radio, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";

const features = [
  {
    icon: Lightbulb,
    title: "Idea Inbox",
    desc: "Capture ideas the moment they hit — tag, annotate, and build your personal idea bank.",
  },
  {
    icon: Sparkles,
    title: "Prompt Library",
    desc: "Save and organize your best AI prompts. Find what works, reuse it, and learn faster.",
  },
  {
    icon: Archive,
    title: "Resource Vault",
    desc: "Bookmark the tools, tutorials, and links that level up your AI skills — all in one place.",
  },
  {
    icon: Radio,
    title: "Community",
    desc: "Share prompts & resources with other builders. Discover what's working for the community.",
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
            Get Started
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
            Built for vibe-builders & AI learners ✦
          </span>
          <h1 className="font-heading text-4xl md:text-6xl text-foreground leading-tight tracking-tight mb-5">
            Your space for ideas,
            <br />
            <span className="text-muted-foreground">prompts & resources</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Save your best AI prompts, capture ideas, and curate the resources
            that help you build better products and learn AI faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth?mode=signup"
              className="rounded-pill bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-all flex items-center gap-2 shadow-sm"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="rounded-pill border border-border bg-card/60 backdrop-blur-sm px-8 py-3 text-sm font-medium text-foreground hover:bg-card transition-colors"
            >
              See Features
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 pb-20 md:pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.slice(0, 3).map((f, i) => (
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
        <div className="flex justify-center mt-4">
          {features.slice(3).map((f, i) => (
            <motion.div
              key={f.title}
              custom={i + 3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="card-glass p-6 flex flex-col gap-3 w-full max-w-sm hover:-translate-y-1 transition-transform duration-300"
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
            Your ideas deserve a home
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Join vibe-builders and AI learners who use Vibesfolio to capture what matters and ship what counts.
          </p>
          <Link
            to="/auth?mode=signup"
            className="inline-flex items-center gap-2 rounded-pill bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-all shadow-sm"
          >
            Start Your Free Space
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
