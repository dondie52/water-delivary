"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, Sparkles, X } from "lucide-react";
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
          className="fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-none"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        className={cn(
          "fixed z-40 flex flex-col items-end gap-3",
          "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6"
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
            "focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-100 bg-white text-primary shadow-md shadow-cyan-900/10 transition-all hover:bg-aqua/55",
            open && "bg-aqua/55"
          )}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
              <Bot className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                <Sparkles className="h-2 w-2" />
              </span>
            </span>
          )}
        </button>
      </div>
    </>
  );
}
