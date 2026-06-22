import { z } from "zod";
import type { ServiceType } from "@/lib/orders/order-wizard";

export const customerSignupSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  fullName: z.string().min(2, "Enter your full name.").max(120),
  phoneNumber: z.string().min(7, "Enter a phone number.").max(30),
  next: z
    .string()
    .optional()
    .refine((value) => !value || (value.startsWith("/") && !value.startsWith("//")), {
      message: "Invalid redirect path."
    })
});

export const customerLoginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.")
});

export const customerResendConfirmationSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  next: z
    .string()
    .optional()
    .refine((value) => !value || (value.startsWith("/") && !value.startsWith("//")), {
      message: "Invalid redirect path."
    })
});

export type CustomerProfile = {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  createdAt: string;
};

export type CartItemRecord = {
  id: string;
  userId: string;
  sku: string;
  serviceType: ServiceType;
  quantity: number;
  refillLitres: number;
  containerCount: number;
  productName: string;
  unitPrice: number;
  updatedAt: string;
  createdAt: string;
};

export const cartItemInputSchema = z.object({
  sku: z.string().min(1),
  serviceType: z.enum(["refill", "bottled", "personalized", "ice"]),
  quantity: z.coerce.number().int().min(0).max(999),
  refillLitres: z.coerce.number().min(0).max(10000).default(0),
  containerCount: z.coerce.number().int().min(0).max(1000).default(1),
  productName: z.string().min(1),
  unitPrice: z.coerce.number().min(0)
});

export function normalizeCustomerProfileRow(row: Record<string, unknown>): CustomerProfile {
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? ""),
    phoneNumber: String(row.phone_number ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString())
  };
}

export function normalizeCartItemRow(row: Record<string, unknown>): CartItemRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    sku: String(row.sku),
    serviceType: String(row.service_type) as ServiceType,
    quantity: Number(row.quantity ?? 0),
    refillLitres: Number(row.refill_litres ?? 0),
    containerCount: Number(row.container_count ?? 1),
    productName: String(row.product_name ?? row.sku),
    unitPrice: Number(row.unit_price ?? 0),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
    createdAt: String(row.created_at ?? new Date().toISOString())
  };
}
