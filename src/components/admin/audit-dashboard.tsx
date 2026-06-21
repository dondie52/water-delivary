"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";

type AuditLog = { id: string; action: string; entity_type?: string; staff_name?: string; staff_role?: string; created_at: string };
const inputClass = "h-10 rounded-md border bg-white px-3 text-sm focus-ring";

export function AuditDashboard() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({ staff: "", action: "", date: "", entityType: "" });

  const load = useCallback(async () => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    const response = await fetch(`/api/v1/audit-logs?${params}`, { cache: "no-store" });
    if (response.ok) setLogs((await response.json()).data);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Audit logs</h1>
        <div className="mt-4 grid gap-2 md:grid-cols-5">
          <input className={inputClass} placeholder="Staff" value={filters.staff} onChange={(e) => setFilters({ ...filters, staff: e.target.value })} />
          <input className={inputClass} placeholder="Action" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} />
          <input className={inputClass} placeholder="Entity type" value={filters.entityType} onChange={(e) => setFilters({ ...filters, entityType: e.target.value })} />
          <input className={inputClass} type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
          <div className="flex gap-2"><Button onClick={load}>Filter</Button><Button variant="ghost" onClick={() => downloadCsv("audit-logs.csv", logs)}>CSV</Button></div>
        </div>
        <div className="mt-5 divide-y rounded-lg border bg-white shadow-sm">
          {logs.map((log) => <article key={log.id} className="grid gap-2 p-4 md:grid-cols-[180px_1fr_180px_180px]"><p>{log.action}</p><p>{log.entity_type}</p><p>{log.staff_name} {log.staff_role}</p><p>{new Date(log.created_at).toLocaleString()}</p></article>)}
        </div>
      </section>
    </main>
  );
}
