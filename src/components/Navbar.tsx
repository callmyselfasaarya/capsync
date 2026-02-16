import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import capsyncLogo from "@/assets/capsync-logo.png";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 rounded-none border-x-0"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={capsyncLogo} alt="CapSync logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className="font-display font-bold text-lg text-foreground">
            Cap<span className="gradient-text">Sync</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isHome ? (
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
      </div>
    </motion.nav>
  );
};

export default Navbar;
