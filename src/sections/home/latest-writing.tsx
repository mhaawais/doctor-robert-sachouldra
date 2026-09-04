import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionHeading } from "@/components/common/section-heading";
import { RevealGroup, RevealItem } from "@/components/common/reveal";
import { ArticleCard } from "@/components/cards/article-card";
import { getArticles } from "@/lib/content";

/**
 * HOME — LATEST WRITING (10.7)
 * Three most recent articles with cover, category, title, excerpt, date,
 * read time, and CTA.
 */
export async function LatestWriting() {
  const articles = (await getArticles()).slice(0, 3);

  return (
    <section aria-label="Latest writing" className="bg-ivory">
      <Container className="py-20 sm:py-28">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Latest Writing"
            title="Notes from the intersection."
            description="Essays on medicine, biotechnology, and the human stories between them."
          />
          <RevealItem>
            <Link
              href="/blog"
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-gold-deep transition-colors hover:text-ink"
            >
              All Articles
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </RevealItem>
        </div>

        <RevealGroup className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <RevealItem key={article.slug}>
              <ArticleCard article={article} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
