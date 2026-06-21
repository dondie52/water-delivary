"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { AgentChat, createAgentChat } from "@21st-sdk/nextjs";
import type { Chat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import "@21st-sdk/react/styles.css";
import { CustomerShell } from "@/components/customer/customer-shell";
import theme from "./theme.json";

const chat = createAgentChat({
  agent: "fresh-water-assistant",
  tokenUrl: "/api/an-token",
});

export function AssistantChat({ configured }: { configured: boolean }) {
  const { messages, sendMessage, status, stop, error } = useChat({
    chat: chat as Chat<UIMessage>,
  });

  const resolvedTheme = useMemo(
    () => ({
      ...theme,
      theme: {
        ...theme.theme,
        "--an-input-placeholder": "Ask about prices, pickup, delivery, or orders...",
        "--an-max-width": "100%",
      },
    }),
    []
  );

  if (!configured) {
    return (
      <CustomerShell showAssistant={false} className="water-canvas min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <Link
            href="/"
            className="focus-ring mb-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Fresh Water Market
          </Link>
          <div className="customer-card border-amber-200 bg-amber-50">
            <h1 className="text-xl font-black text-slate-950">Fresh Water Assistant</h1>
            <p className="mt-3 text-sm font-semibold text-amber-900">
              Assistant is not configured yet. Please add API_KEY_21ST.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Add your key to <code className="rounded bg-white px-1.5 py-0.5 text-xs">.env.local</code> on the server, then restart the app.
            </p>
          </div>
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell showAssistant={false} className="water-canvas min-h-screen">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="focus-ring mb-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Fresh Water Market
        </Link>
        <div className="mb-4">
          <h1 className="text-2xl font-black text-slate-950">Fresh Water Assistant</h1>
          <p className="mt-1 text-sm text-slate-600">
            Ask about prices, pickup points, delivery slots, or how to order.
          </p>
        </div>
        <div className="flex min-h-[min(640px,calc(100vh-12rem))] flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5">
          <AgentChat
            messages={messages}
            onSend={(message) =>
              sendMessage({
                role: "user",
                parts: [{ type: "text", text: message.content }],
              })
            }
            status={status}
            onStop={stop}
            error={error ?? undefined}
            theme={resolvedTheme}
            className="h-full"
          />
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Ready to order?{" "}
          <Link href="/order" className="font-semibold text-primary hover:underline">
            Start an order
          </Link>{" "}
          or{" "}
          <Link href="/track" className="font-semibold text-primary hover:underline">
            track yours
          </Link>
          .
        </p>
      </div>
    </CustomerShell>
  );
}
