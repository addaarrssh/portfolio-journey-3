import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

// A hand-drawn-style connector line that draws itself as the trigger
// section scrolls through view, with a small glowing dot travelling
// along the same path. Purely decorative — path shape has no semantic
// content, so any curve works here.
export default function ThreadLine({
  pathD,
  viewBox = "0 0 800 600",
  triggerRef,
  className = "",
}) {
  const pathRef = useRef(null);
  const dotRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const path = pathRef.current;
    const dot = dotRef.current;
    const trigger = triggerRef?.current;
    if (!path || !trigger) return;

    const length = path.getTotalLength();

    if (reducedMotion) {
      path.style.strokeDasharray = "none";
      path.style.strokeDashoffset = "0";
      if (dot) {
        const end = path.getPointAtLength(length);
        gsap.set(dot, { x: end.x, y: end.y });
      }
      return;
    }

    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);

    const st = ScrollTrigger.create({
      trigger,
      start: "top 75%",
      end: "bottom 25%",
      scrub: 0.6,
      onUpdate: (self) => {
        const progress = self.progress;
        path.style.strokeDashoffset = String(length * (1 - progress));
        if (dot) {
          const pt = path.getPointAtLength(progress * length);
          gsap.set(dot, { x: pt.x, y: pt.y });
        }
      },
    });

    return () => st.kill();
  }, [reducedMotion, triggerRef]);

  return (
    <svg
      viewBox={viewBox}
      className={`pointer-events-none absolute overflow-visible ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke="var(--color-teal)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle ref={dotRef} r="7" fill="var(--color-accent)" className="thread-dot" />
    </svg>
  );
}
