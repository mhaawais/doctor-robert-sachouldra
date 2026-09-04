import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { AuthorPortrait } from "@/components/common/author-portrait";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { buildMetadata } from "@/lib/seo";
import { getAuthor, getJourney, getExpertiseAreas } from "@/lib/content";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "The story of Dr. Robert Sakulanda — family medicine physician, hospitalist, and biotechnologist — from the COVID-19 front lines to graduate study and a life of writing at the intersection of medicine, science, and humanity.",
  path: "/about",
});

export default async function AboutPage() {
  const [author, journey, expertise] = await Promise.all([
    getAuthor(),
    getJourney(),
    getExpertiseAreas(),
  ]);

  return (
    <>
      {/* ── Page hero ─────────────────────────────────────────── */}
      <section aria-label="About hero" className="border-b border-hairline bg-ivory-deep/50">
        <Container className="grid items-center gap-12 pb-16 pt-16 sm:pb-20 sm:pt-20 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
                <span aria-hidden="true" className="inline-block h-px w-10 bg-gold/70" />
                Biography
              </p>
              <h1 className="mt-6 font-serif text-4xl leading-[1.1] text-ink text-balance sm:text-5xl lg:text-[3.4rem]">
                About Dr. Robert Sakulanda
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-body">
                Physician. Scientist. Author. Father. Immigrant. MD, MBA,
                FAAFP, DABFM. His story is proof that the path to purpose is
                rarely a straight line — it is built from the questions we
                refuse to stop asking.
              </p>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={0.15} className="mx-auto max-w-xs lg:max-w-none">
              <AuthorPortrait />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── Long-form biography ───────────────────────────────── */}
      <section aria-label="The story" className="bg-ivory">
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-2xl space-y-12">
            {/* Early journey */}
            <Reveal>
              <div>
                <h2 className="font-serif text-2xl text-ink sm:text-3xl">
                  The early journey
                </h2>
                <div className="mt-5 space-y-5 text-[17px] leading-relaxed text-slate-body">
                  <p>
                    Robert&apos;s story began in the communities of Zambia,
                    where he first understood what medicine means to a family —
                    not as an abstraction, but as the difference between fear
                    and reassurance, between loss and more time. That early
                    understanding became a compass that has guided him across
                    two continents and every chapter since.
                  </p>
                  <p>
                    Migration taught him the rest: how to begin again, how to
                    rebuild an identity in a new country, and how much of
                    medicine — and of life — translates without a common
                    language. Attention. Empathy. The willingness to sit with
                    people in their hardest moments.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Medicine */}
            <Reveal>
              <div>
                <h2 className="font-serif text-2xl text-ink sm:text-3xl">Medicine</h2>
                <div className="mt-5 space-y-5 text-[17px] leading-relaxed text-slate-body">
                  <p>
                    He has practiced medicine for more than two decades — first
                    in family medicine, following people across years and
                    generations, and now as a hospitalist in Georgia, where he
                    cares for admitted patients at Wayne Memorial Hospital in
                    Jesup and has served communities from Warner Robins to
                    Roswell. The two roles are two perspectives on the same
                    human being. Family medicine follows people through time;
                    hospital medicine meets them at their most fragile hours.
                    Both require the same discipline: to listen first, and to
                    treat the person, not only the disease.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* COVID */}
            <Reveal>
              <figure className="rounded-md border border-hairline bg-card p-8 shadow-[0_10px_36px_-22px_rgba(14,27,42,0.4)] sm:p-10">
                <blockquote>
                  <p className="font-serif text-xl italic leading-relaxed text-ink sm:text-2xl">
                    The pandemic asked more of medicine than anything in a
                    generation — and it asked the same of the people standing
                    inside it.
                  </p>
                </blockquote>
                <figcaption className="mt-4 text-xs uppercase tracking-[0.2em] text-ink/45">
                  On his COVID-19 frontline experience
                </figcaption>
              </figure>
            </Reveal>
            <Reveal>
              <div>
                <h2 className="font-serif text-2xl text-ink sm:text-3xl">
                  The frontline: COVID-19
                </h2>
                <div className="mt-5 space-y-5 text-[17px] leading-relaxed text-slate-body">
                  <p>
                    When COVID-19 arrived, Robert stood where the pandemic was
                    most real: at the bedsides of critically ill patients. He
                    has described those months as a defining classroom — nights
                    when protocols changed faster than anyone could learn them,
                    when families said goodbye through phones, and when
                    medicine&apos;s limits became impossible to ignore.
                  </p>
                  <p>
                    The experience changed him in two ways at once. It deepened
                    his conviction in the human side of care — presence,
                    honesty, tenderness. And it planted a question he could not
                    put down: where are the better tools? Why is the distance
                    between the laboratory and the patient still so long?
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Biotech */}
            <Reveal>
              <div>
                <h2 className="font-serif text-2xl text-ink sm:text-3xl">
                  Biotechnology &amp; scientific interests
                </h2>
                <div className="mt-5 space-y-5 text-[17px] leading-relaxed text-slate-body">
                  <p>
                    Rather than leave that question at the bedside, he followed
                    it into formal study. He earned a Master of Science in
                    Applied Biotechnology from the University of
                    Wisconsin–Madison, deepening his understanding of vaccines,
                    gene editing, and emerging medical technologies — the
                    fields that will decide what the next health crisis looks
                    like, and how many lives the next generation of medicine
                    can save.
                  </p>
                  <p>
                    His scientific interests now sit deliberately at the
                    junction of discovery and delivery: how breakthroughs move
                    from bench to bedside, how patients come to understand —
                    and trust — new technologies, and what clinicians owe the
                    public when science moves faster than common language.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Writing */}
            <Reveal>
              <div>
                <h2 className="font-serif text-2xl text-ink sm:text-3xl">Writing</h2>
                <div className="mt-5 space-y-5 text-[17px] leading-relaxed text-slate-body">
                  <p>
                    Writing is where the two halves of his working life — the
                    ward and the laboratory — finally speak to each other. On
                    the page, the urgency of patient care meets the patience of
                    science: essays and stories that translate complex ideas
                    into human terms, and that keep the dignity of sick people
                    at the center of every technical conversation.
                  </p>
                  <p>
                    His first book, drawn from his frontline experience and his
                    journey into biotechnology, is currently in the works.
                    Details will be announced on this site.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Entrepreneurship + perspectives */}
            <Reveal>
              <div>
                <h2 className="font-serif text-2xl text-ink sm:text-3xl">
                  Entrepreneurship &amp; global perspective
                </h2>
                <div className="mt-5 space-y-5 text-[17px] leading-relaxed text-slate-body">
                  <p>
                    His commitment extends beyond clinic and laboratory into
                    entrepreneurship — the conviction that good ideas deserve
                    to become real services, real access, and real change. It
                    is a conviction he has practiced: since 2017 he has owned
                    and rebuilt Mufulira United Football Club in Zambia&apos;s
                    Copperbelt — a civic institution he sees as social
                    infrastructure for young people — and he mentors young
                    African entrepreneurs in shaping and executing business
                    proposals.
                  </p>
                  <p>
                    His ties to Zambia run deeper than investment. He returns
                    regularly on medical missions, carrying the same bedside
                    discipline across the ocean — a worldview shaped by
                    communities in the United States and Zambia alike: health
                    is produced by systems, and systems can be built better.
                  </p>
                  <p>
                    As a father, he carries one more reason to care about the
                    long game. The future he works toward — in his practice,
                    his studies, and his writing — is the one his children and
                    yours will inherit.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Mission */}
            <Reveal>
              <div className="border-t-2 border-gold/60 pt-10 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
                  Mission
                </p>
                <p className="mx-auto mt-5 max-w-xl font-serif text-2xl leading-snug text-ink text-balance">
                  {author.mission}
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── Journey timeline (thematic — no invented dates) ───── */}
      <section aria-label="Journey timeline" className="border-y border-hairline bg-ivory-deep/60">
        <Container className="py-16 sm:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
              Selected Journey
            </p>
            <h2 className="mt-4 font-serif text-3xl text-ink sm:text-4xl">
              Chapters of the path
            </h2>
          </Reveal>
          <RevealGroup className="mx-auto mt-14 max-w-3xl">
            {journey.map((step, i) => (
              <RevealItem key={step.id}>
                <div className="relative flex gap-6 pb-10 last:pb-0 sm:gap-10">
                  {/* rail */}
                  {i < journey.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-[19px] top-11 h-[calc(100%-2.75rem)] w-px bg-gold/40 sm:left-[23px]"
                    />
                  ) : null}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-card font-serif text-sm text-gold-deep sm:h-12 sm:w-12">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-serif text-xl text-ink">{step.title}</h3>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-deep">
                      {step.caption}
                    </p>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-slate-body">
                      {step.narrative}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* ── Expertise ─────────────────────────────────────────── */}
      <section aria-label="Areas of expertise" className="bg-ivory">
        <Container className="py-16 sm:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-deep">
              Expertise
            </p>
            <h2 className="mt-4 font-serif text-3xl text-ink sm:text-4xl">
              Areas of focus
            </h2>
          </Reveal>
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2">
            {expertise.map((area) => (
              <RevealItem key={area.title}>
                <div className="h-full rounded-md border border-hairline bg-card p-7 shadow-[0_10px_36px_-22px_rgba(14,27,42,0.4)]">
                  <h3 className="font-serif text-xl text-ink">{area.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-body">
                    {area.description}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section aria-label="Explore books" className="border-t border-hairline bg-ink text-ivory">
        <Container className="py-16 text-center sm:py-20">
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-serif text-3xl leading-tight text-balance sm:text-4xl">
              The journey continues on the page.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ivory/70">
              Discover the book currently in the works, and the ideas behind it.
            </p>
            <Link
              href="/books"
              className="mt-8 inline-flex h-[52px] items-center justify-center rounded-sm bg-gold px-8 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-soft"
            >
              Explore Books
              <ArrowRight className="ml-2.5 h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
