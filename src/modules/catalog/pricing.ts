export type ProductCategory = "bottled_water" | "personalized_water" | "standard_case" | "refill" | "delivery" | "design";

export type PriceItem = {
  sku: string;
  name: string;
  category: ProductCategory;
  unit: string;
  price: number;
  active?: boolean;
  marginTarget?: number;
};

export const priceBook: PriceItem[] = [
  { sku: "FWM-BW-250", name: "Fresh Water 250ml", category: "bottled_water", unit: "bottle", price: 3 },
  { sku: "FWM-BW-330", name: "Fresh Water 330ml", category: "bottled_water", unit: "bottle", price: 4 },
  { sku: "FWM-BW-500", name: "Fresh Water 500ml", category: "bottled_water", unit: "bottle", price: 5 },
  { sku: "FWM-BW-1500", name: "Fresh Water 1.5L", category: "bottled_water", unit: "bottle", price: 10 },
  { sku: "FWM-BW-5000", name: "Fresh Water 5L", category: "bottled_water", unit: "bottle", price: 20 },
  { sku: "FWM-PW-250-24", name: "Personalized 250ml x24", category: "personalized_water", unit: "case", price: 96 },
  { sku: "FWM-PW-330-24", name: "Personalized 330ml x24", category: "personalized_water", unit: "case", price: 120 },
  { sku: "FWM-PW-500-24", name: "Personalized 500ml x24", category: "personalized_water", unit: "case", price: 144 },
  { sku: "FWM-DESIGN-STICKER", name: "Sticker Design", category: "design", unit: "design", price: 200 },
  { sku: "FWM-CASE-250-24", name: "Standard 250ml x24", category: "standard_case", unit: "case", price: 72 },
  { sku: "FWM-CASE-330-24", name: "Standard 330ml x24", category: "standard_case", unit: "case", price: 96 },
  { sku: "FWM-CASE-500-24", name: "Standard 500ml x24", category: "standard_case", unit: "case", price: 120 },
  { sku: "FWM-REFILL-L", name: "Water Refill", category: "refill", unit: "litre", price: 1.6 },
  { sku: "FWM-DEL-STUDENT", name: "Student Delivery", category: "delivery", unit: "trip", price: 30 }
];

export const deliverySlots = [
  { id: "slot-morning", label: "8am-10am", startsAt: "08:00", endsAt: "10:00", capacity: 42 },
  { id: "slot-afternoon", label: "1pm-3pm", startsAt: "13:00", endsAt: "15:00", capacity: 48 },
  { id: "slot-evening", label: "4pm-6pm", startsAt: "16:00", endsAt: "18:00", capacity: 54 }
];

export const pickupLocations = [
  "Vegas Parking Lot",
  "UB Clinic Parking",
  "475 Parking Lot",
  "Block 470 Parking Lot"
];

export function normalizeProductRow(row: Record<string, unknown>): PriceItem & { id?: string; size?: string; volumeLitres?: number; caseSize?: number | null; sortOrder?: number } {
  const category = String(row.category) === "service"
    ? String(row.sku).includes("DESIGN") ? "design" : "delivery"
    : String(row.category) === "bottled_water" && String(row.unit) === "case" ? "standard_case" : String(row.category);

  return {
    id: row.id ? String(row.id) : undefined,
    sku: String(row.sku),
    name: String(row.name),
    category: category as ProductCategory,
    unit: String(row.unit),
    size: row.volume_litres ? `${Number(row.volume_litres)}L` : row.case_size ? `x${Number(row.case_size)}` : String(row.unit),
    volumeLitres: row.volume_litres == null ? undefined : Number(row.volume_litres),
    caseSize: row.case_size == null ? null : Number(row.case_size),
    active: Boolean(row.active),
    sortOrder: row.sort_order == null ? 0 : Number(row.sort_order),
    price: Number(row.unit_price ?? row.price ?? 0)
  };
}
