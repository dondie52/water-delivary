import { z } from "zod";

export const inventoryCategories = ["water", "bottle", "cap", "label", "ice", "packaging", "finished_goods"] as const;

export const inventoryItemSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(2).max(80),
  name: z.string().min(2).max(160),
  category: z.enum(inventoryCategories),
  unit: z.string().min(1).max(40),
  currentQuantity: z.coerce.number().min(0),
  reorderPoint: z.coerce.number().min(0)
});

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;

export type InventoryItem = InventoryItemInput & {
  id: string;
  isLowStock: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export function normalizeInventoryItemRow(row: Record<string, unknown>): InventoryItem {
  const currentQuantity = Number(row.current_quantity ?? 0);
  const reorderPoint = Number(row.reorder_point ?? 0);

  return {
    id: String(row.id),
    sku: String(row.sku),
    name: String(row.name),
    category: row.category as InventoryItem["category"],
    unit: String(row.unit),
    currentQuantity,
    reorderPoint,
    isLowStock: currentQuantity <= reorderPoint,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined
  };
}
