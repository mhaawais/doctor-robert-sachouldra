import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";

export function BookCard({ book, className }: { book: Book; className?: string }) {
  return (
    <article className={cn("group relative flex h-full flex-col overflow-hidden rounded-md border border-hairline bg-card shadow-[0_10px_36px_-20px_rgba(14,27,42,0.35)]", className)}>
      <Link href="/books" className="relative block overflow-hidden bg-ink" aria-label={`Buy ${book.title}`}>
        <div className="aspect-[2/3] w-full overflow-hidden">
          <Image src={book.coverImage ?? "/images/general/og-image.png"} alt={`Book cover: ${book.title}`} width={520} height={780} sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 320px" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-soft backdrop-blur-sm">Published</span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl leading-snug text-ink"><Link href="/books" className="transition-colors hover:text-gold-deep">{book.title}</Link></h3>
        {book.subtitle ? <p className="mt-2 font-serif text-base italic text-slate-body">{book.subtitle}</p> : null}
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-body">{book.description}</p>
        <div className="mt-auto flex flex-wrap gap-4 pt-5">
          <Link href="/books" className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-gold-deep">Buy the book<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  );
}
