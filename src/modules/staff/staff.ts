import { z } from "zod";

export const staffRoles = ["admin", "manager", "driver"] as const;
export type StaffRole = (typeof staffRoles)[number];

export type StaffSession = {
  id: string;
  name: string;
  phone: string;
  role: StaffRole;
  emergency?: boolean;
};

export const staffLoginSchema = z.object({
  phone: z.string().min(4).max(30),
  pin: z.string().min(4).max(80)
});

export const staffCreateSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(4).max(30),
  role: z.enum(staffRoles),
  pin: z.string().min(4).max(80)
});

export const staffUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  role: z.enum(staffRoles).optional(),
  active: z.boolean().optional(),
  pin: z.string().min(4).max(80).optional()
});

export function normalizeStaff(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone),
    role: row.role as StaffRole,
    active: Boolean(row.active),
    createdAt: String(row.created_at)
  };
}
