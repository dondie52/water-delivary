"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { ASSISTANT_QUICK_PROMPTS, ASSISTANT_WELCOME } from "@/lib/assistant/fresh-water-knowledge";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function renderMessageContent(content: string) {
  const parts = content.split(/(\/[\w?=&-]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith("/")) {
      return (
        <Link key={index} href={part} className="font-semibold text-primary underline underline-offset-2">
          {part}
        </Link>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function AssistantChatPanel({
  className,
  onClose,
  showClose = true
}: {
  className?: string;
  onClose?: () => void;
  showClose?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: ASSISTANT_WELCOME }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (showClose) inputRef.current?.focus();
  }, [showClose]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not get a reply");
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: payload.data.reply
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I couldn't respond right now. Try again or WhatsApp us at +267 75 909 515."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-xl shadow-cyan-900/10 ring-1 ring-cyan-100/80",
        className
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-cyan-100 bg-aqua/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-extrabold text-[#061a4f]">Fresh Water AI</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                <Sparkles className="h-3 w-3" />
                Free
              </span>
            </div>
            <p className="text-xs text-primary/70">Prices, pickup, delivery & orders</p>
          </div>
        </div>
        {showClose && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-white text-primary hover:bg-aqua/50"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-white px-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6",
                message.role === "user"
                  ? "bg-primary text-white"
                  : "border border-cyan-100 bg-aqua/35 text-[#061a4f]"
              )}
            >
              {message.role === "assistant" ? renderMessageContent(message.content) : message.content}
            </div>
          </div>
        ))}
        {isLoading ? (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-100 bg-aqua/35 px-3.5 py-2.5 text-sm text-primary/75">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          </div>
        ) : null}
      </div>

      {messages.length <= 1 ? (
        <div className="flex flex-wrap gap-2 border-t border-cyan-100 bg-aqua/20 px-3 py-2.5">
          {ASSISTANT_QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendMessage(prompt)}
              className="focus-ring rounded-full border border-cyan-100 bg-white px-3 py-1.5 text-xs font-semibold text-primary hover:border-primary/30 hover:bg-aqua/45"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="border-t border-cyan-100 bg-white p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage(input);
              }
            }}
            rows={1}
            placeholder="Ask about water, prices, or delivery..."
            className="focus-ring max-h-24 min-h-11 flex-1 resize-none rounded-xl border border-cyan-100 bg-aqua/20 px-3 py-2.5 text-sm text-[#061a4f] placeholder:text-primary/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-primary/55">
          Free AI assistant · No login ·{" "}
          <Link href="/order" className="font-semibold text-primary hover:underline">
            Order now
          </Link>
        </p>
      </form>
    </div>
  );
}
