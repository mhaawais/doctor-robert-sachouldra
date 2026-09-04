import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { AuthorPortrait } from "@/components/common/author-portrait";
import { Reveal } from "@/components/common/reveal";
import { author } from "@/data/author";

/**
 * HOME — HERO (10.1)
 * Cinematic, editorial, typography-led. Communicates who Robert is,
 * what he does, and why his story matters.
 */
export function Hero() {
  return (
    <section aria-label="Introduction" className="relative overflow-hidden">
      {/* soft radial washes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_10%,rgba(181,154,98,0.10),transparent_60%),radial-gradient(50%_40%_at_10%_90%,rgba(29,58,79,0.08),transparent_60%)]"
      />

      <Container className="relative grid items-center gap-14 pb-20 pt-16 sm:pb-24 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-24">
        {/* Copy */}
        <div className="lg:col-span-7">
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
              <span aria-hidden="true" className="inline-block h-px w-10 bg-gold/70" />
              Family Medicine Physician · Biotechnologist · Author
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-7 font-serif text-[2.65rem] leading-[1.08] text-ink text-balance sm:text-6xl lg:text-[4.2rem]">
              Medicine, science, and the{" "}
              <span className="relative whitespace-nowrap text-gold-deep">
                stories
              </span>{" "}
              that connect us.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-body sm:text-xl">
              I&apos;m Dr. Robert Sakulanda — a frontline physician who stepped
              out of the COVID-19 wards and into the world of biotechnology,
              searching for better answers. I write about medicine, science,
              and the human lives where the two meet.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/books"
                className="inline-flex h-[52px] items-center justify-center rounded-sm bg-ink px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ivory shadow-[0_16px_36px_-16px_rgba(14,27,42,0.6)] transition-all hover:-translate-y-0.5 hover:bg-navy"
              >
                Explore My Books
                <ArrowRight className="ml-2.5 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/about"
                className="inline-flex h-[52px] items-center justify-center rounded-sm border border-ink/25 px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-gold hover:text-gold-deep"
              >
                Read My Story
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <p className="mt-12 max-w-md text-sm leading-relaxed text-ink/50 italic">
              &ldquo;A lifelong commitment to medicine, biotechnology, and
              creating a healthier future — in the United States, Zambia, and
              around the world.&rdquo;
            </p>
          </Reveal>
        </div>

        {/* Portrait */}
        <div className="lg:col-span-5">
          <Reveal delay={0.25} className="relative mx-auto max-w-sm lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -left-4 -top-4 h-full w-full rounded-sm border border-gold/40 sm:-left-6 sm:-top-6"
            />
            <AuthorPortrait caption={false} priority />
            <p className="mt-4 text-center text-xs tracking-wide text-ink/45">
              {author.name} — official portrait coming soon
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
