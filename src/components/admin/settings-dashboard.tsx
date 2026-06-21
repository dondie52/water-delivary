"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";
import { defaultPilotSettings, type PilotSettings } from "@/modules/settings/pilot-settings";

const inputClass = "h-10 w-full rounded-md border bg-white px-3 text-sm focus-ring";

export function SettingsDashboard() {
  const [settings, setSettings] = useState<PilotSettings>(defaultPilotSettings);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const response = await fetch("/api/v1/pilot-settings", { cache: "no-store" });
      const payload = await response.json();
      if (response.ok) setSettings(payload.data);
    }
    loadSettings();
  }, []);

  async function save() {
    setMessage(null);
    setError(null);
    const response = await fetch("/api/v1/pilot-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Could not save settings");
      return;
    }
    setMessage("Settings saved.");
  }

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">Pilot Settings</h1>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp number" value={settings.whatsappNumber} onChange={(value) => setSettings({ ...settings, whatsappNumber: value })} />
            <NumberField label="Student delivery fee" value={settings.studentDeliveryFee} onChange={(value) => setSettings({ ...settings, studentDeliveryFee: value })} />
            <NumberField label="Refill price per litre" value={settings.refillPricePerLitre} onChange={(value) => setSettings({ ...settings, refillPricePerLitre: value })} />
            <NumberField label="Extra handling fee" value={settings.extraHandlingFee} onChange={(value) => setSettings({ ...settings, extraHandlingFee: value })} />
            <NumberField label="Slot capacity" value={settings.defaultSlotCapacity} onChange={(value) => setSettings({ ...settings, defaultSlotCapacity: value })} />
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Pilot active
              <select className={inputClass} value={String(settings.pilotActive)} onChange={(event) => setSettings({ ...settings, pilotActive: event.target.value === "true" })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <label className="grid gap-2 sm:col-span-2 text-sm font-semibold text-slate-800">
              Order cutoff message
              <textarea className="min-h-24 rounded-md border bg-white p-3 text-sm focus-ring" value={settings.orderCutoffMessage} onChange={(event) => setSettings({ ...settings, orderCutoffMessage: event.target.value })} />
            </label>
          </div>
          {message ? <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{message}</p> : null}
          {error ? <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
          <Button className="mt-5" onClick={save}>Save settings</Button>
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-800">{label}<input className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-800">{label}<input className={inputClass} type="number" step="0.01" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}
