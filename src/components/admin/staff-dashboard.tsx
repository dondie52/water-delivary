"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";
import { staffRoles, type StaffRole } from "@/modules/staff/staff";

type Staff = { id: string; name: string; phone: string; role: StaffRole; active: boolean; createdAt: string };
const inputClass = "h-10 w-full rounded-md border bg-white px-3 text-sm focus-ring";

export function StaffDashboard() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", role: "driver" as StaffRole, pin: "" });
  const [error, setError] = useState<string | null>(null);

  async function loadStaff() {
    const response = await fetch("/api/v1/staff", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) setStaff(payload.data);
    else setError(payload.error ?? "Could not load staff");
  }

  async function createStaff(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/v1/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Could not create staff");
      return;
    }
    setForm({ name: "", phone: "", role: "driver", pin: "" });
    await loadStaff();
  }

  async function updateStaff(id: string, update: Record<string, unknown>) {
    setError(null);
    const response = await fetch(`/api/v1/staff/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(update) });
    const payload = await response.json();
    if (!response.ok) setError(payload.error ?? "Could not update staff");
    await loadStaff();
  }

  useEffect(() => { loadStaff(); }, []);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <form className="h-fit rounded-lg border bg-white p-5 shadow-sm" onSubmit={createStaff}>
          <h1 className="text-xl font-bold text-slate-950">Create staff user</h1>
          <div className="mt-4 grid gap-3">
            <input className={inputClass} placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <input className={inputClass} placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
            <select className={inputClass} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as StaffRole })}>
              {staffRoles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <input className={inputClass} placeholder="PIN/password" type="password" value={form.pin} onChange={(event) => setForm({ ...form, pin: event.target.value })} required />
            <Button>Create staff</Button>
          </div>
          {error ? <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        </form>
        <section className="rounded-lg border bg-white shadow-sm">
          <div className="border-b bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">Staff list</div>
          <div className="divide-y">
            {staff.map((member) => (
              <article key={member.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_120px_120px_220px] md:items-center">
                <div>
                  <p className="font-bold text-slate-950">{member.name}</p>
                  <p className="text-sm text-slate-600">{member.phone}</p>
                </div>
                <p className="text-sm font-semibold capitalize">{member.role}</p>
                <p className={`text-sm font-semibold ${member.active ? "text-emerald-700" : "text-red-700"}`}>{member.active ? "active" : "inactive"}</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" onClick={() => updateStaff(member.id, { active: !member.active })}>{member.active ? "Deactivate" : "Activate"}</Button>
                  <Button type="button" variant="ghost" onClick={() => {
                    const pin = window.prompt("New PIN/password");
                    if (pin) updateStaff(member.id, { pin });
                  }}>Reset PIN</Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
