import { NextResponse } from "next/server";
import { getServerCustomer } from "@/lib/customer/session";

export async function GET() {
  const customer = await getServerCustomer();

  if (!customer) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({
    data: {
      user: { id: customer.userId, email: customer.email },
      profile: customer.profile
    }
  });
}
