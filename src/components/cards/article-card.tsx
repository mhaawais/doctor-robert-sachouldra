import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import type { Article } from "@/types";
import { formatDate } from "@/data/articles";
import { cn } from "@/lib/utils";

/**
 * Article card — editorial blog preview.
 * `variant="featured"` renders a large horizontal layout for the blog hero.
 */
export function ArticleCard({
  article,
  variant = "default",
  priority = false,
  className,
}: {
  article: Article;
  variant?: "default" | "featured";
  priority?: boolean;
  className?: string;
}) {
  if (variant === "featured") {
    return (
      <article
        className={cn(
          "group grid overflow-hidden rounded-md border border-hairline bg-card shadow-[0_10px_36px_-20px_rgba(14,27,42,0.35)] md:grid-cols-2",
          className
        )}
      >
        <Link
          href={`/blog/${article.slug}`}
          className="relative block aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[340px]"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={article.coverImage}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        <div className="flex flex-col justify-center p-7 sm:p-10">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
            <span className="rounded-full bg-accent px-3 py-1 text-ink">
              {article.category}
            </span>
            <span className="text-ink/50">Featured</span>
          </p>
          <h3 className="mt-4 font-serif text-2xl leading-snug text-ink sm:text-[1.75rem]">
            <Link
              href={`/blog/${article.slug}`}
              className="transition-colors hover:text-gold-deep"
            >
              {article.title}
            </Link>
          </h3>
          <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-slate-body">
            {article.excerpt}
          </p>
          <div className="mt-6 flex items-center gap-4 text-xs text-ink/55">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {article.readTime} min read
            </span>
          </div>
          <Link
            href={`/blog/${article.slug}`}
            className="group/cta mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-deep transition-colors hover:text-ink"
          >
            Read article
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover/cta:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-md border border-hairline bg-card shadow-[0_10px_36px_-20px_rgba(14,27,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(14,27,42,0.45)]",
        className
      )}
    >
      <Link
        href={`/blog/${article.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-ink"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={article.coverImage}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 360px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
          {article.category}
        </p>
        <h3 className="mt-2 font-serif text-xl leading-snug text-ink">
          <Link
            href={`/blog/${article.slug}`}
            className="transition-colors hover:text-gold-deep"
          >
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-body">
          {article.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-5 text-xs text-ink/55">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {article.readTime} min
          </span>
        </div>
      </div>
    </article>
  );
}
