"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { CustomerButton, CustomerButtonLink } from "@/components/customer/customer-button";
import { useCustomerAuth } from "@/components/customer/customer-auth-provider";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, isLoading, logout } = useCustomerAuth();

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <CustomerShell showAssistant={false}>
      <section className="mx-auto max-w-lg px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-950">Your account</h1>
        {isLoading ? (
          <p className="mt-4 text-sm text-slate-600">Loading...</p>
        ) : user ? (
          <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Signed in as</p>
            <p className="mt-1 font-semibold text-slate-950">{profile?.fullName || user.email}</p>
            <p className="mt-1 text-sm text-slate-600">{user.email}</p>
            {profile?.phoneNumber ? <p className="mt-1 text-sm text-slate-600">{profile.phoneNumber}</p> : null}
            <div className="mt-6 grid gap-3">
              <CustomerButtonLink href="/cart">View cart</CustomerButtonLink>
              <CustomerButtonLink href="/order" variant="outline">
                Continue shopping
              </CustomerButtonLink>
              <CustomerButton type="button" variant="outline" onClick={handleLogout}>
                Sign out
              </CustomerButton>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">Sign in to manage your cart and orders.</p>
            <div className="mt-4 flex gap-3">
              <CustomerButtonLink href="/login?next=/account">Sign in</CustomerButtonLink>
              <CustomerButtonLink href="/signup?next=/account" variant="outline">
                Create account
              </CustomerButtonLink>
            </div>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/" className="underline underline-offset-2">
            Back to home
          </Link>
        </p>
      </section>
    </CustomerShell>
  );
}
