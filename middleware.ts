import { NextRequest, NextResponse } from "next/server";
import { isRoleAuthenticated, passwordGateConfig, type GateRole } from "@/lib/auth/password-gates";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = getProtectedRole(pathname);

  if (!role) {
    return NextResponse.next();
  }

  if (await isStaffSessionAllowed(request, role) || isRoleAuthenticated(request, role)) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, private");
    return response;
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = passwordGateConfig[role].loginPath;
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

async function isStaffSessionAllowed(request: NextRequest, role: GateRole) {
  const allowed = role === "admin" ? "admin,manager" : "admin,manager,driver";
  const url = new URL(`/api/v1/staff/validate?allowed=${allowed}`, request.url);
  const response = await fetch(url, {
    headers: {
      cookie: request.headers.get("cookie") ?? ""
    },
    cache: "no-store"
  });
  return response.ok;
}

function getProtectedRole(pathname: string): GateRole | null {
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return "admin";
  }

  if (pathname === "/driver") {
    return "driver";
  }

  return null;
}

export const config = {
  matcher: ["/admin/:path*", "/driver"]
};
