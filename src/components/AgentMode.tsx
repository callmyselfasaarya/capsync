import { useState } from "react";
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

const buildSteps = (task: string): AgentStep[] => [
  { id: 1, label: "Analyzing task", detail: `Understanding: "${task.slice(0, 50)}..."`, status: "pending" },
  { id: 2, label: "Breaking into subtasks", detail: "Identifying key components & tone requirements", status: "pending" },
  { id: 3, label: "Researching context", detail: "Fetching relevant trends and platform best practices", status: "pending" },
  { id: 4, label: "Drafting captions", detail: "Generating 3 high-engagement variations", status: "pending" },
  { id: 5, label: "Scoring & ranking", detail: "Running engagement prediction model", status: "pending" },
  { id: 6, label: "Finalizing output", detail: "Assembling final result with hashtags & analytics", status: "pending" },
];

interface AgentModeProps {
  onComplete: (result: string) => void;
}

const AgentMode = ({ onComplete }: AgentModeProps) => {
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const runAgent = () => {
    if (!task.trim()) return;
    const initialSteps = buildSteps(task);
    setSteps(initialSteps);
    setIsRunning(true);
    setIsDone(false);

    let currentStep = 0;
    const runNext = () => {
      if (currentStep >= initialSteps.length) {
        setIsRunning(false);
        setIsDone(true);
        onComplete(task);
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
                <Textarea
                  placeholder="e.g., Research 5 competitors in sustainable fashion and write a comparison LinkedIn post with hashtags..."
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
