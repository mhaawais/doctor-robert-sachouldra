import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SocialLink } from "@/types";
import { cn } from "@/lib/utils";
import {
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  BookOpen,
} from "lucide-react";

/**
 * Social links — renders ONLY platforms with real URLs (site.socials).
 * If none are provided, renders nothing (per data-integrity policy).
 */
export function SocialLinks({
  socials,
  className,
  tone = "light",
}: {
  socials: SocialLink[];
  className?: string;
  tone?: "light" | "dark";
}) {
  if (!socials.length) return null;

  const icons = {
    linkedin: Linkedin,
    instagram: Instagram,
    facebook: Facebook,
    x: Twitter,
    youtube: Youtube,
    goodreads: BookOpen,
  } as const;

  return (
    <ul className={cn("flex items-center gap-3", className)}>
      {socials.map((s) => {
        const Icon = icons[s.platform] ?? BookOpen;
        return (
          <li key={s.platform}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                tone === "dark"
                  ? "border-nightline text-ivory/70 hover:border-gold hover:text-gold-soft"
                  : "border-hairline text-ink/70 hover:border-gold hover:text-gold-deep"
              )}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function ArrowCta({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-gold-deep transition-colors hover:text-ink",
        className
      )}
    >
      {children}
      <ArrowRight
        className="h-4 w-4 transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      />
    </Link>
  );
}
