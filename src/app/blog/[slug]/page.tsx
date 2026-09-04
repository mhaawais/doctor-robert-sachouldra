import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { ArticleBody } from "@/components/blog/article-body";
import { ShareArticle } from "@/components/blog/share-article";
import { ArticleCard } from "@/components/cards/article-card";
import { NewsletterSection } from "@/sections/home/newsletter-section";
import { buildMetadata } from "@/lib/seo";
import { getArticleBySlug, getArticleSlugs, getRelatedArticles } from "@/lib/content";
import { formatDate } from "@/data/articles";
import { site } from "@/data/site";
import { articleSchema } from "@/lib/structured-data";

/** Pre-render every article page (SSG, CMS-swap friendly). */
export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article)
    return buildMetadata({
      title: "Article Not Found",
      description: "This article could not be found.",
      path: `/blog/${slug}`,
    });

  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/blog/${article.slug}`,
    type: "article",
    publishedTime: article.date,
    images: [article.coverImage],
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(slug, 2);
  const shareUrl = `${site.url}/blog/${article.slug}`;

  return (
    <>
      <article>
        {/* ── Article hero ──────────────────────────────────────── */}
        <header className="bg-ivory">
          <Container className="max-w-4xl pb-10 pt-12 sm:pt-16">
            <Reveal>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/55 transition-colors hover:text-gold-deep"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                All Articles
              </Link>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.2em]">
                <span className="rounded-full bg-accent px-3 py-1 text-ink">
                  {article.category}
                </span>
                <span className="text-gold-deep">{formatDate(article.date)}</span>
                <span className="inline-flex items-center gap-1.5 text-ink/50">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {article.readTime} min read
                </span>
              </p>
              <h1 className="mt-6 font-serif text-[2.1rem] leading-[1.15] text-ink text-balance sm:text-5xl">
                {article.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-body">
                By {site.name}
              </p>
            </Reveal>
          </Container>
        </header>

        {/* ── Cover image ───────────────────────────────────────── */}
        <Reveal>
          <figure className="relative aspect-[16/8] w-full overflow-hidden bg-ink sm:aspect-[21/9]">
            <Image
              src={article.coverImage}
              alt={article.coverAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </figure>
        </Reveal>

        {/* ── Body ──────────────────────────────────────────────── */}
        <div className="bg-ivory">
          <Container className="max-w-3xl py-12 sm:py-16">
            <Reveal>
              <div className="[&>div>p:first-child]:drop-cap">
                <ArticleBody content={article.content} />
              </div>
            </Reveal>

            <Reveal>
              <div className="mt-12 flex items-center justify-between border-t border-hairline pt-8">
                <ShareArticle title={article.title} url={shareUrl} />
                <p className="text-xs text-ink/45">Published {formatDate(article.date)}</p>
              </div>
            </Reveal>
          </Container>
        </div>

        {/* ── Related articles ──────────────────────────────────── */}
        {related.length ? (
          <section aria-label="Related articles" className="border-y border-hairline bg-ivory-deep/50">
            <Container className="py-16 sm:py-20">
              <div className="flex items-end justify-between gap-6">
                <h2 className="font-serif text-2xl text-ink sm:text-3xl">
                  Keep reading
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
                {related.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </Container>
          </section>
        ) : null}
      </article>

      <NewsletterSection />

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              title: article.title,
              excerpt: article.excerpt,
              date: article.date,
              slug: article.slug,
              coverImage: article.coverImage,
            })
          ),
        }}
      />
    </>
  );
}
