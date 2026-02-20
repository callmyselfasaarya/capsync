import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Search, Star, GitFork, TrendingUp, Clock, ArrowRight,
  Bookmark, BookmarkCheck, Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = ["All", "Marketing", "Educational", "Personal", "Storytelling", "Humor", "Motivational"];

const templates = [
  {
    id: 1, title: "Product Launch Hype", category: "Marketing",
    description: "Build excitement for a new product drop with punchy, energetic copy.",
    uses: 4823, stars: 4.9, author: "CapsyncPro", emoji: "🚀",
    prompt: "A brand new [product] is dropping. Generate an exciting Instagram caption that builds FOMO.",
    tags: ["launch", "product", "hype"],
  },
  {
    id: 2, title: "Monday Motivation", category: "Motivational",
    description: "Start the week strong with an inspiring, shareable message.",
    uses: 3241, stars: 4.7, author: "CreatorHub", emoji: "💪",
    prompt: "Write a motivational Monday caption that feels authentic, not cheesy. Focus on growth mindset.",
    tags: ["monday", "motivation", "growth"],
  },
  {
    id: 3, title: "Behind the Scenes", category: "Personal",
    description: "Authentic storytelling about your creative or work process.",
    uses: 2897, stars: 4.8, author: "AuthenticWrite", emoji: "🎬",
    prompt: "Share a behind-the-scenes caption about [your process]. Make it raw and real.",
    tags: ["bts", "authentic", "process"],
  },
  {
    id: 4, title: "Edu-Content Hook", category: "Educational",
    description: "Teach something valuable in a scroll-stopping opener.",
    uses: 5102, stars: 4.6, author: "EduCreators", emoji: "📚",
    prompt: "Write a carousel caption that starts with '3 things I wish I knew about [topic]...'",
    tags: ["education", "carousel", "value"],
  },
  {
    id: 5, title: "Storytime Hook", category: "Storytelling",
    description: "Open a story loop that makes people stop and read to the end.",
    uses: 3678, stars: 4.9, author: "NarrativeAI", emoji: "📖",
    prompt: "Start a caption with a cliffhanger about [your story]. Make the first sentence impossible to scroll past.",
    tags: ["story", "hook", "cliffhanger"],
  },
  {
    id: 6, title: "Relatable Humor", category: "Humor",
    description: "Funny, self-aware captions that make followers feel seen.",
    uses: 6211, stars: 4.8, author: "ViralVoice", emoji: "😂",
    prompt: "Write a funny, relatable caption about [a universal experience]. Use lowercase casual tone.",
    tags: ["humor", "relatable", "viral"],
  },
  {
    id: 7, title: "LinkedIn Thought Leader", category: "Marketing",
    description: "Position yourself as an expert with a bold professional take.",
    uses: 2143, stars: 4.5, author: "LinkedElite", emoji: "💼",
    prompt: "Write a LinkedIn post sharing a contrarian take on [industry topic]. Be confident and data-driven.",
    tags: ["linkedin", "professional", "thought-leadership"],
  },
  {
    id: 8, title: "Community Shoutout", category: "Personal",
    description: "Celebrate your audience or community in a warm, genuine way.",
    uses: 1892, stars: 4.7, author: "CommunityAI", emoji: "🤝",
    prompt: "Thank your community for [milestone] with warmth and specificity. Avoid generic platitudes.",
    tags: ["community", "gratitude", "authentic"],
  },
];

const TemplatesPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"trending" | "newest" | "top">("trending");
  const [saved, setSaved] = useState<number[]>([]);
  const navigate = useNavigate();

  const filtered = templates.filter(t => {
    const matchCat = selectedCategory === "All" || t.category === selectedCategory;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "trending") return b.uses - a.uses;
    if (sortBy === "top") return b.stars - a.stars;
    return b.id - a.id;
  });

  const toggleSave = (id: number) => {
    setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const useTemplate = (template: typeof templates[0]) => {
    navigate("/generate");
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Prompt <span className="gradient-text">Templates</span>
          </h1>
          <p className="text-muted-foreground">Community-crafted prompts. Use, fork, and build on them.</p>
        </motion.div>

        {/* Search & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background/60 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {(["trending", "newest", "top"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full capitalize transition-all ${
                  sortBy === s ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "trending" && <TrendingUp className="w-3 h-3" />}
                {s === "newest" && <Clock className="w-3 h-3" />}
                {s === "top" && <Star className="w-3 h-3" />}
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5 flex flex-col group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{template.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold font-display text-foreground">{template.title}</p>
                    <span className="text-xs text-primary/70 font-medium">{template.category}</span>
                  </div>
                </div>
                <button onClick={() => toggleSave(template.id)} className="text-muted-foreground hover:text-primary transition-colors">
                  {saved.includes(template.id) ? (
                    <BookmarkCheck className="w-4 h-4 text-primary" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">
                {template.description}
              </p>

              {/* Prompt preview */}
              <div className="bg-background/40 border border-border/30 rounded-lg p-2.5 mb-3">
                <p className="text-xs text-muted-foreground/80 italic line-clamp-2">{template.prompt}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground">#{tag}</span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-primary/60 fill-primary/30" />
                  {template.stars}
                </span>
                <span>{template.uses.toLocaleString()} uses</span>
                <span>by @{template.author}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => useTemplate(template)}
                  size="sm"
                  className="flex-1 h-8 text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90"
                >
                  Use Template <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-border/50 text-muted-foreground hover:text-foreground gap-1"
                >
                  <GitFork className="w-3 h-3" /> Fork
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No templates found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
