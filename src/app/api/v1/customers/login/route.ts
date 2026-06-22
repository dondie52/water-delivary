import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient, jsonWithCookies } from "@/lib/supabase/route";
import { customerLoginSchema, normalizeCustomerProfileRow } from "@/modules/customer/profile";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = customerLoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login details.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { supabase, getResponse } = createRouteHandlerClient(request);
  const { email, password } = parsed.data;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const { data: profileRow } = await supabase.from("customer_profiles").select("*").eq("id", data.user.id).maybeSingle();

  return jsonWithCookies(
    {
      data: {
        user: { id: data.user.id, email: data.user.email },
        profile: profileRow ? normalizeCustomerProfileRow(profileRow) : null
      }
    },
    getResponse()
  );
}
