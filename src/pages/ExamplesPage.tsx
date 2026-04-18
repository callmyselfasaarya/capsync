import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Copy, Check, Heart, MessageSquare, Share2, Bookmark,
  TrendingUp, Clock, Filter, Search, ArrowRight,
  Instagram, Linkedin, Twitter, Facebook
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = ["All", "Instagram", "LinkedIn", "Twitter", "Facebook", "TikTok", "YouTube"];
const tones = ["All", "Professional", "Casual", "Funny", "Inspirational", "Educational", "Promotional"];

const examples = [
  {
    id: 1,
    platform: "Instagram",
    tone: "Inspirational",
    caption: "Sunsets are proof that endings can be beautiful too. ✨ Chasing golden hours and quiet moments — because the best things in life aren't things.",
    hashtags: ["#goldenhour", "#aesthetic", "#sunsetvibes", "#peacefulmoments"],
    likes: 2847,
    comments: 192,
    shares: 89,
    engagement: "92%",
    author: "@wanderlust_soul",
    timestamp: "2 hours ago",
    image: "🌅"
  },
  {
    id: 2,
    platform: "LinkedIn",
    tone: "Professional",
    caption: "3 leadership lessons I learned from my biggest failure:\n\n1. Vulnerability builds trust\n2. Admitting mistakes shows strength\n3. The best ideas come from collaboration\n\nSometimes the most valuable lessons come from moments that feel like defeats. What's one failure that taught you something unexpected?",
    hashtags: ["#leadership", "#professionaldevelopment", "#career", "#mindset"],
    likes: 1523,
    comments: 87,
    shares: 234,
    engagement: "78%",
    author: "@executive_mindset",
    timestamp: "5 hours ago",
    image: "💼"
  },
  {
    id: 3,
    platform: "Twitter",
    tone: "Funny",
    caption: "My brain has two modes:\n\n1. 'I should be productive'\n2. 'What if I learned to bake sourdough from scratch at 2 AM?'",
    hashtags: ["#relatable", "#procrastination", "#adulting"],
    likes: 8934,
    comments: 412,
    shares: 1203,
    engagement: "89%",
    author: "@comedy_gold",
    timestamp: "1 hour ago",
    image: "😂"
  },
  {
    id: 4,
    platform: "Instagram",
    tone: "Educational",
    caption: "Did you know? The average person spends 2.5 hours daily on social media. That's 7.5 years of your life! 🤯\n\nHere's how to make that time count:\n• Follow accounts that inspire you\n• Engage meaningfully, not mindlessly\n• Set intentional time limits\n• Create before you consume\n\nYour attention is your most valuable asset. Spend it wisely.",
    hashtags: ["#digitalwellness", "#mindfulliving", "#productivity", "#socialmediatips"],
    likes: 3421,
    comments: 156,
    shares: 298,
    engagement: "85%",
    author: "@wellness_guru",
    timestamp: "3 hours ago",
    image: "📱"
  },
  {
    id: 5,
    platform: "Facebook",
    tone: "Promotional",
    caption: "🎉 LIMITED TIME OFFER! 🎉\n\nGet 30% OFF our best-selling productivity bundle! Perfect for:\n✅ Students heading back to school\n✅ Professionals leveling up their skills\n✅ Anyone looking to crush their goals\n\nUse code: SUCCESS30\n\nSale ends Friday! Don't miss out on transforming your productivity game. 🚀",
    hashtags: ["#sale", "#discount", "#productivity", "#limitedtime"],
    likes: 567,
    comments: 43,
    shares: 78,
    engagement: "72%",
    author: "@productivity_pro",
    timestamp: "6 hours ago",
    image: "🛍️"
  },
  {
    id: 6,
    platform: "TikTok",
    tone: "Casual",
    caption: "POV: You finally mastered that recipe you've been failing at for weeks 🍝✨\n\nTag someone who needs this confidence boost! We love to see it 🙌",
    hashtags: ["#cooking", "#success", "#kitchenhacks", "#relatable"],
    likes: 12543,
    comments: 892,
    shares: 2341,
    engagement: "94%",
    author: "@foodie_adventures",
    timestamp: "30 minutes ago",
    image: "👨‍🍳"
  }
];

const platformIcons = {
  Instagram: <Instagram className="w-4 h-4" />,
  LinkedIn: <Linkedin className="w-4 h-4" />,
  Twitter: <Twitter className="w-4 h-4" />,
  Facebook: <Facebook className="w-4 h-4" />,
  TikTok: <span className="text-sm">🎵</span>,
  YouTube: <span className="text-sm">📺</span>
};

const ExamplesPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTone, setSelectedTone] = useState("All");
  const [sortBy, setSortBy] = useState<"trending" | "newest" | "engagement">("trending");
  const [copied, setCopied] = useState<number | null>(null);
  const [saved, setSaved] = useState<number[]>([]);
  const navigate = useNavigate();

  const filtered = examples.filter(example => {
    const matchCategory = selectedCategory === "All" || example.platform === selectedCategory;
    const matchTone = selectedTone === "All" || example.tone === selectedTone;
    const matchSearch = example.caption.toLowerCase().includes(search.toLowerCase()) ||
      example.hashtags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchTone && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "trending") return b.likes - a.likes;
    if (sortBy === "engagement") return parseFloat(b.engagement) - parseFloat(a.engagement);
    return 0;
  });

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSave = (id: number) => {
    setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const useAsTemplate = (example: typeof examples[0]) => {
    navigate("/generate", {
      state: {
        templatePrompt: `Write a ${example.tone.toLowerCase()} ${example.platform.toLowerCase()} caption similar to: "${example.caption.substring(0, 100)}..."`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            Caption <span className="gradient-text">Examples</span>
          </h1>
          <p className="text-muted-foreground">Real-world examples that drive engagement. Learn from what works.</p>
        </motion.div>

        {/* Search & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search examples..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background/60 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {(["trending", "engagement", "newest"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full capitalize transition-all ${
                    sortBy === s ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s === "trending" && <TrendingUp className="w-3 h-3" />}
                  {s === "engagement" && <Heart className="w-3 h-3" />}
                  {s === "newest" && <Clock className="w-3 h-3" />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Category and Tone Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
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
          <div className="flex flex-wrap gap-2">
            {tones.map(tone => (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedTone === tone
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground"
                }`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        {/* Examples Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filtered.map((example, i) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-6 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{example.image}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      {platformIcons[example.platform as keyof typeof platformIcons]}
                      <span className="text-sm font-semibold text-foreground">{example.platform}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                        {example.tone}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{example.author} • {example.timestamp}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleSave(example.id)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {saved.includes(example.id) ? (
                    <Bookmark className="w-4 h-4 text-primary fill-primary" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Caption */}
              <div className="mb-4">
                <p className="text-foreground leading-relaxed text-sm">{example.caption}</p>
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {example.hashtags.map(tag => (
                  <span key={tag} className="text-xs text-primary/80 hover:text-primary transition-colors cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4 p-3 bg-background/40 rounded-lg border border-border/30">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-500" />
                    {example.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-blue-500" />
                    {example.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3 text-green-500" />
                    {example.shares}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                  {example.engagement} engagement
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(example.caption + "\n\n" + example.hashtags.join(" "), example.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs border-border/50 text-muted-foreground hover:text-foreground gap-1"
                >
                  {copied === example.id ? (
                    <>
                      <Check className="w-3 h-3" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => useAsTemplate(example)}
                  size="sm"
                  className="flex-1 h-8 text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90 gap-1"
                >
                  Use as Template <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No examples found</p>
            <p className="text-sm mt-1">Try different filters or search terms</p>
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-4">
              Ready to create your own viral captions?
            </h2>
            <p className="text-muted-foreground mb-6">
              Use these examples as inspiration and let AI help you craft the perfect caption for your audience.
            </p>
            <Button 
              onClick={() => navigate("/generate")}
              size="lg" 
              className="font-display bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90 px-8 h-12"
            >
              Start Creating <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamplesPage;
