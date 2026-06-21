import { NextRequest, NextResponse } from "next/server";
import { getRolePassword, passwordGateConfig } from "@/lib/auth/password-gates";

export async function POST(request: NextRequest) {
  const configuredPassword = getRolePassword("driver");
  const { password } = await request.json();

  if (!configuredPassword) {
    return NextResponse.json({ error: "DRIVER_PASSWORD is not configured." }, { status: 503 });
  }

  if (password !== configuredPassword) {
    return NextResponse.json({ error: "Incorrect driver password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(passwordGateConfig.driver.cookieName, configuredPassword, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/driver",
    maxAge: 60 * 60 * 12
  });

  return response;
}
