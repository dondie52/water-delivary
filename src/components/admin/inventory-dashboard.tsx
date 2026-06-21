"use client";

import { useEffect, useState } from "react";
import { Boxes, Pencil } from "lucide-react";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { downloadCsv } from "@/lib/csv";
import { InventoryItem, InventoryItemInput, inventoryCategories } from "@/modules/inventory/inventory";

const inputClass = "h-10 w-full rounded-md border bg-white px-3 text-sm focus-ring";

const emptyForm: InventoryItemInput = {
  sku: "",
  name: "",
  category: "finished_goods",
  unit: "unit",
  currentQuantity: 0,
  reorderPoint: 0
};

export function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState<InventoryItemInput>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/inventory", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load inventory");
      }

      setItems(payload.data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load inventory");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save inventory item");
      }

      setForm(emptyForm);
      await loadItems();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not save inventory item");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  const lowStockItems = items.filter((item) => item.isLowStock);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Boxes className="h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="mt-3 text-2xl font-bold text-slate-950">Inventory</h1>
          <p className="mt-1 text-sm text-slate-600">Track daily stock levels and low-stock alerts.</p>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[380px_1fr] lg:px-8">
        <form className="h-fit rounded-lg border bg-white p-5 shadow-sm" onSubmit={saveItem}>
          <h2 className="text-lg font-bold text-slate-950">{form.id ? "Edit item" : "Add item"}</h2>
          <div className="mt-4 grid gap-3">
            <input className={inputClass} value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} placeholder="SKU" required />
            <input className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Item name" required />
            <select className={inputClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as InventoryItemInput["category"] })}>
              {inventoryCategories.map((category) => <option key={category} value={category}>{category.replaceAll("_", " ")}</option>)}
            </select>
            <input className={inputClass} value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="Unit" required />
            <input className={inputClass} type="number" min="0" step="0.01" value={form.currentQuantity} onChange={(event) => setForm({ ...form, currentQuantity: Number(event.target.value) })} placeholder="Current quantity" />
            <input className={inputClass} type="number" min="0" step="0.01" value={form.reorderPoint} onChange={(event) => setForm({ ...form, reorderPoint: Number(event.target.value) })} placeholder="Reorder level" />
            <Button disabled={isSaving}>{isSaving ? "Saving..." : "Save item"}</Button>
          </div>
          {error ? <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        </form>

        <div className="space-y-5">
          <section className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950">Low stock alerts</h2>
            <Button type="button" variant="ghost" onClick={() => downloadCsv("fresh-water-inventory.csv", items)}>
              Export CSV
            </Button>
          </div>
            <div className="mt-4 grid gap-2">
              {lowStockItems.length === 0 ? <p className="text-sm text-slate-600">No low stock items right now.</p> : lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border bg-red-50 px-3 py-2">
                  <span className="text-sm font-semibold text-red-900">{item.name}</span>
                  <StatusPill tone="critical">{item.currentQuantity} {item.unit}</StatusPill>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="border-b bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">Inventory items</div>
            {isLoading ? <p className="p-5 text-sm font-semibold text-slate-600">Loading inventory...</p> : items.length === 0 ? <p className="p-5 text-sm text-slate-600">No inventory items yet.</p> : (
              <div className="divide-y">
                {items.map((item) => (
                  <article key={item.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_140px_140px_90px] md:items-center">
                    <div>
                      <p className="font-bold text-slate-950">{item.name}</p>
                      <p className="text-sm text-slate-600">{item.sku} - {item.category.replaceAll("_", " ")}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{item.currentQuantity} {item.unit}</p>
                    <p className="text-sm text-slate-600">Reorder: {item.reorderPoint}</p>
                    <Button type="button" variant="ghost" onClick={() => setForm(item)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
