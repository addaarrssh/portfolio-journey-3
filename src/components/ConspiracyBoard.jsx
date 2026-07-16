import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapAnimation } from "../hooks/useGsapAnimation";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { DURATION, EASE, STAGGER, SCROLL_TRIGGER_DEFAULTS } from "../config/animations";
import { SectionTag } from "./SectionKit";

gsap.registerPlugin(ScrollTrigger);

// "Evidence I'm a real person" — a detective corkboard of Adarsh's actual
// drawings/photos. Each polaroid starts UNDEVELOPED (dark) and develops on
// hover, connected by red thread like a conspiracy wall. This is the evolved
// version of the old hover-photo strip.
//
// Images are real assets under /public/images. If a photo is ever missing the
// polaroid still renders its frame + caption (no broken-image icon), because
// the dark filter hides the placeholder until hover.
const EVIDENCE = [
  { img: "/images/drawings/3.jpg", cap: "proof I draw when I should be studying", rot: -6, pos: { top: "6%", left: "4%" } },
  { img: "/images/sunset-polaroid.jpg", cap: "proof I go outside (rare)", rot: 5, pos: { top: "10%", left: "27%" } },
  { img: "/images/drawings/17.jpg", cap: "2 AM sketch, no regrets", rot: -3, pos: { top: "4%", left: "50%" } },
  { img: "/images/character-waving.jpg", cap: "hi, it's me", rot: 7, pos: { top: "8%", left: "73%" } },
  { img: "/images/drawings/25.jpg", cap: "the one I'm secretly proud of", rot: 4, pos: { top: "52%", left: "10%" } },
  { img: "/images/journey-sunset.png", cap: "Jamshedpur skies hit different", rot: -5, pos: { top: "56%", left: "38%" } },
  { img: "/images/drawings/31.jpg", cap: "exhibit G: still improving", rot: 6, pos: { top: "50%", left: "66%" } },
];

function Polaroid({ item, className = "", style }) {
  return (
    <figure
      data-anim="cb-item"
      className={`cb-polaroid ${className}`}
      style={{ "--cb-rot": `${item.rot}deg`, ...style }}
      onMouseEnter={(e) => {
        // Count each distinct polaroid once toward the "develop 3 polaroids" quest.
        if (!e.currentTarget.dataset.dev) {
          e.currentTarget.dataset.dev = "1";
          window.dispatchEvent(new CustomEvent("quest", { detail: "polaroid" }));
        }
      }}
    >
      <span className="cb-pin" />
      <img className="cb-photo" src={item.img} alt={item.cap} loading="lazy" draggable="false" />
      <figcaption className="cb-cap">{item.cap}</figcaption>
    </figure>
  );
}

export default function ConspiracyBoard() {
  const reducedMotion = usePrefersReducedMotion();

  const scope = useGsapAnimation((scope) => {
    gsap.from(scope.current.querySelectorAll("[data-anim='cb-item']"), {
      y: reducedMotion ? 0 : 30,
      opacity: 0,
      rotate: reducedMotion ? 0 : -8,
      duration: DURATION.base,
      stagger: STAGGER.tight,
      ease: EASE.out,
      scrollTrigger: { trigger: scope.current, ...SCROLL_TRIGGER_DEFAULTS },
    });
  }, [reducedMotion]);

  return (
    <section id="board" ref={scope} className="cb-cork py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="flex justify-center">
            <SectionTag n="04" label="The Evidence" color="cream" />
          </div>
          <h2 className="section-heading mt-5 text-cream drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
            Evidence I&apos;m a Real Person
          </h2>
          <p className="mt-4 font-hand text-lg text-cream/90 cb-hint inline-block">
            hover a polaroid to develop it 🔍
          </p>
        </div>

        {/* Scattered board (desktop) */}
        <div className="relative mt-14 hidden h-[620px] md:block">
          {/* red thread connecting the pins */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <polyline
              points="9%,12% 33%,16% 57%,10% 80%,14% 74%,58% 46%,62% 18%,58% 9%,12%"
              fill="none"
              stroke="#c23a2b"
              strokeWidth="1.5"
              strokeDasharray="4 5"
              opacity="0.7"
            />
          </svg>
          {EVIDENCE.map((item, i) => (
            <Polaroid key={i} item={item} className="absolute" style={item.pos} />
          ))}
        </div>

        {/* Simple grid (mobile) — same polaroids, no absolute positioning */}
        <div className="mt-10 grid grid-cols-2 justify-items-center gap-6 md:hidden">
          {EVIDENCE.map((item, i) => (
            <Polaroid key={i} item={item} className="!relative" style={{ position: "relative" }} />
          ))}
        </div>
      </div>
    </section>
  );
}
