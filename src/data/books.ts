import type { Book } from "@/types";

/**
 * BOOKS DATA
 * ----------
 * DATA INTEGRITY — READ BEFORE EDITING:
 * Dr. Sakulanda's debut book is forthcoming. No public record of a published
 * title, ISBN, publisher, or retailer listing exists (verified via web
 * research — see /research/VERIFIED_FACTS.md), so those fields remain `null`
 * and are rendered as tasteful "forthcoming" placeholders by the UI.
 *
 * The description and themes ARE final editorial content — grounded in the
 * author's verified life story (client brief + public record).
 *
 * When the client supplies real book details:
 *   1. Replace the `null` fields below.
 *   2. Drop the real cover image at /public/images/books/<slug>/cover.jpg
 *      and set `coverImage` accordingly (remove the designed placeholder).
 *   3. Update /CONTENT_NEEDED.md.
 */
export const books: Book[] = [
  {
    slug: "forthcoming-debut",
    title: null, // [BOOK TITLE REQUIRED]
    subtitle: null, // [BOOK SUBTITLE REQUIRED]
    description:
      "Dr. Robert Sakulanda is writing his first book — a story drawn from two decades of clinical practice, the front lines of the COVID-19 pandemic in Georgia hospitals, and the road that led from bedside medicine to a Master's degree in Applied Biotechnology at the University of Wisconsin–Madison. It follows a Zambian-born physician and immigrant through crisis, science, and self-discovery — and asks what it means to care for patients while searching for better answers. Further details will be announced here first.",
    whyThisBook: [
      "A frontline physician's honest account of caring for critically ill patients during the COVID-19 pandemic — the fear, the resolve, and the quiet acts of humanity that carried a ward through its darkest nights.",
      "The story of a deliberate leap from clinical medicine into biotechnology — why a practicing hospitalist with more than twenty years at the bedside returned to graduate study to understand vaccines, gene editing, and the technologies reshaping patient care.",
      "An immigrant's double perspective on health and hope — from the communities of Zambia to hospital medicine in the American South, told by a physician, MBA, and entrepreneur who believes medicine, enterprise, and storytelling ultimately serve the same end: making people whole.",
    ],
    themes: [
      "Frontline medicine",
      "Resilience",
      "Biotechnology",
      "Immigrant journey",
      "Science & humanity",
      "Purpose",
    ],
    publicationDate: null, // [PUBLICATION DATE REQUIRED]
    category: null, // [BOOK CATEGORY REQUIRED] — e.g. Memoir / Narrative nonfiction
    isbn: null, // [ISBN REQUIRED]
    publisher: null, // [PUBLISHER REQUIRED]
    formats: [], // [FORMATS REQUIRED] — e.g. Hardcover, Paperback, eBook, Audiobook
    purchaseLinks: [], // [PURCHASE LINK REQUIRED] — retailer URLs when available
    coverImage: "/images/books/forthcoming-cover-placeholder.png", // designed placeholder — replace with real cover
    status: "forthcoming",
    featured: true,
    authorNote: null, // [AUTHOR NOTE OPTIONAL] — a personal note from Dr. Sakulanda
    testimonials: [], // [TESTIMONIALS OPTIONAL] — added only when provided
  },
];

/** Books with real titles, ready for public listing (excludes unannounced). */
export function listableBooks(all: Book[]): Book[] {
  return all.filter((b) => b.title !== null);
}
