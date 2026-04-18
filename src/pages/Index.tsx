import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Hash, Globe, BarChart3, Share2, ArrowRight,
  MessageSquare, Palette, Brain, Zap
} from "lucide-react";
import capsyncLogo from "@/assets/capsync-logo.png";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Captions",
    description: "Advanced LLMs craft captions that resonate with your audience.",
  },
  {
    icon: Palette,
    title: "Tone Selector",
    description: "Funny, professional, bold, aesthetic — pick your vibe instantly.",
  },
  {
    icon: Hash,
    title: "Smart Hashtags",
    description: "Trending hashtag suggestions to maximize your content reach.",
  },
  {
    icon: BarChart3,
    title: "Engagement Prediction",
    description: "AI-estimated reach scores so you post with confidence.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Generate captions in 30+ languages for global audiences.",
  },
  {
    icon: Share2,
    title: "One-Click Share",
    description: "Post directly to Instagram, LinkedIn, X, and WhatsApp.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background glows */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="container mx-auto text-center relative z-10 max-w-4xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm font-medium text-muted-foreground mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            AI-Powered Caption Engine
          </motion.div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Captions that
            <br />
            <span className="gradient-text">stop the scroll.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate high-converting social media captions in seconds.
            Powered by AI, refined by creators.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/generate">
              <Button size="lg" className="font-display text-base px-8 bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90 glow-primary h-12">
                Start Creating Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/examples">
              <Button variant="outline" size="lg" className="font-display text-base px-8 h-12 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40">
                See Examples
              </Button>
            </Link>
          </div>

          {/* Floating preview card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 glass-card p-6 max-w-2xl mx-auto text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Generated Caption</p>
                <p className="text-xs text-muted-foreground">Tone: Aesthetic • Platform: Instagram</p>
              </div>
              <div className="ml-auto flex gap-1">
                {["🔥", "92%"].map((item, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-foreground/90 text-sm leading-relaxed italic">
              "Sunsets are proof that endings can be beautiful too. ✨ Chasing golden hours and quiet moments — because the best things in life aren't things."
            </p>
            <div className="flex gap-2 mt-3">
              {["#goldenhour", "#aesthetic", "#sunsetvibes", "#peacefulmoments"].map((tag) => (
                <span key={tag} className="text-xs text-primary/80">{tag}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to <span className="gradient-text">create & convert</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From AI generation to publishing — your entire caption workflow in one place.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="glass-card-hover p-6 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-3xl text-center gradient-border p-12 rounded-2xl"
        >
          <Zap className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold mb-4">
            Ready to level up your content?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of creators using CapSync to write better captions in less time.
          </p>
          <Link to="/generate">
            <Button size="lg" className="font-display bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90 px-10 h-12">
              Get Started — It's Free
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={capsyncLogo} alt="CapSync logo" className="w-6 h-6 rounded object-contain" />
            <span className="font-display font-semibold text-sm text-foreground">CapSync</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 CapSync. Built for creators.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
