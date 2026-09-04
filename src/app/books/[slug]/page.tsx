import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Bell, Clock } from "lucide-react";
import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { BookCover } from "@/components/common/book-cover";
import { ArticleCard } from "@/components/cards/article-card";
import { NewsletterSection } from "@/sections/home/newsletter-section";
import { buildMetadata } from "@/lib/seo";
import { getBookBySlug, getBookSlugs, getRelatedArticles } from "@/lib/content";
import { bookSchema } from "@/lib/structured-data";

/** Pre-render every book page (SSG, CMS-swap friendly). */
export async function generateStaticParams() {
  const slugs = await getBookSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return buildMetadata({ title: "Book Not Found", description: "This book could not be found.", path: `/books/${slug}` });

  const displayTitle = book.title ?? "A Forthcoming Book";
  return buildMetadata({
    title: book.title
      ? `${book.title} — Book`
      : "Forthcoming Book",
    description:
      book.description ??
      `A forthcoming book by Dr. Robert Sakulanda — physician, scientist, and author.`,
    path: `/books/${book.slug}`,
  });
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) notFound();

  const related = await getRelatedArticles(slug, 2);
  const displayTitle = book.title ?? "Title to Be Announced";

  return (
    <>
      {/* ── Book hero ─────────────────────────────────────────── */}
      <section aria-label="Book overview" className="bg-ink text-ivory">
        <Container className="grain relative pb-16 pt-12 sm:pb-20 sm:pt-16">
          <Reveal>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ivory/60 transition-colors hover:text-gold-soft"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All Books
            </Link>
          </Reveal>

          <div className="mt-10 grid items-start gap-12 lg:grid-cols-12">
            {/* Cover */}
            <div className="lg:col-span-5">
              <Reveal className="relative mx-auto max-w-[300px] sm:max-w-sm lg:max-w-none">
                <div
                  aria-hidden="true"
                  className="absolute -bottom-5 -right-5 h-full w-full bg-gradient-to-br from-gold/25 to-transparent"
                />
                <div className="relative shadow-[0_40px_80px_-32px_rgba(0,0,0,0.85)]">
                  <BookCover
                    src={book.coverImage}
                    alt={
                      book.title
                        ? `Book cover: ${book.title}`
                        : "Designed placeholder cover for Dr. Robert Sakulanda's forthcoming book"
                    }
                    title={book.title}
                    priority
                    sizes="(max-width: 640px) 80vw, 440px"
                  />
                </div>
              </Reveal>
            </div>

            {/* Details */}
            <div className="lg:col-span-7">
              <Reveal>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-soft">
                  {book.status === "forthcoming"
                    ? "Forthcoming"
                    : book.category ?? "Book"}
                </p>
                <h1 className="mt-4 font-serif text-4xl leading-[1.12] text-balance sm:text-5xl">
                  {book.title ?? (
                    <>
                      A new book by{" "}
                      <span className="italic text-gold-soft">
                        Dr. Robert Sakulanda
                      </span>
                    </>
                  )}
                </h1>
                {book.subtitle ? (
                  <p className="mt-3 font-serif text-xl italic text-ivory/70">
                    {book.subtitle}
                  </p>
                ) : null}
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-ivory/80 sm:text-lg">
                  {book.description}
                </p>
              </Reveal>

              <Reveal delay={0.16}>
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

              {/* Metadata table — placeholders stay honest */}
              <Reveal delay={0.2}>
                <dl className="mt-10 grid gap-x-10 gap-y-4 border-t border-nightline pt-8 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-4 sm:justify-start">
                    <dt className="uppercase tracking-wider text-ivory/45">Status</dt>
                    <dd className="text-ivory/85">
                      {book.status === "forthcoming"
                        ? "In progress"
                        : "Available"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:justify-start">
                    <dt className="uppercase tracking-wider text-ivory/45">
                      Publication
                    </dt>
                    <dd className="text-ivory/85">
                      {book.publicationDate ?? "To be announced"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:justify-start">
                    <dt className="uppercase tracking-wider text-ivory/45">Publisher</dt>
                    <dd className="text-ivory/85">
                      {book.publisher ?? "To be announced"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:justify-start">
                    <dt className="uppercase tracking-wider text-ivory/45">Formats</dt>
                    <dd className="text-ivory/85">
                      {book.formats.length ? book.formats.join(", ") : "To be announced"}
                    </dd>
                  </div>
                </dl>
              </Reveal>

              {/* Purchase options — honest "coming soon" until links exist */}
              <Reveal delay={0.24}>
                <div className="mt-10 rounded-md border border-nightline bg-ink-soft/70 p-6">
                  {book.purchaseLinks.length ? (
                    <div className="flex flex-wrap gap-4">
                      {book.purchaseLinks.map((l) => (
                        <a
                          key={l.retailer}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-12 items-center rounded-sm bg-gold px-6 text-sm font-semibold uppercase tracking-[0.12em] text-ink hover:bg-gold-soft"
                        >
                          Buy from {l.retailer}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-serif text-lg text-ivory">
                          Availability coming soon
                        </p>
                        <p className="mt-1 text-sm text-ivory/60">
                          Purchase options will appear here on release.
                        </p>
                      </div>
                      <Link
                        href="/#stay-connected"
                        className="inline-flex h-11 items-center gap-2 rounded-sm border border-gold/50 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-gold-soft transition-colors hover:bg-gold hover:text-ink"
                      >
                        <Bell className="h-4 w-4" aria-hidden="true" />
                        Get Notified
                      </Link>
                    </div>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Why this book ─────────────────────────────────────── */}
      {book.whyThisBook ? (
        <section aria-label="Why this book" className="bg-ivory">
          <Container className="py-16 sm:py-20">
            <Reveal className="mx-auto max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
                Why This Book
              </p>
              <h2 className="mt-4 font-serif text-3xl text-ink sm:text-4xl">
                Three reasons it matters
              </h2>
            </Reveal>
            <div className="mx-auto mt-10 max-w-3xl space-y-8">
              {book.whyThisBook.map((reason, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="flex gap-6">
                    <span
                      aria-hidden="true"
                      className="font-serif text-4xl leading-none text-gold/60"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="pt-1 text-[17px] leading-relaxed text-slate-body">
                      {reason}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ── Author note (placeholder state) ───────────────────── */}
      <section aria-label="Author's note" className="border-y border-hairline bg-ivory-deep/60">
        <Container className="py-16 sm:py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
              A Note from Robert
            </p>
            {book.authorNote ? (
              <blockquote className="mt-6 font-serif text-2xl italic leading-relaxed text-ink">
                &ldquo;{book.authorNote}&rdquo;
              </blockquote>
            ) : (
              <p className="mt-6 font-serif text-xl italic leading-relaxed text-slate-body">
                A personal note about this book will be shared here as
                publication approaches.
              </p>
            )}
          </Reveal>
        </Container>
      </section>

      {/* ── Testimonials (only when provided) ─────────────────── */}
      {book.testimonials.length > 0 ? (
        <section aria-label="Reviews" className="bg-ivory">
          <Container className="py-16 sm:py-20">
            <h2 className="font-serif text-3xl text-ink">Early praise</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {book.testimonials.map((t, i) => (
                <figure
                  key={i}
                  className="rounded-md border border-hairline bg-card p-8"
                >
                  <blockquote className="font-serif text-lg italic leading-relaxed text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-sm text-slate-body">
                    {t.name}
                    {t.credential ? ` — ${t.credential}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ── Related articles ──────────────────────────────────── */}
      {related.length ? (
        <section aria-label="Related writing" className="border-t border-hairline bg-ivory">
          <Container className="py-16 sm:py-20">
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-serif text-2xl text-ink sm:text-3xl">
                Related writing
              </h2>
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-gold-deep hover:text-ink"
              >
                All articles
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-10 grid gap-7 sm:grid-cols-2">
              {related.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <NewsletterSection />

      {/* Structured data — only for real, titled books */}
      {book.title ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              bookSchema({
                title: book.title,
                slug: book.slug,
                description: book.description,
              })
            ),
          }}
        />
      ) : null}
    </>
  );
}
