import { cn } from "@/lib/utils";
import { Reveal } from "@/components/common/reveal";

/**
 * Editorial section heading — eyebrow, serif title, optional lede.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]",
            tone === "dark" ? "text-gold-soft" : "text-gold-deep",
            align === "center" && "justify-center"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "inline-block h-px w-8",
              tone === "dark" ? "bg-gold-soft/60" : "bg-gold/60"
            )}
          />
          {eyebrow}
          {align === "center" && (
            <span
              aria-hidden="true"
              className={cn(
                "inline-block h-px w-8",
                tone === "dark" ? "bg-gold-soft/60" : "bg-gold/60"
              )}
            />
          )}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-serif text-3xl leading-[1.15] text-balance sm:text-4xl lg:text-[2.6rem]",
          tone === "dark" ? "text-ivory" : "text-ink"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-5 text-base leading-relaxed sm:text-lg",
            tone === "dark" ? "text-ivory/70" : "text-slate-body"
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
