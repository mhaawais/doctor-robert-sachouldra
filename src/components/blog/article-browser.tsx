"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Article } from "@/types";
import { ArticleCard } from "@/components/cards/article-card";
import { RevealItem } from "@/components/common/reveal";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;

/**
 * Blog listing browser — client-side search, category filtering, and
 * "load more" pagination over the article collection. Displays loading,
 * empty, and error states appropriately.
 */
export function ArticleBrowser({
  articles,
  categories,
  hasFeatured = false,
}: {
  articles: Article[];
  categories: string[];
  hasFeatured?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const matchesCategory = !category || a.category === category;
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [articles, query, category]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  // Simulated short transition for perceived responsiveness + skeleton state
  function onSearchChange(value: string) {
    setQuery(value);
    setSearching(true);
    setVisible(PAGE_SIZE);
    window.setTimeout(() => setSearching(false), 220);
  }

  function onCategoryChange(next: string | null) {
    setCategory((c) => (c === next ? null : next));
    setVisible(PAGE_SIZE);
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <label htmlFor="article-search" className="sr-only">
            Search articles
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
            aria-hidden="true"
          />
          <input
            id="article-search"
            type="search"
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search articles…"
            className="h-12 w-full rounded-sm border border-hairline bg-white pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-gold"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategoryChange(c)}
              aria-pressed={category === c}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-colors",
                category === c
                  ? "border-ink bg-ink text-ivory"
                  : "border-hairline bg-white text-ink/70 hover:border-gold hover:text-gold-deep"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Result count (screen-reader friendly) */}
      <p className="mt-6 text-sm text-ink/55" role="status" aria-live="polite">
        {searching
          ? "Searching…"
          : filtered.length === 0
            ? ""
            : `Showing ${shown.length} of ${filtered.length} article${filtered.length === 1 ? "" : "s"}`}
      </p>

      {/* Grid */}
      {searching ? (
        <div className="mt-4 grid gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-md border border-hairline bg-card">
              <div className="aspect-[16/10] animate-pulse bg-muted" />
              <div className="space-y-3 p-6">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : shown.length ? (
        <div className="mt-4 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((article) => (
            <RevealItem key={article.slug}>
              <ArticleCard article={article} />
            </RevealItem>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="mt-4 rounded-md border border-dashed border-ink/20 bg-ivory-deep/40 px-8 py-16 text-center">
          <p className="font-serif text-2xl text-ink/70">No articles found</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-body">
            Nothing matches your search in this category yet. Try different
            keywords or clear the filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory(null);
              setVisible(PAGE_SIZE);
            }}
            className="mt-6 rounded-sm bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-navy"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Load more */}
      {hasMore && !searching ? (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="inline-flex h-12 items-center rounded-sm border border-ink/25 px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-gold hover:text-gold-deep"
          >
            Load More Articles
          </button>
        </div>
      ) : null}
    </div>
  );
}
