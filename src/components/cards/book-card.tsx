import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Book } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Book card — used in the books grid. Displays real metadata when available
 * and a polished "forthcoming" state when fields are still pending.
 */
export function BookCard({ book, className }: { book: Book; className?: string }) {
  const title = book.title ?? "Title to Be Announced";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-md border border-hairline bg-card shadow-[0_10px_36px_-20px_rgba(14,27,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(14,27,42,0.45)]",
        className
      )}
    >
      <Link
        href={`/books/${book.slug}`}
        className="relative block overflow-hidden bg-ink"
        aria-label={`View details for ${title}`}
      >
        <div className="aspect-[2/3] w-full overflow-hidden">
          <Image
            src={book.coverImage ?? "/images/books/forthcoming-cover-placeholder.png"}
            alt={
              book.title
                ? `Book cover: ${book.title}`
                : `Designed placeholder cover for a forthcoming book by Dr. Robert Sakulanda`
            }
            width={520}
            height={780}
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 320px"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-soft backdrop-blur-sm">
          {book.status === "forthcoming" ? "Forthcoming" : book.status}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
          {book.category ?? "Narrative Nonfiction"}
        </p>
        <h3 className="mt-2 font-serif text-xl leading-snug text-ink">
          <Link href={`/books/${book.slug}`} className="transition-colors hover:text-gold-deep">
            {title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-body">
          {book.description}
        </p>

        <dl className="mt-4 space-y-1.5 text-xs text-slate-body/85">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 uppercase tracking-wider text-ink/50">Status</dt>
            <dd>{book.status === "forthcoming" ? "In progress — details soon" : "Available"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 uppercase tracking-wider text-ink/50">Publisher</dt>
            <dd>{book.publisher ?? "To be announced"}</dd>
          </div>
        </dl>

        <div className="mt-auto pt-5">
          <Link
            href={`/books/${book.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-gold-deep"
          >
            Learn more
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
