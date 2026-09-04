import type { Metadata } from "next";
import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How Dr. Robert Sakulanda's website collects, uses, and protects information — contact messages, newsletter subscriptions, and analytics.",
  path: "/privacy",
});

/**
 * TEMPLATE PRIVACY POLICY — written for this site's actual data practices
 * (contact + newsletter storage, optional analytics). The client should
 * review before launch — flagged in CONTENT_NEEDED.md.
 */
export default function PrivacyPage() {
  return (
    <>
      <section aria-label="Privacy hero" className="border-b border-hairline bg-ivory-deep/50">
        <Container className="pb-12 pt-16 text-center sm:pt-20">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
              Legal
            </p>
            <h1 className="mt-6 font-serif text-4xl text-ink sm:text-5xl">Privacy Policy</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm text-slate-body">
              Last updated: September 2026 — this policy is a reviewed template;
              final legal wording is pending client sign-off.
            </p>
          </Reveal>
        </Container>
      </section>

      <section aria-label="Privacy content" className="bg-ivory">
        <Container className="py-14 sm:py-20">
          <div className="mx-auto max-w-2xl space-y-10 text-[16px] leading-relaxed text-slate-body">
            <Reveal>
              <div>
                <h2 className="font-serif text-2xl text-ink">Overview</h2>
                <p className="mt-4">
                  This website is the personal home of Dr. Robert Sakulanda&apos;s
                  writing. We keep data collection deliberately minimal: this
                  site exists to introduce Robert and his work, and it only
                  stores what is necessary to respond to you or to send
                  updates you have explicitly requested.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div>
                <h2 className="font-serif text-2xl text-ink">What we collect</h2>
                <ul className="mt-4 list-disc space-y-2 pl-6">
                  <li>
                    <strong className="text-ink">Contact form.</strong> Your
                    name, email address, subject, and message — used solely to
                    read and reply to your inquiry.
                  </li>
                  <li>
                    <strong className="text-ink">Newsletter.</strong> Your
                    email address — used solely to send occasional updates
                    about new writing and announcements. Every email will
                    include a way to unsubscribe.
                  </li>
                  <li>
                    <strong className="text-ink">Analytics (optional).</strong>{" "}
                    If enabled, privacy-respecting, aggregated analytics may be
                    used to understand which pages are helpful. No advertising
                    profiles are built and no personal data is sold — ever.
                  </li>
                </ul>
              </div>
            </Reveal>
            <Reveal>
              <div>
                <h2 className="font-serif text-2xl text-ink">How information is used</h2>
                <p className="mt-4">
                  Information you submit is stored securely and accessed only
                  by Robert (or a trusted assistant acting on his behalf) for
                  the purpose you provided it: responding to your message, or
                  delivering the newsletter. It is never sold, rented, or
                  shared with third parties for marketing.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div>
                <h2 className="font-serif text-2xl text-ink">Your choices</h2>
                <p className="mt-4">
                  You may request deletion of your contact message or
                  unsubscribe from the newsletter at any time. To request data
                  removal, use the contact form and include the email address
                  you used previously.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div>
                <h2 className="font-serif text-2xl text-ink">Changes to this policy</h2>
                <p className="mt-4">
                  If this policy changes materially, the updated version will
                  be posted on this page with a new date. Continued use of the
                  site after changes constitutes acceptance of the revised
                  policy.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
