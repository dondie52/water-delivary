import { z } from "zod";

export type PilotSettings = {
  whatsappNumber: string;
  studentDeliveryFee: number;
  refillPricePerLitre: number;
  extraHandlingFee: number;
  defaultSlotCapacity: number;
  pilotActive: boolean;
  orderCutoffMessage: string;
};

export const defaultPilotSettings: PilotSettings = {
  whatsappNumber: "+26775909515",
  studentDeliveryFee: 30,
  refillPricePerLitre: 1.6,
  extraHandlingFee: 5,
  defaultSlotCapacity: 48,
  pilotActive: true,
  orderCutoffMessage: "Fresh Water Market ordering is paused for today. Please check back for the next delivery window."
};

export const pilotSettingsSchema = z.object({
  whatsappNumber: z.string().min(7).max(30),
  studentDeliveryFee: z.coerce.number().min(0).max(500),
  refillPricePerLitre: z.coerce.number().min(0).max(50),
  extraHandlingFee: z.coerce.number().min(5).max(7.5),
  defaultSlotCapacity: z.coerce.number().int().min(1).max(500),
  pilotActive: z.boolean(),
  orderCutoffMessage: z.string().min(5).max(300)
});

export function normalizePilotSettings(rows: Array<{ key: string; value: unknown }> | null | undefined): PilotSettings {
  const settings = { ...defaultPilotSettings };

  for (const row of rows ?? []) {
    const key = row.key as keyof PilotSettings;

    if (!(key in settings)) {
      continue;
    }

    if (typeof settings[key] === "number") {
      (settings[key] as number) = Number(row.value);
    } else if (typeof settings[key] === "boolean") {
      (settings[key] as boolean) = row.value === true || row.value === "true";
    } else {
      (settings[key] as string) = String(row.value);
    }
  }

  return settings;
}

export function settingsToRows(settings: PilotSettings) {
  return Object.entries(settings).map(([key, value]) => ({ key, value }));
}
