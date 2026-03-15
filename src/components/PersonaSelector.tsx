import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Zap, FlaskConical, User, ChevronDown, ChevronUp } from "lucide-react";

const personas = [
  {
    id: "startup",
    label: "Startup Founder",
    icon: Briefcase,
    description: "Bold, disrupting, growth-focused",
    example: "We're not just building a product — we're changing how the world creates.",
  },
  {
    id: "educator",
    label: "Tech Educator",
    icon: GraduationCap,
    description: "Clear, informative, structured",
    example: "Here's a 3-step breakdown that will change how you write captions forever.",
  },
  {
    id: "genz",
    label: "Gen Z Creator",
    icon: Zap,
    description: "Casual, relatable, trendy",
    example: "no thoughts just vibes ✨ also hire me someone please lowkey",
  },
  {
    id: "academic",
    label: "Academic Researcher",
    icon: FlaskConical,
    description: "Precise, evidenced, analytical",
    example: "New study reveals 73% higher engagement with authentic storytelling frameworks.",
  },
  {
    id: "custom",
    label: "Custom Persona",
    icon: User,
    description: "Train on your own writing",
    example: "Upload samples to mirror your unique style.",
  },
];

interface PersonaSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

const PersonaSelector = ({ value, onChange }: PersonaSelectorProps) => {
  const [expanded, setExpanded] = useState(false);
  const selected = personas.find(p => p.id === value) ?? personas[0];

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-foreground">AI Persona</label>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          {expanded ? "Collapse" : "Change"}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {!expanded ? (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
          <selected.icon className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground">{selected.label}</p>
            <p className="text-xs text-muted-foreground">{selected.description}</p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          {personas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => { onChange(persona.id); setExpanded(false); }}
              className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                value === persona.id
                  ? "bg-primary/10 border-primary/30 text-foreground"
                  : "bg-background/30 border-border/40 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <persona.icon className="w-3.5 h-3.5 text-primary/70" />
                <span className="text-xs font-semibold">{persona.label}</span>
              </div>
              <p className="text-xs opacity-70">{persona.description}</p>
              <p className="text-xs italic mt-1 opacity-50 line-clamp-1">"{persona.example}"</p>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default PersonaSelector;
