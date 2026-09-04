import type { Metadata } from "next";
import { BookOpen, Mail, Mic2, Newspaper } from "lucide-react";
import { Container } from "@/components/common/container";
import { Reveal } from "@/components/common/reveal";
import { ContactForm } from "@/components/contact/contact-form";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/data/site";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with Dr. Robert Sakulanda — about the books, speaking and interviews, media requests, or anything else at the intersection of medicine and story.",
  path: "/contact",
});

const topics = [
  {
    icon: BookOpen,
    title: "Books & writing",
    text: "Questions about the forthcoming book, the stories behind it, or the writing process.",
  },
  {
    icon: Mic2,
    title: "Speaking & interviews",
    text: "Panels, podcasts, keynote and media inquiries — welcome and carefully considered.",
  },
  {
    icon: Newspaper,
    title: "Newsletter & updates",
    text: "The fastest way to follow new essays and announcements is the newsletter below.",
  },
];

export default function ContactPage() {
  return (
    <>
      <section aria-label="Contact hero" className="border-b border-hairline bg-ivory-deep/50">
        <Container className="pb-14 pt-16 text-center sm:pb-16 sm:pt-20">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
              Contact
            </p>
            <h1 className="mx-auto mt-6 max-w-2xl font-serif text-4xl leading-[1.1] text-ink text-balance sm:text-5xl">
              Let&apos;s Connect
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-body">
              Whether it&apos;s a question about the writing, an invitation to
              speak, or a story of your own you&apos;d like to share — Robert
              reads every message.
            </p>
          </Reveal>
        </Container>
      </section>

      <section aria-label="Contact form" className="bg-ivory">
        <Container className="py-16 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Form */}
            <div className="lg:col-span-7">
              <Reveal>
                <div className="rounded-md border border-hairline bg-card p-7 shadow-[0_10px_36px_-22px_rgba(14,27,42,0.4)] sm:p-9">
                  <h2 className="font-serif text-2xl text-ink">Send a message</h2>
                  <p className="mt-2 text-sm text-slate-body">
                    Fields marked <span className="text-gold-deep">*</span> are required.
                  </p>
                  <div className="mt-7">
                    <ContactForm />
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-5">
              <Reveal delay={0.1} className="space-y-8">
                <div>
                  <h2 className="font-serif text-2xl text-ink">
                    What people usually write about
                  </h2>
                  <ul className="mt-6 space-y-6">
                    {topics.map(({ icon: Icon, title, text }) => (
                      <li key={title} className="flex gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-accent text-gold-deep">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                          <h3 className="font-serif text-lg text-ink">{title}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-slate-body">{text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-md border border-hairline bg-card p-7 shadow-[0_10px_36px_-22px_rgba(14,27,42,0.4)]">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gold-deep" aria-hidden="true" />
                    <h3 className="font-serif text-lg text-ink">A quick note on replies</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-body">
                    Messages sent here are received directly by Robert&apos;s
                    team and reviewed personally. As clinical schedules vary,
                    please allow a little time for a thoughtful reply.
                  </p>
                </div>
              </Reveal>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
