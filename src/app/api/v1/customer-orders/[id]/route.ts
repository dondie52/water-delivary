import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyOrderCompletionEffects } from "@/lib/orders/completion-effects";
import { writeAuditLog } from "@/lib/audit/audit";
import { requireStaffRole } from "@/lib/auth/require-staff";
import { normalizeOrderRow, normalizeStatusEventRow, orderStatuses, paymentMethods, paymentStatuses, personalizedStages } from "@/modules/orders/customer-order";

const updateOrderSchema = z.object({
  status: z.enum(orderStatuses).optional(),
  paymentStatus: z.enum(paymentStatuses).optional(),
  paymentReference: z.string().max(120).optional(),
  paymentConfirmedMethod: z.enum(paymentMethods).optional(),
  amountPaid: z.coerce.number().min(0).optional(),
  internalNotes: z.string().max(2000).optional(),
  assignedRunnerName: z.string().max(120).optional(),
  assignedRunnerPhone: z.string().max(30).optional(),
  personalizedStage: z.enum(personalizedStages).optional(),
  changedBy: z.string().max(120).optional(),
  note: z.string().max(500).optional()
}).refine((value) =>
  value.status
  || value.paymentStatus
  || value.paymentReference !== undefined
  || value.paymentConfirmedMethod
  || value.amountPaid !== undefined
  || value.internalNotes !== undefined
  || value.assignedRunnerName !== undefined
  || value.assignedRunnerPhone !== undefined
  || value.personalizedStage !== undefined,
{
  message: "Provide status, paymentStatus, payment fields, internalNotes, or runner assignment"
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }
  const auth = await requireStaffRole(request, supabase, ["admin", "manager"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const [{ data: order, error: orderError }, { data: events, error: eventsError }] = await Promise.all([
    supabase.from("customer_orders").select("*").eq("id", id).single(),
    supabase.from("order_status_events").select("*").eq("order_id", id).order("created_at", { ascending: false })
  ]);

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 404 });
  }

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 });
  }

  const { data: feedback } = await supabase
    .from("order_feedback")
    .select("*")
    .eq("order_id", id)
    .maybeSingle();

  return NextResponse.json({
    data: {
      order: normalizeOrderRow(order),
      events: (events ?? []).map((event) => normalizeStatusEventRow(event)),
      feedback
    }
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }
  const auth = await requireStaffRole(request, supabase, ["admin", "manager", "driver"]);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", details: parsed.error.flatten() }, { status: 400 });
  }

  const { data: currentOrder, error: currentOrderError } = await supabase
    .from("customer_orders")
    .select("*")
    .eq("id", id)
    .single();

  if (currentOrderError) {
    return NextResponse.json({ error: currentOrderError.message }, { status: 404 });
  }

  const payload: Record<string, string | number> = {};

  if (parsed.data.status) {
    payload.status = parsed.data.status;
  }

  if (parsed.data.paymentStatus) {
    payload.payment_status = parsed.data.paymentStatus;
  }

  if (parsed.data.paymentReference !== undefined) {
    payload.payment_reference = parsed.data.paymentReference;
  }

  if (parsed.data.paymentConfirmedMethod) {
    payload.payment_confirmed_method = parsed.data.paymentConfirmedMethod;
  }

  if (parsed.data.amountPaid !== undefined) {
    payload.amount_paid = parsed.data.amountPaid;
  }

  if (parsed.data.internalNotes !== undefined) {
    payload.internal_notes = parsed.data.internalNotes;
  }

  if (parsed.data.assignedRunnerName !== undefined) {
    payload.assigned_runner_name = parsed.data.assignedRunnerName;
  }

  if (parsed.data.assignedRunnerPhone !== undefined) {
    payload.assigned_runner_phone = parsed.data.assignedRunnerPhone;
  }

  if (parsed.data.personalizedStage !== undefined) {
    payload.personalized_stage = parsed.data.personalizedStage;
  }

  const { data, error } = await supabase
    .from("customer_orders")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const staff = auth.staff;
  const changedBy = parsed.data.changedBy ?? staff?.name ?? "admin";
  const note = parsed.data.note;
  const eventRows = [];

  if (parsed.data.status && parsed.data.status !== currentOrder.status) {
    eventRows.push({
      order_id: id,
      event_type: "status",
      from_value: currentOrder.status,
      to_value: parsed.data.status,
      changed_by: changedBy,
      note
    });
  }

  if (
    (parsed.data.paymentStatus && parsed.data.paymentStatus !== currentOrder.payment_status)
    || (parsed.data.amountPaid !== undefined && parsed.data.amountPaid !== Number(currentOrder.amount_paid ?? 0))
    || (parsed.data.paymentReference !== undefined && parsed.data.paymentReference !== currentOrder.payment_reference)
    || (parsed.data.paymentConfirmedMethod && parsed.data.paymentConfirmedMethod !== currentOrder.payment_confirmed_method)
  ) {
    eventRows.push({
      order_id: id,
      event_type: "payment",
      from_value: currentOrder.payment_status,
      to_value: parsed.data.paymentStatus ?? currentOrder.payment_status,
      changed_by: changedBy,
      note: note ?? `Payment updated. Amount paid: P${parsed.data.amountPaid ?? currentOrder.amount_paid ?? 0}`
    });
  }

  if (parsed.data.personalizedStage && parsed.data.personalizedStage !== currentOrder.personalized_stage) {
    eventRows.push({
      order_id: id,
      event_type: "note",
      changed_by: changedBy,
      note: `Personalized stage: ${currentOrder.personalized_stage ?? "not started"} -> ${parsed.data.personalizedStage}`
    });
  }

  if (parsed.data.internalNotes !== undefined && parsed.data.internalNotes !== currentOrder.internal_notes) {
    eventRows.push({
      order_id: id,
      event_type: "note",
      changed_by: changedBy,
      note: parsed.data.internalNotes
    });
  }

  if (
    (parsed.data.assignedRunnerName !== undefined && parsed.data.assignedRunnerName !== currentOrder.assigned_runner_name)
    || (parsed.data.assignedRunnerPhone !== undefined && parsed.data.assignedRunnerPhone !== currentOrder.assigned_runner_phone)
  ) {
    eventRows.push({
      order_id: id,
      event_type: "note",
      changed_by: changedBy,
      note: `Runner assigned: ${parsed.data.assignedRunnerName ?? currentOrder.assigned_runner_name ?? "Unassigned"} (${parsed.data.assignedRunnerPhone ?? currentOrder.assigned_runner_phone ?? "no phone"})`
    });
  }

  if (eventRows.length > 0) {
    await supabase.from("order_status_events").insert(eventRows);
  }

  if (parsed.data.status && parsed.data.status !== currentOrder.status) {
    await writeAuditLog(supabase, "order_status_change", { staff, entityType: "customer_order", entityId: id, details: { from: currentOrder.status, to: parsed.data.status } });
  }

  if (
    (parsed.data.paymentStatus && parsed.data.paymentStatus !== currentOrder.payment_status)
    || parsed.data.amountPaid !== undefined
    || parsed.data.paymentReference !== undefined
    || parsed.data.paymentConfirmedMethod
  ) {
    await writeAuditLog(supabase, "payment_update", { staff, entityType: "customer_order", entityId: id, details: { paymentStatus: parsed.data.paymentStatus, amountPaid: parsed.data.amountPaid } });
  }

  if (parsed.data.assignedRunnerName !== undefined || parsed.data.assignedRunnerPhone !== undefined) {
    await writeAuditLog(supabase, "runner_assignment", { staff, entityType: "customer_order", entityId: id, details: { runnerName: parsed.data.assignedRunnerName, runnerPhone: parsed.data.assignedRunnerPhone } });
  }

  if (parsed.data.status === "completed" && currentOrder.status !== "completed") {
    await applyOrderCompletionEffects(supabase, data);
  }

  return NextResponse.json({ data: normalizeOrderRow(data) });
}
