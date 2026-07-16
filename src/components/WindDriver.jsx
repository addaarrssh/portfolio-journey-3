import { useEffect } from "react";

// S3: publishes a global `--wind` CSS variable (-1..1) from Lenis scroll
// velocity, smoothed. Any element can lean/skew/streak by referencing
// var(--wind) in a transform — no per-component JS needed.
export default function WindDriver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let wind = 0;
    let raf = 0;
    const tick = () => {
      const v = window.__lenis ? window.__lenis.velocity || 0 : 0;
      const target = Math.max(-1, Math.min(1, v / 45));
      wind += (target - wind) * 0.12;
      document.documentElement.style.setProperty("--wind", wind.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.setProperty("--wind", "0");
    };
  }, []);

  return null;
}
