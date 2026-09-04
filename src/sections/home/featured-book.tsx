import Link from "next/link";
import { ArrowRight, Bell } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal } from "@/components/common/reveal";
import { BookCover } from "@/components/common/book-cover";
import { getFeaturedBook } from "@/lib/content";

/**
 * HOME — FEATURED BOOK (10.3)
 * Visually strong presentation of the forthcoming book. Real metadata is
 * pending from the client; "null" fields render as polished placeholders
 * (never fabricated titles, ISBNs, or purchase links).
 */
export async function FeaturedBook() {
  const book = await getFeaturedBook();
  if (!book) return null;

  const displayTitle = book.title ?? "A New Book";
  const statusLabel =
    book.status === "forthcoming" ? "Forthcoming Book" : book.status;

  return (
    <section aria-label="Featured book" className="bg-ink text-ivory">
      <Container className="py-20 sm:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          {/* Cover */}
          <div className="lg:col-span-5">
            <Reveal className="relative mx-auto max-w-[320px] sm:max-w-sm lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute -bottom-5 -right-5 h-full w-full rounded-sm bg-gradient-to-br from-gold/25 to-transparent"
              />
              <div className="relative shadow-[0_40px_80px_-32px_rgba(0,0,0,0.8)]">
                <BookCover
                  src={book.coverImage}
                  alt={
                    book.title
                      ? `Book cover: ${book.title}`
                      : "Designed placeholder cover for Dr. Robert Sakulanda's forthcoming book"
                  }
                  title={book.title}
                  priority
                  sizes="(max-width: 640px) 80vw, 460px"
                />
              </div>
            </Reveal>
          </div>

          {/* Copy */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-gold-soft">
                <span aria-hidden="true" className="inline-block h-px w-10 bg-gold/60" />
                {statusLabel}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-6 font-serif text-4xl leading-[1.12] text-balance sm:text-5xl">
                {book.title ?? (
                  <>
                    His first book is{" "}
                    <span className="italic text-gold-soft">in the writing.</span>
                  </>
                )}
              </h2>
            </Reveal>
            {book.subtitle ? (
              <Reveal delay={0.12}>
                <p className="mt-3 font-serif text-xl italic text-ivory/70">{book.subtitle}</p>
              </Reveal>
            ) : null}
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/75 sm:text-lg">
                {book.description}
              </p>
            </Reveal>

            <Reveal delay={0.22}>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {book.themes.map((theme) => (
                  <span
                    key={theme}
                    className="rounded-full border border-nightline px-4 py-1.5 text-xs tracking-wide text-ivory/75"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.28}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href={`/books/${book.slug}`}
                  className="inline-flex h-[52px] items-center justify-center rounded-sm bg-gold px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-soft"
                >
                  About the Book
                  <ArrowRight className="ml-2.5 h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/#stay-connected"
                  className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-sm border border-nightline px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:border-gold hover:text-gold-soft"
                >
                  <Bell className="h-4 w-4" aria-hidden="true" />
                  Get Release Updates
                </Link>
              </div>
              <p className="mt-4 text-xs tracking-wide text-ivory/40">
                Publication details — title, publisher, and release date — will
                be announced here first.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
