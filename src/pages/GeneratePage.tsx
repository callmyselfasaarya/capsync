import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles, RefreshCw, Image as ImageIcon, Send,
  Download, Brain, ToggleLeft, ChevronDown, ChevronUp,
  User, PenLine
} from "lucide-react";
import StreamingCaption from "@/components/StreamingCaption";
import AgentMode from "@/components/AgentMode";
import PersonaSelector from "@/components/PersonaSelector";
import ExportModal from "@/components/ExportModal";
import VoiceInput from "@/components/VoiceInput";

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

const generateCaptions = (prompt: string, tone: string, platform: string, researchMode: boolean) => [
  {
    text: `The algorithm doesn't decide your worth — your creativity does. Keep showing up, keep creating, keep being unapologetically you. 🚀 ${researchMode ? "(Research-backed: authenticity drives 2.4x more engagement)" : ""}`,
    hashtags: ["#CreatorLife", "#ContentIsKing", "#AuthenticCreator", "#DigitalCreator"],
    score: 87,
    emoji: "🔥",
    tone: "Inspiring",
    readability: 88,
    engagementPct: 84,
  },
  {
    text: `Plot twist: the journey IS the destination. Every late night, every pivot, every 'failed' attempt — it's all building something bigger than you can see right now. ${researchMode ? "Source: Growth Mindset Research, Stanford 2024." : ""}`,
    hashtags: ["#Mindset", "#GrowthJourney", "#Entrepreneurship", "#KeepGoing"],
    score: 92,
    emoji: "✨",
    tone: "Motivational",
    readability: 91,
    engagementPct: 89,
  },
  {
    text: `Coffee: because adulting without it should be illegal. ☕ Starting this week with questionable decisions and great vibes. ${researchMode ? "Trend data: relatable humor posts see 3.1x share rate." : ""}`,
    hashtags: ["#MondayMood", "#CoffeeLover", "#Relatable", "#WeekdayVibes"],
    score: 78,
    emoji: "😂",
    tone: "Playful",
    readability: 95,
    engagementPct: 76,
  },
];

// Confetti effect
const spawnConfetti = () => {
  const colors = ["hsl(48,100%,50%)", "hsl(0,0%,10%)", "hsl(48,90%,70%)", "hsl(0,0%,90%)"];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    el.className = "confetti-particle";
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -20px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      width: ${4 + Math.random() * 8}px;
      height: ${4 + Math.random() * 8}px;
      animation-delay: ${Math.random() * 0.8}s;
      animation-duration: ${1.5 + Math.random() * 1.5}s;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
};

const GeneratePage = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState("aesthetic");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<ReturnType<typeof generateCaptions>>([]);
  const [researchMode, setResearchMode] = useState(false);
  const [persona, setPersona] = useState("startup");
  const [agentMode, setAgentMode] = useState(false);
  const [styleMemory, setStyleMemory] = useState(true);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = useCallback((overridePrompt?: string) => {
    const p = overridePrompt ?? prompt;
    if (!p.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const captions = generateCaptions(p, selectedTone, selectedPlatform, researchMode);
      setGeneratedCaptions(captions);
      setIsGenerating(false);
      if (!hasGenerated) {
        spawnConfetti();
        setHasGenerated(true);
      }
    }, 1800);
  }, [prompt, selectedTone, selectedPlatform, researchMode, hasGenerated]);

  const handleRegenerate = useCallback((index: number) => {
    setGeneratedCaptions(prev => {
      const newCaps = [...prev];
      const newTexts = generateCaptions(prompt, selectedTone, selectedPlatform, researchMode);
      newCaps[index] = newTexts[index];
      return newCaps;
    });
  }, [prompt, selectedTone, selectedPlatform, researchMode]);

  const handleAgentComplete = (task: string) => handleGenerate(task);

  const readableText = generatedCaptions[0]?.text ?? "";

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Generate <span className="gradient-text">Captions</span>
          </h1>
          <p className="text-muted-foreground">Describe your post and let AI craft the perfect caption.</p>
        </motion.div>

        {/* Mode toggles bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-4 mb-6 glass-card px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Agent Mode</span>
            <Switch checked={agentMode} onCheckedChange={setAgentMode} />
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {researchMode ? "Research Mode" : "Creative Mode"}
            </span>
            <Switch checked={researchMode} onCheckedChange={setResearchMode} />
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Style Memory</span>
            <Switch checked={styleMemory} onCheckedChange={setStyleMemory} />
          </div>
          {generatedCaptions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportOpen(true)}
              className="ml-auto gap-1.5 text-xs border-border/50 text-muted-foreground hover:text-foreground"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Agent Mode */}
            <AnimatePresence>
              {agentMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AgentMode onComplete={handleAgentComplete} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prompt */}
            {!agentMode && (
              <div className="glass-card p-5">
                <label className="text-sm font-medium text-foreground mb-2 block">What's your post about?</label>
                <Textarea
                  placeholder="e.g., Morning coffee at a cozy café with friends..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] bg-background/50 border-border/50 resize-none focus:border-primary/40"
                />
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 border-border/50 text-muted-foreground hover:text-foreground">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Upload Image
                  </Button>
                  <VoiceInput
                    onTranscript={(t) => setPrompt(prev => prev ? prev + " " + t : t)}
                    textToRead={readableText || undefined}
                  />
                </div>
              </div>
            )}

            {/* Persona */}
            <PersonaSelector value={persona} onChange={setPersona} />

            {/* Writing Style Memory */}
            {styleMemory && (
              <div className="glass-card p-4">
                <button
                  onClick={() => setShowStylePanel(!showStylePanel)}
                  className="flex items-center justify-between w-full text-sm font-medium text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <PenLine className="w-4 h-4 text-primary/70" />
                    Your Writing Style
                  </div>
                  {showStylePanel ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {showStylePanel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2 overflow-hidden"
                    >
                      <p className="text-xs text-muted-foreground">Detected tone profile:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["Bold", "Motivational", "Authentic"].map(t => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{t}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Write like my previous posts</span>
                        <Switch defaultChecked className="scale-75" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

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
            {!agentMode && (
              <Button
                onClick={() => handleGenerate()}
                disabled={!prompt.trim() || isGenerating}
                className="w-full h-12 font-display text-base bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90 glow-primary disabled:opacity-40"
              >
                {isGenerating ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Captions</>
                )}
              </Button>
            )}
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
                {/* AI Avatar */}
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="relative w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary animate-spin" style={{ animationDuration: "3s" }} />
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">AI is crafting your captions...</p>
                    <p className="text-xs text-muted-foreground">{researchMode ? "Research mode: fetching sources" : "Creative mode: generating ideas"}</p>
                  </div>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card p-5">
                    <div className="shimmer-bg h-4 rounded w-3/4 mb-3" />
                    <div className="shimmer-bg h-4 rounded w-full mb-2" />
                    <div className="shimmer-bg h-4 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence>
                {generatedCaptions.map((caption, index) => (
                  <StreamingCaption
                    key={index}
                    caption={caption}
                    index={index}
                    researchMode={researchMode}
                    onRegenerate={handleRegenerate}
                  />
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </div>

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        captions={generatedCaptions}
      />
    </div>
  );
};

export default GeneratePage;
