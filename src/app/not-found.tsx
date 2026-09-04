import Link from "next/link";
import { Container } from "@/components/common/container";

export default function NotFound() {
  return (
    <section className="bg-ivory">
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-[7rem] leading-none text-gold/50 sm:text-[9rem]" aria-hidden="true">
          404
        </p>
        <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">
          This page has wandered off the map.
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-slate-body">
          Like many a good journey, the one you were on doesn&apos;t exist at
          this address. Let&apos;s get you back to solid ground.
        </p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-[52px] items-center justify-center rounded-sm bg-ink px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-navy"
          >
            Back Home
          </Link>
          <Link
            href="/books"
            className="inline-flex h-[52px] items-center justify-center rounded-sm border border-ink/25 px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-gold hover:text-gold-deep"
          >
            Explore Books
          </Link>
        </div>
      </Container>
    </section>
  );
}
