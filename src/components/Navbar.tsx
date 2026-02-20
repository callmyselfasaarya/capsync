import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ThemeToggle from "./ThemeToggle";
import capsyncLogo from "@/assets/capsync-logo.png";
import { Menu, X, Sparkles, Type, LayoutTemplate, BarChart3, Brain } from "lucide-react";

const navLinks = [
  { to: "/generate", label: "Generate", icon: Sparkles },
  { to: "/editor", label: "Editor", icon: Type },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="navbar fixed top-0 left-0 right-0 z-50 glass-card border-t-0 rounded-none border-x-0"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <img src={capsyncLogo} alt="CapSync logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-display font-bold text-lg text-foreground">
            Cap<span className="gradient-text">Sync</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link key={to} to={to} className="relative group px-3 py-1.5 flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className={`text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Desktop CTA */}
          <div className="hidden md:block">
            {location.pathname === "/" ? (
              <Link to="/generate">
                <Button size="sm" className="font-display bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90">
                  Start Creating
                </Button>
              </Link>
            ) : (
              <Link to="/">
                <Button variant="ghost" size="sm" className="font-display text-muted-foreground hover:text-foreground">
                  Home
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden w-8 h-8 p-0 text-muted-foreground hover:text-foreground">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card border-border/50 p-6">
              <div className="flex items-center gap-2 mb-8">
                <img src={capsyncLogo} alt="CapSync" className="w-7 h-7 rounded object-contain" />
                <span className="font-display font-bold text-foreground">Cap<span className="gradient-text">Sync</span></span>
                <button onClick={() => setMobileOpen(false)} className="ml-auto text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <Link to="/" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                  <Brain className="w-4 h-4" />
                  <span className="font-medium text-sm">Home</span>
                </Link>
                {navLinks.map(({ to, label, icon: Icon }) => {
                  const isActive = location.pathname === to;
                  return (
                    <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8">
                <Link to="/generate" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full font-display bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Creating
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
