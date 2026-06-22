import { Skeleton } from "@/components/ui/skeleton";

function DriverOrderCardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-3 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-40 rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4 rounded-lg" />
      <Skeleton className="mt-2 h-11 w-full rounded-md" />
    </div>
  );
}

export function DriverBoardSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <section>
        <Skeleton className="mb-3 h-4 w-32 rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <DriverOrderCardSkeleton key={index} />
          ))}
        </div>
      </section>
      <section>
        <Skeleton className="mb-3 h-4 w-40 rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <DriverOrderCardSkeleton key={`unassigned-${index}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
