import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadCatalogProducts } from "@/lib/catalog/load-catalog-products";
import { requireStaffRole } from "@/lib/auth/require-staff";

const productSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().trim().min(2).max(80),
  name: z.string().trim().min(2).max(160),
  category: z.enum(["bottled_water", "personalized_water", "refill", "ice", "service"]),
  unit: z.string().trim().min(2).max(40),
  volumeLitres: z.coerce.number().min(0).optional().nullable(),
  caseSize: z.coerce.number().int().min(0).optional().nullable(),
  unitPrice: z.coerce.number().min(0),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  active: z.boolean()
});

async function getRetailPriceBookId(supabase: NonNullable<ReturnType<typeof createAdminClient>>) {
  const { data: existing } = await supabase
    .from("price_books")
    .select("id")
    .eq("name", "Retail BWP 2026")
    .eq("segment", "retail")
    .maybeSingle();

  if (existing?.id) return String(existing.id);

  const { data, error } = await supabase
    .from("price_books")
    .insert({ name: "Retail BWP 2026", segment: "retail", currency: "BWP", active_from: new Date().toISOString().slice(0, 10) })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not create retail price book");

  return String(data.id);
}

async function findSkuConflict(supabase: NonNullable<ReturnType<typeof createAdminClient>>, sku: string, excludeId?: string) {
  let query = supabase.from("products").select("id").eq("sku", sku.toUpperCase());
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.maybeSingle();
  return data?.id ? String(data.id) : null;
}

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const includeInactive = request.nextUrl.searchParams.get("includeInactive") === "true";
  if (includeInactive) {
    if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
    const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
    if ("response" in auth) return auth.response;
  }
  const data = await loadCatalogProducts(includeInactive);

  return NextResponse.json({
    data,
    meta: {
      currency: "BWP",
      count: data.length
    }
  });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;

  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid product", details: parsed.error.flatten() }, { status: 400 });

  const sku = parsed.data.sku.toUpperCase();
  const existingId = await findSkuConflict(supabase, sku);
  if (existingId) return NextResponse.json({ error: "A product with this SKU already exists. Edit the existing product instead." }, { status: 409 });

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      sku,
      name: parsed.data.name,
      category: parsed.data.category,
      unit: parsed.data.unit,
      volume_litres: parsed.data.volumeLitres ?? null,
      case_size: parsed.data.caseSize ?? null,
      sort_order: parsed.data.sortOrder ?? 0,
      active: parsed.data.active
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const priceBookId = await getRetailPriceBookId(supabase);
  const { error: priceError } = await supabase
    .from("price_book_items")
    .upsert({ price_book_id: priceBookId, product_id: product.id, unit_price: parsed.data.unitPrice, minimum_quantity: 1 }, { onConflict: "price_book_id,product_id,minimum_quantity" });

  if (priceError) return NextResponse.json({ error: priceError.message }, { status: 500 });

  return NextResponse.json({ data: await loadCatalogProducts(true) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;

  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success || !parsed.data.id) return NextResponse.json({ error: "Invalid product update", details: parsed.error?.flatten() }, { status: 400 });

  const sku = parsed.data.sku.toUpperCase();
  const conflictingId = await findSkuConflict(supabase, sku, parsed.data.id);
  if (conflictingId) return NextResponse.json({ error: "Another product already uses this SKU." }, { status: 409 });

  const { error } = await supabase
    .from("products")
    .update({
      sku,
      name: parsed.data.name,
      category: parsed.data.category,
      unit: parsed.data.unit,
      volume_litres: parsed.data.volumeLitres ?? null,
      case_size: parsed.data.caseSize ?? null,
      sort_order: parsed.data.sortOrder ?? 0,
      active: parsed.data.active
    })
    .eq("id", parsed.data.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const priceBookId = await getRetailPriceBookId(supabase);
  const { error: priceError } = await supabase
    .from("price_book_items")
    .upsert({ price_book_id: priceBookId, product_id: parsed.data.id, unit_price: parsed.data.unitPrice, minimum_quantity: 1 }, { onConflict: "price_book_id,product_id,minimum_quantity" });

  if (priceError) return NextResponse.json({ error: priceError.message }, { status: 500 });

  return NextResponse.json({ data: await loadCatalogProducts(true) });
}
