/**
 * Core content types for the Dr. Robert Sakulanda author website.
 *
 * CONTENT / PRESENTATION SEPARATION
 * ---------------------------------
 * These types model the content layer only. All UI components consume them,
 * so swapping the local data files for a CMS (Sanity, Contentful, WordPress,
 * MDX) later only requires re-implementing the getters in `src/lib/content.ts`.
 *
 * DATA INTEGRITY RULE
 * -------------------
 * Fields that require verified client input are typed `string | null`.
 * `null` always means "not yet provided by the client" — the UI renders a
 * tasteful placeholder instead of fabricated data. Every `null` field is
 * listed in /CONTENT_NEEDED.md.
 */

export interface SiteSettings {
  /** Site display name */
  name: string;
  /** Author-facing brand line used in header/footer */
  brandLine: string;
  /** One-sentence positioning statement (client-approved brand idea) */
  positioning: string;
  /** Canonical production URL — configure via NEXT_PUBLIC_SITE_URL */
  url: string;
  /** Primary navigation */
  nav: NavItem[];
  /**
   * Social profiles. ONLY add entries when the client supplies real URLs.
   * An empty array intentionally renders nothing in the UI.
   */
  socials: SocialLink[];
  /**
   * Public contact email. `null` until the client provides one
   * — see CONTENT_NEEDED.md.
   */
  contactEmail: string | null;
  /** OG image path relative to /public */
  ogImage: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: "linkedin" | "instagram" | "facebook" | "x" | "youtube" | "goodreads";
  url: string;
  label: string;
}

export interface Author {
  name: string;
  shortName: string;
  /** Post-nominal credentials, e.g. "MD, MBA, FAAFP, DABFM" (from the author's own professional profile) */
  credentials: string;
  /** Professional roles exactly as provided by the client */
  roles: string[];
  /** Verified short biography (client-provided copy) */
  bio: string;
  /** Mission statement derived from the client-provided background text */
  mission: string;
  /**
   * Real author portrait path. `null` = not yet provided → the UI renders a
   * designed monogram placeholder instead of a fake photo.
   */
  portrait: string | null;
}

export interface JourneyStep {
  id: string;
  /** Short label, e.g. "Medicine" */
  title: string;
  /** Editorial narrative for this chapter */
  narrative: string;
  /** Optional micro-caption under the step number */
  caption: string;
}

export type BookStatus = "forthcoming" | "announced" | "published";

export interface Book {
  slug: string;
  /**
   * Real title. `null` = not yet provided → UI shows "Title to Be Announced".
   * NEVER fabricate. See CONTENT_NEEDED.md.
   */
  title: string | null;
  subtitle: string | null;
  description: string | null;
  /** Longer "why this book" narrative grounded in verified themes only */
  whyThisBook: string[] | null;
  themes: string[];
  /** Publication date (ISO) — null until provided */
  publicationDate: string | null;
  category: string | null;
  isbn: string | null;
  publisher: string | null;
  formats: string[];
  /** Purchase / retailer links — empty array renders the "coming soon" state */
  purchaseLinks: PurchaseLink[];
  /** Designed placeholder cover path (public/) — replaced when real cover arrives */
  coverImage: string | null;
  status: BookStatus;
  featured: boolean;
  /** Author's note for the detail page — null until provided */
  authorNote: string | null;
  testimonials: Testimonial[];
}

export interface PurchaseLink {
  retailer: string;
  url: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  credential: string | null;
}

export type ArticleCategory =
  | "Medicine"
  | "Biotechnology"
  | "Writing & Ideas"
  | "Personal Journey"
  | "Entrepreneurship";

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  /** ISO date string */
  date: string;
  /** Minutes to read */
  readTime: number;
  /** Decorative editorial cover (public/) */
  coverImage: string;
  /** Alt text for the cover image */
  coverAlt: string;
  /** Article body in lightweight markdown (##, paragraphs, > quotes, - lists) */
  content: string;
  featured?: boolean;
  /**
   * SAMPLE CONTENT FLAG — the posts shipped in this build are realistic
   * placeholders to demonstrate the system. Replace with the client's real
   * writing before launch. See CONTENT_NEEDED.md.
   */
  isSample: boolean;
}

export interface SectionCopy {
  eyebrow?: string;
  title: string;
  description?: string;
}
