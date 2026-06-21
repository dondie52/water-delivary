import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAppError(supabase: SupabaseClient | null, route: string, error: unknown) {
  if (!supabase) return;

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  await supabase.from("app_errors").insert({
    route,
    message,
    stack
  });
}
