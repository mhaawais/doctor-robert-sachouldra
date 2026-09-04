import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { NewsletterForm } from "@/components/layout/newsletter-form";

/**
 * HOME — NEWSLETTER (10.8)
 * "Stay Connected" — real backend storage via /api/newsletter with a clean
 * integration point for a future email provider (see README).
 */
export function NewsletterSection() {
  return (
    <section
      id="stay-connected"
      aria-label="Newsletter"
      className="border-y border-hairline bg-ivory-deep/60"
    >
      <Container className="py-20 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
            Newsletter
          </p>
          <h2 className="mt-4 font-serif text-3xl text-ink text-balance sm:text-4xl">
            Stay Connected
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-body">
            Follow Robert&apos;s latest writing, ideas, and updates — a short
            note when something new is published. No noise, ever.
          </p>
          <div className="mx-auto mt-8 max-w-lg">
            <NewsletterForm id="home-newsletter" />
          </div>
          <p className="mt-4 text-xs text-ink/45">
            By subscribing you agree to receive email updates. Unsubscribe at
            any time.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
