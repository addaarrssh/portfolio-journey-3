import { useEffect, useRef, useState } from "react";

// Easter egg: type "adarsh" (or the Konami code) to flip the whole site into
// a playful "debug mode" — blueprint grid, section outlines, and an FPS meter.
// Pays off the "DEBUG MODE: ON" sticker in the notebook.
const WORD = "adarsh";
const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
];

export default function DebugMode() {
  const [on, setOn] = useState(false);
  const [fps, setFps] = useState(0);
  const wordBuf = useRef("");
  const konamiIdx = useRef(0);

  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;
      if (typing) return;

      // word trigger
      if (e.key.length === 1) {
        wordBuf.current = (wordBuf.current + e.key.toLowerCase()).slice(-WORD.length);
        if (wordBuf.current === WORD) {
          setOn((v) => !v);
          wordBuf.current = "";
        }
      }

      // konami trigger
      if (e.key === KONAMI[konamiIdx.current]) {
        konamiIdx.current += 1;
        if (konamiIdx.current === KONAMI.length) {
          setOn((v) => !v);
          konamiIdx.current = 0;
        }
      } else {
        konamiIdx.current = e.key === KONAMI[0] ? 1 : 0;
      }

      if (e.key === "Escape") setOn(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // toggle body class + fps loop
  useEffect(() => {
    document.body.classList.toggle("debug-on", on);
    if (!on) return;

    let raf = 0;
    let last = performance.now();
    let frames = 0;
    const loop = (now) => {
      frames += 1;
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("debug-on");
    };
  }, [on]);

  if (!on) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[92]">
      {/* blueprint grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,98,44,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(232,98,44,0.25) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* HUD */}
      <div className="pointer-events-auto absolute left-4 top-24 rounded-lg border border-sunset/60 bg-ink/85 px-4 py-3 font-display text-xs uppercase tracking-widest text-cream shadow-lg">
        <p className="flex items-center gap-2 text-sunset">
          <span className="h-2 w-2 animate-pulse rounded-full bg-sunset" /> Debug Mode: ON
        </p>
        <p className="mt-2 text-cream/70">FPS <span className="text-accent">{fps}</span></p>
        <p className="mt-1 text-cream/50">viewport {window.innerWidth}×{window.innerHeight}</p>
      </div>
    </div>
  );
}
