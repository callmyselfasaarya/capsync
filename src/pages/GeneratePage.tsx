import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles, Copy, RefreshCw, Hash, BarChart3,
  Check, Image as ImageIcon, Send, X, Wand2,
  Lightbulb, ChevronRight, MessageSquarePlus,
  RotateCcw, Info, TrendingUp, Clock, Users,
  PenLine, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Caption {
  text: string;
  hashtags: string[];
  score: number;
  emoji: string;
}

interface AISuggestion {
  tone: string;
  platform: string;
  reasoning: string;
}

interface PlatformTip {
  bestTime: string;
  audience: string;
  tip: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TONES = [
  { id: "funny",        label: "😂 Funny" },
  { id: "aesthetic",   label: "✨ Aesthetic" },
  { id: "professional",label: "💼 Professional" },
  { id: "bold",        label: "🔥 Bold" },
  { id: "minimalist",  label: "🤍 Minimalist" },
  { id: "emotional",   label: "💕 Emotional" },
  { id: "witty",       label: "😏 Witty" },
  { id: "motivational",label: "💪 Motivational" },
];

const PLATFORMS: { id: string; label: string; charLimit: number; icon: string }[] = [
  { id: "instagram", label: "Instagram", charLimit: 2200, icon: "📸" },
  { id: "linkedin",  label: "LinkedIn",  charLimit: 3000, icon: "💼" },
  { id: "twitter",   label: "X / Twitter", charLimit: 280, icon: "🐦" },
  { id: "whatsapp",  label: "WhatsApp",  charLimit: 700,  icon: "💬" },
];

const PLATFORM_TIPS: Record<string, PlatformTip> = {
  instagram: { bestTime: "6–9 PM weekdays", audience: "18–34 year olds",   tip: "Use 5–10 hashtags for best reach. First 125 chars count most." },
  linkedin:  { bestTime: "Tue–Thu 8–10 AM", audience: "Professionals, B2B", tip: "Long-form content performs well. End with a question to drive comments." },
  twitter:   { bestTime: "12–3 PM weekdays", audience: "News & tech savvy", tip: "Keep it under 240 chars. Trending hashtags boost impressions 2x." },
  whatsapp:  { bestTime: "Any time",         audience: "Your contacts",     tip: "Personal tone works best. Emojis add warmth without overdoing it." },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Build a Gemini parts array and call the REST API. */
async function callGemini(
  apiKey: string,
  parts: object[]
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Gemini request failed");
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No content received from Gemini");
  return text;
}

// ─── Component ────────────────────────────────────────────────────────────────

const GeneratePage = () => {
  const [prompt, setPrompt]                   = useState("");
  const [selectedTone, setSelectedTone]       = useState("aesthetic");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [isGenerating, setIsGenerating]       = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<Caption[]>([]);
  const [copiedIndex, setCopiedIndex]         = useState<number | null>(null);
  const [copiedWithHashtags, setCopiedWithHashtags] = useState(true);
  const [selectedImage, setSelectedImage]     = useState<File | null>(null);
  const [imagePreview, setImagePreview]       = useState<string | null>(null);
  const [imageEncoded, setImageEncoded]       = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion]       = useState<AISuggestion | null>(null);
  const [isSuggesting, setIsSuggesting]       = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [refineIndex, setRefineIndex]         = useState<number | null>(null);
  const [refineInstruction, setRefineInstruction] = useState("");
  const [isRefining, setIsRefining]           = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const platform = PLATFORMS.find((p) => p.id === selectedPlatform)!;
  const platformTip = PLATFORM_TIPS[selectedPlatform];

  // ── API key helper ──────────────────────────────────────────────────────────

  const getApiKey = useCallback(() => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
      toast({
        title: "API Key Missing",
        description: "Add GEMINI_API_KEY to your .env file.",
        variant: "destructive",
      });
    }
    return key as string | undefined;
  }, [toast]);

  // ── Image handling ──────────────────────────────────────────────────────────

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setImageEncoded((reader.result as string).split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageEncoded(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── AI: Get tone & platform suggestion ─────────────────────────────────────

  const handleAISuggest = async () => {
    if (!prompt.trim()) {
      toast({ title: "Write something first", description: "Enter a description so AI can suggest settings.", variant: "destructive" });
      return;
    }
    const apiKey = getApiKey();
    if (!apiKey) return;

    setIsSuggesting(true);
    setAiSuggestion(null);
    try {
      const text = await callGemini(apiKey, [
        {
          text: `Analyze this social media post description and suggest the BEST tone and platform for maximum engagement.
Description: "${prompt}"

Return JSON with keys: "tone" (one of: funny, aesthetic, professional, bold, minimalist, emotional, witty, motivational), "platform" (one of: instagram, linkedin, twitter, whatsapp), "reasoning" (one short sentence explaining why).`,
        },
      ]);
      const suggestion = JSON.parse(text);
      setAiSuggestion(suggestion);
      if (suggestion.tone) setSelectedTone(suggestion.tone);
      if (suggestion.platform) setSelectedPlatform(suggestion.platform);
      toast({ title: "AI Settings Applied ✨", description: suggestion.reasoning || "Tone & platform updated." });
    } catch (e: any) {
      toast({ title: "Suggestion Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };

  // ── AI: Generate all captions ───────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedImage) return;
    const apiKey = getApiKey();
    if (!apiKey) return;

    setIsGenerating(true);
    try {
      const parts: object[] = [
        {
          text: `Generate 3 unique, highly engaging social media captions with the following parameters:
Topic/Description: ${prompt || "Image provided"}
Tone: ${selectedTone}
Platform: ${selectedPlatform}
Character limit: ${platform.charLimit}

Return ONLY a JSON object with a 'captions' array of 3 objects. Each object MUST have:
- "text": caption text (respect ${platform.charLimit} char limit)
- "hashtags": array of 4-6 relevant hashtags
- "score": number 70-98 (estimated engagement %)
- "emoji": single relevant emoji for this option`,
        },
      ];

      if (imageEncoded && selectedImage) {
        parts.push({
          inlineData: {
            mimeType: selectedImage.type,
            data: imageEncoded,
          },
        });
      }

      const text = await callGemini(apiKey, parts);
      const result = JSON.parse(text);
      const captions = result.captions || result;
      setGeneratedCaptions(Array.isArray(captions) ? captions : []);
      toast({ title: "Captions Generated! 🚀", description: "3 AI-powered captions are ready." });
    } catch (e: any) {
      toast({ title: "Generation Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  // ── AI: Regenerate single caption ───────────────────────────────────────────

  const handleRegenerateOne = async (index: number) => {
    const apiKey = getApiKey();
    if (!apiKey) return;
    setRegeneratingIndex(index);
    try {
      const text = await callGemini(apiKey, [
        {
          text: `Generate ONE new ${selectedTone} caption for ${selectedPlatform} about: "${prompt || "same topic as before"}". 
Make it different from: "${generatedCaptions[index]?.text}"
Return JSON: {"text":"...","hashtags":["..."],"score":85,"emoji":"🔥"}`,
        },
      ]);
      const newCaption: Caption = JSON.parse(text);
      setGeneratedCaptions((prev) => prev.map((c, i) => (i === index ? { ...c, ...newCaption } : c)));
      toast({ title: "Caption Refreshed ✨" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setRegeneratingIndex(null);
    }
  };

  // ── AI: Refine caption with instruction ────────────────────────────────────

  const handleRefine = async () => {
    if (refineIndex === null || !refineInstruction.trim()) return;
    const apiKey = getApiKey();
    if (!apiKey) return;
    setIsRefining(true);
    try {
      const original = generatedCaptions[refineIndex];
      const text = await callGemini(apiKey, [
        {
          text: `Refine this social media caption based on the instruction below.
Original: "${original.text}"
Instruction: "${refineInstruction}"
Platform: ${selectedPlatform}, Tone: ${selectedTone}

Return JSON: {"text":"...","hashtags":["..."],"score":${original.score},"emoji":"${original.emoji}"}`,
        },
      ]);
      const refined: Caption = JSON.parse(text);
      setGeneratedCaptions((prev) => prev.map((c, i) => (i === refineIndex ? { ...c, ...refined } : c)));
      toast({ title: "Caption Refined! ✨" });
      setRefineIndex(null);
      setRefineInstruction("");
    } catch (e: any) {
      toast({ title: "Refinement Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsRefining(false);
    }
  };

  // ── Copy ────────────────────────────────────────────────────────────────────

  const handleCopy = (caption: Caption, index: number) => {
    const text = copiedWithHashtags
      ? `${caption.text}\n\n${caption.hashtags.join(" ")}`
      : caption.text;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Powered
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Generate <span className="gradient-text">Captions</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Describe your post, choose your vibe, and let AI craft captions that actually perform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Prompt */}
            <div className="glass-card p-5">
              <label className="text-sm font-medium text-foreground mb-2 block">
                What's your post about?
              </label>
              <Textarea
                placeholder="e.g., Morning coffee at a cozy café with friends..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[110px] bg-background/50 border-border/50 resize-none focus:border-primary/40"
              />

              {/* Image upload */}
              <div className="flex flex-col gap-3 mt-3">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                {imagePreview && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border/50 bg-secondary/30">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background text-foreground rounded-full shadow-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <Button
                  variant="outline" size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs gap-1.5 border-border/50 text-muted-foreground hover:text-foreground w-fit"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  {selectedImage ? "Change Image" : "Upload Image (Optional)"}
                </Button>
              </div>

              {/* AI Suggest button */}
              <div className="mt-3 pt-3 border-t border-border/30">
                <Button
                  variant="outline" size="sm"
                  onClick={handleAISuggest}
                  disabled={isSuggesting || !prompt.trim()}
                  className="w-full gap-2 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                >
                  {isSuggesting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  {isSuggesting ? "Analyzing your prompt…" : "AI: Suggest Best Tone & Platform"}
                </Button>
                <AnimatePresence>
                  {aiSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/15 text-xs text-muted-foreground flex gap-2 items-start"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{aiSuggestion.reasoning}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tone */}
            <div className="glass-card p-5">
              <label className="text-sm font-medium text-foreground mb-3 block">Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedTone(tone.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedTone === tone.id
                        ? "bg-primary/20 text-primary border border-primary/40 shadow-sm"
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
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedPlatform === p.id
                        ? "bg-accent/20 text-accent border border-accent/40 shadow-sm"
                        : "bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>

              {/* Platform Engagement Tips */}
              <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> {platform.label} Tips
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 shrink-0 text-primary/60" />
                  <span>Best time: <span className="text-foreground">{platformTip.bestTime}</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3 shrink-0 text-primary/60" />
                  <span>Audience: <span className="text-foreground">{platformTip.audience}</span></span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 shrink-0 text-primary/60 mt-0.5" />
                  <span>{platformTip.tip}</span>
                </div>
              </div>
            </div>

            {/* Copy mode toggle */}
            <div className="glass-card p-4 flex items-center justify-between">
              <div className="text-xs">
                <p className="font-medium text-foreground">Include Hashtags on Copy</p>
                <p className="text-muted-foreground mt-0.5">Auto-append hashtags when copying</p>
              </div>
              <button
                onClick={() => setCopiedWithHashtags((v) => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  copiedWithHashtags ? "bg-primary" : "bg-secondary border border-border"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    copiedWithHashtags ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={(!prompt.trim() && !selectedImage) || isGenerating}
              className="w-full h-12 font-display text-base bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90 glow-primary disabled:opacity-40 gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isGenerating ? "Generating…" : "Generate Captions"}
            </Button>
          </motion.div>

          {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-3 space-y-4"
          >
            {/* Empty state */}
            {generatedCaptions.length === 0 && !isGenerating && (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[420px]">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Send className="w-7 h-7 text-primary/60" />
                </div>
                <p className="text-muted-foreground font-medium">Your captions will appear here</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Describe your post and hit generate</p>
                <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-xs">
                  {["Describe", "Pick tone", "Generate"].map((step, i) => (
                    <div key={step} className="flex flex-col items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </div>
                      <span className="text-xs text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skeleton loader */}
            {isGenerating && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card p-5 overflow-hidden relative">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <div className="h-3.5 bg-secondary/70 rounded-full w-1/4 mb-4" />
                    <div className="space-y-2.5">
                      <div className="h-3 bg-secondary/60 rounded-full w-full" />
                      <div className="h-3 bg-secondary/50 rounded-full w-5/6" />
                      <div className="h-3 bg-secondary/40 rounded-full w-3/4" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-5 bg-secondary/40 rounded-full w-20" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Captions */}
            <AnimatePresence>
              {!isGenerating && generatedCaptions.map((caption, index) => {
                const charCount = caption.text.length;
                const overLimit = charCount > platform.charLimit;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="glass-card-hover p-5"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{caption.emoji}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          Option {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* Engagement score */}
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          <BarChart3 className="w-3 h-3" />
                          {caption.score}%
                        </span>

                        {/* Char count */}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          overLimit
                            ? "bg-destructive/10 text-destructive"
                            : "bg-secondary/60 text-muted-foreground"
                        }`}>
                          {charCount}/{platform.charLimit}
                        </span>

                        {/* Refine button */}
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Refine with instruction"
                          onClick={() => { setRefineIndex(index); setRefineInstruction(""); }}
                        >
                          <PenLine className="w-3.5 h-3.5" />
                        </Button>

                        {/* Regenerate single */}
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          title="Regenerate this caption"
                          onClick={() => handleRegenerateOne(index)}
                          disabled={regeneratingIndex === index}
                        >
                          {regeneratingIndex === index ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                        </Button>

                        {/* Copy */}
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopy(caption, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Caption text */}
                    <p className="text-foreground/90 text-sm leading-relaxed mb-3">{caption.text}</p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1.5">
                      {caption.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-primary/70 font-medium px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => navigator.clipboard.writeText(tag)}
                          title="Click to copy hashtag"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Refine panel */}
                    <AnimatePresence>
                      {refineIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-border/40"
                        >
                          <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                            <MessageSquarePlus className="w-3.5 h-3.5 text-primary" />
                            Refine this caption
                          </p>
                          <Textarea
                            placeholder='e.g., "Make it shorter", "Add more humor", "Remove the emoji"…'
                            value={refineInstruction}
                            onChange={(e) => setRefineInstruction(e.target.value)}
                            className="min-h-[70px] text-xs bg-background/50 border-border/50 resize-none focus:border-primary/40"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={handleRefine}
                              disabled={!refineInstruction.trim() || isRefining}
                              className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground hover:opacity-90"
                            >
                              {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronRight className="w-3 h-3" />}
                              {isRefining ? "Refining…" : "Apply"}
                            </Button>
                            <Button
                              size="sm" variant="ghost"
                              onClick={() => setRefineIndex(null)}
                              className="text-xs h-8 text-muted-foreground"
                            >
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Regenerate All button — shown after results */}
            {generatedCaptions.length > 0 && !isGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full h-10 text-sm gap-2 border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate All
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GeneratePage;
