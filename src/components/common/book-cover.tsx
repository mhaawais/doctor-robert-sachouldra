import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Book cover renderer.
 * - Real/provided cover images render via next/image.
 * - The forthcoming book ships with a designed placeholder cover artwork
 *   (clearly labelled "Forthcoming" — not a fabricated real cover).
 */
export function BookCover({
  src,
  alt,
  title,
  width = 520,
  height = 780,
  className,
  priority = false,
  sizes = "(max-width: 640px) 60vw, 300px",
}: {
  src: string | null;
  alt: string;
  title?: string | null;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={cn("h-auto w-full object-cover", className)}
      />
    );
  }

  // Fallback: designed typographic placeholder (used only if no artwork exists)
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "grain relative flex aspect-[2/3] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-ink via-ink-soft to-navy px-8 text-center",
        className
      )}
    >
      <div className="absolute inset-3 border border-gold/30" />
      <p className="relative text-[10px] uppercase tracking-[0.3em] text-gold-soft">
        A book by
      </p>
      <p className="relative mt-2 font-serif text-xl text-ivory">
        Dr. Robert Sakulanda
      </p>
      <div className="relative my-6 h-px w-16 bg-gold/50" />
      <p className="relative font-serif text-2xl italic leading-snug text-ivory/80">
        {title ?? "Title to be announced"}
      </p>
      <p className="absolute bottom-8 text-[10px] uppercase tracking-[0.3em] text-ivory/40">
        Forthcoming
      </p>
    </div>
  );
}
