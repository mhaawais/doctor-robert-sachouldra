# Content Status

This file tracks content completeness. On the latest update, the site's
editorial content was **enriched with verified public-record facts** about
Dr. Robert Sakulanda (sources documented in `/research/VERIFIED_FACTS.md`):
his professional LinkedIn profile, public clinical directories (WebMD,
US News, MediFind, Wayne Memorial Hospital staff page), and Zambian news
coverage (Lusaka Times 2017; Daily Nation 2025).

## Filled from verified public sources ✅

- [x] **Credentials line** — MD, MBA, FAAFP, DABFM (author's own LinkedIn).
- [x] **Clinical facts** — more than two decades of practice; hospitalist at
      Wayne Memorial Hospital (Jesup, GA); past affiliations incl. Houston
      Healthcare Warner Robins, Coffee Regional Medical Center, Wellstar North
      Fulton; practice communities Jesup / Warner Robins / Roswell.
- [x] **Biotechnology degree** — Master of Science in Applied Biotechnology,
      University of Wisconsin–Madison (LinkedIn + public records).
- [x] **Global health / entrepreneurship** — Zambian-born; medical missions in
      Zambia; mentoring young African entrepreneurs; owner of Mufulira United
      Football Club since 2017 (bought as Nkwiza FC — Lusaka Times, Jan 2017;
      governance advocacy — Daily Nation, Jan 2025).
- [x] **Social profile** — LinkedIn URL live in header/footer.
- [x] **Blog content** — five editorial essays grounded in the verified story,
      including a real-news piece on Mufulira United FC. Sample flags removed.

## Still open (client input required)

- [ ] **Author professional portrait photo** — `public/images/author/portrait.jpg`
      (4:5, ≥1200×1500), then set `author.portrait`. No rights-cleared photo
      exists in the public record, so the designed "RS" monogram placeholder
      remains — deliberately not replaced with a photo of the wrong person.
- [ ] **Book facts** — no published title exists in the public record
      (Amazon/Goodreads checked), so the debut book remains honestly
      "forthcoming": title, subtitle, ISBN, publisher, date, formats,
      purchase links, author note, testimonials. The description IS final,
      grounded in the verified story.
- [ ] **Public contact email** (`site.contactEmail`) — optional; the contact
      form stores messages in the database.
- [ ] **Email / newsletter provider keys** — integration points marked in
      `src/app/api/contact/route.ts` and `newsletter/route.ts`.
- [ ] **Further social URLs** (Instagram / Facebook / X / YouTube / Goodreads)
      — add to `site.socials` only when real URLs are available.

## Deliberate omissions (data-integrity policy)

- **Medical school is not named.** Public directories conflict (US News lists
  University of Zambia; WebMD lists Loyola Stritch Chicago). The site says
  medical training "spanning two continents" instead of risking an error.
  Supply the correct institution(s) and we will add them.
- No invented awards, reviews, statistics, or quotations anywhere.
