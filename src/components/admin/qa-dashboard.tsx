"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/layout/admin-nav";

type QaCheck = { id: string; check_key: string; label: string; completed: boolean };

export function QaDashboard() {
  const [checks, setChecks] = useState<QaCheck[]>([]);
  async function load() {
    const response = await fetch("/api/v1/qa-checks", { cache: "no-store" });
    if (response.ok) setChecks((await response.json()).data);
  }
  async function toggle(check: QaCheck) {
    await fetch("/api/v1/qa-checks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checkKey: check.check_key, completed: !check.completed }) });
    await load();
  }
  useEffect(() => { load(); }, []);
  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-3xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">QA checklist</h1>
        <div className="mt-5 space-y-2 rounded-lg border bg-white p-4 shadow-sm">
          {checks.map((check) => <label key={check.id} className="flex items-center gap-3 rounded-md border bg-slate-50 px-3 py-3 text-sm font-semibold"><input type="checkbox" checked={check.completed} onChange={() => toggle(check)} />{check.label}</label>)}
        </div>
      </section>
    </main>
  );
}
