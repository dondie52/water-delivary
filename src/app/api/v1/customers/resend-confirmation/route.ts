import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route";
import { buildAuthCallbackUrl } from "@/lib/site-url";
import { customerResendConfirmationSchema } from "@/modules/customer/profile";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = customerResendConfirmationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const { supabase } = createRouteHandlerClient(request);
  const { email, next } = parsed.data;

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: buildAuthCallbackUrl(next, request)
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    data: {
      message: "If an account exists for that email, we sent a new confirmation link."
    }
  });
}
