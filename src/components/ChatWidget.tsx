import { useEffect, useRef, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircleIcon, SendIcon, XIcon, SparklesIcon } from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey, I'm Nights — your VanCity guide. Ask me about bars, clubs, restaurants, or daytime stuff around Vancouver.",
    },
  ]);
  const [busy, setBusy] = useState(false);

  const chatAction = useAction(api.chat.chat);
  const seedKnowledge = useMutation(api.knowledge.seed);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    seedKnowledge().catch(() => {
      // Ignore seed errors (already seeded)
    });
  }, [seedKnowledge]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || busy) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setBusy(true);

    try {
      const reply = await chatAction({ message: text });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't reach the assistant right now. Try again in a moment.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <Button
        aria-label="Open chat assistant"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full shadow-lg shadow-primary/30"
      >
        {open ? <XIcon /> : <MessageCircleIcon />}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-20 right-5 z-50 flex h-[480px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-border bg-primary/10 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <SparklesIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Nights</p>
                <p className="text-xs text-muted-foreground">
                  VanCity's local AI guide
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {msg.content}
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-1.5 px-1 py-1 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:240ms]" />
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about tonight's plans..."
                className="h-9"
              />
              <Button
                type="submit"
                size="icon"
                disabled={busy || !input.trim()}
                aria-label="Send message"
              >
                <SendIcon />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}