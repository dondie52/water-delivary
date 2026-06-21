"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/layout/admin-nav";
import { StatusPill } from "@/components/ui/status-pill";

type Readiness = { env: Record<string, boolean>; supabaseConnected: boolean; migrationCheck: string; seed: Record<string, number> };

export function DeploymentDashboard() {
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  useEffect(() => { fetch("/api/v1/deployment-readiness", { cache: "no-store" }).then((r) => r.json()).then((p) => setReadiness(p.data)); }, []);
  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-4xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Deployment readiness</h1>
        {!readiness ? <p className="mt-4 text-sm">Loading...</p> : (
          <div className="mt-5 grid gap-5">
            <Card title="Environment variables">{Object.entries(readiness.env).map(([key, ok]) => <Row key={key} label={key} ok={ok} />)}</Card>
            <Card title="Supabase and seed data">
              <Row label="Supabase connected" ok={readiness.supabaseConnected} />
              <p className="text-sm">Migration check: {readiness.migrationCheck}</p>
              {Object.entries(readiness.seed).map(([key, count]) => <p key={key} className="text-sm">{key}: {count}</p>)}
            </Card>
            <Card title="Vercel deployment steps">
              <ol className="list-decimal space-y-1 pl-5 text-sm">
                <li>Push this repo to GitHub.</li>
                <li>Create a Vercel project from the repo.</li>
                <li>Add all environment variables from `.env.example`.</li>
                <li>Run Supabase migrations through `0007` and seed data.</li>
                <li>Open `/admin/deployment`, `/admin/qa`, and test protected routes.</li>
              </ol>
            </Card>
          </div>
        )}
      </section>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border bg-white p-5 shadow-sm"><h2 className="mb-3 text-lg font-bold">{title}</h2>{children}</section>;
}

function Row({ label, ok }: { label: string; ok: boolean }) {
  return <div className="mb-2 flex items-center justify-between gap-3"><span className="text-sm font-semibold">{label}</span><StatusPill tone={ok ? "good" : "critical"}>{ok ? "present" : "missing"}</StatusPill></div>;
}
