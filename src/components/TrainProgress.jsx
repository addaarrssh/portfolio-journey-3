import { useEffect, useRef, useState } from "react";
import { soundManager } from "../config/soundManager";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

// A tiny hand-drawn train rides the bottom edge of the screen; its position IS
// your scroll progress. Adarsh is from Jamshedpur (a railway town) and RailCross
// is his flagship — so the train is the site's little mascot.
//
// Sections become "stations": a signboard pops up as you arrive, with a soft
// crossing-bell tick. Type "train" anywhere to make it whistle and dash across.
//
// The whole thing is pointer-events-none and sits below the command-palette
// pill, so it can never block a click.
const STATIONS = [
  { pct: 0.0, label: "STN · HOME" },
  { pct: 0.16, label: "STN · THE NOTEBOOK" },
  { pct: 0.44, label: "STN · THE TOOLBOX" },
  { pct: 0.6, label: "STN · PROJECTS" },
  { pct: 0.78, label: "STN · JOURNEY" },
  { pct: 0.99, label: "STN · SAY HI" },
];

const WHISTLE_WORD = "train";

export default function TrainProgress() {
  const reducedMotion = usePrefersReducedMotion();
  const trainRef = useRef(null);
  const smokeRef = useRef(null);
  const rafRef = useRef(0);
  const lastStation = useRef(-1);
  const wordBuf = useRef("");
  const [sign, setSign] = useState(null); // { label, xPct }
  const signTimer = useRef(0);

  // Track scroll progress and slide the train.
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      const train = trainRef.current;
      if (train) {
        // Keep the train fully on-screen: 0 → (viewport - train width).
        // The rotate(var(--wind)) makes it lean forward when scrolling fast (S3).
        const travel = window.innerWidth - 40;
        train.style.transform = `translateX(${p * travel}px) scaleX(-1) rotate(calc(var(--wind, 0) * -6deg))`;
      }

      // Fire a station sign when we pass each threshold (once, in order).
      let idx = -1;
      for (let i = 0; i < STATIONS.length; i++) {
        if (p >= STATIONS[i].pct - 0.01) idx = i;
      }
      if (idx !== lastStation.current && idx >= 0) {
        lastStation.current = idx;
        showSign(STATIONS[idx], p);
        soundManager.playTick();
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSign = (station, p) => {
    const xPct = Math.min(92, Math.max(8, p * 100));
    setSign({ label: station.label, xPct });
    clearTimeout(signTimer.current);
    signTimer.current = window.setTimeout(() => setSign(null), 2200);
  };

  const puff = () => {
    const s = smokeRef.current;
    if (!s || reducedMotion) return;
    s.classList.remove("trn-puff");
    // force reflow so the animation can restart
    void s.offsetWidth;
    s.classList.add("trn-puff");
  };

  // "train" easter egg — whistle + dash across the screen.
  useEffect(() => {
    const onKey = (e) => {
      const typing =
        /^(input|textarea|select)$/i.test(e.target.tagName) ||
        e.target.isContentEditable;
      if (typing || e.key.length !== 1) return;

      wordBuf.current = (wordBuf.current + e.key.toLowerCase()).slice(
        -WHISTLE_WORD.length
      );
      if (wordBuf.current === WHISTLE_WORD) {
        wordBuf.current = "";
        soundManager.playWarp(); // low whistle-ish sweep
        window.dispatchEvent(new CustomEvent("quest", { detail: "train" }));
        const train = trainRef.current;
        if (train && !reducedMotion) {
          train.classList.add("trn-dash");
          const travel = window.innerWidth - 40;
          train.style.transform = `translateX(${travel}px) scaleX(-1)`;
          puff();
          setTimeout(() => puff(), 300);
          setTimeout(() => puff(), 600);
          setTimeout(() => {
            train.classList.remove("trn-dash");
            // snap back to real scroll position
            window.dispatchEvent(new Event("scroll"));
          }, 1300);
        }
        setSign({ label: "🚂  wooo-woooo!", xPct: 50 });
        clearTimeout(signTimer.current);
        signTimer.current = window.setTimeout(() => setSign(null), 2000);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <div className="trn-wrap" aria-hidden="true">
      <div className="trn-track" />
      <div ref={trainRef} className="trn-train">
        🚂
        <span ref={smokeRef} className="trn-smoke" style={{ left: "20px" }} />
      </div>
      {sign && (
        <div
          className="trn-sign trn-sign-in"
          style={{ left: `${sign.xPct}%` }}
        >
          {sign.label}
        </div>
      )}
    </div>
  );
}
