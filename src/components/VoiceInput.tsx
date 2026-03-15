import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  textToRead?: string;
}

type VoiceStyle = "podcast" | "narrator" | "storyteller";

const voiceParams: Record<VoiceStyle, { rate: number; pitch: number }> = {
  podcast: { rate: 1.1, pitch: 1.0 },
  narrator: { rate: 0.9, pitch: 0.85 },
  storyteller: { rate: 0.95, pitch: 1.15 },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any;

const VoiceInput = ({ onTranscript, textToRead }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>("podcast");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<AnyRecognition>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const recognition: AnyRecognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: AnyRecognition) => {
      const t = Array.from(event.results as AnyRecognition[]).map((r: AnyRecognition) => r[0].transcript).join("");
      setTranscript(t);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      if (transcript) onTranscript(transcript);
      setTranscript("");
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const readAloud = () => {
    if (!textToRead || !window.speechSynthesis) return;
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(textToRead);
    const params = voiceParams[voiceStyle];
    utterance.rate = params.rate;
    utterance.pitch = params.pitch;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  if (!supported) {
    return (
      <div className="text-xs text-muted-foreground/60 italic p-2">
        Voice input not supported in this browser.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleListening}
          className={`gap-1.5 text-xs border-border/50 transition-all ${
            isListening
              ? "border-destructive/50 text-destructive bg-destructive/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          {isListening ? "Stop" : "Voice Input"}
        </Button>

        {textToRead && (
          <Button
            variant="outline"
            size="sm"
            onClick={readAloud}
            className={`gap-1.5 text-xs border-border/50 transition-all ${
              isSpeaking ? "border-primary/50 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isSpeaking ? "Stop" : "Read Aloud"}
          </Button>
        )}

        {textToRead && (
          <div className="flex gap-1 ml-auto">
            {(["podcast", "narrator", "storyteller"] as VoiceStyle[]).map(style => (
              <button
                key={style}
                onClick={() => setVoiceStyle(style)}
                className={`text-[10px] px-2 py-0.5 rounded-full capitalize transition-all ${
                  voiceStyle === style
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-destructive/5 border border-destructive/20 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs text-destructive font-medium">Listening...</span>
            </div>
            <p className="text-xs text-muted-foreground italic min-h-[20px]">
              {transcript || "Speak now..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;
