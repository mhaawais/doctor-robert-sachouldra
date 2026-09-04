import Link from "next/link";
import { Container } from "@/components/common/container";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { SocialLinks } from "@/components/common/social-links";
import { site } from "@/data/site";

/**
 * Site footer — brand, navigation, newsletter, socials (only real URLs),
 * legal links. Sticks to the bottom of the viewport via root flex layout.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-nightline bg-ink text-ivory pb-[env(safe-area-inset-bottom)]">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <p className="font-serif text-2xl tracking-tight">{site.brandLine}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft/80">
              {"MD, MBA, FAAFP, DABFM"}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/65">
              {site.positioning}
            </p>
            <SocialLinks socials={site.socials} tone="dark" className="mt-6" />
          </div>

          {/* Navigation */}
          <nav aria-label="Footer" className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-soft">
              Explore
            </p>
            <ul className="mt-5 space-y-3">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ivory/70 transition-colors hover:text-gold-soft"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <div className="md:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-soft">
              Stay connected
            </p>
            <p className="mt-5 text-sm leading-relaxed text-ivory/65">
              Follow Robert&apos;s latest writing, ideas, and updates.
            </p>
            <div className="mt-4">
              <NewsletterForm tone="dark" compact id="footer-newsletter" />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-nightline pt-7 text-xs text-ivory/45 sm:flex-row sm:items-center">
          <p>© {year} {site.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-gold-soft">
              Privacy Policy
            </Link>
            <Link href="/contact" className="transition-colors hover:text-gold-soft">
              Contact
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
