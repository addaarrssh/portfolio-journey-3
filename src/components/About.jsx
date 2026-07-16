import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapAnimation } from "../hooks/useGsapAnimation";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { originStory } from "../data/story";
import { DURATION, EASE, SCROLL_TRIGGER_DEFAULTS, STAGGER } from "../config/animations";
import ThreadLine from "./ThreadLine";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const reducedMotion = usePrefersReducedMotion();
  const threadTrigger = useRef(null);

  const scope = useGsapAnimation((scope) => {
    gsap.from(scope.current.querySelectorAll("[data-anim='origin-in']"), {
      y: reducedMotion ? 0 : 30,
      opacity: 0,
      duration: DURATION.base,
      stagger: STAGGER.base,
      ease: EASE.out,
      scrollTrigger: { trigger: scope.current, ...SCROLL_TRIGGER_DEFAULTS },
    });
  }, [reducedMotion]);

  return (
    <section id="about" ref={scope} className="paper-bg relative py-28">
      <div ref={threadTrigger} className="relative mx-auto max-w-5xl px-6 pl-20">
        <ThreadLine
          triggerRef={threadTrigger}
          viewBox="0 0 800 500"
          pathD="M 40 40 C 260 40 260 260 480 260 S 700 460 760 460"
          className="left-0 top-0 h-full w-full"
        />

        <p className="font-hand text-sm uppercase tracking-widest text-sunset-deep">
          {originStory.kicker}
        </p>
        <p className="font-hand mt-1 text-xl text-ink/70">how it started.</p>

        <h2
          data-anim="origin-in"
          className="section-heading mt-4 max-w-2xl"
        >
          {originStory.headline}
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <p
            data-anim="origin-in"
            className="lg:col-span-2 text-lg leading-relaxed text-ink/80"
          >
            {originStory.body}
          </p>

          <div data-anim="origin-in" className="space-y-4">
            <div className="sticky-note p-4 text-base" style={{ "--tilt": "2deg" }}>
              {originStory.sideNoteTop.split("\n").map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </div>
            <p className="font-hand text-xl leading-snug text-sunset-deep">
              {originStory.sideNoteMid.split("\n").map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
