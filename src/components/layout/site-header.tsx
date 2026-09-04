"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Site header — sticky, translucent → solid on scroll, with an accessible
 * full-screen mobile menu (focus trap, ESC close, scroll lock).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Close the mobile menu on route change (adjust state during render —
  // the React-recommended alternative to an effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll lock + ESC close for the mobile menu
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-hairline/80 bg-ivory/92 shadow-[0_6px_24px_-18px_rgba(14,27,42,0.4)] backdrop-blur-md"
          : "border-b border-transparent bg-ivory/70 backdrop-blur-sm"
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-ivory"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Brand */}
        <Link
          href="/"
          className="group flex flex-col leading-none"
          aria-label={`${site.name} — home`}
        >
          <span className="font-serif text-[1.35rem] tracking-tight text-ink transition-colors group-hover:text-gold-deep">
            Dr. Robert Sakulanda
          </span>
          <span className="mt-1 hidden text-[10px] uppercase tracking-[0.3em] text-ink/50 sm:block">
            Physician · Scientist · Author
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative py-2 text-sm font-medium tracking-wide transition-colors",
                isActive(item.href)
                  ? "text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-gold"
                  : "text-ink/65 hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/books"
            className="rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold tracking-wide text-ivory transition-colors hover:bg-navy"
          >
            Explore Books
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 items-center justify-center rounded-sm text-ink lg:hidden"
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>
    </header>

      {/* Mobile menu overlay */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 top-[72px] z-40 flex flex-col bg-ivory transition-all duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile" className="flex flex-1 flex-col px-8 pt-10">
          <ul className="space-y-2">
            {site.nav.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  tabIndex={open ? 0 : -1}
                  className={cn(
                    "flex items-baseline gap-4 border-b border-hairline/70 py-4 font-serif text-3xl transition-all duration-300",
                    isActive(item.href) ? "text-gold-deep" : "text-ink",
                    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  )}
                  style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
                >
                  <span className="text-xs font-sans tracking-[0.2em] text-ink/40" aria-hidden="true">
                    0{i + 1}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10" style={{ transitionDelay: open ? "380ms" : "0ms" }}>
            <Link
              href="/books"
              tabIndex={open ? 0 : -1}
              className="inline-flex items-center justify-center rounded-sm bg-ink px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-ivory"
            >
              Explore Books
            </Link>
          </div>
        </nav>
        <p className="px-8 pb-10 text-xs uppercase tracking-[0.25em] text-ink/40">
          {site.positioning.split(" at the ")[0]}
        </p>
      </div>
    </>
  );
}
