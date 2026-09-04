import "server-only";

import { books } from "@/data/books";
import { articles } from "@/data/articles";
import { author, journey, expertiseAreas } from "@/data/author";
import { site } from "@/data/site";
import type { Article, Book, Author, JourneyStep, SiteSettings } from "@/types";

/**
 * CONTENT ACCESS LAYER
 * --------------------
 * All pages fetch content through these async getters instead of importing
 * data files directly. Today they read from local structured data; to move
 * to a CMS later (Sanity, Contentful, WordPress, MDX), re-implement only
 * this file — no UI component changes required.
 */

export async function getSiteSettings(): Promise<SiteSettings> {
  return site;
}

export async function getAuthor(): Promise<Author> {
  return author;
}

export async function getJourney(): Promise<JourneyStep[]> {
  return journey;
}

export async function getExpertiseAreas() {
  return expertiseAreas;
}

export async function getBooks(): Promise<Book[]> {
  // Sorted: featured first, then published > announced > forthcoming
  const statusOrder = { published: 0, announced: 1, forthcoming: 2 } as const;
  return [...books].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return statusOrder[a.status] - statusOrder[b.status];
  });
}

export async function getFeaturedBook(): Promise<Book | undefined> {
  return books.find((b) => b.featured) ?? books[0];
}

export async function getBookBySlug(slug: string): Promise<Book | undefined> {
  return books.find((b) => b.slug === slug);
}

export async function getBookSlugs(): Promise<string[]> {
  return books.map((b) => b.slug);
}

export async function getArticles(): Promise<Article[]> {
  return [...articles].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  return articles.find((a) => a.slug === slug);
}

export async function getArticleSlugs(): Promise<string[]> {
  return articles.map((a) => a.slug);
}

export async function getFeaturedArticle(): Promise<Article | undefined> {
  return (await getArticles()).find((a) => a.featured);
}

export async function getRelatedArticles(slug: string, limit = 2): Promise<Article[]> {
  const all = await getArticles();
  const current = all.find((a) => a.slug === slug);
  if (!current) return all.slice(0, limit);
  const sameCategory = all.filter(
    (a) => a.slug !== slug && a.category === current.category
  );
  const others = all.filter(
    (a) => a.slug !== slug && a.category !== current.category
  );
  return [...sameCategory, ...others].slice(0, limit);
}
