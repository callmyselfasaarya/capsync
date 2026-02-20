import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Code2, Linkedin, Twitter, Instagram, Mail, Check } from "lucide-react";

const formats = [
  { id: "markdown", label: "Markdown", icon: FileText, ext: "md", mime: "text/markdown" },
  { id: "html", label: "Blog HTML", icon: Code2, ext: "html", mime: "text/html" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, ext: "txt", mime: "text/plain" },
  { id: "twitter", label: "Twitter Thread", icon: Twitter, ext: "txt", mime: "text/plain" },
  { id: "instagram", label: "Instagram Pack", icon: Instagram, ext: "txt", mime: "text/plain" },
  { id: "email", label: "Email Newsletter", icon: Mail, ext: "html", mime: "text/html" },
];

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  captions: { text: string; hashtags: string[] }[];
}

const formatContent = (format: string, captions: { text: string; hashtags: string[] }[]): string => {
  const texts = captions.map(c => c.text).filter(Boolean);
  const tags = captions[0]?.hashtags?.join(" ") ?? "";

  switch (format) {
    case "markdown":
      return texts.map((t, i) => `## Option ${i + 1}\n\n${t}\n\n${tags}`).join("\n\n---\n\n");
    case "html":
      return `<!DOCTYPE html><html><body>\n${texts.map((t, i) =>
        `<article>\n  <h2>Option ${i + 1}</h2>\n  <p>${t}</p>\n  <p class="hashtags">${tags}</p>\n</article>`
      ).join("\n")}\n</body></html>`;
    case "linkedin":
      return texts.map((t, i) => `--- Post ${i + 1} ---\n\n${t}\n\n${tags}`).join("\n\n");
    case "twitter":
      return texts.flatMap((t) => {
        const chunks: string[] = [];
        let remaining = t;
        while (remaining.length > 240) {
          chunks.push(remaining.slice(0, 240) + "...");
          remaining = remaining.slice(240);
        }
        chunks.push(remaining + "\n" + tags);
        return chunks.map((c, i) => `${i + 1}/${chunks.length} ${c}`);
      }).join("\n\n");
    case "instagram":
      return texts.map((t, i) =>
        `=== Caption ${i + 1} ===\n${t}\n.\n.\n.\n${tags}`
      ).join("\n\n");
    case "email":
      return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">\n${
        texts.map((t, i) => `<div style="margin-bottom:24px;padding:16px;border:1px solid #eee;border-radius:8px;">\n<h3>Option ${i+1}</h3>\n<p>${t}</p>\n<p style="color:#888;">${tags}</p>\n</div>`).join("\n")
      }\n</body></html>`;
    default:
      return texts.join("\n\n");
  }
};

const ExportModal = ({ open, onClose, captions }: ExportModalProps) => {
  const [selected, setSelected] = useState("markdown");
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const format = formats.find(f => f.id === selected)!;
    const content = formatContent(selected, captions);
    const blob = new Blob([content], { type: format.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capsync-captions.${format.ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">Export Captions</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 my-2">
          {formats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setSelected(fmt.id)}
              className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                selected === fmt.id
                  ? "bg-primary/10 border-primary/40 text-foreground"
                  : "bg-background/40 border-border/40 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <fmt.icon className="w-4 h-4 text-primary/70 flex-shrink-0" />
              <span className="text-xs font-medium">{fmt.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-background/40 border border-border/30 rounded-lg p-3 max-h-32 overflow-y-auto">
          <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-5">
            {formatContent(selected, captions).slice(0, 300)}...
          </p>
        </div>

        <Button
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90"
        >
          {downloaded ? (
            <><Check className="w-4 h-4 mr-2" /> Downloaded!</>
          ) : (
            <><Download className="w-4 h-4 mr-2" /> Download {formats.find(f => f.id === selected)?.label}</>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
