"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";

type AppError = { id: string; route: string; message: string; stack?: string; resolved: boolean; created_at: string };

export function ErrorsDashboard() {
  const [errors, setErrors] = useState<AppError[]>([]);
  async function load() {
    const response = await fetch("/api/v1/app-errors", { cache: "no-store" });
    if (response.ok) setErrors((await response.json()).data);
  }
  async function resolve(id: string) {
    await fetch(`/api/v1/app-errors/${id}`, { method: "PATCH" });
    await load();
  }
  useEffect(() => { load(); }, []);
  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">App errors</h1>
        <div className="mt-5 divide-y rounded-lg border bg-white shadow-sm">
          {errors.length === 0 ? <p className="p-5 text-sm text-slate-600">No errors logged.</p> : errors.map((error) => (
            <article key={error.id} className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="font-bold">{error.route}</p><Button variant="ghost" onClick={() => resolve(error.id)} disabled={error.resolved}>{error.resolved ? "Resolved" : "Mark resolved"}</Button></div>
              <p className="text-sm text-red-700">{error.message}</p>
              <p className="text-xs text-slate-500">{new Date(error.created_at).toLocaleString()}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
