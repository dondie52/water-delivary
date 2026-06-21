import type { SupabaseClient } from "@supabase/supabase-js";

export async function applyOrderCompletionEffects(supabase: SupabaseClient, order: Record<string, unknown>) {
  await Promise.all([
    awardCustomerPoints(supabase, order),
    reduceMappedInventory(supabase, order)
  ]);
}

async function awardCustomerPoints(supabase: SupabaseClient, order: Record<string, unknown>) {
  const phoneNumber = String(order.phone_number);
  const customerName = String(order.customer_name);
  const total = Number(order.total ?? 0);
  const pointsToAdd = Math.floor(total / 10);
  const referredByPhone = order.referred_by_phone ? String(order.referred_by_phone) : "";

  if (!phoneNumber || pointsToAdd <= 0) {
    return;
  }

  const { data: existing } = await supabase
    .from("customer_points")
    .select("*")
    .eq("phone_number", phoneNumber)
    .maybeSingle();

  await supabase
    .from("customer_points")
    .upsert({
      phone_number: phoneNumber,
      customer_name: customerName,
      points: Number(existing?.points ?? 0) + pointsToAdd,
      lifetime_spend: Number(existing?.lifetime_spend ?? 0) + total,
      updated_at: new Date().toISOString()
    }, { onConflict: "phone_number" });

  if (referredByPhone && referredByPhone !== phoneNumber) {
    const { data: referrer } = await supabase
      .from("customer_points")
      .select("*")
      .eq("phone_number", referredByPhone)
      .maybeSingle();

    await supabase
      .from("customer_points")
      .upsert({
        phone_number: referredByPhone,
        customer_name: referrer?.customer_name ?? "Referral customer",
        points: Number(referrer?.points ?? 0) + 5,
        lifetime_spend: Number(referrer?.lifetime_spend ?? 0),
        referral_count: Number(referrer?.referral_count ?? 0) + 1,
        updated_at: new Date().toISOString()
      }, { onConflict: "phone_number" });
  }
}

async function reduceMappedInventory(supabase: SupabaseClient, order: Record<string, unknown>) {
  const productSku = String(order.product_sku);
  const quantity = Number(order.quantity ?? 0);

  if (!productSku || quantity <= 0) {
    return;
  }

  const { data: mappings } = await supabase
    .from("product_inventory_mappings")
    .select("inventory_item_id, quantity_per_unit")
    .eq("product_sku", productSku);

  if (!mappings || mappings.length === 0) {
    return;
  }

  await Promise.all(mappings.map(async (mapping) => {
    const delta = -1 * Number(mapping.quantity_per_unit ?? 1) * quantity;
    const { data: item } = await supabase
      .from("inventory_items")
      .select("current_quantity")
      .eq("id", mapping.inventory_item_id)
      .single();

    if (!item) {
      return;
    }

    await supabase
      .from("inventory_items")
      .update({ current_quantity: Math.max(Number(item.current_quantity ?? 0) + delta, 0) })
      .eq("id", mapping.inventory_item_id);

    await supabase.from("inventory_movements").insert({
      inventory_item_id: mapping.inventory_item_id,
      order_id: order.id,
      movement_type: "order_completed",
      quantity_delta: delta,
      note: `Reduced stock for order ${order.order_number}`
    });
  }));
}
