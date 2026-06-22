import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeCustomerProfileRow, type CustomerProfile } from "@/modules/customer/profile";

export type CustomerSession = {
  userId: string;
  email: string;
  profile: CustomerProfile | null;
};

export async function getServerCustomer(): Promise<CustomerSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profileRow } = await supabase.from("customer_profiles").select("*").eq("id", user.id).maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? "",
    profile: profileRow ? normalizeCustomerProfileRow(profileRow) : null
  };
}

export async function requireCustomer() {
  const customer = await getServerCustomer();

  if (!customer) {
    return {
      customer: null,
      response: NextResponse.json({ error: "Sign in to continue." }, { status: 401 })
    };
  }

  return { customer, response: null };
}
