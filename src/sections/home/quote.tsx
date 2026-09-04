import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { author } from "@/data/author";

/**
 * HOME — AUTHOR'S PHILOSOPHY (10.6)
 * The only "quotation" used is the client-provided mission language from
 * his verified biography — never an invented quote.
 */
export function Quote() {
  return (
    <section aria-label="Author's philosophy" className="bg-ink text-ivory">
      <Container className="grain relative py-24 text-center sm:py-32">
        <Reveal>
          <p
            aria-hidden="true"
            className="font-serif text-[7rem] leading-none text-gold/25 sm:text-[9rem]"
          >
            &ldquo;
          </p>
          <blockquote className="mx-auto -mt-10 max-w-3xl sm:-mt-14">
            <p className="font-serif text-2xl leading-snug text-ivory text-balance sm:text-[2.1rem]">
              A lifelong commitment to medicine, biotechnology, and creating a
              healthier future — for communities in the United States, Zambia,
              and around the world.
            </p>
            <footer className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-gold-soft">
                — {author.name}
              </p>
              <p className="mt-2 text-xs tracking-wide text-ivory/45">
                Personal mission, from his biography
              </p>
            </footer>
          </blockquote>
        </Reveal>
      </Container>
    </section>
  );
}
