import { NextRequest } from "next/server";
import { createRouteHandlerClient, jsonWithCookies } from "@/lib/supabase/route";

export async function POST(request: NextRequest) {
  const { supabase, getResponse } = createRouteHandlerClient(request);
  await supabase.auth.signOut();
  return jsonWithCookies({ ok: true }, getResponse());
}
