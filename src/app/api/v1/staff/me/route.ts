import { NextResponse } from "next/server";
import { getServerStaffSession } from "@/lib/staff/session";

export async function GET() {
  return NextResponse.json({ data: await getServerStaffSession() });
}
