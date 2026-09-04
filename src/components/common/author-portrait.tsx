import { cn } from "@/lib/utils";
import { author } from "@/data/author";

/**
 * Author portrait.
 * When `author.portrait` is set (real photo provided), renders the photo.
 * Until then it renders a designed monogram placeholder — clearly a
 * placeholder, but intentional and elegant (never a fake stock doctor photo).
 */
export function AuthorPortrait({
  className,
  caption = true,
  priority = false,
}: {
  className?: string;
  caption?: boolean;
  priority?: boolean;
}) {
  if (author.portrait) {
    return (
      <figure className={cn("relative", className)}>
        <img
          src={author.portrait}
          alt={`Portrait of ${author.name}`}
          className="h-full w-full rounded-sm object-cover shadow-[0_24px_60px_-24px_rgba(14,27,42,0.45)]"
          loading={priority ? "eager" : "lazy"}
        />
      </figure>
    );
  }

  return (
    <figure className={cn("relative", className)}>
      <div
        aria-hidden="true"
        className="grain relative flex aspect-[4/5] h-full w-full flex-col items-center justify-center overflow-hidden rounded-sm bg-gradient-to-br from-ink via-ink-soft to-navy shadow-[0_24px_60px_-24px_rgba(14,27,42,0.55)]"
      >
        {/* concentric frame lines */}
        <div className="absolute inset-4 rounded-sm border border-gold/25" />
        <div className="absolute inset-6 rounded-sm border border-gold/15" />
        {/* monogram */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gold/40 sm:h-28 sm:w-28">
          <span className="font-serif text-4xl tracking-wide text-gold-soft sm:text-[2.6rem]">
            RS
          </span>
        </div>
        <p className="relative mt-6 px-6 text-center font-serif text-lg italic leading-snug text-ivory/85">
          {author.name}
        </p>
        <p className="relative mt-2 px-6 pb-2 text-center text-[11px] uppercase tracking-[0.28em] text-ivory/45">
          Physician · Scientist · Author
        </p>
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-xs tracking-wide text-slate-body/80">
          Official author portrait coming soon
        </figcaption>
      ) : null}
    </figure>
  );
}
