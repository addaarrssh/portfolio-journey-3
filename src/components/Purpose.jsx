import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapAnimation } from "../hooks/useGsapAnimation";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { education, heroStats } from "../data/experience";
import { projects, featuredProjectIds } from "../data/projects";
import { purposeStory } from "../data/story";
import { DURATION, EASE, SCROLL_TRIGGER_DEFAULTS, STAGGER } from "../config/animations";
import ThreadLine from "./ThreadLine";

gsap.registerPlugin(ScrollTrigger);

const featured = featuredProjectIds
  .map((id) => projects.find((p) => p.id === id))
  .filter(Boolean);

export default function Purpose() {
  const reducedMotion = usePrefersReducedMotion();
  const threadTrigger = useRef(null);

  const scope = useGsapAnimation((scope) => {
    gsap.from(scope.current.querySelectorAll("[data-anim='purpose-in']"), {
      y: reducedMotion ? 0 : 30,
      opacity: 0,
      duration: DURATION.base,
      stagger: STAGGER.base,
      ease: EASE.out,
      scrollTrigger: { trigger: scope.current, ...SCROLL_TRIGGER_DEFAULTS },
    });
  }, [reducedMotion]);

  return (
    <section id="purpose" ref={scope} className="paper-bg relative py-28">
      <div ref={threadTrigger} className="relative mx-auto max-w-6xl px-6 pl-20">
        <ThreadLine
          triggerRef={threadTrigger}
          viewBox="0 0 900 500"
          pathD="M 780 30 C 560 30 560 200 340 200 S 80 380 40 460"
          className="left-0 top-0 h-full w-full"
        />

        <p className="font-hand text-sm uppercase tracking-widest text-sunset-deep">
          {purposeStory.kicker}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div data-anim="purpose-in" className="space-y-4 lg:col-span-1">
            <div className="sticky-note p-4" style={{ "--tilt": "-2deg" }}>
              <p className="font-display text-sm font-bold uppercase tracking-wide">
                {purposeStory.noteTitle}
              </p>
              <p className="mt-2 text-base leading-snug">{purposeStory.noteBody}</p>
            </div>
            <p className="font-hand text-lg text-ink/70">{purposeStory.noteFooter}</p>
          </div>

          <div data-anim="purpose-in" className="glass-card lg:col-span-1 flex flex-col items-center justify-center text-center">
            <p className="font-display text-6xl font-black text-sunset">
              {purposeStory.statHighlight.value}
            </p>
            <p className="mt-2 font-display text-sm uppercase tracking-wider text-ink/70">
              {purposeStory.statHighlight.label}
            </p>
            <p className="font-hand mt-3 text-base text-sunset-deep">
              {purposeStory.sideAnnotation}
            </p>
          </div>

          <div data-anim="purpose-in" className="flex flex-col gap-4 lg:col-span-1">
            <StatBox
              value={`${education.cgpa}`}
              label="CGPA"
              note="gotta keep parents happy"
            />
            <StatBox
              value={`${heroStats.find((s) => s.id === "projects")?.value}+`}
              label="Public ML/AI Projects"
              note="scaled one weekend at a time"
            />
            <StatBox
              value={`${heroStats.find((s) => s.id === "technologies")?.value}+`}
              label="Technologies Used"
              note="and counting"
            />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div data-anim="purpose-in">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-sunset-deep">
              // Projects I&apos;ve Built
            </p>
            <ul className="mt-4 space-y-2 text-lg text-ink/80">
              {featured.map((p) => (
                <li key={p.id}>{p.title}</li>
              ))}
            </ul>
          </div>

          <div data-anim="purpose-in" className="flex flex-col justify-center">
            <p className="font-hand text-sm uppercase tracking-widest text-ink/50">
              Public Repositories
            </p>
            <p className="font-display text-2xl font-bold text-ink">Build With Purpose</p>
            <p className="mt-3 text-ink/70">{purposeStory.closing}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBox({ value, label, note }) {
  return (
    <div className="glass-card py-4">
      <p className="font-display text-3xl font-black text-ink">{value}</p>
      <p className="text-xs uppercase tracking-wider text-ink/60">{label}</p>
      <p className="font-hand mt-1 text-sm text-sunset-deep">{note}</p>
    </div>
  );
}
