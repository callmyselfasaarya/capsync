import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Type, Wand2, ChevronRight, ChevronLeft, Download,
  RotateCcw, Lightbulb, Maximize2, Minimize2
} from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import ExportModal from "@/components/ExportModal";

const aiSuggestions = [
  "Consider starting with a bold hook to capture attention immediately.",
  "This paragraph could benefit from more specific details or examples.",
  "Great energy here! A metaphor could make this even more vivid.",
  "Try varying sentence length for better rhythm and readability.",
];

const workflowNodes = [
  { id: "prompt", label: "Prompt", color: "bg-primary/20 border-primary/40 text-primary" },
  { id: "summarize", label: "Summarize", color: "bg-secondary border-border text-foreground" },
  { id: "convert", label: "Convert", color: "bg-secondary border-border text-foreground" },
  { id: "translate", label: "Translate", color: "bg-secondary border-border text-foreground" },
  { id: "export", label: "Export", color: "bg-accent/20 border-accent/40 text-accent" },
];

const EditorPage = () => {
  const [content, setContent] = useState(
    "Start writing your masterpiece here...\n\nLet the ideas flow naturally. CapSync AI will help you refine and enhance your writing in real time."
  );
  const [toneValue, setToneValue] = useState([50]);
  const [creativityValue, setCreativityValue] = useState([70]);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [runningWorkflow, setRunningWorkflow] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const suggestionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelection = (e: React.MouseEvent) => {
    const sel = window.getSelection()?.toString().trim();
    if (sel && sel.length > 5) {
      setSelectedText(sel);
      setShowToolbar(true);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setToolbarPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 44 });
    } else {
      setShowToolbar(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setShowSuggestion(false);
    if (suggestionTimer.current) clearTimeout(suggestionTimer.current);
    suggestionTimer.current = setTimeout(() => {
      setSuggestion(aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)]);
      setShowSuggestion(true);
      setTimeout(() => setShowSuggestion(false), 5000);
    }, 2500);
  };

  const applyAIAction = (action: string) => {
    const actionTexts: Record<string, string> = {
      rewrite: `[Rewritten: ${selectedText}]`,
      expand: selectedText + " — and here's the deeper context that makes this even more compelling...",
      shorten: selectedText.slice(0, Math.floor(selectedText.length * 0.6)) + "...",
      tone: `[Tone adjusted: ${selectedText}]`,
    };
    setContent(prev => prev.replace(selectedText, actionTexts[action] || selectedText));
    setShowToolbar(false);
  };

  const runWorkflow = () => {
    setRunningWorkflow(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < workflowNodes.length) {
        setActiveNode(workflowNodes[i].id);
        i++;
      } else {
        clearInterval(interval);
        setActiveNode(null);
        setRunningWorkflow(false);
      }
    }, 900);
  };

  useEffect(() => {
    return () => { if (suggestionTimer.current) clearTimeout(suggestionTimer.current); };
  }, []);

  return (
    <div className={`min-h-screen bg-background ${focusMode ? "focus-mode" : ""}`}>
      {/* Toolbar */}
      {!focusMode && (
        <div className="fixed top-16 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto flex items-center gap-3 h-12 px-4">
            <div className="flex items-center gap-1">
              <Type className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-display font-semibold text-foreground">Smart Editor</span>
            </div>
            <div className="h-5 w-px bg-border/50" />
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground">Tone: Formal</span>
              <div className="w-28">
                <Slider value={toneValue} onValueChange={setToneValue} min={0} max={100} step={1} />
              </div>
              <span className="text-xs text-muted-foreground">Casual</span>
              <div className="h-5 w-px bg-border/50 mx-1" />
              <span className="text-xs text-muted-foreground">Creativity</span>
              <div className="w-28">
                <Slider value={creativityValue} onValueChange={setCreativityValue} min={0} max={100} step={1} />
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => setFocusMode(true)}>
                <Maximize2 className="w-3.5 h-3.5 mr-1" /> Focus
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs border-border/50 text-muted-foreground hover:text-foreground" onClick={() => setExportOpen(true)}>
                <Download className="w-3.5 h-3.5 mr-1" /> Export
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex ${focusMode ? "pt-0" : "pt-28"} pb-8 h-screen`}>
        {/* Editor Area */}
        <div className={`flex-1 flex flex-col relative px-4 ${focusMode ? "max-w-3xl mx-auto pt-8" : ""}`}>
          {focusMode && (
            <button onClick={() => setFocusMode(false)} className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground transition-colors">
              <Minimize2 className="w-5 h-5" />
            </button>
          )}

          {/* Floating selection toolbar */}
          <AnimatePresence>
            {showToolbar && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute z-50 flex items-center gap-1 glass-card p-1.5 shadow-xl border-primary/20"
                style={{ left: toolbarPos.x, top: toolbarPos.y }}
              >
                {[
                  { action: "rewrite", label: "Rewrite" },
                  { action: "expand", label: "Expand" },
                  { action: "shorten", label: "Shorten" },
                  { action: "tone", label: "Adjust Tone" },
                ].map(({ action, label }) => (
                  <button
                    key={action}
                    onClick={() => applyAIAction(action)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all font-medium"
                  >
                    <Wand2 className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main editor */}
          <div className="flex-1 relative">
            <textarea
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              onMouseUp={handleSelection}
              className="w-full h-full min-h-[500px] bg-card/40 border border-border/40 rounded-xl p-8 text-foreground text-base leading-8 resize-none focus:outline-none focus:border-primary/30 font-body placeholder:text-muted-foreground"
              placeholder="Start writing..."
            />

            {/* AI inline suggestion */}
            <AnimatePresence>
              {showSuggestion && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute bottom-6 right-6 max-w-xs glass-card p-3 border-primary/20"
                >
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{suggestion}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Voice input bar */}
          <div className="mt-3 glass-card p-3">
            <VoiceInput
              onTranscript={(t) => setContent(prev => prev + " " + t)}
              textToRead={content}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <AnimatePresence>
          {sidebarOpen && !focusMode && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden flex-shrink-0"
            >
              <div className="w-72 px-3 space-y-4 overflow-y-auto h-full pb-8">
                {/* Context panel */}
                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-foreground mb-3 font-display">Context Settings</p>
                  <div className="space-y-2">
                    {["Platform: Instagram", "Goal: Engagement", "Audience: Creators"].map(s => (
                      <div key={s} className="text-xs px-2.5 py-1.5 rounded-lg bg-secondary/60 text-muted-foreground">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI suggestions */}
                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-foreground mb-3 font-display flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-primary" />
                    AI Suggestions
                  </p>
                  <div className="space-y-2">
                    {aiSuggestions.slice(0, 2).map((s, i) => (
                      <div key={i} className="text-xs p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-muted-foreground leading-relaxed cursor-pointer hover:bg-primary/10 transition-colors">
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Builder */}
                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-foreground mb-3 font-display">Workflow Builder</p>
                  <div className="flex flex-col gap-2">
                    {workflowNodes.map((node, i) => (
                      <div key={node.id} className="flex items-center gap-2">
                        <div
                          className={`flex-1 text-center text-xs py-2 px-3 rounded-lg border transition-all ${node.color} ${activeNode === node.id ? "animate-node-pulse ring-2 ring-primary" : ""}`}
                        >
                          {node.label}
                        </div>
                        {i < workflowNodes.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-muted-foreground/50 rotate-90 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={runWorkflow}
                    disabled={runningWorkflow}
                    size="sm"
                    className="w-full mt-3 h-8 text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90"
                  >
                    {runningWorkflow ? (
                      <><RotateCcw className="w-3 h-3 mr-1.5 animate-spin" /> Running...</>
                    ) : (
                      "Run Workflow"
                    )}
                  </Button>
                </div>

                {/* Stats */}
                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-foreground mb-3 font-display">Document Stats</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Words", value: content.trim().split(/\s+/).filter(Boolean).length },
                      { label: "Chars", value: content.length },
                      { label: "Sentences", value: content.split(/[.!?]+/).filter(Boolean).length },
                      { label: "Read time", value: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))}m` },
                    ].map(stat => (
                      <div key={stat.label} className="text-center p-2 bg-secondary/40 rounded-lg">
                        <p className="text-lg font-bold font-display text-primary">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        captions={[{ text: content, hashtags: [] }]}
      />
    </div>
  );
};

export default EditorPage;
