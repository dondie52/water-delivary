"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { BrandImage } from "@/components/customer/brand-image";
import {
  CustomerAuthCard,
  CustomerAuthCardSkeleton,
  CustomerAuthError,
  CustomerAuthField,
  CustomerAuthFooter,
  CustomerAuthInput,
  CustomerAuthLayout,
  CustomerAuthPasswordInput,
  CustomerAuthSubmitButton
} from "@/components/customer/customer-auth-layout";
import { useCustomerAuth } from "@/components/customer/customer-auth-provider";
import { BRAND_ASSETS } from "@/lib/brand-assets";

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<CustomerLoginFallback />}>
      <CustomerLoginForm />
    </Suspense>
  );
}

function CustomerLoginFallback() {
  return (
    <CustomerAuthLayout>
      <CustomerAuthCardSkeleton />
    </CustomerAuthLayout>
  );
}

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/order";
  const { refresh } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  function validateEmail(value: string) {
    if (!value.trim()) {
      return "Enter your email address.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Enter a valid email address.";
    }
    return null;
  }

  function handleEmailBlur() {
    setEmailError(validateEmail(email));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);
    if (nextEmailError) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/v1/customers/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Could not sign in. Check your email and password, then try again.");
      setIsSubmitting(false);
      return;
    }

    await refresh();
    router.push(nextPath);
    router.refresh();
  }

  const credentialsInvalid = Boolean(error);

  return (
    <CustomerAuthLayout>
      <CustomerAuthCard backHref={nextPath}>
        <form className="mt-6" onSubmit={submit} noValidate>
          <BrandImage
            src={BRAND_ASSETS.logo}
            alt="Fresh Water Market"
            fit="contain"
            className="h-10 w-auto max-w-[160px] object-contain"
            fallbackLabel="Fresh Water Market"
            width={400}
            height={120}
          />

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">Sign in</h1>
          <p className="mt-2 max-w-[36ch] text-sm leading-6 text-muted-foreground">
            Access your cart, saved details, and order history.
          </p>

          <div className="mt-6 space-y-4">
            <CustomerAuthField
              id="email"
              label="Email"
              required
              error={emailError ?? undefined}
            >
              <CustomerAuthInput
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                invalid={Boolean(emailError) || credentialsInvalid}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) {
                    setEmailError(null);
                  }
                  if (error) {
                    setError(null);
                  }
                }}
                onBlur={handleEmailBlur}
                required
              />
            </CustomerAuthField>

            <CustomerAuthField id="password" label="Password" required>
              <CustomerAuthPasswordInput
                id="password"
                autoComplete="current-password"
                value={password}
                invalid={credentialsInvalid}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) {
                    setError(null);
                  }
                }}
                required
              />
            </CustomerAuthField>
          </div>

          {error ? (
            <div className="mt-4">
              <CustomerAuthError message={error} errorRef={errorRef} />
            </div>
          ) : null}

          <CustomerAuthSubmitButton className="mt-6" isSubmitting={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Continue"}
          </CustomerAuthSubmitButton>

          <CustomerAuthFooter>
            New here?{" "}
            <Link
              className="focus-ring inline-flex min-h-11 items-center rounded-xl px-1 font-semibold text-primary underline underline-offset-2"
              href={`/signup?next=${encodeURIComponent(nextPath)}`}
            >
              Create an account
            </Link>
          </CustomerAuthFooter>
        </form>
      </CustomerAuthCard>
    </CustomerAuthLayout>
  );
}
