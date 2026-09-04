import { Container } from "@/components/common/container";

/**
 * Route-level loading skeleton (editorial, on-brand).
 */
export default function Loading() {
  return (
    <Container className="py-20 sm:py-28">
      <div className="mx-auto max-w-2xl" aria-hidden="true">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-12 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-10 space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-10 grid gap-7 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-md border border-hairline bg-card">
              <div className="aspect-[16/10] animate-pulse bg-muted" />
              <div className="space-y-3 p-6">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="sr-only" role="status">
        Loading…
      </p>
    </Container>
  );
}
