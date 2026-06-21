"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/layout/admin-nav";
import { Button } from "@/components/ui/button";
type ProductForm = {
  id?: string;
  sku: string;
  name: string;
  category: "bottled_water" | "personalized_water" | "refill" | "service";
  unit: string;
  price: number;
  sortOrder?: number;
  active?: boolean;
  volumeLitres?: number;
  caseSize?: number | null;
};
const inputClass = "h-10 w-full rounded-md border bg-white px-3 text-sm focus-ring";
const blank: ProductForm = { sku: "", name: "", category: "bottled_water", unit: "bottle", price: 0, sortOrder: 0, active: true };

export function ProductsDashboard() {
  const [products, setProducts] = useState<ProductForm[]>([]);
  const [form, setForm] = useState<ProductForm>(blank);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/v1/catalog/products?includeInactive=true", { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) {
      setProducts(payload.data.map((product: ProductForm & { sortOrder?: number }) => ({
        ...product,
        price: Number(product.price ?? 0),
        sortOrder: Number(product.sortOrder ?? 0)
      })));
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/v1/catalog/products", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, unitPrice: form.price, sortOrder: form.sortOrder ?? 0 })
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error ?? "Could not save product");
      return;
    }
    setForm(blank);
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="water-canvas min-h-screen">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
          <form className="h-fit rounded-lg border bg-white p-4 shadow-sm" onSubmit={save}>
            <h2 className="text-lg font-bold">{form.id ? "Edit product" : "Add product"}</h2>
            <div className="mt-4 grid gap-3">
              <input className={inputClass} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" required />
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
              <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductForm["category"] })}>
                {["bottled_water", "personalized_water", "refill", "service"].map((category) => <option key={category} value={category}>{category.replaceAll("_", " ")}</option>)}
              </select>
              <input className={inputClass} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Unit" required />
              <input className={inputClass} type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="Unit price" />
              <input className={inputClass} type="number" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} placeholder="Sort order" />
              <input className={inputClass} type="number" step="0.01" value={form.volumeLitres ?? ""} onChange={(e) => setForm({ ...form, volumeLitres: e.target.value ? Number(e.target.value) : undefined })} placeholder="Volume litres" />
              <input className={inputClass} type="number" value={form.caseSize ?? ""} onChange={(e) => setForm({ ...form, caseSize: e.target.value ? Number(e.target.value) : null })} placeholder="Case size" />
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.active !== false} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
              {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
              <Button>{form.id ? "Save changes" : "Create product"}</Button>
            </div>
          </form>
          <div className="grid gap-3">
            {products.map((product) => (
              <button key={product.sku} className="focus-ring rounded-lg border bg-white p-4 text-left shadow-sm hover:border-primary" onClick={() => setForm(product)}>
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-bold">{product.name}</p><p className="text-sm text-slate-600">{product.sku} - {product.category}</p></div>
                  <p className="text-sm font-black text-primary">P{product.price}</p>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">{product.active === false ? "Inactive" : "Active"} · sort {product.sortOrder ?? 0}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
