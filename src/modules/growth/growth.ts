import { z } from "zod";

export const subscriptionStatuses = ["new", "approved", "paused", "cancelled"] as const;
export const corporateStatuses = ["new", "contacted", "quoted", "won", "lost"] as const;

export const subscriptionSchema = z.object({
  phone: z.string().min(4).max(30),
  customerName: z.string().min(2).max(120),
  productPreference: z.string().min(2).max(200),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  preferredSlot: z.string().optional(),
  fulfillmentType: z.enum(["pickup", "delivery"]),
  notes: z.string().max(1000).optional()
});

export const corporateSchema = z.object({
  companyName: z.string().min(2).max(180),
  contactPerson: z.string().min(2).max(120),
  phone: z.string().min(4).max(30),
  email: z.string().email().optional().or(z.literal("")),
  useCase: z.string().min(2).max(300),
  bottleSize: z.string().max(80).optional(),
  quantity: z.coerce.number().int().min(1).max(100000),
  brandingRequired: z.boolean(),
  notes: z.string().max(1000).optional()
});

export function normalizeSubscription(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    phone: String(row.phone),
    customerName: String(row.customer_name),
    productPreference: String(row.product_preference),
    frequency: String(row.frequency),
    preferredSlot: row.preferred_slot ? String(row.preferred_slot) : "",
    fulfillmentType: String(row.fulfillment_type),
    notes: row.notes ? String(row.notes) : "",
    status: String(row.status),
    createdAt: String(row.created_at)
  };
}

export function normalizeCorporate(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    companyName: String(row.company_name),
    contactPerson: String(row.contact_person),
    phone: String(row.phone),
    email: row.email ? String(row.email) : "",
    useCase: String(row.use_case),
    bottleSize: row.bottle_size ? String(row.bottle_size) : "",
    quantity: Number(row.quantity),
    brandingRequired: Boolean(row.branding_required),
    notes: row.notes ? String(row.notes) : "",
    status: String(row.status),
    createdAt: String(row.created_at)
  };
}
