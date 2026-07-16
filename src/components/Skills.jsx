import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapAnimation } from "../hooks/useGsapAnimation";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { skillGroups } from "../data/skills";
import { DURATION, EASE, SCROLL_TRIGGER_DEFAULTS } from "../config/animations";
import SkillCard from "./SkillCard";
import { SectionTag, QuickNote, GridBackdrop } from "./SectionKit";

gsap.registerPlugin(ScrollTrigger);

export default function Skills() {
  const reducedMotion = usePrefersReducedMotion();

  const scope = useGsapAnimation((scope) => {
    gsap.from(scope.current.querySelectorAll("[data-anim='skill-word']"), {
      opacity: 0,
      y: reducedMotion ? 0 : 12,
      duration: DURATION.fast,
      stagger: 0.02,
      ease: EASE.out,
      scrollTrigger: { trigger: scope.current, ...SCROLL_TRIGGER_DEFAULTS },
    });
  }, [reducedMotion]);

  return (
    <section id="skills" ref={scope} className="relative overflow-hidden bg-teal py-28 text-cream">
      <GridBackdrop opacity={0.07} />
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <SectionTag n="01" label="The CV" />
            <h2 className="mt-5 font-display text-5xl font-bold uppercase tracking-tight sm:text-7xl">
              The Toolbox
            </h2>
            <div className="mt-3 h-1 w-24 bg-accent" />
            <p className="mt-5 max-w-xl text-cream/70">
              Everything I reach for, grouped by area. The faded, dashed words are
              things I&apos;m actively learning right now — not claimed proficiencies.
            </p>
          </div>

          <QuickNote title="How to read this" tone="dark" className="mt-2">
            Solid = I&apos;ve shipped with it. Dashed = on my desk this month. No
            fake five-star ratings here.
          </QuickNote>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-x-1 gap-y-2 text-cream">
          {skillGroups.map((group) =>
            group.skills.map((skill) => (
              <span data-anim="skill-word" key={`${group.id}-${skill}`}>
                <SkillCard skill={skill} learning={group.learning} />
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
