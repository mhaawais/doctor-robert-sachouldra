import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal, RevealItem } from "@/components/common/reveal";
import { ArticleCard } from "@/components/cards/article-card";
import { ArticleBrowser } from "@/components/blog/article-browser";
import { NewsletterSection } from "@/sections/home/newsletter-section";
import { buildMetadata } from "@/lib/seo";
import { getArticles, getFeaturedArticle } from "@/lib/content";
import { articleCategories } from "@/data/articles";

export const metadata: Metadata = buildMetadata({
  title: "Blog & News",
  description:
    "Essays and updates from Dr. Robert Sakulanda on medicine, biotechnology, resilience, and the human stories where science and life meet.",
  path: "/blog",
});

export default async function BlogPage() {
  const [articles, featured] = await Promise.all([
    getArticles(),
    getFeaturedArticle(),
  ]);

  // Featured article is shown large above; excluded from the browser grid
  const rest = featured ? articles.filter((a) => a.slug !== featured.slug) : articles;

  return (
    <>
      <section aria-label="Blog hero" className="border-b border-hairline bg-ivory-deep/50">
        <Container className="pb-14 pt-16 text-center sm:pb-16 sm:pt-20">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
              Blog &amp; News
            </p>
            <h1 className="mx-auto mt-6 max-w-2xl font-serif text-4xl leading-[1.1] text-ink text-balance sm:text-5xl">
              Notes from the intersection of medicine &amp; meaning.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-body">
              Essays, reflections, and news — written between the ward, the
              laboratory, and the page.
            </p>
          </Reveal>
        </Container>
      </section>

      <section aria-label="Articles" className="bg-ivory">
        <Container className="py-16 sm:py-20">
          {/* Featured article */}
          {featured ? (
            <div className="mb-16">
              <RevealItem>
                <ArticleCard article={featured} variant="featured" priority />
              </RevealItem>
            </div>
          ) : null}

          {/* Latest articles + search/filter/load-more */}
          <SectionHeading title="Latest articles" className="mb-10" />
          <ArticleBrowser articles={rest} categories={[...articleCategories]} />
        </Container>
      </section>

      <NewsletterSection />
    </>
  );
}
