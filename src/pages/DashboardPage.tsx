import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, Brain, FileText, Users, Plus, Trash2,
  Lightbulb, Upload, Link2, Activity, TrendingUp, PenLine,
  Sparkles, Hash
} from "lucide-react";

// ── Heatmap ──────────────────────────────────────────────────────────────────
const generateHeatmap = () =>
  Array.from({ length: 52 }, () =>
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
  );

const heatColors = [
  "bg-secondary/40",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/70",
  "bg-primary",
];

const HeatmapGrid = () => {
  const data = generateHeatmap();
  return (
    <div className="flex gap-0.5 overflow-x-auto pb-2">
      {data.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-0.5">
          {week.map((val, di) => (
            <div
              key={di}
              className={`heatmap-cell ${heatColors[val]} hover:ring-1 hover:ring-primary/50`}
              title={`${val} captions`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// ── Mini bar chart ────────────────────────────────────────────────────────────
const platformData = [
  { label: "Instagram", pct: 45, color: "bg-primary" },
  { label: "LinkedIn", pct: 30, color: "bg-accent" },
  { label: "X/Twitter", pct: 15, color: "bg-muted-foreground" },
  { label: "WhatsApp", pct: 10, color: "bg-secondary-foreground" },
];

// ── Sample data ───────────────────────────────────────────────────────────────
const sampleDrafts = [
  { id: 1, text: "The future of content isn't about volume — it's about resonance...", date: "Feb 18", platform: "LinkedIn" },
  { id: 2, text: "Golden hour hits different when you're chasing the light ✨", date: "Feb 15", platform: "Instagram" },
  { id: 3, text: "3 things no one tells you about building a personal brand:", date: "Feb 12", platform: "X/Twitter" },
];

const DashboardPage = () => {
  const [ideas, setIdeas] = useState([
    { id: 1, text: "Series on sustainable living tips for Gen Z" },
    { id: 2, text: "Behind-the-scenes of my morning creative ritual" },
    { id: 3, text: "Myth-busting post: AI won't replace creators" },
  ]);
  const [newIdea, setNewIdea] = useState("");
  const [drafts, setDrafts] = useState(sampleDrafts);
  const [uploadedDoc, setUploadedDoc] = useState<string | null>(null);
  const [docQuestion, setDocQuestion] = useState("");
  const [docAnswer, setDocAnswer] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [connectedUsers] = useState([
    { name: "Alex R.", color: "bg-primary" },
    { name: "Sam K.", color: "bg-accent" },
  ]);
  const fileRef = useRef<HTMLInputElement>(null);

  const addIdea = () => {
    if (!newIdea.trim()) return;
    setIdeas(prev => [{ id: Date.now(), text: newIdea }, ...prev]);
    setNewIdea("");
  };

  const removeIdea = (id: number) => setIdeas(prev => prev.filter(i => i.id !== id));
  const removeDraft = (id: number) => setDrafts(prev => prev.filter(d => d.id !== id));

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedDoc(file.name);
  };

  const handleDocQuestion = () => {
    if (!docQuestion.trim()) return;
    setDocAnswer(`Based on "${uploadedDoc}", here's what I found: The document discusses key themes related to your question. Key insight: "${docQuestion.replace("?", "")} is directly addressed in section 2, with strong evidence supporting a multi-faceted approach." — Confidence: 91%`);
  };

  const generateShareLink = () => {
    setShareLink(`https://capsync.app/collab/${Math.random().toString(36).slice(2, 10)}`);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-1">
            Your <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Analytics, second brain, documents, and collaboration.</p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Captions Created", value: "248", icon: PenLine, delta: "+12 this week" },
            { label: "Avg. Score", value: "87%", icon: TrendingUp, delta: "+3% vs last month" },
            { label: "Most Used Tone", value: "Bold", icon: Activity, delta: "42% of sessions" },
            { label: "Top Platform", value: "Instagram", icon: Hash, delta: "45% of exports" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-card p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="w-4 h-4 text-primary/70" />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold font-display text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">{stat.delta}</p>
            </motion.div>
          ))}
        </motion.div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-secondary/50 border border-border/50">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="brain" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-1.5">
              <Brain className="w-3.5 h-3.5" /> Second Brain
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Documents
            </TabsTrigger>
            <TabsTrigger value="collab" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-1.5">
              <Users className="w-3.5 h-3.5" /> Collaborate
            </TabsTrigger>
          </TabsList>

          {/* ── ANALYTICS TAB ── */}
          <TabsContent value="analytics" className="space-y-5">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold font-display text-foreground text-sm">Productivity Heatmap</p>
                <span className="text-xs text-muted-foreground">Last 12 months</span>
              </div>
              <HeatmapGrid />
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-xs text-muted-foreground">Less</span>
                {heatColors.map((c, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                ))}
                <span className="text-xs text-muted-foreground">More</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="glass-card p-5">
                <p className="font-semibold font-display text-foreground text-sm mb-4">Platform Breakdown</p>
                <div className="space-y-3">
                  {platformData.map(p => (
                    <div key={p.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{p.label}</span>
                        <span className="text-foreground font-medium">{p.pct}%</span>
                      </div>
                      <div className="h-2 bg-secondary/60 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.pct}%` }}
                          transition={{ delay: 0.4, duration: 0.8 }}
                          className={`h-full rounded-full ${p.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-5">
                <p className="font-semibold font-display text-foreground text-sm mb-4">Writing Speed</p>
                <div className="flex items-end gap-1 h-24">
                  {[40, 65, 55, 80, 70, 90, 75, 95, 85, 100, 88, 92].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                      className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t-sm transition-colors"
                      title={`Week ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Jan</span><span>Jun</span><span>Dec</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── SECOND BRAIN TAB ── */}
          <TabsContent value="brain" className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Drafts */}
              <div className="glass-card p-5">
                <p className="font-semibold font-display text-foreground text-sm mb-4 flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-primary/70" /> Saved Drafts
                </p>
                <div className="space-y-3">
                  {drafts.map(draft => (
                    <div key={draft.id} className="flex items-start gap-3 p-3 bg-secondary/40 rounded-lg group">
                      <div className="flex-1">
                        <p className="text-xs text-foreground line-clamp-2">{draft.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">{draft.date}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{draft.platform}</span>
                        </div>
                      </div>
                      <button onClick={() => removeDraft(draft.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ideas */}
              <div className="glass-card p-5">
                <p className="font-semibold font-display text-foreground text-sm mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary/70" /> Ideas Board
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add a new idea..."
                    value={newIdea}
                    onChange={e => setNewIdea(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addIdea()}
                    className="flex-1 text-xs px-3 py-2 bg-background/60 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                  />
                  <Button onClick={addIdea} size="sm" className="h-8 w-8 p-0 bg-primary text-primary-foreground">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {ideas.map(idea => (
                      <motion.div
                        key={idea.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2 p-2.5 bg-secondary/40 rounded-lg group"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />
                        <p className="text-xs text-foreground flex-1">{idea.text}</p>
                        <button onClick={() => removeIdea(idea.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs font-medium text-primary mb-1">AI Topic Suggestions</p>
                  <p className="text-xs text-muted-foreground">Based on your notes, try writing about:</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Creator burnout solutions", "Sustainable content schedules", "AI + Human creativity balance"].map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── DOCUMENTS TAB ── */}
          <TabsContent value="documents" className="space-y-5">
            <div className="glass-card p-6">
              {!uploadedDoc ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border/50 rounded-xl p-12 text-center cursor-pointer hover:border-primary/40 transition-colors group"
                >
                  <Upload className="w-10 h-10 text-muted-foreground/50 group-hover:text-primary/60 transition-colors mx-auto mb-3" />
                  <p className="font-medium text-muted-foreground text-sm">Drop PDFs or documents here</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Supports PDF, DOCX, TXT, MD</p>
                  <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.md" onChange={handleDocUpload} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{uploadedDoc}</p>
                      <p className="text-xs text-muted-foreground">Ready for AI analysis · 3 pages detected</p>
                    </div>
                    <button onClick={() => { setUploadedDoc(null); setDocAnswer(""); }} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question about your document..."
                      value={docQuestion}
                      onChange={e => setDocQuestion(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleDocQuestion()}
                      className="flex-1 text-sm px-3 py-2.5 bg-background/60 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                    />
                    <Button onClick={handleDocQuestion} className="bg-primary text-primary-foreground hover:opacity-90 border-0">
                      Ask AI
                    </Button>
                  </div>

                  {docAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-secondary/40 rounded-xl border border-border/30"
                    >
                      <p className="text-xs font-medium text-primary mb-2">AI Response</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{docAnswer}</p>
                    </motion.div>
                  )}

                  <Button variant="outline" className="border-border/50 text-muted-foreground hover:text-foreground gap-2 text-sm">
                    <Sparkles className="w-4 h-4" />
                    Generate captions from this document
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── COLLABORATE TAB ── */}
          <TabsContent value="collab" className="space-y-5">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-semibold font-display text-foreground">Live Collaboration</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Share a session link for real-time co-writing</p>
                </div>
                <div className="flex -space-x-2">
                  {connectedUsers.map((u, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${u.color} flex items-center justify-center text-xs font-bold text-primary-foreground border-2 border-background`} title={u.name}>
                      {u.name[0]}
                    </div>
                  ))}
                </div>
              </div>

              {shareLink ? (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-4">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-sm font-mono text-primary flex-1 truncate">{shareLink}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-primary/30 text-primary hover:bg-primary/10 flex-shrink-0"
                      onClick={() => { navigator.clipboard.writeText(shareLink); }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Link expires in 24 hours · 2 collaborators online</p>
                </div>
              ) : (
                <Button onClick={generateShareLink} className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90 mb-4">
                  <Link2 className="w-4 h-4 mr-2" /> Generate Session Link
                </Button>
              )}

              {/* Collab activity */}
              <div className="space-y-2">
                {[
                  { user: "Alex R.", action: "is typing a new caption...", time: "now", color: "bg-primary" },
                  { user: "Sam K.", action: "suggested: 'Add more emotion to line 2'", time: "2m ago", color: "bg-accent" },
                  { user: "You", action: "edited the hook section", time: "5m ago", color: "bg-secondary-foreground" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                    <div className={`w-6 h-6 rounded-full ${activity.color} flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-primary-foreground`}>
                      {activity.user[0]}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium text-foreground">{activity.user}</span>
                      <span className="text-xs text-muted-foreground"> {activity.action}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/50">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;
