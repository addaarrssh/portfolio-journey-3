import { useEffect } from "react";
import { gsap } from "gsap";

// Moves `ref.current` toward the pointer position within its bounding box.
// Pass `disabled` (e.g. from usePrefersReducedMotion/useIsLowPower) to no-op.
export function useMouseParallax(ref, { strength = 20, disabled = false } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (disabled || !el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(el, {
        x: relX * strength,
        y: relY * strength,
        duration: 0.6,
        ease: "power2.out",
      });
    };

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "power2.out" });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, strength, disabled]);
}
