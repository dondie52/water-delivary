import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultPilotSettings, normalizePilotSettings } from "@/modules/settings/pilot-settings";

export async function loadPilotSettings(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("pilot_settings").select("key,value");

  if (error) {
    return defaultPilotSettings;
  }

  return normalizePilotSettings(data);
}
