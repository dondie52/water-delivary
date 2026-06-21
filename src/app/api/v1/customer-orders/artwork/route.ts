import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAppError } from "@/lib/errors/log-app-error";

const ARTWORK_BUCKET = "artwork";
const MAX_ARTWORK_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an artwork file to upload." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Upload a PNG, JPG, WebP, or PDF file." }, { status: 400 });
  }

  if (file.size > MAX_ARTWORK_SIZE) {
    return NextResponse.json({ error: "Artwork must be 8MB or smaller." }, { status: 400 });
  }

  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
  const datePath = new Date().toISOString().slice(0, 10);
  const path = `customer-orders/${datePath}/${randomUUID()}-${safeName || "artwork"}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(ARTWORK_BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false
  });

  if (error) {
    await logAppError(supabase, "POST /api/v1/customer-orders/artwork", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { path } }, { status: 201 });
}
