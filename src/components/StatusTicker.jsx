import { useEffect, useRef, useState } from "react";

// Witty, honest one-liners that rotate in the top strip — the "ticker".
const QUIPS = [
  "This portfolio runs on curiosity and caffeine.",
  "Still debugging at 2 AM — some habits die hard.",
  "Honest models beat impressive demos.",
  "Built this whole thing myself. Blame me for the bugs.",
  "Teaching machines to admit what they don't know.",
  "From Jamshedpur to NIT Jamshedpur, one commit at a time.",
  "4 ML projects shipped. Infinitely more ideas.",
  "If the model isn't sure, it should say so.",
];

export default function StatusTicker() {
  const [pct, setPct] = useState(0);
  const [quip, setQuip] = useState(0);
  const fillRef = useRef(null);

  // Live scroll-progress readout — Lenis drives native scroll, so a plain
  // scroll listener (plus a rAF fallback) keeps this in sync.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
      setPct(p);
      if (fillRef.current) fillRef.current.style.width = `${p}%`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Rotate the quip every few seconds.
  useEffect(() => {
    const id = setInterval(() => setQuip((q) => (q + 1) % QUIPS.length), 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-8 items-center justify-between gap-4 border-b border-cream/10 bg-ink px-4 font-display text-[11px] uppercase tracking-widest text-cream/70 sm:px-6">
      {/* Left: pulsing live dot + brand */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sunset opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-sunset" />
        </span>
        <span className="hidden text-cream/90 sm:inline">Adarsh Sahu</span>
      </div>

      {/* Center: rotating quip */}
      <div className="relative hidden flex-1 overflow-hidden text-center md:block">
        <span key={quip} className="ticker-quip inline-block normal-case tracking-normal font-hand text-sm text-cream/60">
          {QUIPS[quip]}
        </span>
      </div>

      {/* Right: live scroll-progress readout */}
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-cream/50">You&apos;ve seen</span>
        <div className="h-[3px] w-16 overflow-hidden rounded-full bg-cream/15 sm:w-24">
          <div
            ref={fillRef}
            className="h-full w-0 rounded-full"
            style={{ background: "linear-gradient(90deg, var(--color-sunset), var(--color-accent))" }}
          />
        </div>
        <span className="w-9 text-right tabular-nums text-accent">{pct}%</span>
      </div>
    </div>
  );
}
