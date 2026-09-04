import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { BookCard } from "@/components/cards/book-card";
import { NewsletterSection } from "@/sections/home/newsletter-section";
import { buildMetadata } from "@/lib/seo";
import { getBooks } from "@/lib/content";

export const metadata: Metadata = buildMetadata({
  title: "Books",
  description:
    "Books by Dr. Robert Sakulanda — frontline physician and biotechnologist. Discover his forthcoming debut book on medicine, science, and the human stories between them.",
  path: "/books",
});

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <>
      <section aria-label="Books hero" className="border-b border-hairline bg-ivory-deep/50">
        <Container className="pb-14 pt-16 text-center sm:pb-16 sm:pt-20">
          <Reveal>
            <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
              <span aria-hidden="true" className="inline-block h-px w-8 bg-gold/70" />
              The Library
              <span aria-hidden="true" className="inline-block h-px w-8 bg-gold/70" />
            </p>
            <h1 className="mx-auto mt-6 max-w-2xl font-serif text-4xl leading-[1.1] text-ink text-balance sm:text-5xl">
              Books
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-body">
              Writing that carries the ward and the laboratory into the same
              room — starting with a debut book drawn from the COVID-19
              front lines.
            </p>
          </Reveal>
        </Container>
      </section>

      <section aria-label="All books" className="bg-ivory">
        <Container className="py-16 sm:py-20">
          <RevealGroup className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <RevealItem key={book.slug}>
                <BookCard book={book} />
              </RevealItem>
            ))}

            {/* Elegant empty slot — future titles */}
            <RevealItem>
              <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-ink/20 bg-ivory-deep/40 p-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold-deep">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-serif text-xl text-ink/70">
                  More titles to be announced
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-body">
                  New projects are in motion. Subscribe to the newsletter to
                  hear about them first.
                </p>
              </div>
            </RevealItem>
          </RevealGroup>

          <Reveal className="mx-auto mt-16 max-w-2xl text-center">
            <p className="text-sm leading-relaxed text-slate-body/90">
              <span className="font-semibold text-ink">A note on details:</span>{" "}
              titles, publishers, ISBNs, and purchase links are shared here the
              moment they are official — and not before.
            </p>
          </Reveal>
        </Container>
      </section>

      <NewsletterSection />
    </>
  );
}
