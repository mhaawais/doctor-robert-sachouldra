import type { SiteSettings } from "@/types";

/**
 * SITE SETTINGS
 * -------------
 * Central brand + configuration data.
 *
 * SOCIALS — populated with the author's verified public profile (LinkedIn).
 * Add further platforms only when real URLs are available; the header/footer
 * render them automatically.
 */
export const site: SiteSettings = {
  name: "Dr. Robert Sakulanda",
  brandLine: "Robert Sakulanda",
  positioning:
    "A physician and scientist telling human stories at the intersection of medicine, biotechnology, resilience, and purpose.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.robertsakulanda.com",
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Books", href: "/books" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  socials: [
    {
      platform: "linkedin",
      url: "https://www.linkedin.com/in/robert-sakulanda-md-mba-faafp-dabfm-a9214312",
      label: "Dr. Robert Sakulanda on LinkedIn",
    },
  ],
  contactEmail: null, // [CONTACT EMAIL OPTIONAL] — contact form stores messages in the database
  ogImage: "/images/general/og-image.png",
};
