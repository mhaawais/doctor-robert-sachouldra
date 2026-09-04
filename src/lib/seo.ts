import type { Metadata } from "next";
import { site } from "@/data/site";

/**
 * SEO HELPER
 * -----------
 * Centralized metadata builder so every page ships complete tags:
 * title, description, canonical, Open Graph, and Twitter cards.
 * Structured data (JSON-LD) lives in `structured-data.tsx`.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  type = "website",
  publishedTime,
  images,
}: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  images?: string[];
}): Metadata {
  const url = `${site.url}${path}`;
  const ogImages = images ?? [site.ogImage];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      images: ogImages.map((img) => ({ url: img })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
  };
}
