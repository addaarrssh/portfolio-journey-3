import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { TrendingUp } from "lucide-react";
import { useGsapAnimation } from "../hooks/useGsapAnimation";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { education } from "../data/experience";
import { heroCopy } from "../data/story";
import { DURATION, EASE, STAGGER } from "../config/animations";
import DraggableSticker from "./DraggableSticker";
import NeuralNetwork from "./NeuralNetwork";

const ROLES = [
  "building RAG systems",
  "shipping ML projects",
  "chasing honest metrics",
  "debugging at 2 AM",
  "learning PyTorch",
];

// Live "now in Jamshedpur" clock (IST, UTC+5:30) — makes the hero feel alive.
function useISTClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const t = new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setTime(t);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// Rotating "currently" phrase with a typewriter feel.
function RotatingRole() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ROLES.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-block">
      <span key={i} className="role-swap inline-block text-accent">
        {ROLES[i]}
      </span>
      <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-accent align-middle" style={{ height: "1em" }} />
    </span>
  );
}

export default function Hero() {
  const reducedMotion = usePrefersReducedMotion();
  const ist = useISTClock();

  const heroBgRef = useRef(null);
  const heroTextRef = useRef(null);
  const nameClipRef = useRef(null);
  const bottomLeftRef = useRef(null);
  const bottomRightRef = useRef(null);
  const spotlightRef = useRef(null);

  const scope = useGsapAnimation((scope) => {
    const tl = gsap.timeline({ defaults: { ease: EASE.out } });
    if (!scope.current) return;
    tl.from(scope.current.querySelectorAll("[data-anim='hero-in']"), {
      y: reducedMotion ? 0 : 30,
      opacity: 0,
      duration: DURATION.base,
      stagger: STAGGER.base,
    }).from(
      scope.current.querySelector("[data-anim='hero-name']"),
      { scale: reducedMotion ? 1 : 0.9, opacity: 0, duration: DURATION.slow },
      "-=0.5"
    );
  }, [reducedMotion]);

  // Mouse-reactive parallax + warm spotlight cursor
  useEffect(() => {
    if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

    const heroBg = heroBgRef.current;
    const heroText = heroTextRef.current;
    const bottomLeft = bottomLeftRef.current;
    const bottomRight = bottomRightRef.current;
    const spotlight = spotlightRef.current;
    if (!heroBg || !heroText) return;

    let globalMouseX = window.innerWidth / 2;
    let globalMouseY = window.innerHeight / 2;
    let currMouseX = globalMouseX;
    let currMouseY = globalMouseY;
    let spotX = globalMouseX;
    let spotY = globalMouseY;

    const onMouseMove = (e) => {
      globalMouseX = e.clientX;
      globalMouseY = e.clientY;
    };

    const tick = () => {
      // Smooth lerp for buttery movement
      currMouseX += (globalMouseX - currMouseX) * 0.06;
      currMouseY += (globalMouseY - currMouseY) * 0.06;
      spotX += (globalMouseX - spotX) * 0.12;
      spotY += (globalMouseY - spotY) * 0.12;

      // Normalize to -1..1
      const normX = (currMouseX / window.innerWidth - 0.5) * 2;
      const normY = (currMouseY / window.innerHeight - 0.5) * 2;

      // Background image moves OPPOSITE to cursor (depth illusion)
      gsap.set(heroBg, {
        x: normX * -35,
        y: normY * -35,
        rotationY: normX * 4,
        rotationX: normY * -4,
      });

      // Text moves WITH cursor
      gsap.set(heroText, {
        x: normX * 30,
        y: normY * 30,
        rotationY: normX * 5,
        rotationX: normY * -5,
      });

      // Multi-layer warm 3D extrusion (sunset-deep → ink)
      const shadowMax = 60;
      const shX = normX * -shadowMax;
      const shY = normY * -shadowMax;
      const layers = 40;
      let shadowStr = "";
      for (let i = 1; i <= layers; i++) {
        const factor = i / layers;
        // Interpolate from sunset-deep (#b3502d → r:179,g:80,b:45) to ink (#3e2a1e → r:62,g:42,b:30)
        const r = Math.round(179 + (62 - 179) * factor);
        const g = Math.round(80 + (42 - 80) * factor);
        const b = Math.round(45 + (30 - 45) * factor);
        shadowStr += `${shX * factor}px ${shY * factor}px 0 rgba(${r},${g},${b},1)`;
        if (i < layers) shadowStr += ", ";
      }
      heroText.style.textShadow = shadowStr;

      // Bottom labels inverse parallax
      if (bottomLeft) gsap.set(bottomLeft, { x: normX * 16, y: normY * 20 });
      if (bottomRight) gsap.set(bottomRight, { x: normX * -16, y: normY * -20 });
      if (spotlight) {
        spotlight.style.background = `radial-gradient(circle 340px at ${spotX}px ${spotY}px, rgba(232,98,44,0.14), rgba(217,164,65,0.05) 40%, transparent 62%)`;
      }
    };

    window.addEventListener("pointermove", onMouseMove);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("pointermove", onMouseMove);
      gsap.ticker.remove(tick);

      // Reset transforms on cleanup
      if (heroBg) gsap.set(heroBg, { clearProps: "all" });
      if (heroText) {
        gsap.set(heroText, { clearProps: "all" });
        heroText.style.textShadow = "";
      }
      if (bottomLeft) gsap.set(bottomLeft, { clearProps: "all" });
      if (bottomRight) gsap.set(bottomRight, { clearProps: "all" });
    };
  }, [reducedMotion]);

  return (
    <section
      id="home"
      ref={scope}
      className="relative flex h-screen min-h-[700px] w-full flex-col justify-between overflow-hidden bg-black pt-28 pb-8 text-cream"
      style={{ perspective: "1200px" }}
    >
      {/* Background silhouette (parallax) */}
      <div
        ref={heroBgRef}
        className="pointer-events-none absolute inset-0 will-change-transform select-none"
        style={{ transform: "scale(1.05)" }}
      >
        <img
          src="/images/silhouette-glow.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-90"
          style={{ objectPosition: "center 30%", transform: "scale(1.25)" }}
        />
        {/* warm vignette so the dark photo reads as lamp-lit, not muddy */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 40%, transparent 30%, rgba(20,13,7,0.55) 80%)" }} />
      </div>

      {/* Interactive neural-net overlay */}
      <NeuralNetwork />

      {/* Warm spotlight that follows the cursor */}
      <div ref={spotlightRef} className="pointer-events-none absolute inset-0 z-[6] mix-blend-screen" />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-between px-6 py-4 sm:px-12 sm:py-6 md:px-16 lg:px-20 w-full h-full">
        {/* Top row: sticky note (left) + eyebrow & clock (right) */}
        <div className="flex items-start justify-between">
          <div data-anim="hero-in">
            <DraggableSticker id="hero_quote_v4" initialRotate={-4} className="top-2 left-6 sm:top-4 sm:left-12 md:left-16 lg:left-20 w-64 sm:w-80 z-20">
              <div className="sticky-note p-5 sm:p-6 text-base sm:text-lg leading-snug cursor-grab">
                {heroCopy.quote.split("\n").map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </div>
            </DraggableSticker>
          </div>

          <div data-anim="hero-in" className="flex flex-col items-end gap-3">
            <DraggableSticker id="hero_eyebrow_v4" initialRotate={6} className="top-2 right-6 sm:top-4 sm:right-12 md:right-16 lg:right-20 z-20">
              <div className="tag-chip cursor-grab text-sm sm:text-base px-5 py-2.5">
                {heroCopy.eyebrow}
              </div>
            </DraggableSticker>
          </div>
        </div>

        {/* Live IST clock chip — floats clear of the eyebrow */}
        <div data-anim="hero-in" className="absolute right-6 top-[16%] z-20 hidden items-center gap-2 rounded-full border border-cream/20 bg-ink/60 px-4 py-2 backdrop-blur-sm sm:right-12 md:right-16 lg:right-20 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="font-display text-xs uppercase tracking-widest text-cream/70">
            {ist} in Jamshedpur
          </span>
        </div>

        {/* Floating extra stickers to fill the space */}
        <div data-anim="hero-in" className="pointer-events-none absolute inset-0 z-[8]">
          <DraggableSticker id="hero_overthinker_v1" initialRotate={-7} className="top-[30%] right-[10%] hidden lg:block pointer-events-auto">
            <div className="rounded-full bg-sunset px-4 py-2 font-display text-xs uppercase tracking-widest text-ink shadow-[0_6px_14px_rgba(0,0,0,0.4)] cursor-grab">
              Certified Overthinker
            </div>
          </DraggableSticker>

          <DraggableSticker id="hero_railcross_v1" initialRotate={5} className="top-[54%] right-[16%] hidden lg:block pointer-events-auto">
            <div className="rounded-lg border-2 border-cream/40 bg-ink/70 px-4 py-3 backdrop-blur-sm cursor-grab">
              <svg width="88" height="40" viewBox="0 0 130 60" fill="none">
                <rect x="8" y="14" width="52" height="30" rx="6" stroke="#f5ead8" strokeWidth="2.5" />
                <rect x="60" y="22" width="44" height="22" rx="4" stroke="#f5ead8" strokeWidth="2.5" />
                <circle cx="24" cy="52" r="6" stroke="#f5ead8" strokeWidth="2.5" />
                <circle cx="48" cy="52" r="6" stroke="#f5ead8" strokeWidth="2.5" />
                <circle cx="78" cy="52" r="6" stroke="#f5ead8" strokeWidth="2.5" />
                <path d="M104 44h16M2 52h6" stroke="#e8622c" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <p className="mt-1 font-hand text-xs text-cream/70">RailCross · flagship</p>
            </div>
          </DraggableSticker>
        </div>

        {/* Center: name with gold outline */}
        <div className="flex flex-1 items-center justify-center mt-16 sm:mt-24 mb-4" style={{ perspective: "1200px" }}>
          <h1
            ref={heroTextRef}
            data-anim="hero-name"
            className="font-script relative text-[6.5rem] leading-none sm:text-[12rem] md:text-[15rem] lg:text-[17rem] select-none will-change-transform"
            style={{ transformStyle: "preserve-3d" }}
          >
            <span ref={nameClipRef} className="relative block">
              {/* warm outline behind */}
              <span
                className="absolute inset-0 text-transparent pointer-events-none"
                style={{ WebkitTextStroke: "clamp(12px, 2.6vw, 24px) #8a6f4e" }}
                aria-hidden="true"
              >
                Adarsh
              </span>
              <span className="relative text-[#f2ebd9] pointer-events-none">Adarsh</span>
            </span>
          </h1>
        </div>

        {/* Bottom row: spec card (left) + tagline (right) */}
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end w-full">
          {/* Field-profile spec card */}
          <div ref={bottomLeftRef} data-anim="hero-in" className="will-change-transform">
            <div className="w-fit rounded-lg border border-cream/20 bg-ink/50 px-5 py-4 backdrop-blur-sm">
              <p className="mb-3 flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.25em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Field Profile
              </p>
              <dl className="space-y-2 font-display text-sm sm:text-base">
                <SpecRow k="Role" v="ML / AI Engineer (in training)" />
                <div className="flex gap-4">
                  <dt className="w-14 shrink-0 text-xs uppercase tracking-wider text-cream/45">Now</dt>
                  <dd className="font-hand text-base"><RotatingRole /></dd>
                </div>
                <SpecRow k="Base" v="NIT Jamshedpur · Jharkhand" />
                <SpecRow k="Drive" v="Solving complex problems, honestly" />
              </dl>
            </div>
          </div>

          {/* Tagline + scroll cue */}
          <div ref={bottomRightRef} data-anim="hero-in" className="flex flex-col items-start gap-4 sm:items-end sm:text-right will-change-transform">
            <p className="font-hand max-w-md text-2xl sm:text-3xl md:text-4xl leading-tight">
              {heroCopy.tagline}
            </p>
            <div className="flex items-center gap-3">
              <TrendingUp className="text-accent" size={30} />
              <span className="text-sm uppercase tracking-widest text-cream/60 font-bold font-sans">
                Scroll down
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SpecRow({ k, v }) {
  return (
    <div className="flex gap-4">
      <dt className="w-14 shrink-0 text-xs uppercase tracking-wider text-cream/45">{k}</dt>
      <dd className="font-semibold text-cream">{v}</dd>
    </div>
  );
}
