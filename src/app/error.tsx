"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/common/container";

/**
 * Global error boundary — user-friendly recovery UI.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error boundary]", error);
  }, [error]);

  return (
    <section className="bg-ivory">
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
          Something went wrong
        </p>
        <h1 className="mt-4 max-w-xl font-serif text-3xl text-ink text-balance sm:text-4xl">
          An unexpected error interrupted this page.
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-slate-body">
          This usually fixes itself on a retry. If it persists, please come
          back a little later — or head home and explore from there.
        </p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-[52px] items-center justify-center rounded-sm bg-ink px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-navy"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex h-[52px] items-center justify-center rounded-sm border border-ink/25 px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-gold hover:text-gold-deep"
          >
            Back Home
          </Link>
        </div>
      </Container>
    </section>
  );
}
