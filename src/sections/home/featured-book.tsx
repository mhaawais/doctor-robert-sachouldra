import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { BookCover } from "@/components/common/book-cover";
import { getFeaturedBook } from "@/lib/content";

export async function FeaturedBook() {
  const book = await getFeaturedBook();
  if (!book) return null;
  return (
    <section aria-label="Featured book" className="bg-ink text-ivory">
      <Container className="py-20 sm:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5"><Reveal className="relative mx-auto max-w-[320px] sm:max-w-sm lg:max-w-none"><div aria-hidden="true" className="absolute -bottom-5 -right-5 h-full w-full rounded-sm bg-gradient-to-br from-gold/25 to-transparent" /><div className="relative shadow-[0_40px_80px_-32px_rgba(0,0,0,0.8)]"><BookCover src={book.coverImage} alt={`Book cover: ${book.title}`} title={book.title} priority sizes="(max-width: 640px) 80vw, 460px" /></div></Reveal></div>
          <div className="lg:col-span-7">
            <Reveal><p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-gold-soft"><span aria-hidden="true" className="inline-block h-px w-10 bg-gold/60" />Published book</p></Reveal>
            <Reveal delay={0.08}><h2 className="mt-6 font-serif text-4xl leading-[1.12] text-balance sm:text-5xl">{book.title}</h2></Reveal>
            {book.subtitle ? <Reveal delay={0.12}><p className="mt-3 font-serif text-xl italic text-ivory/70">{book.subtitle}</p></Reveal> : null}
            <Reveal delay={0.16}><p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/75 sm:text-lg">{book.description}</p></Reveal>
            <Reveal delay={0.22}><div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"><Link href="/books" className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-sm border border-nightline px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:border-gold hover:text-gold-soft">Buy the book<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
