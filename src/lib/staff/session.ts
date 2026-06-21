import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StaffRole, StaffSession } from "@/modules/staff/staff";

export const staffSessionCookie = "fwm_staff_session";

export function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(pin, salt, 100000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPin(pin: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = pbkdf2Sync(pin, salt, 100000, 32, "sha256");
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}

export function encodeStaffSession(session: StaffSession) {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

export function decodeStaffSession(value?: string): StaffSession | null {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as StaffSession;
  } catch {
    return null;
  }
}

export async function getServerStaffSession() {
  const cookieStore = await cookies();
  const supabase = createAdminClient();
  if (!supabase) return null;
  return validateStaffSessionToken(supabase, cookieStore.get(staffSessionCookie)?.value);
}

export function getRequestStaffSession(request: NextRequest) {
  return decodeStaffSession(request.cookies.get(staffSessionCookie)?.value);
}

export function setStaffSessionCookie(response: NextResponse, session: StaffSession) {
  response.cookies.set(staffSessionCookie, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export function clearStaffSessionCookie(response: NextResponse) {
  response.cookies.set(staffSessionCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export function roleAllowed(role: StaffRole, allowed: StaffRole[]) {
  return allowed.includes(role);
}

export function generateSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createStaffSession(supabase: SupabaseClient, staff: StaffSession) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();

  await supabase.from("staff_sessions").insert({
    staff_user_id: staff.id,
    session_token_hash: hashSessionToken(token),
    expires_at: expiresAt,
    last_seen_at: new Date().toISOString()
  });

  return token;
}

export async function validateStaffSessionToken(supabase: SupabaseClient, token?: string | null) {
  if (!token) return null;
  const tokenHash = hashSessionToken(token);
  const { data } = await supabase
    .from("staff_sessions")
    .select("*, staff_users(*)")
    .eq("session_token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!data?.staff_users?.active) return null;

  await supabase.from("staff_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", data.id);

  return {
    id: data.staff_users.id,
    name: data.staff_users.name,
    phone: data.staff_users.phone,
    role: data.staff_users.role
  } as StaffSession;
}

export async function revokeStaffSession(supabase: SupabaseClient, token?: string | null) {
  if (!token) return;
  await supabase
    .from("staff_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("session_token_hash", hashSessionToken(token));
}
