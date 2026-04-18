import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, CheckCircle2, Circle, Loader2, ChevronDown, ChevronUp, Zap } from "lucide-react";

interface AgentStep {
  id: number;
  label: string;
  detail: string;
  status: "pending" | "running" | "done";
}

type AgentContext = {
  platformLabel?: string;
  toneLabel?: string;
  personaLabel?: string;
  targetAudience?: string;
  marketingGoal?: string;
  languageLabel?: string;
  hasImage?: boolean;
  promptSeed?: string;
};

const buildSteps = (task: string, ctx?: AgentContext): AgentStep[] => {
  const platform = ctx?.platformLabel ? ` for ${ctx.platformLabel}` : "";
  const tone = ctx?.toneLabel ? ` (${ctx.toneLabel})` : "";
  const audience = ctx?.targetAudience ? ` Audience: ${ctx.targetAudience}.` : "";
  const goal = ctx?.marketingGoal ? ` Goal: ${ctx.marketingGoal}.` : "";
  const language = ctx?.languageLabel ? ` Language: ${ctx.languageLabel}.` : "";
  const imageNote = ctx?.hasImage ? " Image: provided." : "";

  return [
    { id: 1, label: "Analyzing your request", detail: `Understanding: "${task.slice(0, 70)}${task.length > 70 ? "…" : ""}"`, status: "pending" },
    { id: 2, label: "Locking context", detail: `Applying your settings${platform}${tone}.${audience}${goal}${language}${imageNote}`.trim(), status: "pending" },
    { id: 3, label: "Planning the content", detail: "Choosing structure, hook, CTA, and hashtag strategy", status: "pending" },
    { id: 4, label: "Drafting options", detail: "Writing 3 variations optimized for scroll-stopping clarity", status: "pending" },
    { id: 5, label: "Scoring & tightening", detail: "Reducing fluff, improving specificity, and checking length", status: "pending" },
    { id: 6, label: "Finalizing output", detail: "Delivering a ready-to-post prompt for Generate", status: "pending" },
  ];
};

interface AgentModeProps {
  onComplete: (result: string) => void;
  context?: AgentContext;
}

const RECENTS_KEY = "capsync.agentMode.recentTasks.v1";
const MAX_RECENTS = 3;

function readRecentTasks(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === "string").map((t) => t.trim()).filter(Boolean).slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

function writeRecentTasks(tasks: string[]) {
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(tasks.slice(0, MAX_RECENTS)));
  } catch {
    // ignore
  }
}

const AgentMode = ({ onComplete, context }: AgentModeProps) => {
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [recentTasks, setRecentTasks] = useState<string[]>([]);

  useEffect(() => {
    setRecentTasks(readRecentTasks());
  }, []);

  const suggestions = useMemo(() => {
    const platform = context?.platformLabel ?? "this platform";
    const tone = context?.toneLabel ?? "your tone";
    const persona = context?.personaLabel ? ` as ${context.personaLabel}` : "";
    const audience = context?.targetAudience ? ` for ${context.targetAudience}` : "";
    const goal = context?.marketingGoal ? ` to ${context.marketingGoal}` : "";
    const seed = context?.promptSeed?.trim();
    const seedClause = seed ? ` based on: "${seed}"` : "";
    const imageClause = context?.hasImage ? " Use the uploaded image context too." : "";

    return [
      {
        id: "caption-3",
        label: "3 captions",
        text: `Write 3 ${platform} captions in a ${tone} style${persona}${audience}${goal}${seedClause}.${imageClause}`.trim(),
      },
      {
        id: "hook-cta",
        label: "Hook + CTA",
        text: `Create 3 strong hooks and 3 CTAs for ${platform}${audience}${goal}, matching a ${tone} voice.${seedClause}`.trim(),
      },
      {
        id: "hashtag-set",
        label: "Hashtags",
        text: `Suggest 10 relevant hashtags for ${platform}${audience}${goal}${seedClause}. Group them by broad vs niche.`.trim(),
      },
    ];
  }, [context]);

  const placeholder = useMemo(() => {
    const platform = context?.platformLabel ?? "Instagram";
    const tone = context?.toneLabel ?? "Aesthetic";
    const audience = context?.targetAudience?.trim();
    const goal = context?.marketingGoal?.trim();
    const persona = context?.personaLabel?.trim();
    const seed = context?.promptSeed?.trim();
    const bits = [
      `e.g., Create a ready-to-paste post description for ${platform} (${tone})`,
      persona ? `from the perspective of a ${persona}` : null,
      audience ? `for ${audience}` : null,
      goal ? `to ${goal}` : null,
      seed ? `based on: "${seed.slice(0, 60)}${seed.length > 60 ? "…" : ""}"` : null,
    ].filter(Boolean);
    return `${bits.join(" ")}.`;
  }, [context]);

  const runAgent = () => {
    if (!task.trim()) return;
    const taskToRun = task.trim();
    const initialSteps = buildSteps(task, context);
    setSteps(initialSteps);
    setIsRunning(true);
    setIsDone(false);

    let currentStep = 0;
    const runNext = () => {
      if (currentStep >= initialSteps.length) {
        setIsRunning(false);
        setIsDone(true);
        setRecentTasks((prev) => {
          const next = [taskToRun, ...prev.filter((t) => t !== taskToRun)].slice(0, MAX_RECENTS);
          writeRecentTasks(next);
          return next;
        });
        onComplete(taskToRun);
        return;
      }

      setSteps(prev => prev.map((s, i) =>
        i === currentStep ? { ...s, status: "running" } : s
      ));

      setTimeout(() => {
        setSteps(prev => prev.map((s, i) =>
          i === currentStep ? { ...s, status: "done" } : s
        ));
        currentStep++;
        setTimeout(runNext, 300);
      }, 800 + Math.random() * 600);
    };

    runNext();
  };

  return (
    <div className="glass-card p-5 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold font-display text-foreground">Agent Mode</p>
            <p className="text-xs text-muted-foreground">Multi-step AI task execution</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {!isRunning && !isDone && (
              <div className="space-y-3">
                {recentTasks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Recent
                    </span>
                    {recentTasks.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTask(t)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary/80 hover:text-primary hover:bg-primary/15 transition-colors"
                        title={t}
                      >
                        {t.length > 28 ? `${t.slice(0, 28)}…` : t}
                      </button>
                    ))}
                  </div>
                )}
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setTask(s.text)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
                <Textarea
                  placeholder={placeholder}
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  className="min-h-[80px] bg-background/50 border-border/50 resize-none text-sm"
                />
                <Button
                  onClick={runAgent}
                  disabled={!task.trim()}
                  className="w-full h-9 text-sm bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90"
                >
                  <Zap className="w-3.5 h-3.5 mr-2" />
                  Run Agent Task
                </Button>
              </div>
            )}

            {(isRunning || isDone) && (
              <div className="space-y-2">
                {steps.map((step) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-3 p-2.5 rounded-lg transition-all ${
                      step.status === "running" ? "bg-primary/5 border border-primary/20" :
                      step.status === "done" ? "opacity-70" : "opacity-40"
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {step.status === "done" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      {step.status === "running" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                      {step.status === "pending" && <Circle className="w-4 h-4 text-muted-foreground/40" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.detail}</p>
                    </div>
                  </motion.div>
                ))}
                {isDone && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                    <Button
                      onClick={() => { setSteps([]); setIsDone(false); setTask(""); }}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-border/50"
                    >
                      Run New Agent Task
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentMode;