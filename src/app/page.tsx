import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/sections/home/hero";
import { AuthorIntro } from "@/sections/home/author-intro";
import { FeaturedBook } from "@/sections/home/featured-book";
import { Journey } from "@/sections/home/journey";
import { MedicineBiotech } from "@/sections/home/medicine-biotech";
import { Quote } from "@/sections/home/quote";
import { LatestWriting } from "@/sections/home/latest-writing";
import { NewsletterSection } from "@/sections/home/newsletter-section";
import { FinalCta } from "@/sections/home/final-cta";

export const metadata: Metadata = buildMetadata({
  title: "Dr. Robert Sakulanda — Physician, Scientist, Author",
  description:
    "A physician and scientist telling human stories at the intersection of medicine, biotechnology, resilience, and purpose. Explore books, essays, and the journey from the COVID-19 frontline to biotechnology.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <AuthorIntro />
      <FeaturedBook />
      <Journey />
      <MedicineBiotech />
      <Quote />
      <LatestWriting />
      <NewsletterSection />
      <FinalCta />
    </>
  );
}
