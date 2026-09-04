import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";

/**
 * HOME — FINAL CTA (10.9)
 * "Explore the books, stories, and ideas behind the journey."
 */
export function FinalCta() {
  return (
    <section aria-label="Explore further" className="bg-ivory">
      <Container className="py-20 text-center sm:py-28">
        <Reveal>
          <p
            aria-hidden="true"
            className="mx-auto mb-8 h-10 w-px bg-gradient-to-b from-transparent to-gold/70"
          />
          <h2 className="mx-auto max-w-3xl font-serif text-3xl leading-tight text-ink text-balance sm:text-[2.6rem]">
            Explore the books, stories, and ideas behind the journey.
          </h2>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/books"
              className="inline-flex h-[52px] items-center justify-center rounded-sm bg-ink px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-navy"
            >
              Explore Books
              <ArrowRight className="ml-2.5 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-[52px] items-center justify-center rounded-sm border border-ink/25 px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-gold hover:text-gold-deep"
            >
              Get in Touch
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
