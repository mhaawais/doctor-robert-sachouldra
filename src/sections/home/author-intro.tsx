import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { author } from "@/data/author";

/**
 * HOME — INTRODUCTION (10.2)
 * "Physician. Scientist. Author." — concise editorial storytelling with a
 * CTA to the About page.
 */
export function AuthorIntro() {
  return (
    <section aria-label="About Robert" className="border-y border-hairline bg-ivory-deep/60">
      <Container className="py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Introducing"
              title="A doctor who followed the questions."
            />
          </div>
          <div className="lg:col-span-8">
            <RevealGroup className="space-y-6">
              <RevealItem>
                <p className="flex flex-wrap gap-x-4 gap-y-1 font-serif text-2xl text-ink sm:text-3xl">
                  {author.roles.slice(0, 3).map((role, i) => (
                    <span key={role} className="flex items-baseline gap-4">
                      {i > 0 && (
                        <span aria-hidden="true" className="text-gold">
                          ·
                        </span>
                      )}
                      <span className={i === 2 ? "italic text-gold-deep" : undefined}>
                        {role}
                      </span>
                    </span>
                  ))}
                </p>
              </RevealItem>
              <RevealItem>
                <p className="text-lg leading-relaxed text-slate-body">
                  Robert&apos;s career bridges two worlds that are too often
                  kept apart: the bedside and the laboratory. Over more than
                  two decades of practice — as a family medicine physician and
                  board-certified hospitalist — he has cared for critically ill
                  patients on the front lines of the COVID-19 pandemic, then
                  returned to graduate training to earn a Master of Science in
                  Applied Biotechnology from the University of
                  Wisconsin–Madison, studying the vaccines, gene editing, and
                  emerging technologies that will shape the next generation of
                  care.
                </p>
              </RevealItem>
              <RevealItem>
                <p className="text-lg leading-relaxed text-slate-body">
                  His commitments reach beyond the ward: medical missions in
                  his native Zambia, mentorship for young African
                  entrepreneurs, and the ownership of Mufulira United Football
                  Club — a belief that health is built in communities, not
                  only in hospitals. Along the way, he became something else:
                  a storyteller. Writing is how he carries the humanity of the
                  ward and the curiosity of the lab into the same room — for
                  readers, patients, and anyone who believes a healthier
                  future is worth understanding.
                </p>
              </RevealItem>
              <RevealItem>
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 pt-2 text-sm font-semibold uppercase tracking-[0.14em] text-gold-deep transition-colors hover:text-ink"
                >
                  About Robert
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </RevealItem>
            </RevealGroup>
          </div>
        </div>
      </Container>
    </section>
  );
}
