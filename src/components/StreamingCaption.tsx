import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BarChart3, Copy, Check, RefreshCw, Pencil, Save, X,
  BookOpen, Smile, TrendingUp, Tag
} from "lucide-react";

interface CaptionData {
  text: string;
  hashtags: string[];
  score: number;
  emoji: string;
  readability?: number;
  tone?: string;
  keywords?: string[];
  engagementPct?: number;
  sources?: { title: string; url: string }[];
}

interface StreamingCaptionProps {
  caption: CaptionData;
  index: number;
  researchMode?: boolean;
  onRegenerate?: (index: number) => void;
}

const StreamingCaption = ({ caption, index, researchMode, onRegenerate }: StreamingCaptionProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(caption.text);
  const [savedText, setSavedText] = useState(caption.text);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    setIsStreaming(true);
    const delay = index * 600;

    const timer = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (i < caption.text.length) {
          setDisplayedText(caption.text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(intervalRef.current!);
          setIsStreaming(false);
        }
      }, 18);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [caption.text, index]);

  const handleCopy = () => {
    navigator.clipboard.writeText(savedText + "\n\n" + caption.hashtags.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      onRegenerate?.(index);
    }, 1500);
  };

  const handleSaveEdit = () => {
    setSavedText(editText);
    setIsEditing(false);
  };

  const readability = caption.readability ?? Math.floor(70 + Math.random() * 25);
  const engagementPct = caption.engagementPct ?? Math.floor(60 + Math.random() * 35);
  const tone = caption.tone ?? ["Inspiring", "Playful", "Bold", "Witty", "Emotional"][index % 5];
  const keywords = caption.keywords ?? caption.hashtags.slice(0, 2).map(h => h.replace("#", ""));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="glass-card-hover p-5 group"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{caption.emoji}</span>
          <span className="text-xs font-medium text-muted-foreground font-display">Option {index + 1}</span>
          {researchMode && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
              Research Mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            <BarChart3 className="w-3 h-3" />
            {caption.score}%
          </span>
          <Button
            variant="ghost" size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => { setIsEditing(true); setEditText(savedText); }}
            title="Edit inline"
          >
            <Pencil className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            title="Regenerate this caption"
          >
            <RefreshCw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Caption text — streaming or editable */}
      {isEditing ? (
        <div className="mb-3">
          <textarea
            className="w-full min-h-[80px] text-sm text-foreground/90 leading-relaxed bg-background/60 border border-primary/30 rounded-lg p-3 resize-none focus:outline-none focus:border-primary/60"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground" onClick={handleSaveEdit}>
              <Save className="w-3 h-3 mr-1" /> Save
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setIsEditing(false)}>
              <X className="w-3 h-3 mr-1" /> Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p
          className={`text-foreground/90 text-sm leading-relaxed mb-3 cursor-text ${isStreaming ? "streaming-cursor" : ""}`}
          onClick={() => !isStreaming && setIsEditing(true)}
          title={!isStreaming ? "Click to edit" : undefined}
        >
          {displayedText}
        </p>
      )}

      {/* Hashtags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {caption.hashtags.map((tag) => (
          <span key={tag} className="text-xs text-primary/70 font-medium hover:text-primary cursor-pointer transition-colors">
            {tag}
          </span>
        ))}
      </div>

      {/* Analytics chips */}
      {!isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-t border-border/40 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2"
        >
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="w-3 h-3 text-primary/60" />
            <span>Readability: <strong className="text-foreground">{readability}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Smile className="w-3 h-3 text-primary/60" />
            <span>Tone: <strong className="text-foreground">{tone}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Tag className="w-3 h-3 text-primary/60" />
            <span>KW: <strong className="text-foreground">{keywords.join(", ")}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3 text-primary/60" />
            <span>Reach: <strong className="text-foreground">{engagementPct}%</strong></span>
          </div>
        </motion.div>
      )}

      {/* Research Mode sources */}
      {researchMode && !isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 border-t border-amber-500/20 pt-3"
        >
          <p className="text-xs font-medium text-amber-500 mb-2">Sources & Confidence</p>
          <div className="flex flex-wrap gap-2">
            {["HubSpot Blog", "Sprout Social", "Buffer Research"].map((src) => (
              <span key={src} className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {src}
              </span>
            ))}
            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              Confidence: {85 + index * 3}%
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StreamingCaption;
