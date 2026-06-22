"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerShell } from "@/components/customer/customer-shell";
import { AuthCardSkeleton } from "@/components/skeletons/customer-skeletons";
import { cn } from "@/lib/utils";

const inputBaseClassName =
  "h-12 w-full touch-manipulation rounded-2xl border bg-white px-4 text-sm text-foreground transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground focus-ring";

const labelClassName = "grid gap-2 text-sm font-semibold text-foreground";

function inputClassName(invalid?: boolean) {
  return cn(
    inputBaseClassName,
    invalid ? "border-red-300 aria-[invalid=true]:border-red-400" : "border-cyan-100"
  );
}

export function CustomerAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerShell showAssistant={false} compactFooter>
      <section className="customer-section flex min-h-[calc(100dvh-10rem)] items-center justify-center py-8 sm:py-12">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </CustomerShell>
  );
}

export function CustomerAuthCardSkeleton() {
  return <AuthCardSkeleton />;
}

export function CustomerAuthCard({
  children,
  backHref = "/order"
}: {
  children: React.ReactNode;
  backHref?: string;
}) {
  return (
    <div className="customer-card p-6 sm:p-8">
      <Link
        href={backHref}
        className="focus-ring -ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-1 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
        Back to shop
      </Link>
      {children}
    </div>
  );
}

export function CustomerAuthField({
  id,
  label,
  required = false,
  hint,
  error,
  children
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <label className={labelClassName} htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="-mt-1 text-xs leading-5 text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <div aria-describedby={describedBy}>{children}</div>
      {error ? (
        <p id={errorId} className="text-xs font-semibold text-red-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CustomerAuthInput({
  id,
  invalid,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; invalid?: boolean }) {
  return (
    <input
      id={id}
      aria-invalid={invalid || undefined}
      className={cn(inputClassName(invalid), className)}
      {...props}
    />
  );
}

export function CustomerAuthPasswordInput({
  id,
  invalid,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { id: string; invalid?: boolean }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        aria-invalid={invalid || undefined}
        className={cn(inputClassName(invalid), "pr-12", className)}
        {...props}
      />
      <button
        type="button"
        className="focus-ring absolute right-1 top-1 inline-flex h-10 w-10 touch-manipulation items-center justify-center rounded-xl text-muted-foreground transition-colors duration-200 hover:text-foreground"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={0}
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}

export function CustomerAuthError({
  message,
  errorRef,
  children
}: {
  message: string;
  errorRef?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}) {
  return (
    <div
      ref={errorRef}
      tabIndex={-1}
      className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="space-y-3">
        <p>{message}</p>
        {children}
      </div>
    </div>
  );
}

export function CustomerAuthNotice({
  message,
  noticeRef
}: {
  message: string;
  noticeRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={noticeRef}
      tabIndex={-1}
      className="rounded-2xl border border-cyan-100 bg-aqua/35 px-4 py-3 text-sm leading-6 text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

export function CustomerAuthSubmitButton({
  isSubmitting,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { isSubmitting?: boolean }) {
  return (
    <Button
      className={cn(
        "h-12 w-full touch-manipulation rounded-2xl text-sm font-semibold transition-opacity duration-200",
        isSubmitting && "opacity-90",
        className
      )}
      disabled={isSubmitting}
      type="submit"
      aria-busy={isSubmitting}
      {...props}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function CustomerAuthFooter({
  children,
  staffHref = "/staff/login"
}: {
  children: React.ReactNode;
  staffHref?: string;
}) {
  return (
    <div className="mt-6 space-y-4 border-t border-cyan-100 pt-6">
      <p className="text-center text-sm leading-6 text-muted-foreground">{children}</p>
      <p className="text-center text-xs text-muted-foreground">
        <Link
          className="focus-ring inline-flex min-h-11 items-center rounded-xl px-2 font-semibold text-primary underline underline-offset-2"
          href={staffHref}
        >
          Staff sign in
        </Link>
      </p>
    </div>
  );
}
