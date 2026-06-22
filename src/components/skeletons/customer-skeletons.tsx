import { CustomerShell } from "@/components/customer/customer-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function HomePageSkeleton() {
  return (
    <CustomerShell>
      <main aria-hidden="true">
        <section className="hero-navy relative overflow-hidden px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12 lg:px-8 lg:pt-16">
          <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl space-y-5">
              <Skeleton className="h-16 w-4/5 max-w-lg rounded-xl bg-white/20" />
              <Skeleton className="h-16 w-3/5 max-w-sm rounded-xl bg-white/20" />
              <Skeleton className="h-5 w-full max-w-md rounded-lg bg-white/15" />
              <Skeleton className="h-5 w-4/5 max-w-sm rounded-lg bg-white/15" />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Skeleton className="h-12 w-full max-w-[200px] rounded-2xl bg-white/20" />
                <Skeleton className="h-12 w-full max-w-[160px] rounded-2xl bg-white/15" />
              </div>
            </div>
            <Skeleton className="aspect-[4/3] w-full rounded-3xl bg-white/10" />
          </div>
        </section>
        <section className="customer-section">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="customer-card space-y-3 p-5">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        </section>
        <section className="customer-section">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="customer-card p-5">
                <Skeleton className="h-5 w-2/3 rounded-lg" />
                <Skeleton className="mt-3 h-6 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </CustomerShell>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-hidden="true">
      <div className="customer-card divide-y divide-cyan-100 p-0">
        {[0, 1].map((key) => (
          <div key={key} className="flex gap-4 p-5">
            <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40 rounded-lg" />
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-4 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <div className="customer-card space-y-3 p-5">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded-lg" />
        </div>
        <Skeleton className="h-12 rounded-2xl" />
      </div>
    </div>
  );
}

export function AccountPageSkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-hidden="true">
      <div className="customer-card space-y-4 p-6 sm:p-8">
        <div className="flex gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24 rounded-lg" />
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-4 w-52 rounded-lg" />
            <Skeleton className="h-4 w-36 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="customer-card space-y-3 p-6">
        <Skeleton className="h-4 w-28 rounded-lg" />
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="h-12 rounded-2xl" />
      </div>
    </div>
  );
}

export function AccountLookupSkeleton() {
  return (
    <div className="customer-card space-y-3 p-6" aria-hidden="true">
      <Skeleton className="h-4 w-32 rounded-lg" />
      <Skeleton className="h-5 w-48 rounded-lg" />
      <Skeleton className="h-4 w-full max-w-xs rounded-lg" />
      <Skeleton className="h-10 w-full rounded-2xl" />
    </div>
  );
}

export function AuthCardSkeleton() {
  return (
    <div className="customer-card p-6 sm:p-8" aria-hidden="true">
      <Skeleton className="h-4 w-28 rounded-lg" />
      <Skeleton className="mt-6 h-10 w-40 rounded-lg" />
      <Skeleton className="mt-5 h-7 w-32 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-full max-w-xs rounded-lg" />
      <div className="mt-6 space-y-4">
        <Skeleton className="h-12 rounded-2xl" />
        <Skeleton className="h-12 rounded-2xl" />
      </div>
      <Skeleton className="mt-6 h-12 rounded-2xl" />
    </div>
  );
}

export function ReceiptSkeleton() {
  return (
    <CustomerShell>
      <main className="bg-gradient-to-b from-cyan-50/40 to-white pb-16">
        <section className="customer-section max-w-lg space-y-4" aria-hidden="true">
          <div className="customer-card space-y-4 p-6">
            <Skeleton className="mx-auto h-16 w-16 rounded-2xl" />
            <Skeleton className="mx-auto h-6 w-40 rounded-lg" />
            <Skeleton className="mx-auto h-4 w-56 rounded-lg" />
            <div className="flex justify-center gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>
          <div className="customer-card space-y-3 p-6">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-4/5 rounded-lg" />
            <Skeleton className="h-4 w-3/5 rounded-lg" />
            <div className="mt-4 border-t border-cyan-100 pt-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16 rounded-lg" />
                <Skeleton className="h-5 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </CustomerShell>
  );
}

export function TrackResultSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="mt-6 grid gap-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, key) => (
        <div key={key} className="customer-card space-y-3 p-5">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function ProductRowSkeleton() {
  return (
    <div className="border-b border-slate-100 py-4" aria-hidden="true">
      <div className="flex gap-4">
        <Skeleton className="h-20 w-20 rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded bg-slate-100" />
          <Skeleton className="h-3 w-1/3 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function WizardProductGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-cyan-100 bg-aqua/30 p-4">
          <Skeleton className="h-5 w-3/4 rounded bg-cyan-100/80" />
          <Skeleton className="mt-2 h-4 w-1/3 rounded bg-cyan-100/80" />
        </div>
      ))}
    </div>
  );
}

export function OrderPageSkeleton() {
  return (
    <CustomerShell>
      <main className="pb-24" aria-hidden="true">
        <section className="customer-section max-w-2xl">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="mt-5 h-9 w-56 rounded-lg" />
          <Skeleton className="mt-2 h-4 w-full max-w-sm rounded-lg" />
          <div className="customer-card mt-6 divide-y divide-slate-100 p-0">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductRowSkeleton key={index} />
            ))}
          </div>
        </section>
      </main>
    </CustomerShell>
  );
}
