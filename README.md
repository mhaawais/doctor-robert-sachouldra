# Dr. Robert Sakulanda — Author Website

Production-ready personal author website for **Dr. Robert Sakulanda** — family
medicine physician, hospitalist, biotechnologist, and author. A digital home
built to connect a serious physician-author with readers: books, biography,
essays, and contact.

> **Design idea:** *"A physician and scientist telling human stories at the
> intersection of medicine, biotechnology, resilience, and purpose."*
> Editorial, premium, warm — credibility of Atul Gawande, elegance of Michelle
> Obama, simplicity of James Clear (high-level inspiration only).

---

## Tech Stack

| Layer      | Choice                                              |
| ---------- | --------------------------------------------------- |
| Framework  | Next.js 16 (App Router, RSC, SSG) + TypeScript 5    |
| Styling    | Tailwind CSS 4 + design tokens in `globals.css`     |
| Typography | Playfair Display (headings) · Source Sans 3 (body)  |
| Animation  | Framer Motion (subtle, `prefers-reduced-motion` safe) |
| Database   | Prisma ORM + SQLite (contact messages, subscribers) |
| Validation | Zod (server) + mirrored client validation           |
| UI         | Custom editorial components + shadcn/ui primitives  |

## Features

- **Pages:** Home (9 editorial sections), About (long-form bio + timeline +
  expertise), Books (grid + detail), Blog (featured, search, categories,
  load-more), Blog article pages, Contact, Privacy, custom 404, error
  boundary, loading skeletons.
- **Real backend:** contact form and newsletter both validate (client +
  server), sanitize input, rate-limit, honeypot spam trap, and store in SQLite
  via Prisma. **No fake claims** — the UI never says an email was "sent".
- **SEO:** per-page metadata (title/description/canonical), Open Graph +
  Twitter cards, JSON-LD structured data (Person, WebSite, Article, Book),
  `sitemap.xml`, `robots.txt`, manifest, favicon, designed OG image.
- **Accessibility:** semantic landmarks, skip link, keyboard-navigable mobile
  menu (ESC close, scroll lock, focus management), visible focus rings, aria
  labeling, alt text, WCAG-conscious contrast, reduced-motion support.
- **Performance:** static generation for all content pages, `next/image`
  responsive images, minimal client JS (only forms/menu/browser interactivity),
  `next/font` self-hosted fonts.
- **Content/presentation separation:** all copy lives in `src/data/*` behind
  an async content layer (`src/lib/content.ts`) — ready for a CMS swap
  (Sanity / Contentful / WordPress / MDX) without touching UI components.
- **Data integrity:** no invented book titles, ISBNs, quotes, credentials, or
  social links. Missing client data renders as polished placeholders and is
  tracked in [`CONTENT_NEEDED.md`](./CONTENT_NEEDED.md).

## Folder Structure

```
├── prisma/schema.prisma          # ContactMessage, NewsletterSubscriber
├── public/images/                # author/ books/ blog/ general/ (assets)
├── scripts/                      # design-asset renderer (SVG → PNG)
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home
│   │   ├── about/                # About / bio
│   │   ├── books/[slug]/         # Books listing + detail (SSG)
│   │   ├── blog/[slug]/          # Blog listing + article (SSG)
│   │   ├── contact/              # Contact page
│   │   ├── privacy/              # Privacy policy (template)
│   │   ├── api/contact/          # POST — validated contact endpoint
│   │   ├── api/newsletter/       # POST — validated newsletter endpoint
│   │   ├── layout.tsx            # Fonts, header/footer, JSON-LD
│   │   ├── sitemap.ts robots.ts manifest.ts icon.svg
│   │   └── not-found.tsx error.tsx loading.tsx
│   ├── components/               # layout/ common/ cards/ blog/ contact/
│   ├── sections/home/            # The 9 home-page sections
│   ├── data/                     # site.ts author.ts books.ts articles.ts
│   ├── lib/                      # content.ts seo.ts structured-data.ts db.ts
│   └── types/                    # Shared content types
├── CONTENT_NEEDED.md             # ← client input checklist
└── .env.example
```

## Getting Started

```bash
# 1. Install
bun install        # or npm install

# 2. Environment
cp .env.example .env   # then edit values (see below)

# 3. Database (SQLite — created on first push)
bun run db:push

# 4. Develop
bun run dev        # http://localhost:3000

# 5. Production
bun run build
bun run start
```

## Environment Variables

See [`.env.example`](./.env.example). None are required for the site to run;
they configure production URL, email delivery, analytics, and spam protection.

## Content Management

All content is separated from presentation:

| To change…            | Edit…                                              |
| --------------------- | -------------------------------------------------- |
| Site name, nav, socials, contact email | `src/data/site.ts`                |
| Bio, journey, expertise | `src/data/author.ts`                             |
| Books                 | `src/data/books.ts`                                 |
| Blog posts            | `src/data/articles.ts`                              |
| Home page section copy | `src/sections/home/*` (or the data files above)    |

### How to add a book

1. Open `src/data/books.ts`, duplicate the entry, and fill in **real** values
   (title, ISBN, publisher, dates, purchase links — never placeholders in
   production).
2. Drop the real cover at `public/images/books/<slug>/cover.jpg` and set
   `coverImage`.
3. Set `status: "published"` when it's out. The listing, detail page, sitemap,
   and structured data update automatically.

### How to add a blog post

1. Open `src/data/articles.ts`, add a new object: `slug`, `title`, `excerpt`,
   `category`, `date` (ISO), `readTime`, `coverImage`, `coverAlt`, `content`
   (lightweight markdown: `##`, paragraphs, `>`, `-`), `isSample: false`.
2. Drop the cover image in `public/images/blog/` (1344×768 recommended).
3. Listing, article page, search, related posts, sitemap, and Article JSON-LD
   update automatically.

### How to replace the author portrait

1. Save the real photo as `public/images/author/portrait.jpg` (4:5 ratio,
   ≥1200×1500).
2. Set `author.portrait = "/images/author/portrait.jpg"` in `src/data/author.ts`.
   The monogram placeholder is replaced everywhere automatically.

### How to configure the contact form

The form stores messages in SQLite via `/api/contact` (zod-validated,
sanitized, rate-limited, honeypot-protected). To also receive them by email:

1. Create an account with an email API provider (e.g. Resend, Postmark).
2. Add its API key to `.env` (`CONTACT_EMAIL_API_KEY`, `CONTACT_RECIPIENT_EMAIL`).
3. Implement the send in `src/app/api/contact/route.ts` at the marked
   `integration point` comment.
4. For extra spam protection, add Cloudflare Turnstile / reCAPTCHA and verify
   server-side at the same integration point.

### How to configure the newsletter

`/api/newsletter` stores subscribers in SQLite. To sync with a provider
(Mailchimp / ConvertKit / Resend): add the API key to `.env`, then POST the
address at the marked integration point in the route handler.

### How to configure analytics

`src/app/layout.tsx` is the single integration point. Recommended: a
privacy-respecting provider (Plausible/Fathom) loaded only when
`NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set — no fake tracking IDs are shipped.

## SEO Configuration

- **Canonical/OG base URL:** `NEXT_PUBLIC_SITE_URL` in `.env` (must be the
  final production domain — currently a documented placeholder).
- **Per-page metadata:** each page calls `buildMetadata()` from
  `src/lib/seo.ts`.
- **Structured data:** `src/lib/structured-data.ts` emits Person + WebSite
  (global), Article (blog posts), and Book (only once a real title exists —
  never for placeholder data).
- **Files:** `src/app/sitemap.ts`, `src/app/robots.ts`, `manifest.ts`,
  `icon.svg`, and `public/images/general/og-image.png` (regenerate anytime with
  `bun scripts/render-design-assets.mjs`).

## Deployment

The project is Vercel-ready out of the box:

1. Push the repository to GitHub/GitLab.
2. Import into Vercel (or any Node host: `bun run build` produces a standalone
   server via `next.config.ts`).
3. Set environment variables from `.env.example` — especially
   `NEXT_PUBLIC_SITE_URL` and `DATABASE_URL`.
4. **Note on SQLite:** for serverless hosts (Vercel), swap Prisma's provider to
   a hosted database (e.g. PostgreSQL/Supabase or Turso) in
   `prisma/schema.prisma`, run `bun run db:push`, and set the new
   `DATABASE_URL`. The two models used (`ContactMessage`,
   `NewsletterSubscriber`) are standard and portable.

## Known Limitations

- Blog posts shipped in this build are **clearly-flagged sample content**
  (`isSample: true`) demonstrating the system — replace before launch.
- The book is unpublished; its page intentionally uses "to be announced"
  states instead of invented metadata.
- The privacy policy is a well-formed template pending client legal review.
- Social icons are hidden entirely until real profile URLs exist (by design).
