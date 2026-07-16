import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GraduationCap, Rocket } from "lucide-react";
import { useGsapAnimation } from "../hooks/useGsapAnimation";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { education } from "../data/experience";
import { projects } from "../data/projects";
import TextPressure from "./TextPressure";
import { DURATION, EASE, SCROLL_TRIGGER_DEFAULTS, STAGGER } from "../config/animations";
import { SectionTag } from "./SectionKit";

gsap.registerPlugin(ScrollTrigger);

// Only real, dated milestones — education plus projects with a confirmed
// year. Undated projects live in the Projects grid, not here.
const datedProjects = projects.filter((p) => p.year);
const milestones = [
  {
    id: education.id,
    year: `${education.startYear} – ${education.endYear}`,
    icon: GraduationCap,
    title: education.degree,
    detail: `${education.institution} · CGPA ${education.cgpa}`,
  },
  ...datedProjects.map((p) => ({
    id: p.id,
    year: String(p.year),
    icon: Rocket,
    title: p.title,
    detail: p.description.split(".")[0] + ".",
  })),
];

export default function Timeline() {
  const reducedMotion = usePrefersReducedMotion();

  const scope = useGsapAnimation((scope) => {
    gsap.from(scope.current.querySelectorAll("[data-anim='milestone']"), {
      x: reducedMotion ? 0 : -30,
      opacity: 0,
      duration: DURATION.base,
      stagger: STAGGER.base,
      ease: EASE.out,
      scrollTrigger: { trigger: scope.current, ...SCROLL_TRIGGER_DEFAULTS },
    });
  }, [reducedMotion]);

  return (
    <section id="timeline" ref={scope} className="bg-paper py-28">
      <div className="mx-auto max-w-3xl px-6">
        <SectionTag n="03" label="Journey" />
        <div className="relative h-[80px] sm:h-[120px] mt-5 mb-6">
          <TextPressure
            text="Education & Milestones"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            textColor="#3e2a1e"
            strokeColor="#ff0000"
            minFontSize={32}
          />
        </div>
        <p className="mt-4 text-ink/60">
          A real chronological record — education plus the projects with a
          confirmed build year.
        </p>

        <div className="relative mt-14 border-l-2 border-ink/20 pl-8">
          {milestones.map(({ id, year, icon: Icon, title, detail }) => (
            <div key={id} data-anim="milestone" className="relative mb-12 last:mb-0">
              <span className="absolute -left-[2.65rem] flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-cream text-ink">
                <Icon size={16} />
              </span>
              <p className="font-hand text-lg text-sunset-deep">{year}</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-ink/60">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
