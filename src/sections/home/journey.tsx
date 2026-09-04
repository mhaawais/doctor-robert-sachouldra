import { Container } from "@/components/common/container";
import { SectionHeading } from "@/components/common/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { getJourney } from "@/lib/content";

/**
 * HOME — THE JOURNEY (10.4)
 * Editorial storytelling: Medicine → COVID-19 frontline → Biotechnology →
 * Scientific exploration → Writing → Purpose. Chapter numbers + narrative —
 * not a corporate timeline.
 */
export async function Journey() {
  const steps = await getJourney();

  return (
    <section aria-label="The journey" className="bg-ivory">
      <Container className="py-20 sm:py-28">
        <SectionHeading
          eyebrow="The Journey"
          title="From the bedside to the bench — and back to the story."
          description="Six chapters that trace one physician's path through crisis, science, and purpose."
        />

        <RevealGroup className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <RevealItem key={step.id} className="relative">
              <div className="flex h-full flex-col border-t-2 border-gold/50 pt-6">
                <span
                  aria-hidden="true"
                  className="font-serif text-5xl leading-none text-ink/12"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-serif text-2xl text-ink">{step.title}</h3>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">
                  {step.caption}
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-body">
                  {step.narrative}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
