import { FlaskConical, HeartPulse, Microscope, PenLine } from "lucide-react";
import { Container } from "@/components/common/container";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";

/**
 * HOME — MEDICINE + BIOTECHNOLOGY (10.5)
 * The unique intersection that defines the author identity: clinical
 * medicine, scientific discovery, biotechnology, human experience.
 */
const pillars = [
  {
    icon: HeartPulse,
    title: "Clinical Medicine",
    text: "More than two decades of family and hospital medicine — listening to patients, carrying their stories, and practicing care where it matters most.",
  },
  {
    icon: Microscope,
    title: "Scientific Discovery",
    text: "Graduate training that looks past the prescription pad — into trials, evidence, and the way knowledge is actually made.",
  },
  {
    icon: FlaskConical,
    title: "Biotechnology",
    text: "Vaccines, gene editing, and emerging medical technologies — understood deeply enough to be explained honestly.",
  },
  {
    icon: PenLine,
    title: "Human Experience",
    text: "The thread through it all: writing that keeps the human being at the center of every scientific advance.",
  },
];

export function MedicineBiotech() {
  return (
    <section aria-label="Medicine and biotechnology" className="border-y border-hairline bg-ivory-deep/60">
      <Container className="py-20 sm:py-28">
        <SectionHeading
          eyebrow="The Intersection"
          title="Where medicine meets biotechnology — and becomes story."
          description="Robert's writing lives at a crossroads few authors occupy: frontline patient care, rigorous science, and the human experience that binds them."
          align="center"
        />

        <RevealGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, text }) => (
            <RevealItem key={title}>
              <div className="group flex h-full flex-col rounded-md border border-hairline bg-card p-7 shadow-[0_10px_36px_-22px_rgba(14,27,42,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/50">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-accent text-gold-deep">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-serif text-xl text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-body">{text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-14 max-w-2xl text-center font-serif text-xl italic leading-relaxed text-ink/75 sm:text-2xl">
            This intersection — clinic, laboratory, and page — is where his
            voice as an author is formed.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
