import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRouteHandlerClient, jsonWithCookies } from "@/lib/supabase/route";
import { normalizeBotswanaPhone } from "@/lib/phone";
import { buildAuthCallbackUrl } from "@/lib/site-url";
import { logAppError } from "@/lib/errors/log-app-error";
import { customerSignupSchema, normalizeCustomerProfileRow } from "@/modules/customer/profile";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = customerSignupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup details.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { supabase, getResponse } = createRouteHandlerClient(request);
  const { email, password, fullName, phoneNumber, next } = parsed.data;
  const normalizedPhone = normalizeBotswanaPhone(phoneNumber);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: buildAuthCallbackUrl(next, request),
      data: {
        full_name: fullName,
        phone_number: normalizedPhone
      }
    }
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  if (!authData.user) {
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }

  if (!authData.session) {
    return jsonWithCookies(
      {
        data: {
          requiresEmailConfirmation: true,
          email: authData.user.email
        }
      },
      getResponse(),
      { status: 201 }
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase service role environment variables are not configured." }, { status: 503 });
  }

  const { data: profileRow, error: profileError } = await admin
    .from("customer_profiles")
    .upsert(
      {
        id: authData.user.id,
        full_name: fullName,
        phone_number: normalizedPhone
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  if (profileError) {
    await logAppError(admin, "POST /api/v1/customers/signup profile", profileError);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return jsonWithCookies(
    {
      data: {
        user: { id: authData.user.id, email: authData.user.email },
        profile: normalizeCustomerProfileRow(profileRow)
      }
    },
    getResponse()
  );
}
