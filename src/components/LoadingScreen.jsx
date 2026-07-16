import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const BOOT_LINES = [
  "waking up the neural net…",
  "brewing coffee ☕…",
  "loading honest predictions…",
  "warming up the pen…",
  "almost there —",
];

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const rootRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  const finish = (skip = false) => {
    if (skip || reducedMotion) {
      gsap.set(rootRef.current, { autoAlpha: 0 });
      onComplete?.();
      return;
    }
    gsap.to(rootRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: "power3.inOut",
      onComplete: () => onComplete?.(),
    });
  };

  useEffect(() => {
    const counter = { value: 0 };
    const tween = gsap.to(counter, {
      value: 100,
      duration: reducedMotion ? 0.3 : 2.2,
      ease: "power2.inOut",
      onUpdate: () => setProgress(Math.round(counter.value)),
      onComplete: () => finish(),
    });
    return () => tween.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onComplete, reducedMotion]);

  const line = BOOT_LINES[Math.min(BOOT_LINES.length - 1, Math.floor(progress / 20))];

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-ink p-8 sm:p-12"
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${progress} percent complete.`}
    >
      {/* faint dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(245,234,216,0.08) 1px, transparent 1.4px)",
          backgroundSize: "34px 34px",
        }}
      />

      {/* top row: brand + skip */}
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em] text-cream/60">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sunset opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sunset" />
          </span>
          Adarsh Sahu · Field Notes
        </div>
        <button
          onClick={() => finish(true)}
          className="border border-cream/25 px-4 py-2 font-display text-xs uppercase tracking-[0.2em] text-cream/70 transition-colors hover:border-cream hover:text-cream"
        >
          Skip intro →
        </button>
      </div>

      {/* center: brand mark */}
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <p className="font-script text-6xl text-cream sm:text-8xl">Adarsh</p>
        <p className="mt-3 font-hand text-lg text-cream/50">{line}</p>
      </div>

      {/* bottom: big percentage + bar */}
      <div className="relative">
        <div className="flex items-end justify-between">
          <p className="font-display text-7xl font-bold leading-none text-cream sm:text-9xl">
            {progress}
            <span className="text-sunset">%</span>
          </p>
          <p className="mb-2 hidden font-hand text-base text-cream/50 sm:block">
            a journey in machine learning
          </p>
        </div>
        <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-cream/15">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--color-sunset), var(--color-accent))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
