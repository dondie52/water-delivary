"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { AdminNav } from "@/components/layout/admin-nav";

type ChecklistItem = { label: string; pass: boolean };

export function LaunchChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/v1/launch-checklist", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Could not load checklist");
        return;
      }
      setItems(payload.data);
    }
    load();
  }, []);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">Launch Checklist</h1>
          {error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
          <div className="mt-5 space-y-2">
            {items.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-3">
                <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                {item.pass ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
