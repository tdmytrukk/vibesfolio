import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lightbulb, Sparkles, Archive, Rocket, Radio, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Idea Inbox",
    desc: "Capture raw ideas in seconds — tag, annotate, and never lose a spark again.",
  },
  {
    icon: Sparkles,
    title: "Prompt Library",
    desc: "Save, tag, and reuse your best AI prompts. AI-generated summaries included.",
  },
  {
    icon: Archive,
    title: "Resource Vault",
    desc: "Bookmark links with auto-fetched metadata — titles, images, favicons. All organized.",
  },
  {
    icon: Rocket,
    title: "Build Cockpit",
    desc: "Track projects from idea to shipped — tasks, decisions, shipping log, and session debriefs.",
  },
  {
    icon: Radio,
    title: "Community",
    desc: "Share prompts & resources publicly. Follow other builders and discover what works.",
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
            to="/auth"
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
            Built for solo makers ✦
          </span>
          <h1 className="font-heading text-4xl md:text-6xl text-foreground leading-tight tracking-tight mb-5">
            Your calm workspace
            <br />
            <span className="text-muted-foreground">from spark to ship</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Capture ideas, curate resources, save AI prompts, and track every build
            — all in one beautiful, distraction-free workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth"
              className="rounded-pill bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Start Building Free
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
              className="card-glass p-6 flex flex-col gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <f.icon size={20} className="text-foreground" strokeWidth={1.6} />
              </div>
              <h3 className="font-heading text-lg text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-4 max-w-3xl mx-auto">
          {features.slice(3).map((f, i) => (
            <motion.div
              key={f.title}
              custom={i + 3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              className="card-glass p-6 flex flex-col gap-3"
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
            Ready to build with intention?
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Join solo makers who use Vibesfolio to stay focused, ship faster, and actually enjoy the process.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-pill bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Create Your Free Account
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vibesfolio · Built with intention
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
