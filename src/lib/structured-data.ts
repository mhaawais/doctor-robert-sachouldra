import { site } from "@/data/site";
import { author } from "@/data/author";

/**
 * SCHEMA.ORG STRUCTURED DATA (JSON-LD)
 * ------------------------------------
 * Only verified client information is emitted. No fabricated awards,
 * credentials, or social profiles. Book schema is emitted only when a real
 * title exists (see book detail page).
 */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    alternateName: "Robert Sakulanda",
    honorificSuffix: author.credentials,
    url: site.url,
    jobTitle: author.roles,
    description: author.bio,
    sameAs: site.socials.map((s) => s.url),
    knowsAbout: [
      "Family Medicine",
      "Hospital Medicine",
      "Biotechnology",
      "Vaccines",
      "Gene Editing",
      "Science Writing",
    ],
  };
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.positioning,
    author: { "@type": "Person", name: author.name },
  };
}

export function articleSchema(article: {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  coverImage: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    url: `${site.url}/blog/${article.slug}`,
    image: `${site.url}${article.coverImage}`,
    author: { "@type": "Person", name: author.name, url: site.url },
  };
}

export function bookSchema(book: {
  title: string;
  slug: string;
  description: string;
  image: string | null;
  amazonUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    description: book.description,
    url: `${site.url}/books/${book.slug}`,
    ...(book.image ? { image: `${site.url}${book.image}` } : {}),
    ...(book.amazonUrl ? { sameAs: book.amazonUrl } : {}),
    author: { "@type": "Person", name: author.name, url: site.url },
  };
}

export function breadcrumbSchema(book: { title: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Books", item: `${site.url}/books` },
      { "@type": "ListItem", position: 3, name: book.title, item: `${site.url}/books/${book.slug}` },
    ],
  };
}
