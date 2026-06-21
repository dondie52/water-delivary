import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeProductRow, priceBook } from "@/modules/catalog/pricing";

export async function loadCatalogProducts(includeInactive = false) {
  const supabase = createAdminClient();
  if (!supabase) return priceBook.filter((item) => includeInactive || item.active !== false);

  let productsQuery = supabase
    .from("products")
    .select("id, sku, name, category, unit, volume_litres, case_size, active, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (!includeInactive) productsQuery = productsQuery.eq("active", true);

  const [{ data: products, error }, { data: priceBookRow }] = await Promise.all([
    productsQuery,
    supabase.from("price_books").select("id").eq("name", "Retail BWP 2026").eq("segment", "retail").maybeSingle()
  ]);

  if (error || !products) return priceBook.filter((item) => includeInactive || item.active !== false);

  const productIds = products.map((product) => product.id);
  const { data: prices } = productIds.length > 0 && priceBookRow?.id
    ? await supabase.from("price_book_items").select("product_id, unit_price").eq("price_book_id", priceBookRow.id).in("product_id", productIds)
    : { data: [] as Array<{ product_id: string; unit_price: number }> };
  const priceByProduct = new Map((prices ?? []).map((item) => [String(item.product_id), Number(item.unit_price)]));

  return products.map((product) => normalizeProductRow({ ...product, unit_price: priceByProduct.get(String(product.id)) ?? 0 }));
}
