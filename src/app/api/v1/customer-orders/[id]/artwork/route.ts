import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffRole } from "@/lib/auth/require-staff";

const ARTWORK_BUCKET = "artwork";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const { data: order, error: orderError } = await supabase
    .from("customer_orders")
    .select("artwork_url")
    .eq("id", id)
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 404 });
  }

  if (!order?.artwork_url) {
    return NextResponse.json({ error: "No artwork is attached to this order." }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from(ARTWORK_BUCKET)
    .createSignedUrl(String(order.artwork_url), 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Could not open artwork." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl, 302);
}
