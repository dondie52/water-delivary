"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, MessageCircle, Sparkles, X } from "lucide-react";
import { AssistantChatPanel } from "@/components/customer/assistant-chat-panel";
import { cn } from "@/lib/utils";

const HIDDEN_PREFIXES = ["/assistant", "/admin", "/agent"];

export function FloatingAssistantButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (hidden) return null;

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close chat backdrop"
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-none"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        className={cn(
          "fixed z-50 flex flex-col items-end gap-3",
          "bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8"
        )}
      >
        {open ? (
          <AssistantChatPanel
            className="h-[min(560px,calc(100vh-6rem))] w-[min(100vw-2rem,380px)]"
            onClose={() => setOpen(false)}
          />
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close AI chat" : "Open free AI chat"}
          aria-expanded={open}
          className={cn(
            "focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-cyan-100 bg-white text-sm font-semibold text-primary shadow-lg shadow-cyan-900/10 transition-all hover:bg-aqua/55",
            open ? "h-11 w-11" : "h-12 px-4 sm:h-auto sm:px-4 sm:py-3"
          )}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <>
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
                <Bot className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
              </span>
              <span className="hidden sm:inline">
                <span className="block text-left text-sm font-extrabold leading-tight text-[#061a4f]">AI Chat</span>
                <span className="block text-left text-[10px] font-bold uppercase tracking-wide text-emerald-700">Free</span>
              </span>
              <MessageCircle className="h-4 w-4 sm:hidden" />
            </>
          )}
        </button>
      </div>
    </>
  );
}
