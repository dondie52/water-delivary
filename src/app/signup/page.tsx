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

export default function CustomerSignupPage() {
  return (
    <Suspense fallback={<CustomerSignupFallback />}>
      <CustomerSignupForm />
    </Suspense>
  );
}

function CustomerSignupFallback() {
  return (
    <CustomerAuthLayout>
      <CustomerAuthCardSkeleton />
    </CustomerAuthLayout>
  );
}

function CustomerSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/order";
  const { refresh } = useCustomerAuth();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

  function validate() {
    const next: Record<string, string> = {};

    if (!fullName.trim()) {
      next.fullName = "Enter your full name.";
    }
    if (!phoneNumber.trim()) {
      next.phone = "Enter your phone number.";
    }
    if (!email.trim()) {
      next.email = "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Choose a password.";
    } else if (password.length < 8) {
      next.password = "Use at least 8 characters.";
    }

    return next;
  }

  function clearFieldError(key: string) {
    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors = validate();
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/v1/customers/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, phoneNumber, next: nextPath })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Could not create account. Try a different email or try again.");
      setIsSubmitting(false);
      return;
    }

    await refresh();
    router.push(nextPath);
    router.refresh();
  }

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

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">Create account</h1>
          <p className="mt-2 max-w-[36ch] text-sm leading-6 text-muted-foreground">
            Register to save your cart and place orders faster.
          </p>

          <div className="mt-6 space-y-4">
            <CustomerAuthField id="fullName" label="Full name" required error={fieldErrors.fullName}>
              <CustomerAuthInput
                id="fullName"
                autoComplete="name"
                value={fullName}
                invalid={Boolean(fieldErrors.fullName)}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearFieldError("fullName");
                  if (error) setError(null);
                }}
                required
              />
            </CustomerAuthField>

            <CustomerAuthField id="phone" label="Phone" required error={fieldErrors.phone}>
              <CustomerAuthInput
                id="phone"
                inputMode="tel"
                autoComplete="tel"
                value={phoneNumber}
                invalid={Boolean(fieldErrors.phone)}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  clearFieldError("phone");
                  if (error) setError(null);
                }}
                placeholder="7XXXXXXX"
                required
              />
            </CustomerAuthField>

            <CustomerAuthField id="email" label="Email" required error={fieldErrors.email}>
              <CustomerAuthInput
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                invalid={Boolean(fieldErrors.email)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                  if (error) setError(null);
                }}
                required
              />
            </CustomerAuthField>

            <CustomerAuthField
              id="password"
              label="Password"
              required
              hint="At least 8 characters."
              error={fieldErrors.password}
            >
              <CustomerAuthPasswordInput
                id="password"
                autoComplete="new-password"
                value={password}
                invalid={Boolean(fieldErrors.password)}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                  if (error) setError(null);
                }}
                minLength={8}
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
            {isSubmitting ? "Creating account…" : "Create account"}
          </CustomerAuthSubmitButton>

          <CustomerAuthFooter>
            Already have an account?{" "}
            <Link
              className="focus-ring inline-flex min-h-11 items-center rounded-xl px-1 font-semibold text-primary underline underline-offset-2"
              href={`/login?next=${encodeURIComponent(nextPath)}`}
            >
              Sign in
            </Link>
          </CustomerAuthFooter>
        </form>
      </CustomerAuthCard>
    </CustomerAuthLayout>
  );
}
