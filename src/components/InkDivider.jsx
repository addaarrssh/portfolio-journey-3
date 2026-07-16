import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapAnimation } from "../hooks/useGsapAnimation";

gsap.registerPlugin(ScrollTrigger);

let seq = 0;

// S1: an organic ink-bleed transition between sections. As the boundary
// scrolls into view, a turbulent blob of the NEXT section's colour soaks
// downward — like ink wicking through paper — handing off to that section.
export default function InkDivider({ color = "#e8622c", height = 120 }) {
  const filterId = useRef(`ink-turb-${++seq}`).current;

  const scope = useGsapAnimation((root) => {
    const blob = root.current.querySelector("[data-ink-blob]");
    if (!blob) return;
    gsap.fromTo(
      blob,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top 92%",
          end: "bottom 55%",
          scrub: 0.5
        }
      }
    );
  }, []);

  return (
    <div
      ref={scope}
      aria-hidden="true"
      className="relative w-full overflow-hidden"
      style={{ height: `${height}px`, marginBottom: `-1px`, lineHeight: 0 }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <defs>
          <filter id={filterId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="42" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        {/* the bleeding blob — grows from the bottom edge upward via scaleY */}
        <g data-ink-blob style={{ transformOrigin: "50% 100%", transformBox: "fill-box" }}>
          <rect x="-60" y="20" width="1320" height="120" fill={color} filter={`url(#${filterId})`} />
        </g>
      </svg>
    </div>
  );
}
