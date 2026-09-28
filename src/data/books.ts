import type { Book } from "@/types";

/**
 * Book facts are limited to the Amazon listing for ASIN B0HJP3554R.
 * Fields not displayed there remain unset rather than inferred.
 */
export const books: Book[] = [
  {
    slug: "behind-the-mask",
    title: "Behind the Mask",
    subtitle: "One Doctor. Many Battles. A Purpose Greater Than Fear.",
    description:
      "Behind the Mask: One Doctor. Many Battles. A Purpose Greater Than Fear. is a Kindle eBook by Doctor Robert Sakulanda.",
    whyThisBook: null,
    themes: [],
    publicationDate: null,
    category: null,
    isbn: null,
    publisher: null,
    formats: ["Kindle eBook"],
    purchaseLinks: [
      { retailer: "Amazon", url: "https://www.amazon.com/dp/B0HJP3554R" },
    ],
    coverImage: "/images/books/behind-the-mask/cover-2.jpeg",
    status: "published",
    featured: true,
    authorNote: null,
    testimonials: [],
  },
];

/** Books ready for public listing. */
export function listableBooks(all: Book[]): Book[] {
  return all;
}
