import { NextRequest, NextResponse } from "next/server";
import { getRolePassword, passwordGateConfig } from "@/lib/auth/password-gates";

export async function POST(request: NextRequest) {
  const configuredPassword = getRolePassword("admin");
  const { password } = await request.json();

  if (!configuredPassword) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not configured." }, { status: 503 });
  }

  if (password !== configuredPassword) {
    return NextResponse.json({ error: "Incorrect admin password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(passwordGateConfig.admin.cookieName, configuredPassword, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 12
  });

  return response;
}
