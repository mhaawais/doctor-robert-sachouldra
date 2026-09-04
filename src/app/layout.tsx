import type { Metadata, Viewport } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { site } from "@/data/site";
import { personSchema, webSiteSchema } from "@/lib/structured-data";

// Editorial typography system: elegant serif headings + readable sans body
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Dr. Robert Sakulanda — Physician, Scientist, Author",
    template: "%s — Dr. Robert Sakulanda",
  },
  description: site.positioning,
  keywords: [
    "Robert Sakulanda",
    "physician author",
    "family medicine",
    "biotechnology",
    "COVID-19 frontline doctor",
    "medical storytelling",
    "science writing",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: "Dr. Robert Sakulanda — Physician, Scientist, Author",
    description: site.positioning,
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr. Robert Sakulanda — Physician, Scientist, Author",
    description: site.positioning,
    images: [site.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1b2a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${sourceSans.variable} flex min-h-screen flex-col bg-background font-sans text-foreground antialiased`}
      >
        <SiteHeader />
        <main id="main-content" className="flex-1 pt-[72px]">
          {children}
        </main>
        <SiteFooter />
        <Toaster />
        {/* Structured data: Person + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([personSchema(), webSiteSchema()]),
          }}
        />
      </body>
    </html>
  );
}
