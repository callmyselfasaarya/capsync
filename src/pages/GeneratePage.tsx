import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, Copy, RefreshCw, Hash, Globe, BarChart3,
  Check, Zap, Image as ImageIcon, Send
} from "lucide-react";

const tones = [
  { id: "funny", label: "😂 Funny" },
  { id: "aesthetic", label: "✨ Aesthetic" },
  { id: "professional", label: "💼 Professional" },
  { id: "bold", label: "🔥 Bold" },
  { id: "minimalist", label: "🤍 Minimalist" },
  { id: "emotional", label: "💕 Emotional" },
  { id: "witty", label: "😏 Witty" },
  { id: "motivational", label: "💪 Motivational" },
];

const platforms = [
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "X / Twitter" },
  { id: "whatsapp", label: "WhatsApp" },
];

const sampleCaptions = [
  {
    text: "The algorithm doesn't decide your worth — your creativity does. Keep showing up, keep creating, keep being unapologetically you. 🚀",
    hashtags: ["#CreatorLife", "#ContentIsKing", "#AuthenticCreator", "#DigitalCreator"],
    score: 87,
    emoji: "🔥",
  },
  {
    text: "Plot twist: the journey IS the destination. Every late night, every pivot, every 'failed' attempt — it's all building something bigger than you can see right now.",
    hashtags: ["#Mindset", "#GrowthJourney", "#Entrepreneurship", "#KeepGoing"],
    score: 92,
    emoji: "✨",
  },
  {
    text: "Coffee: because adulting without it should be illegal. ☕ Starting Monday with questionable decisions and great vibes.",
    hashtags: ["#MondayMood", "#CoffeeLover", "#Relatable", "#WeekdayVibes"],
    score: 78,
    emoji: "😂",
  },
];

const GeneratePage = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState("aesthetic");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<typeof sampleCaptions>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedCaptions(sampleCaptions);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Generate <span className="gradient-text">Captions</span>
          </h1>
          <p className="text-muted-foreground">Describe your post and let AI craft the perfect caption.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Prompt */}
            <div className="glass-card p-5">
              <label className="text-sm font-medium text-foreground mb-2 block">What's your post about?</label>
              <Textarea
                placeholder="e.g., Morning coffee at a cozy café with friends..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] bg-background/50 border-border/50 resize-none focus:border-primary/40"
              />
              <div className="flex items-center gap-2 mt-3">
                <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border/50 text-muted-foreground hover:text-foreground">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Upload Image
                </Button>
              </div>
            </div>

            {/* Tone */}
            <div className="glass-card p-5">
              <label className="text-sm font-medium text-foreground mb-3 block">Tone</label>
              <div className="flex flex-wrap gap-2">
                {tones.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedTone(tone.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedTone === tone.id
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div className="glass-card p-5">
              <label className="text-sm font-medium text-foreground mb-3 block">Platform</label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedPlatform === p.id
                        ? "bg-accent/20 text-accent border border-accent/30"
                        : "bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full h-12 font-display text-base bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90 glow-primary disabled:opacity-40"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? "Generating..." : "Generate Captions"}
            </Button>
          </motion.div>

          {/* Output Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 space-y-4"
          >
            {generatedCaptions.length === 0 && !isGenerating ? (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Send className="w-7 h-7 text-primary/60" />
                </div>
                <p className="text-muted-foreground font-medium">Your captions will appear here</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Describe your post and hit generate</p>
              </div>
            ) : isGenerating ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card p-5 animate-pulse">
                    <div className="h-4 bg-secondary/60 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-secondary/40 rounded w-full mb-2" />
                    <div className="h-4 bg-secondary/30 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence>
                {generatedCaptions.map((caption, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card-hover p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{caption.emoji}</span>
                        <span className="text-xs font-medium text-muted-foreground">Option {index + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          <BarChart3 className="w-3 h-3" />
                          {caption.score}%
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopy(caption.text, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-foreground/90 text-sm leading-relaxed mb-3">{caption.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {caption.hashtags.map((tag) => (
                        <span key={tag} className="text-xs text-primary/70 font-medium">{tag}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GeneratePage;
