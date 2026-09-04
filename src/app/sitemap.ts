import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getBookSlugs, getArticleSlugs } from "@/lib/content";

/** Dynamic sitemap — static pages + every book and article route. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [bookSlugs, articleSlugs] = await Promise.all([
    getBookSlugs(),
    getArticleSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/books`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${site.url}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const bookRoutes: MetadataRoute.Sitemap = bookSlugs.map((slug) => ({
    url: `${site.url}/books/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${site.url}/blog/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...bookRoutes, ...articleRoutes];
}
