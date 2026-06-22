import { AdminNav } from "@/components/layout/admin-nav";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminShellSkeleton() {
  return (
    <main className="water-canvas min-h-screen" aria-hidden="true">
      <AdminNav />
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="mt-4 h-8 w-56 rounded-lg" />
          <Skeleton className="mt-2 h-4 w-80 max-w-full rounded-lg" />
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <AdminTableSkeleton rows={6} />
      </section>
    </main>
  );
}

export function AdminTableSkeleton({
  rows = 8,
  columns = 6,
  showHeader = true
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm" aria-hidden="true">
      {showHeader ? (
        <div className="hidden gap-3 border-b bg-slate-100 px-4 py-3 lg:grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-16 rounded bg-slate-200" />
          ))}
        </div>
      ) : null}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-3 px-4 py-4 lg:items-center"
            style={{ gridTemplateColumns: `repeat(${Math.min(columns, 2)}, 1fr)` }}
          >
            {Array.from({ length: Math.min(columns, 2) }).map((__, colIndex) => (
              <div key={colIndex} className="space-y-2">
                <Skeleton className="h-4 w-3/4 rounded bg-slate-100" />
                <Skeleton className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminOrderDetailSkeleton() {
  return (
    <main className="water-canvas min-h-screen" aria-hidden="true">
      <AdminNav />
      <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-4 w-28 rounded-lg" />
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-4 w-36 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-md border bg-slate-50 p-4 space-y-2">
                  <Skeleton className="h-4 w-20 rounded-lg" />
                  <Skeleton className="h-3 w-full rounded-lg" />
                  <Skeleton className="h-3 w-4/5 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-11 rounded-md" />
              ))}
            </div>
          </section>
          <aside className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
                <Skeleton className="h-5 w-24 rounded-lg" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </aside>
        </div>
      </section>
    </main>
  );
}

export function AdminStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-white p-5 shadow-sm">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="mt-3 h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function AdminListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y rounded-lg border bg-white shadow-sm" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid gap-2 p-4 md:grid-cols-[1fr_120px_140px_120px] md:items-center">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-3 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-16 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded-lg" />
          <Skeleton className="h-4 w-12 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function AdminCustomerDetailSkeleton() {
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-white p-5 shadow-sm space-y-3">
          <Skeleton className="h-5 w-28 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-4/5 rounded-lg" />
          <Skeleton className="h-4 w-3/5 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function AdminCompactAuthSkeleton() {
  return (
    <main className="water-canvas grid min-h-screen place-items-center px-4" aria-hidden="true">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm space-y-4">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </main>
  );
}
