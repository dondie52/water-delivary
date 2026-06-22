"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminCompactAuthSkeleton } from "@/components/skeletons/admin-skeletons";

type PasswordLoginProps = {
  title: string;
  description: string;
  endpoint: string;
  fallbackPath: string;
};

export function PasswordLogin(props: PasswordLoginProps) {
  return (
    <Suspense fallback={<AdminCompactAuthSkeleton />}>
      <PasswordLoginForm {...props} />
    </Suspense>
  );
}

function PasswordLoginForm({ title, description, endpoint, fallbackPath }: PasswordLoginProps) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? fallbackPath;
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Could not sign in");
      setIsSubmitting(false);
      return;
    }

    window.location.href = nextPath;
  }

  return (
    <main className="water-canvas grid min-h-screen place-items-center px-4">
      <form className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm" onSubmit={submit}>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        <label className="mt-5 grid gap-2">
          <span className="text-sm font-semibold text-slate-800">Password</span>
          <input
            className="h-11 rounded-md border bg-white px-3 text-sm focus-ring"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        <Button className="mt-5 h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Continue"}
        </Button>
      </form>
    </main>
  );
}
