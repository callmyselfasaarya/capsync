import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles, Copy, RefreshCw, BarChart3,
  Check, Image as ImageIcon, Send, X,
  Info, TrendingUp, Clock, Users,
  Loader2, ToggleLeft, Brain, User,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Caption {
  text: string;
  hashtags: string[];
  score: number;
  emoji: string;
}

interface PlatformTip {
  bestTime: string;
  audience: string;
  tip: string;
}

/** CaptionCraft API raw caption item */
interface CaptionCraftItem {
  caption: string;
  hashtags?: string[];
}

interface GeminiModelInfo {
  name?: string;
  supportedGenerationMethods?: string[];
}

interface GeminiModelsResponse {
  models?: GeminiModelInfo[];
}

interface GenerateLocationState {
  templatePrompt?: string;
}

const OPTION_EMOJIS = ["\u2728", "\uD83D\uDD25", "\u2B50"];

function normalizeHashtag(tag: string): string {
  const t = tag.trim();
  if (!t) return "";
  return t.startsWith("#") ? t : `#${t}`;
}

/** Coerce API / model output into a clean Caption the UI can render. */
function normalizeCaptionFromApi(raw: unknown, index: number): Caption | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const text = typeof o.text === "string" ? o.text.trim() : "";
  if (!text) return null;

  let hashtags: string[] = [];
  if (Array.isArray(o.hashtags)) {
    hashtags = o.hashtags
      .filter((h): h is string => typeof h === "string")
      .map(normalizeHashtag)
      .filter(Boolean);
  } else if (typeof o.hashtags === "string") {
    hashtags = o.hashtags
      .split(/[\s,]+/)
      .map(normalizeHashtag)
      .filter(Boolean);
  }

  let score = typeof o.score === "number" && !Number.isNaN(o.score) ? Math.round(o.score) : 82;
  score = Math.min(98, Math.max(70, score));

  const emoji =
    typeof o.emoji === "string" && o.emoji.trim() ? o.emoji.trim().slice(0, 4) : OPTION_EMOJIS[index % OPTION_EMOJIS.length];

  return { text, hashtags, score, emoji };
}

function normalizeCaptionsFromApi(rawList: unknown[]): Caption[] {
  const out: Caption[] = [];
  for (let i = 0; i < rawList.length && out.length < 3; i++) {
    const c = normalizeCaptionFromApi(rawList[i], out.length);
    if (c) out.push(c);
  }
  return out;
}

function parseGeminiJson<T>(rawText: string): T {
  // 1) Try direct JSON first.
  try {
    return JSON.parse(rawText) as T;
  } catch {
    // Continue with extraction fallbacks.
  }

  // 2) Strip fenced code blocks like ```json ... ```
  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() ?? rawText.trim();

  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Continue with object/array boundary extraction.
  }

  // 3) Extract likely JSON boundaries from mixed prose text.
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const objectSlice = candidate.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(objectSlice) as T;
    } catch {
      // continue
    }
  }

  const firstBracket = candidate.indexOf("[");
  const lastBracket = candidate.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const arraySlice = candidate.slice(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(arraySlice) as T;
    } catch {
      // continue
    }
  }

  throw new Error("Model returned non-JSON output. Please retry.");
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

/** CaptionCraft vibe values that map from our tone IDs */
const TONE_TO_VIBE: Record<string, string> = {
  funny:        "funny",
  aesthetic:    "inspirational",
  professional: "professional",
  bold:         "excited",
  minimalist:   "calm",
  emotional:    "romantic",
  witty:        "funny",
  motivational: "inspirational",
};

const LANGUAGES = [
  { id: "en", label: "🇬🇧 English" },
  { id: "es", label: "🇪🇸 Spanish" },
  { id: "de", label: "🇩🇪 German" },
  { id: "ja", label: "🇯🇵 Japanese" },
  { id: "ko", label: "🇰🇷 Korean" },
  { id: "zh-CN", label: "🇨🇳 Chinese (S)" },
  { id: "zh-TW", label: "🇹🇼 Chinese (T)" },
];

const PLATFORMS: { id: string; label: string; charLimit: number; icon: string }[] = [
  { id: "instagram", label: "Instagram",   charLimit: 2200, icon: "📸" },
  { id: "linkedin",  label: "LinkedIn",    charLimit: 3000, icon: "💼" },
  { id: "twitter",   label: "X / Twitter", charLimit: 280,  icon: "🐦" },
  { id: "whatsapp",  label: "WhatsApp",    charLimit: 700,  icon: "💬" },
];

const PLATFORM_TIPS: Record<string, PlatformTip> = {
  instagram: { bestTime: "6–9 PM weekdays",  audience: "18–34 year olds",    tip: "Use 5–10 hashtags for best reach. First 125 chars count most." },
  linkedin:  { bestTime: "Tue–Thu 8–10 AM",  audience: "Professionals, B2B", tip: "Long-form content performs well. End with a question to drive comments." },
  twitter:   { bestTime: "12–3 PM weekdays", audience: "News & tech savvy",  tip: "Keep it under 240 chars. Trending hashtags boost impressions 2x." },
  whatsapp:  { bestTime: "Any time",         audience: "Your contacts",       tip: "Personal tone works best. Emojis add warmth without overdoing it." },
};

// ─── Gemini helper ────────────────────────────────────────────────────────────

async function callGemini(apiKey: string, parts: object[]): Promise<string> {
  // Discover models that support generateContent for this API key,
  // then prioritize non-2.0 models to avoid current quota issues.
  const preferredModelOrder = [
    "models/gemini-1.5-flash-latest",
    "models/gemini-1.5-pro-latest",
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro",
    "models/gemini-2.0-flash",
  ];

  const fallbackCandidates = [
    ...preferredModelOrder,
    "models/gemini-2.0-flash-lite",
    "models/gemini-2.0-flash-exp",
  ];

  let discoveredCandidates: string[] = [];
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (listRes.ok) {
      const listData: GeminiModelsResponse = await listRes.json();
      const compatible = (listData?.models ?? [])
        .filter(
          (m) =>
            m?.name &&
            Array.isArray(m?.supportedGenerationMethods) &&
            m.supportedGenerationMethods.includes("generateContent")
        )
        .map((m) => m.name as string);

      const preferred = preferredModelOrder.filter((m) => compatible.includes(m));
      const others = compatible.filter((m: string) => !preferred.includes(m));
      discoveredCandidates = [...preferred, ...others];
    }
  } catch {
    // Ignore listing failures and use static fallbacks below.
  }

  const modelCandidates = discoveredCandidates.length > 0 ? discoveredCandidates : fallbackCandidates;
  let lastError = "Gemini request failed";

  for (const modelName of modelCandidates) {
    const modelPath = modelName.startsWith("models/") ? modelName : `models/${modelName}`;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`,
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
      const err = await res.json().catch(() => ({}));
      lastError = err?.error?.message || `Gemini request failed for ${modelPath}`;
      continue;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;
    lastError = `No content received from ${modelPath}`;
  }

  throw new Error(lastError);
}

// ─── CaptionCraft API helper ───────────────────────────────────────────────────

/**
 * Calls the CaptionCraft API (image-caption-generator2.p.rapidapi.com).
 * Returns an array of Caption objects normalised to the app's format.
 */
async function callCaptionCraft({
  rapidApiKey,
  imageUrl,
  vibe,
  useEmojis,
  useHashtags,
  lang,
}: {
  rapidApiKey: string;
  imageUrl: string;
  vibe: string;
  useEmojis: boolean;
  useHashtags: boolean;
  lang: string;
}): Promise<Caption[]> {
  const res = await fetch("https://image-caption-generator2.p.rapidapi.com/v2/captions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": rapidApiKey,
      "X-RapidAPI-Host": "image-caption-generator2.p.rapidapi.com",
    },
    body: JSON.stringify({
      imageUrl,
      vibe,
      useEmojis,
      useHashtags,
      lang,
      limit: 3,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err?.message || `CaptionCraft API error: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();

  // Normalise varying response shapes into Caption[]
  const raw: CaptionCraftItem[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.captions)
    ? data.captions
    : [];

  const EMOJIS = ["🔥", "✨", "💫"];
  return raw.slice(0, 3).map((item, i) => ({
    text:     item.caption,
    hashtags: item.hashtags ?? [],
    score:    Math.floor(75 + Math.random() * 20), // API doesn't return a score
    emoji:    EMOJIS[i],
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

const GeneratePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Core state
  const [prompt, setPrompt]                     = useState("");
  const [selectedTone, setSelectedTone]         = useState("aesthetic");
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [isGenerating, setIsGenerating]         = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<Caption[]>([]);
  const [copiedIndex, setCopiedIndex]           = useState<number | null>(null);
  const [copiedWithHashtags, setCopiedWithHashtags] = useState(true);

  // Image state
  const [selectedImage, setSelectedImage]   = useState<File | null>(null);
  const [imagePreview, setImagePreview]     = useState<string | null>(null);
  const [imageEncoded, setImageEncoded]     = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CaptionCraft-specific state
  const [imageUrl, setImageUrl]         = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [apiSource, setApiSource]       = useState<"gemini" | "captioncraft">("gemini");

  // Mode toggles
  const [agentMode, setAgentMode]     = useState(false);
  const [researchMode, setResearchMode] = useState(false);
  const [styleMemory, setStyleMemory] = useState(false);
  const [exportOpen, setExportOpen]   = useState(false);

  const { toast } = useToast();
  const templatePrompt = (location.state as GenerateLocationState | null)?.templatePrompt;

  const platform    = PLATFORMS.find((p) => p.id === selectedPlatform)!;
  const platformTip = PLATFORM_TIPS[selectedPlatform];

  useEffect(() => {
    if (!templatePrompt) return;
    setPrompt(templatePrompt);

    // Clear transient route state so refresh/back doesn't re-apply unintentionally.
    navigate(location.pathname, { replace: true, state: null });
  }, [templatePrompt, navigate, location.pathname]);

  // ── API key helper ─────────────────────────────────────────────────────────

  const getApiKey = useCallback(() => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
      toast({
        title: "API Key Missing",
        description: "Add VITE_GEMINI_API_KEY to your .env file.",
        variant: "destructive",
      });
    }
    return key as string | undefined;
  }, [toast]);

  // ── Image handling ─────────────────────────────────────────────────────────

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

  // ── AI: Generate all captions ──────────────────────────────────────────────

  const handleGenerate = async () => {
    const hasImageUrl = imageUrl.trim().startsWith("http");
    if (!prompt.trim() && !selectedImage && !hasImageUrl) return;

    setIsGenerating(true);
    try {
      // ── Route to CaptionCraft when an image URL is supplied ──────────────
      if (hasImageUrl) {
        const ccKey = import.meta.env.VITE_CAPTIONCRAFT_API_KEY;
        if (!ccKey) {
          toast({
            title: "CaptionCraft API Key Missing",
            description: "Add VITE_CAPTIONCRAFT_API_KEY to your .env file.",
            variant: "destructive",
          });
          return;
        }

        const captions = await callCaptionCraft({
          rapidApiKey: ccKey,
          imageUrl:    imageUrl.trim(),
          vibe:        TONE_TO_VIBE[selectedTone] ?? "inspirational",
          useEmojis:   true,
          useHashtags: true,
          lang:        selectedLanguage,
        });

        setGeneratedCaptions(normalizeCaptionsFromApi(captions as unknown[]));
        setApiSource("captioncraft");
        toast({
          title: "Captions Generated! 🖼️",
          description: "CaptionCraft AI analysed your image URL.",
        });
        return;
      }

      // ── Fallback: Gemini for prompt / uploaded image ─────────────────────
      const apiKey = getApiKey();
      if (!apiKey) return;

      const modeNote = researchMode
        ? "Use accurate, research-backed insights and factual language."
        : "Be creative, engaging, and emotionally resonant.";

      const parts: object[] = [
        {
          text: `Generate 3 unique, highly engaging social media captions with the following parameters:
Topic/Description: ${prompt || "Image provided"}
Tone: ${selectedTone}
Platform: ${selectedPlatform}
Character limit: ${platform.charLimit}
Mode: ${modeNote}
Language: ${LANGUAGES.find((l) => l.id === selectedLanguage)?.label ?? "English"}
${styleMemory ? "Apply a consistent personal brand voice: concise, authentic, and value-driven." : ""}

Return ONLY a JSON object with a 'captions' array of 3 objects. Each object MUST have:
- "text": caption text (respect ${platform.charLimit} char limit, write in the specified language)
- "hashtags": array of 4-6 relevant hashtags
- "score": number 70-98 (estimated engagement %)
- "emoji": single relevant emoji for this option`,
        },
      ];

      if (imageEncoded && selectedImage) {
        parts.push({
          inlineData: { mimeType: selectedImage.type, data: imageEncoded },
        });
      }

      const text = await callGemini(apiKey, parts);
      const result = parseGeminiJson<{ captions?: unknown[] } | unknown[]>(text);
      const rawCaptions = Array.isArray(result)
        ? result
        : ((result as { captions?: unknown[] }).captions ?? []);
      const captions = normalizeCaptionsFromApi(rawCaptions);
      if (captions.length === 0) {
        throw new Error("Could not parse captions from the model. Please try again.");
      }
      setGeneratedCaptions(captions);
      setApiSource("gemini");
      toast({
        title: "Captions Generated!",
        description:
          captions.length >= 3
            ? "3 AI-powered captions are ready."
            : `${captions.length} caption${captions.length === 1 ? "" : "s"} ready. Try Regenerate for more variations.`,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error while generating captions";
      toast({ title: "Generation Failed", description: message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Export captions ────────────────────────────────────────────────────────

  const handleExport = () => {
    const content = generatedCaptions
      .map(
        (c, i) =>
          `Option ${i + 1} ${c.emoji} (Score: ${c.score}%)\n${c.text}\n\n${c.hashtags.join(" ")}`
      )
      .join("\n\n---\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "captions.txt";
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
    toast({ title: "Exported! 📄", description: "Captions saved to captions.txt" });
  };

  // ── Copy ───────────────────────────────────────────────────────────────────

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
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {apiSource === "captioncraft" ? "CaptionCraft AI" : "Gemini"} Powered
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Generate <span className="gradient-text">Captions</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Describe your post, choose your vibe, and let AI craft captions that actually perform.
          </p>
        </motion.div>

        {/* Mode toggles bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-4 mb-6 glass-card px-4 py-3"
        >
          {/* Agent mode toggle */}
          <div className="flex items-center gap-2">
            <ToggleLeft className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Agent Mode</span>
            <button
              onClick={() => setAgentMode((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${agentMode ? "bg-primary" : "bg-secondary border border-border"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${agentMode ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Research / Creative mode toggle */}
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {researchMode ? "Research Mode" : "Creative Mode"}
            </span>
            <button
              onClick={() => setResearchMode((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${researchMode ? "bg-primary" : "bg-secondary border border-border"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${researchMode ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Style memory toggle */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Style Memory</span>
            <button
              onClick={() => setStyleMemory((v) => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${styleMemory ? "bg-primary" : "bg-secondary border border-border"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${styleMemory ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Export button */}
          {generatedCaptions.length > 0 && (
            <Button
              variant="outline" size="sm"
              onClick={handleExport}
              className="ml-auto gap-1.5 text-xs border-border/50 text-muted-foreground hover:text-foreground"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          )}
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

              {/* ── Image URL input (CaptionCraft) ─────────────────────── */}
              <div className="mt-3 pt-3 border-t border-border/30">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" />
                  Image URL
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">CaptionCraft</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 h-8 px-3 text-xs rounded-md bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                  />
                  {imageUrl && (
                    <button
                      onClick={() => setImageUrl("")}
                      className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Paste a public image URL to generate captions via CaptionCraft AI.
                </p>
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

            {/* Language */}
            <div className="glass-card p-5">
              <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                🌐 Language
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-medium ml-auto">Both APIs</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedLanguage === lang.id
                        ? "bg-primary/20 text-primary border border-primary/40 shadow-sm"
                        : "bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {lang.label}
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
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${copiedWithHashtags ? "bg-primary" : "bg-secondary border border-border"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${copiedWithHashtags ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={
                (!prompt.trim() && !selectedImage && !imageUrl.trim().startsWith("http")) ||
                isGenerating
              }
              className="w-full h-12 font-display text-base bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90 glow-primary disabled:opacity-40 gap-2"
            >
              {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? "Generating…" : "Generate Captions"}
            </Button>
          </motion.div>

          {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-3 space-y-6"
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

            {/* Skeleton loader with AI avatar */}
            {isGenerating && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="relative w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary animate-spin" style={{ animationDuration: "3s" }} />
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">AI is crafting your captions…</p>
                    <p className="text-xs text-muted-foreground">
                      {researchMode ? "Research mode: fetching sources" : "Creative mode: generating ideas"}
                    </p>
                  </div>
                </div>
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

            {/* Caption cards */}
            <AnimatePresence>
              {!isGenerating && generatedCaptions.map((caption, index) => {
                const charCount = caption.text.length;
                const overLimit = charCount > platform.charLimit;
                return (
                  <motion.article
                    key={`caption-${index}-${caption.text.slice(0, 24)}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="glass-card-hover p-5 scroll-mt-24"
                    aria-label={`Caption option ${index + 1}`}
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0" aria-hidden>
                          {caption.emoji}
                        </span>
                        <h3 className="text-xs font-semibold text-muted-foreground truncate">
                          Option {index + 1}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* Score */}
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          <BarChart3 className="w-3 h-3" />
                          {caption.score}%
                        </span>

                        {/* Char count */}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          overLimit ? "bg-destructive/10 text-destructive" : "bg-secondary/60 text-muted-foreground"
                        }`}>
                          {charCount}/{platform.charLimit}
                        </span>

                        {/* Copy */}
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopy(caption, index)}
                          aria-label={`Copy caption ${index + 1}`}
                        >
                          {copiedIndex === index
                            ? <Check className="w-3.5 h-3.5 text-primary" />
                            : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>

                    {/* Text */}
                    <p className="text-foreground/90 text-sm leading-relaxed mb-3 whitespace-pre-wrap break-words">
                      {caption.text}
                    </p>

                    {/* Hashtags */}
                    {caption.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {caption.hashtags.map((tag, ti) => (
                          <span
                            key={`${index}-${ti}-${tag}`}
                            className="text-xs text-primary/70 font-medium px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={() => navigator.clipboard.writeText(tag)}
                            title="Click to copy hashtag"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                  </motion.article>
                );
              })}
            </AnimatePresence>

            {/* Regenerate All */}
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
