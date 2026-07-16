import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

// S4: a drying-ink cursor trail. The mouse leaves a pen stroke that starts
// ballpoint-blue, dries to sepia, and fades to nothing in ~1s — so on the
// paper sections it looks like you're marking the page. Width tracks speed.
const LIFE = 950; // ms a point stays visible
const MAX_POINTS = 90;

export default function CursorTrail() {
  const canvasRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const points = [];
    let lastX = null;
    let lastY = null;

    const onMove = (e) => {
      const now = performance.now();
      let width = 5;
      if (lastX !== null) {
        const d = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        width = Math.max(1.4, Math.min(7, 7 - d * 0.12)); // faster → thinner
      }
      points.push({ x: e.clientX, y: e.clientY, t: now, w: width });
      if (points.length > MAX_POINTS) points.shift();
      lastX = e.clientX;
      lastY = e.clientY;
    };

    // ink colour: blue (53,80,178) drying to sepia (138,111,78)
    const inkAt = (k, alpha) => {
      const r = Math.round(53 + (138 - 53) * k);
      const g = Math.round(80 + (111 - 80) * k);
      const b = Math.round(178 + (78 - 178) * k);
      return `rgba(${r},${g},${b},${alpha})`;
    };

    let raf = 0;
    const draw = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const age = now - b.t;
        if (age > LIFE) continue;
        const life = 1 - age / LIFE; // 1 fresh → 0 gone
        const dry = 1 - life; // 0 fresh → 1 dried
        ctx.strokeStyle = inkAt(dry, life * 0.85);
        ctx.lineWidth = b.w * life;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // trim fully-faded points from the front
      while (points.length && now - points[0].t > LIFE) points.shift();

      raf = requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "none" }}
    />
  );
}
