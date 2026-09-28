import type { Metadata } from "next";
import { BookCover } from "@/components/common/book-cover";
import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { DirectPurchasePanel } from "@/components/commerce/direct-purchase-panel";
import { directCatalog } from "@/lib/commerce/config";
import { getFeaturedBook } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { NewsletterSection } from "@/sections/home/newsletter-section";

export const metadata: Metadata = buildMetadata({ title: "Buy Behind the Mask", description: "Behind the Mask: One Doctor. Many Battles. A Purpose Greater Than Fear.", path: "/books" });

export default async function BooksPage() {
  const book = await getFeaturedBook();
  if (!book) return null;
  return <><section className="overflow-hidden bg-ink text-ivory"><Container className="grain relative py-16 sm:py-24"><div aria-hidden="true" className="absolute -right-48 top-0 h-[34rem] w-[34rem] rounded-full bg-gold/10 blur-3xl" /><div className="relative grid items-center gap-12 lg:grid-cols-12"><Reveal className="relative mx-auto max-w-[300px] lg:col-span-5 lg:max-w-none"><div aria-hidden="true" className="absolute -inset-5 rounded-full bg-gold/15 blur-2xl" /><div className="relative rotate-[-1.5deg] overflow-hidden rounded-sm shadow-[0_40px_90px_-35px_rgba(0,0,0,.9)] transition-transform duration-500 hover:rotate-0"><BookCover src={book.coverImage} alt={`Book cover: ${book.title}`} title={book.title} priority sizes="(max-width: 640px) 80vw, 440px" /></div></Reveal><div className="lg:col-span-7"><Reveal><p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[.24em] text-gold-soft"><span className="h-px w-9 bg-gold" />Now available</p><h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.02] sm:text-6xl">{book.title}</h1>{book.subtitle ? <p className="mt-5 max-w-2xl font-serif text-xl italic leading-relaxed text-ivory/75 sm:text-2xl">{book.subtitle}</p> : null}<div className="editorial-rule mt-7 h-px max-w-xl" /><p className="mt-7 max-w-2xl text-base leading-relaxed text-ivory/75 sm:text-lg">{book.description}</p></Reveal><Reveal delay={0.15}><DirectPurchasePanel catalog={directCatalog()} /></Reveal></div></div></Container></section><NewsletterSection /></>;
}
