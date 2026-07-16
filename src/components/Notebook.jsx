import { useMemo, useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapAnimation } from "../hooks/useGsapAnimation";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const PEN = "#3550b2";           // ballpoint blue (journey line)
const PAPER = "#f2e9d3";
const RUST = "#b3502d";
const TEAL = "#2e6e65";

// Ambient ember particles floating around the notebook (deterministic layout)
const FIREFLIES = [
  { left: "6%", top: "22%", size: 5, dur: "7s", delay: "0s", color: "#e8622c" },
  { left: "11%", top: "64%", size: 4, dur: "9s", delay: "1.2s", color: "#d9a441" },
  { left: "17%", top: "38%", size: 3, dur: "6s", delay: "2.4s", color: "#f5ead8" },
  { left: "8%", top: "84%", size: 4, dur: "8s", delay: "0.6s", color: "#e8622c" },
  { left: "23%", top: "12%", size: 3, dur: "10s", delay: "3s", color: "#d9a441" },
  { left: "78%", top: "18%", size: 4, dur: "7.5s", delay: "1.8s", color: "#e8622c" },
  { left: "88%", top: "42%", size: 5, dur: "8.5s", delay: "0.3s", color: "#d9a441" },
  { left: "93%", top: "70%", size: 3, dur: "6.5s", delay: "2s", color: "#f5ead8" },
  { left: "83%", top: "88%", size: 4, dur: "9.5s", delay: "1s", color: "#e8622c" },
  { left: "70%", top: "8%", size: 3, dur: "7s", delay: "3.6s", color: "#f5ead8" },
  { left: "94%", top: "10%", size: 4, dur: "8s", delay: "0.9s", color: "#d9a441" },
  { left: "4%", top: "48%", size: 3, dur: "9s", delay: "2.7s", color: "#f5ead8" },
];

const TRAIL_COUNT = 8;

// Lamp-light spotlight: bright reading circle, warm rim, dark dusk outside
const spotlight = (x, y) =>
  `radial-gradient(circle 460px at ${x}px ${y}px, transparent 34%, rgba(232,98,44,0.05) 48%, rgba(26,17,9,0.62) 68%, rgba(20,13,7,0.92) 82%)`;
import { useMediaQuery } from "../hooks/useMediaQuery";
import NeuralNetwork from "./NeuralNetwork";
import { soundManager } from "../config/soundManager";

gsap.registerPlugin(ScrollTrigger);

// Curved dotted line path for the journey (from 2000x2470 canvas)
const JOURNEY_PATH =
  "M350 232 C 200 333, 550 406, 400 507 C 250 608, 600 681, 420 782 " +
  "C 260 869, 580 956, 400 1043 C 240 1130, 560 1195, 400 1260 " +
  "C 700 1289, 900 1122, 1000 869 C 1100 616, 1300 362, 1650 246 " +
  "C 1850 333, 1500 406, 1650 507 C 1820 608, 1480 695, 1650 782 " +
  "C 1830 869, 1700 1122, 1650 1376 C 1800 1550, 1200 1650, 820 1750 " +
  "C 440 1850, 820 2150, 820 2420";

// N4: chapter tabs — each maps to a pen-progress (0..1) along the journey path.
// Timeline: journey tween runs at position 33 for 52 units; total tl = 126.
const CHAPTER_STOPS = [
  { p: 0.03, label: "Origin", n: "1" },
  { p: 0.22, label: "About Me", n: "2" },
  { p: 0.42, label: "The Question", n: "3" },
  { p: 0.64, label: "RailCross", n: "4" },
  { p: 0.83, label: "Milestones", n: "5" },
];
const TL_JOURNEY_START = 33;
const TL_JOURNEY_DUR = 52;
const TL_TOTAL = 126;

// Convert a pen-progress to an absolute page scroll position for #about.
function stopScrollTarget(p) {
  const el = document.getElementById("about");
  if (!el) return 0;
  const range = el.offsetHeight - window.innerHeight;
  const tlFrac = (TL_JOURNEY_START + p * TL_JOURNEY_DUR) / TL_TOTAL;
  return el.offsetTop + tlFrac * range;
}

export default function Notebook() {
  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const animated = isDesktop && !reducedMotion;

  return (
    <section id="about">
      {animated ? <AnimatedNotebook /> : <StaticNotebook />}
    </section>
  );
}

function AnimatedNotebook() {
  const [dimensions, setDimensions] = useState({ w: 1200, h: 800 });
  // Live camera transform, updated each frame by the GSAP onUpdate so the
  // UV-lamp (N5) can map the mouse from screen space into spread space.
  const camRef = useRef({ tx: 0, ty: 0, scale: 1 });

  // Keep track of window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // N5: cursor UV lamp — reveal the hidden-ink layer through a soft circle
  // that follows the mouse (converted into spread coordinates).
  useEffect(() => {
    const uv = document.querySelector("[data-nb='uv']");
    if (!uv) return;
    let uvFound = false;
    const onMove = (e) => {
      const { tx, ty, scale } = camRef.current;
      if (!scale) return;
      const sx = (e.clientX - tx) / scale;
      const sy = (e.clientY - ty) / scale;
      uv.style.setProperty("--ux", `${sx}px`);
      uv.style.setProperty("--uy", `${sy}px`);
      // Count the UV quest once the lamp is actually over the page while reading.
      if (!uvFound && scale > 0.9 && sx > 0 && sx < 2000 && sy > 0 && sy < 2470) {
        uvFound = true;
        window.dispatchEvent(new CustomEvent("quest", { detail: "uv" }));
      }
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const scope = useGsapAnimation((scope) => {
    const root = scope.current;
    if (!root) return;

    const cover = root.querySelector("[data-nb='cover']");
    const spread = root.querySelector("[data-nb='spread']");
    const spreadWrap = root.querySelector("[data-nb='spread-wrap']");
    const overlay = root.querySelector("[data-nb='overlay']");
    const path = root.querySelector("[data-nb='line']");
    const dot = root.querySelector("[data-nb='dot']");
    const hint = root.querySelector("[data-nb='hint']");
    const pagesContent = root.querySelector("[data-nb='pages-content']");
    const hud = root.querySelector("[data-nb='hud']");
    const hudFill = root.querySelector("[data-nb='hud-fill']");
    const trails = root.querySelectorAll("[data-nb='trail']");

    // Visual-upgrade elements (all optional — guarded individually below)
    const shadow = root.querySelector("[data-nb='shadow']");
    const ink = root.querySelector("[data-nb='ink']");
    const stamp = root.querySelector("[data-nb='stamp']");
    const sparks = root.querySelectorAll("[data-nb='spark']");

    // Living-doodle elements (N3) — wake up as the pen passes their zone
    const dlCompass = root.querySelector("[data-nb='dl-compass']");
    const dlTrain = root.querySelector("[data-nb='dl-train']");
    const dlSteam = root.querySelector("[data-nb='dl-steam']");
    const dlPulse = root.querySelector("[data-nb='dl-pulse']");
    const dlTw = root.querySelectorAll("[data-nb='dl-tw']");

    // N4: chapter tabs rail + progress ribbon
    const tabsEl = root.querySelector("[data-nb='tabs']");
    const tabEls = root.querySelectorAll("[data-nb='tab']");
    const ribbonFill = root.querySelector("[data-nb='ribbon-fill']");

    // N2: the fountain pen that follows the journey path
    const pen = root.querySelector("[data-nb='pen']");

    // Signature finale elements (optional — guarded individually below)
    const sig = root.querySelector("[data-nb='sig']");
    const sigText = root.querySelector("[data-nb='sig-text']");
    const sigNib = root.querySelector("[data-nb='sig-nib']");
    const sigUnderline = root.querySelector("[data-nb='sig-underline']");
    const sigKicker = root.querySelector("[data-nb='sig-kicker']");
    const sigSub = root.querySelector("[data-nb='sig-sub']");
    const sigPlane = root.querySelector("[data-nb='plane']");
    let underlineLen = 0;

    if (!cover || !spread || !spreadWrap || !overlay || !path || !dot || !pagesContent) return;

    const pathLength = path.getTotalLength();
    gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
    gsap.set(dot, { opacity: 0 });
    gsap.set(pagesContent, { opacity: 0 });
    gsap.set(hud, { autoAlpha: 0 });
    if (ink) gsap.set(ink, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
    if (stamp) gsap.set(stamp, { opacity: 0 });

    const W = window.innerWidth;
    const H = window.innerHeight;

    // Fit single closed cover page (1000 x 2470) to screen height
    const S_closed = (H * 0.85) / 2470;
    // Fit full opened spread (2000 x 2470) to screen width/height
    const S_open = Math.min((W * 0.85) / 2000, (H * 0.85) / 2470);
    // Zoomed in reading scale
    const ZOOM_SCALE = Math.max(1.1, W / 1100);

    const animState = {
      progress: 0,
      scale: S_closed,
      cx: 1500, // closed cover page center x
      cy: 1235, // closed cover page center y
      xOffset: 1.0, // 1.0 = off-screen right
      overlayOpacity: 0,
      closing: 0,
      rot: 0,
      coverAngle: 0,
      sigShow: 0,   // finale layer fade-in
      sig: 0,       // name write-on progress (0→1)
      sigSub: 0,    // subtitle fade-in
      sigLine: 0,   // underline flourish draw
      stamp: 0      // rubber-stamp slam at journey's end
    };

    // Main timeline linked to scroll scrub
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.6,
        invalidateOnRefresh: true
      }
    });

    // ── Phase 1: Slide-In from Right (0–12) ──────────────────────────────
    // Start off-screen right
    tl.set(spreadWrap, {
      x: W / 2 - 1500 * S_closed + W,
      y: H / 2 - 1235 * S_closed,
      scale: S_closed
    }, 0);

    tl.set(animState, { rot: 4 }, 0);
    tl.to(animState, {
      xOffset: 0,
      duration: 12,
      ease: "back.out(1.2)"
    }, 0);
    // The book glides in slightly tilted, then settles flat on the desk.
    tl.to(animState, { rot: 0, duration: 14, ease: "power2.out" }, 0);

    // ── Phase 2: Cover rotates open & zoom out (12–25) ────────────────────
    tl.to(animState, { coverAngle: -170, duration: 13, ease: "power1.inOut" }, 12)
      .to(cover, { autoAlpha: 0, duration: 3 }, 22)
      .to(hint, { autoAlpha: 0, duration: 4 }, 2)
      .to(pagesContent, { opacity: 1, duration: 13, ease: "power1.inOut" }, 12);
    tl.to(hud, { autoAlpha: 1, duration: 4 }, 21);

    tl.to(animState, {
      cx: 1000,
      cy: 1235,
      scale: S_open,
      duration: 13,
      ease: "power1.inOut"
    }, 12);

    // ── N1: Pop-up diorama — as the cover opens, the stop cards rise off the
    // page and stand up, staggered, like a paper pop-up book. gsap `from`
    // preserves each card's existing rotation (it reads the current matrix). ──
    const popCards = root.querySelectorAll("[data-nb-pop]");
    if (popCards.length) {
      tl.from(
        popCards,
        {
          y: 130,
          scale: 0.82,
          opacity: 0,
          transformOrigin: "bottom center",
          duration: 9,
          ease: "back.out(1.7)",
          stagger: 1.1
        },
        20
      );
    }

    // ── Phase 3: Zoom in to Stop 1 (25–33) ────────────────────────────────
    tl.to(animState, {
      cx: 350,
      cy: 232,
      scale: ZOOM_SCALE,
      overlayOpacity: 1,
      duration: 8,
      ease: "power2.inOut"
    }, 25);
    tl.to(dot, { opacity: 1, duration: 4 }, 28);

    // ── Phase 4: Follow the journey path (33–85) ──────────────────────────
    tl.to(animState, {
      progress: 1.0,
      duration: 52,
      ease: "none"
    }, 33);
    // Draw the path as the dot travels
    tl.to(path, { strokeDashoffset: 0, duration: 52, ease: "none" }, 33);
    // Solid glowing ink laid down over the pencil dots
    if (ink) tl.to(ink, { strokeDashoffset: 0, duration: 52, ease: "none" }, 33);
    // Gentle handheld-camera sway while following the pen
    tl.to(animState, { rot: 1.3, duration: 16, ease: "sine.inOut" }, 35)
      .to(animState, { rot: -1.1, duration: 16, ease: "sine.inOut" }, 51)
      .to(animState, { rot: 0, duration: 14, ease: "sine.inOut" }, 67);
    // Rubber stamp slams down as the journey completes
    tl.to(animState, { stamp: 1, duration: 5, ease: "power4.out" }, 83);

    // ── Phase 5: Zoom back out to show full spread (85–90) ───────────────
    tl.to(animState, {
      cx: 1000,
      cy: 1235,
      scale: S_open,
      overlayOpacity: 0.25,
      duration: 5,
      ease: "power2.inOut"
    }, 85);
    tl.to(dot, { opacity: 0, duration: 3 }, 85);
    tl.to(hud, { autoAlpha: 0, duration: 4 }, 87);

    // ── Phase 6: Slide-Out to Left (90–100) ────────────────────────────────
    tl.to(animState, {
      xOffset: -1.0,
      duration: 10,
      ease: "power2.in"
    }, 90);
    tl.to(pagesContent, { opacity: 0, duration: 8 }, 92);

    // ── Phase 7: The book closes — shrinks, tips, and drops away (96–106) ──
    tl.to(animState, { closing: 1, duration: 10, ease: "power2.in" }, 96);

    // ── Phase 8: Signature finale (106–144) ──────────────────────────────
    // The book is gone; the same pen that traced the journey now signs the
    // name. This is the reference site's hallmark "line becomes the name".
    if (sigUnderline) {
      underlineLen = sigUnderline.getTotalLength();
      gsap.set(sigUnderline, { strokeDasharray: underlineLen, strokeDashoffset: underlineLen });
    }
    tl.to(animState, { sigShow: 1, duration: 3, ease: "power1.out" }, 106);
    tl.to(animState, { sig: 1, duration: 14, ease: "power1.inOut" }, 108);
    tl.to(animState, { sigSub: 1, duration: 4, ease: "power1.out" }, 120);
    tl.to(animState, { sigLine: 1, duration: 5, ease: "power2.inOut" }, 121);

    // Fire-once sound flags (reset when scrubbing back the other way)
    const sfx = { opened: false, penned: false, signed: false, stamped: false };

    // ── N3: Living doodles — micro-scenes that fire once as the pen passes,
    // and reset when the user scrubs back so they can replay. ──
    const doodleTriggers = [
      {
        at: 0.10,
        done: false,
        play: () => dlCompass && gsap.fromTo(dlCompass, { rotation: 0 }, { rotation: 340, duration: 1.5, ease: "back.out(2)", overwrite: true }),
        reset: () => dlCompass && gsap.set(dlCompass, { rotation: 0 })
      },
      {
        at: 0.30,
        done: false,
        play: () => dlPulse && gsap.fromTo(dlPulse, { opacity: 1, strokeDashoffset: 220 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", overwrite: true }),
        reset: () => dlPulse && gsap.set(dlPulse, { strokeDashoffset: 220 })
      },
      {
        at: 0.52,
        done: false,
        play: () => dlTrain && gsap.fromTo(dlTrain, { x: 0 }, { x: 300, duration: 1.9, ease: "power1.inOut", overwrite: true }),
        reset: () => dlTrain && gsap.set(dlTrain, { x: 0 })
      },
      {
        at: 0.72,
        done: false,
        play: () => dlSteam && gsap.fromTo(dlSteam, { opacity: 0, y: 12 }, { opacity: 1, y: -6, duration: 1.3, ease: "sine.out", overwrite: true }),
        reset: () => dlSteam && gsap.set(dlSteam, { opacity: 0, y: 12 })
      },
      {
        at: 0.90,
        done: false,
        play: () => dlTw.length && gsap.fromTo(dlTw, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.16, ease: "back.out(3)", overwrite: true }),
        reset: () => dlTw.length && gsap.set(dlTw, { opacity: 0, scale: 0.3 })
      }
    ];

    // Timeline update callback to handle tracking and spotlight calculations
    tl.eventCallback("onUpdate", () => {
      let px = animState.cx;
      let py = animState.cy;

      // Page-turn when the cover swings open; pen-scratch as the signature starts
      if (!sfx.opened && animState.coverAngle < -90) {
        sfx.opened = true;
        soundManager.playPaper();
        window.dispatchEvent(new CustomEvent("quest", { detail: "open" }));
      } else if (sfx.opened && animState.coverAngle > -30) {
        sfx.opened = false;
      }
      if (!sfx.penned && animState.progress > 0.02 && animState.progress < 0.9) {
        sfx.penned = true;
        soundManager.playPen();
      } else if (sfx.penned && animState.progress < 0.01) {
        sfx.penned = false;
      }

      // Update cover rotation via coverAngle
      gsap.set(cover, { rotationY: animState.coverAngle });

      // Journey progress HUD
      if (hudFill) hudFill.style.width = `${(tl.progress() * 100).toFixed(1)}%`;

      if (animState.progress > 0) {
        const point = path.getPointAtLength(animState.progress * pathLength);
        px = point.x;
        py = point.y;

        overlay.style.background = spotlight(px, py);
        dot.setAttribute("cx", px);
        dot.setAttribute("cy", py);

        // N2: the pen rides the nib point with a natural writing lean + a
        // subtle wobble, and dips slightly as it "presses" into curves.
        if (pen) {
          const wobble = Math.sin(animState.progress * 46) * 4;
          pen.setAttribute(
            "transform",
            `translate(${px} ${py}) rotate(${30 + wobble}) scale(2.3)`
          );
          pen.style.opacity = String(gsap.getProperty(dot, "opacity"));
        }

        // Comet trail: sample points slightly behind the dot along the path
        trails.forEach((c, i) => {
          const behind = Math.max(0, animState.progress - (i + 1) * 0.011);
          const pt = path.getPointAtLength(behind * pathLength);
          c.setAttribute("cx", pt.x);
          c.setAttribute("cy", pt.y);
          c.style.opacity =
            animState.progress > 0.004 ? 0.5 * (1 - (i + 1) / (TRAIL_COUNT + 1)) : 0;
        });
      } else {
        overlay.style.background = spotlight(px, py);
        trails.forEach((c) => { c.style.opacity = 0; });
        if (pen) pen.style.opacity = "0";
      }

      overlay.style.opacity = animState.overlayOpacity;

      // Soft lerp camera centering with responsive horizontal slide offset
      const tx = window.innerWidth / 2 - px * animState.scale + animState.xOffset * window.innerWidth;
      const ty = window.innerHeight / 2 - py * animState.scale;

      // Publish camera transform for the UV lamp (N5).
      camRef.current.tx = tx;
      camRef.current.ty = ty;
      camRef.current.scale = animState.scale;

      // Closing send-off: the whole spread shrinks, tips, drops and fades,
      // handing the viewport off to the next section.
      const c = animState.closing;
      const extraScale = 1 - 0.6 * c;
      const dropY = c * H * 0.85;
      const spin = animState.rot + c * 8;
      const fade = c > 0.55 ? Math.max(0, 1 - (c - 0.55) / 0.45) : 1;

      gsap.set(spreadWrap, {
        x: tx,
        y: ty + dropY,
        rotation: spin,
        scale: animState.scale * extraScale,
        opacity: fade
      });

      // Desk shadow: narrow under the closed book, widens as the cover opens,
      // fades away as the book drops out.
      if (shadow) {
        const openT = Math.min(1, Math.abs(animState.coverAngle) / 170);
        shadow.style.left = `${1020 - 960 * openT}px`;
        shadow.style.width = `${920 + 960 * openT}px`;
        shadow.style.opacity = String(0.85 * (1 - animState.closing));
      }

      // Rubber stamp: slams from above (large→settled) with a thud.
      if (stamp) {
        const st = Math.min(1, animState.stamp);
        stamp.style.opacity = String(Math.min(1, st * 1.4) * 0.92);
        stamp.style.transform = `rotate(-12deg) scale(${2.6 - 1.6 * st})`;
      }
      if (!sfx.stamped && animState.stamp > 0.55) {
        sfx.stamped = true;
        soundManager.playClick();
      } else if (sfx.stamped && animState.stamp < 0.05) {
        sfx.stamped = false;
      }

      // ── Signature finale rendering ──
      // A fresh pen-scratch as the signing begins.
      if (!sfx.signed && animState.sig > 0.02 && animState.sig < 0.9) {
        sfx.signed = true;
        soundManager.playPen();
      } else if (sfx.signed && animState.sig < 0.01) {
        sfx.signed = false;
      }

      if (sig) sig.style.opacity = animState.sigShow;
      if (sigKicker) sigKicker.style.opacity = animState.sigShow;
      if (sigText) {
        const s = animState.sig;
        // Reveal the name left→right, as if being written.
        sigText.style.clipPath = `inset(0 ${(1 - s) * 100}% -20% 0)`;
        if (sigNib) {
          const w = sigText.getBoundingClientRect().width;
          sigNib.style.transform = `translate(${s * w}px, -50%)`;
          sigNib.style.opacity = animState.sigShow * (s > 0.004 && s < 0.985 ? 1 : 0);
        }
      }
      if (sigUnderline && underlineLen) {
        sigUnderline.style.strokeDashoffset = String((1 - animState.sigLine) * underlineLen);
      }
      if (sigSub) sigSub.style.opacity = animState.sigSub;

      // Exit: once the signature is drawn, the page tears off and flies away
      // as a paper plane — the same plane the contact form later sends.
      if (sigPlane) {
        const f = Math.max(0, (animState.sigLine - 0.6) / 0.4);
        sigPlane.style.opacity = String(animState.sigShow * (f > 0.02 && f < 0.98 ? 1 : 0));
        sigPlane.style.transform = `translate(${f * 62}vw, ${-f * 46}vh) rotate(${f * 28}deg) scale(${1 - f * 0.35})`;
      }

      // Sparkles pop around the finished signature.
      if (sparks.length) {
        const t = Math.max(0, (animState.sigLine - 0.35) / 0.65);
        sparks.forEach((el, i) => {
          el.style.opacity = String(t * animState.sigShow);
          el.style.transform = `scale(${0.4 + 0.6 * t}) rotate(${t * 60 + i * 45}deg)`;
        });
      }

      // N3: fire / reset living-doodle micro-scenes as the pen passes.
      doodleTriggers.forEach((t) => {
        if (!t.done && animState.progress >= t.at) {
          t.done = true;
          t.play();
        } else if (t.done && animState.progress < t.at - 0.06) {
          t.done = false;
          t.reset();
        }
      });

      // N4: chapter tabs — visible while reading (book open, not closing/signing),
      // with the nearest stop highlighted; progress ribbon fills with the journey.
      if (tabsEl) {
        const reading =
          animState.coverAngle < -70 && animState.closing < 0.2 && animState.sigShow < 0.1;
        tabsEl.style.opacity = reading ? "1" : "0";
        tabsEl.style.pointerEvents = reading ? "auto" : "none";
      }
      if (tabEls.length) {
        let nearest = 0;
        let best = 1;
        CHAPTER_STOPS.forEach((s, i) => {
          const d = Math.abs(animState.progress - s.p);
          if (d < best) { best = d; nearest = i; }
        });
        tabEls.forEach((el, i) => {
          el.dataset.active = i === nearest && animState.progress > 0.001 ? "1" : "0";
        });
      }
      if (ribbonFill) ribbonFill.style.height = `${Math.min(100, Math.max(0, animState.progress * 100))}%`;
    });

  }, [dimensions]);

  return (
    <div ref={scope} className="relative h-[1150vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-black px-6">
        <NeuralNetwork />

        {/* Warm lamp glow behind the closed book — sets the 2 AM desk mood */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 62% 58% at 50% 46%, rgba(232,98,44,0.10), rgba(217,164,65,0.05) 40%, transparent 72%)"
          }}
        />

        {/* Ambient floating embers around the notebook */}
        <div className="pointer-events-none absolute inset-0 z-[5]">
          {FIREFLIES.map((f, i) => (
            <span
              key={i}
              className="nb-firefly"
              style={{
                left: f.left,
                top: f.top,
                width: `${f.size}px`,
                height: `${f.size}px`,
                background: f.color,
                boxShadow: `0 0 ${f.size * 3}px ${f.size}px ${f.color}33`,
                "--dur": f.dur,
                "--delay": f.delay
              }}
            />
          ))}
        </div>

        <p
          data-nb="hint"
          className="pointer-events-none absolute top-[22%] z-25 font-hand text-2xl text-cream/70 tracking-wider text-center"
        >
          keep scrolling — it opens.
          <span className="nb-hint-arrow mt-2 block text-3xl text-sunset">↓</span>
        </p>

        {/* Journey progress HUD */}
        <div
          data-nb="hud"
          className="pointer-events-none absolute bottom-8 left-1/2 z-30 -translate-x-1/2 text-center"
        >
          <p className="font-hand text-sm text-cream/50 m-0 mb-2">the journey so far</p>
          <div className="h-[3px] w-44 overflow-hidden rounded-full bg-cream/15">
            <div
              data-nb="hud-fill"
              className="h-full w-0 rounded-full"
              style={{ background: "linear-gradient(90deg, #e8622c, #d9a441)" }}
            />
          </div>
        </div>

        {/* ── N4: Chapter tabs (click to jump) + vertical progress ribbon ── */}
        <div
          data-nb="tabs"
          className="absolute right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-end gap-2"
          style={{ opacity: 0, transition: "opacity 0.4s ease" }}
        >
          {CHAPTER_STOPS.map((s, i) => (
            <button
              key={i}
              data-nb="tab"
              data-active="0"
              onClick={() =>
                window.__lenis
                  ? window.__lenis.scrollTo(stopScrollTarget(s.p), { duration: 1.4 })
                  : window.scrollTo({ top: stopScrollTarget(s.p), behavior: "smooth" })
              }
              className="nb-tab group flex items-center gap-2"
              aria-label={`Jump to ${s.label}`}
            >
              <span className="nb-tab-label">{s.label}</span>
              <span className="nb-tab-chip">{s.n}</span>
            </button>
          ))}
        </div>

        {/* vertical bookmark-ribbon progress on the far right edge */}
        <div
          data-nb="ribbon"
          className="pointer-events-none absolute right-0 top-0 z-20 h-full w-[6px] bg-cream/5"
        >
          <div
            data-nb="ribbon-fill"
            className="w-full"
            style={{ height: "0%", background: "linear-gradient(180deg, #e8622c, #d9a441)", boxShadow: "0 0 10px rgba(232,98,44,0.6)" }}
          />
        </div>

        {/* ── Signature finale: after the book drops, the pen signs off ── */}
        <div
          data-nb="sig"
          className="pointer-events-none absolute inset-0 z-[26] flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: 0 }}
        >
          <p
            data-nb="sig-kicker"
            className="font-hand text-base text-cream/45 mb-4 sm:text-lg"
            style={{ opacity: 0 }}
          >
            the field notes — signed,
          </p>
          <div className="relative inline-block">
            {[
              { top: "-26px", left: "-44px" },
              { top: "-34px", right: "-48px" },
              { bottom: "-10px", left: "-52px" },
              { bottom: "-18px", right: "-36px" },
            ].map((pos, i) => (
              <span
                key={i}
                data-nb="spark"
                className="absolute select-none"
                style={{
                  ...pos,
                  fontSize: "30px",
                  color: "var(--color-accent)",
                  textShadow: "0 0 12px rgba(217,164,65,0.8)",
                  opacity: 0
                }}
              >
                ✦
              </span>
            ))}
            <h2
              data-nb="sig-text"
              className="font-script leading-none text-cream"
              style={{
                fontSize: "clamp(3rem, 9vw, 8rem)",
                margin: 0,
                clipPath: "inset(0 100% -20% 0)",
                textShadow: "0 0 30px rgba(232,98,44,0.35)"
              }}
            >
              Adarsh Sahu
            </h2>
            <span
              data-nb="sig-nib"
              className="absolute left-0 top-1/2"
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "9999px",
                background: "var(--color-sunset)",
                boxShadow: "0 0 16px 5px rgba(232,98,44,0.8)",
                transform: "translate(0, -50%)",
                opacity: 0
              }}
            />
          </div>
          <svg
            width="360"
            height="30"
            viewBox="0 0 360 30"
            fill="none"
            className="mt-3"
            style={{ maxWidth: "70vw" }}
          >
            <path
              data-nb="sig-underline"
              d="M6 16 C 70 6, 150 26, 210 14 C 260 5, 320 22, 354 11"
              stroke="var(--color-accent)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <p
            data-nb="sig-sub"
            className="font-hand mt-8 text-cream/55"
            style={{ opacity: 0 }}
          >
            to be continued…
          </p>

          {/* the page tears off and flies away as a paper plane (→ contact) */}
          <svg
            data-nb="plane"
            width="70"
            height="70"
            viewBox="0 0 70 70"
            fill="none"
            className="absolute"
            style={{ opacity: 0, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.4))" }}
          >
            <path d="M4 34 L66 6 L40 66 L32 42 Z" fill="#f5ead8" stroke="#d9a441" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M32 42 L66 6" stroke="#d9a441" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Perspectival viewport container */}
        <div className="relative z-10 w-full h-full" style={{ perspective: "1800px" }}>

          {/* Main camera scaled / panned wrapper */}
          <div data-nb="spread-wrap" className="absolute top-0 left-0 origin-top-left will-change-transform">

            {/* Soft desk shadow that grounds the book (width driven in JS
                as the cover opens: narrow closed book → full open spread) */}
            <div
              data-nb="shadow"
              style={{
                position: "absolute",
                top: "2390px",
                left: "1020px",
                width: "920px",
                height: "240px",
                background:
                  "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.65), transparent 70%)",
                filter: "blur(34px)",
                pointerEvents: "none"
              }}
            />

            {/* The 2D Spread Canvas (2000 x 2470) */}
            <div
              data-nb="spread"
              className="relative rounded-lg"
              style={{
                width: "2000px",
                height: "2470px",
                background: "transparent",
                fontFamily: "'DM Sans', sans-serif",
                overflow: "hidden"
              }}
            >
              {/* Inner pages content (fades in as cover opens) */}
              <div
                data-nb="pages-content"
                className="absolute inset-0 rounded-lg shadow-[0_30px_80px_rgba(62,42,30,0.35)]"
                style={{
                  background: "#14100c",
                  width: "100%",
                  height: "100%"
                }}
              >
                {/* Overlay lighting/gradients */}
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 12% 10%, rgba(255,255,255,0.05), transparent 28%), radial-gradient(circle at 88% 15%, rgba(255,255,255,0.04), transparent 28%), radial-gradient(circle at 15% 60%, rgba(255,255,255,0.04), transparent 28%), radial-gradient(circle at 85% 65%, rgba(255,255,255,0.04), transparent 28%), radial-gradient(circle at 50% 92%, rgba(245,234,216,0.03), transparent 30%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 0, left: "988px", width: "24px", height: "100%", background: "linear-gradient(to right, transparent, rgba(245,234,216,0.14) 40%, rgba(245,234,216,0.18) 50%, rgba(245,234,216,0.14) 60%, transparent)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 90px 90px 0", borderColor: "transparent #3a2c1e transparent transparent", boxShadow: "-4px 4px 10px rgba(245,234,216,0.25)", zIndex: 4 }} />

              {/* Stacked page edges (right + bottom) */}
              <div style={{ position: "absolute", top: "10px", right: 0, bottom: "10px", width: "16px", background: "repeating-linear-gradient(to right, transparent 0, transparent 2px, rgba(245,234,216,0.07) 3px, transparent 4px)", pointerEvents: "none", zIndex: 3 }} />
              <div style={{ position: "absolute", left: "10px", right: "10px", bottom: 0, height: "16px", background: "repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(245,234,216,0.06) 3px, transparent 4px)", pointerEvents: "none", zIndex: 3 }} />

              {/* Washi tape strips */}
              <div style={{ position: "absolute", top: "26px", left: "36px", width: "170px", height: "36px", transform: "rotate(-26deg)", background: "repeating-linear-gradient(45deg, rgba(46,110,101,0.4) 0, rgba(46,110,101,0.4) 10px, rgba(46,110,101,0.28) 10px, rgba(46,110,101,0.28) 20px)", opacity: 0.85, pointerEvents: "none", zIndex: 3 }} />
              <div style={{ position: "absolute", bottom: "76px", right: "50px", width: "160px", height: "34px", transform: "rotate(-18deg)", background: "repeating-linear-gradient(45deg, rgba(217,164,65,0.4) 0, rgba(217,164,65,0.4) 10px, rgba(217,164,65,0.26) 10px, rgba(217,164,65,0.26) 20px)", opacity: 0.85, pointerEvents: "none", zIndex: 3 }} />
              <div style={{ position: "absolute", top: "1490px", right: "26px", width: "140px", height: "30px", transform: "rotate(24deg)", background: "repeating-linear-gradient(45deg, rgba(232,98,44,0.35) 0, rgba(232,98,44,0.35) 9px, rgba(232,98,44,0.22) 9px, rgba(232,98,44,0.22) 18px)", opacity: 0.8, pointerEvents: "none", zIndex: 3 }} />

              {/* Coffee stain */}
              <svg style={{ position: "absolute", left: "1180px", top: "2200px", zIndex: 1, opacity: 0.16, pointerEvents: "none" }} width="150" height="140" viewBox="0 0 150 140" fill="none">
                <ellipse cx="75" cy="70" rx="62" ry="56" stroke="#b3502d" strokeWidth="9" />
                <ellipse cx="75" cy="70" rx="46" ry="41" stroke="#b3502d" strokeWidth="3" opacity="0.7" />
                <circle cx="128" cy="34" r="6" fill="#b3502d" />
                <circle cx="22" cy="104" r="4" fill="#b3502d" />
              </svg>

              {/* Decorative Concentric Rings */}
              <div style={{ position: "absolute", top: "43px", left: "60px", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle, transparent 54%, rgba(245,234,216,0.16) 57%, rgba(245,234,216,0.16) 61%, transparent 64%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: "1122px", left: "60px", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, transparent 55%, rgba(245,234,216,0.14) 58%, rgba(245,234,216,0.14) 62%, transparent 65%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: "652px", right: "80px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, transparent 53%, rgba(245,234,216,0.15) 57%, rgba(245,234,216,0.15) 60%, transparent 63%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: "1484px", right: "120px", width: "240px", height: "240px", borderRadius: "50%", background: "radial-gradient(circle, transparent 55%, rgba(245,234,216,0.13) 58%, rgba(245,234,216,0.13) 62%, transparent 65%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)", width: "260px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, transparent 52%, rgba(245,234,216,0.12) 56%, rgba(245,234,216,0.12) 60%, transparent 64%)", pointerEvents: "none" }} />

              {/* Title Header */}
              <div style={{ position: "absolute", top: "51px", left: "50%", transform: "translateX(-50%) rotate(-2deg)", textAlign: "center", zIndex: 3 }}>
                <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%) rotate(-4deg)", width: "170px", height: "32px", background: "rgba(217,164,65,0.55)", zIndex: -1 }} />
                <h1 style={{ fontFamily: "'Pacifico', cursive", fontWeight: 400, fontSize: "76px", color: "#e8622c", margin: 0, lineHeight: 1 }}>My Journey</h1>
                <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "24px", color: "#f5ead8", margin: "10px 0 0" }}>a treasure map of the road so far</p>
                <svg style={{ marginTop: "4px" }} width="220" height="26" viewBox="0 0 220 26" fill="none">
                  <path d="M4 14C50 2 90 24 130 12C160 3 190 20 216 10" stroke="#e8622c" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </div>

              {/* Compass Decoration */}
              <svg style={{ position: "absolute", left: "930px", top: "145px", zIndex: 2, opacity: 0.85 }} width="130" height="130" viewBox="0 0 130 130" fill="none">
                <circle cx="65" cy="65" r="56" stroke="#f5ead8" strokeWidth="2" fill="none" />
                <circle cx="65" cy="65" r="40" stroke="#f5ead8" strokeWidth="1.2" fill="none" strokeDasharray="2 4" />
                <path d="M65 18L72 60L65 112L58 60Z" fill="#e8622c" stroke="#f5ead8" strokeWidth="1" />
                <path d="M18 65L60 58L112 65L60 72Z" fill="#2e6e65" stroke="#f5ead8" strokeWidth="1" />
                <text x="65" y="14" textAnchor="middle" fontSize="10" fill="#f5ead8" fontFamily="DM Sans">N</text>
              </svg>

              {/* Floating Skill badges */}
              <div style={{ position: "absolute", left: "150px", top: "390px", zIndex: 2, background: "#f5ead8", color: "#241b14", borderRadius: "20px", padding: "10px 20px", transform: "rotate(-5deg)", boxShadow: "0 6px 12px rgba(245,234,216,0.3)" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "1px", margin: 0 }}>PYTHON</p>
              </div>
              <div style={{ position: "absolute", left: "1810px", top: "652px", zIndex: 2, background: "#2e6e65", color: "#241b14", borderRadius: "20px", padding: "10px 20px", transform: "rotate(5deg)", boxShadow: "0 6px 12px rgba(245,234,216,0.3)" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "1px", margin: 0 }}>PYTORCH</p>
              </div>
              <svg style={{ position: "absolute", left: "150px", top: "105px", zIndex: 2, opacity: 0.85 }} width="80" height="56" viewBox="0 0 80 56" fill="none">
                <path d="M4 44L74 6L44 28L48 50L36 34L4 44Z" stroke="#f5ead8" strokeWidth="2" strokeLinejoin="round" fill="#241b14" />
              </svg>
              <svg style={{ position: "absolute", left: "1760px", top: "109px", zIndex: 2, opacity: 0.85 }} width="60" height="60" viewBox="0 0 60 60" fill="none">
                <path d="M30 2v14M30 44v14M2 30h14M44 30h14M9 9l10 10M41 41l10 10M9 51l10-10M41 19l10-10" stroke="#b3502d" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="30" cy="30" r="8" fill="#d9a441" stroke="#f5ead8" strokeWidth="1.5" />
              </svg>
              <div style={{ position: "absolute", left: "550px", top: "790px", zIndex: 2, background: "#d9a441", color: "#f5ead8", borderRadius: "20px", padding: "10px 18px", transform: "rotate(-6deg)", boxShadow: "0 6px 12px rgba(245,234,216,0.25)" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "1px", margin: 0, whiteSpace: "nowrap" }}>DEBUG MODE: ON</p>
              </div>
              <svg style={{ position: "absolute", left: "840px", top: "1166px", zIndex: 2, opacity: 0.9 }} width="50" height="46" viewBox="0 0 50 46" fill="none">
                <path d="M25 42C6 28 2 14 12 6c6-5 13-2 13 6 0-8 7-11 13-6 10 8 6 22-13 36Z" stroke="#e8622c" strokeWidth="2.5" fill="none" />
              </svg>
              <svg style={{ position: "absolute", left: "950px", top: "1246px", zIndex: 2, opacity: 0.9 }} width="70" height="90" viewBox="0 0 70 90" fill="none">
                <path d="M20 8v74" stroke="#f5ead8" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M20 8 L58 20 L20 34Z" fill="#2e6e65" stroke="#f5ead8" strokeWidth="1.5" />
              </svg>
              <p style={{ position: "absolute", left: "995px", top: "1253px", fontFamily: "'Gloria Hallelujah', cursive", fontSize: "16px", color: "#f5ead8", transform: "rotate(-2deg)", zIndex: 2, margin: 0 }}>halfway there!</p>

              <svg style={{ position: "absolute", left: "1470px", top: "348px", zIndex: 2, opacity: 0.9 }} width="90" height="30" viewBox="0 0 90 30" fill="none">
                <path d="M4 20C24 4 40 26 60 12C70 6 80 10 86 6" stroke="#b3502d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
              <div style={{ position: "absolute", left: "1250px", top: "672px", zIndex: 2, background: "#b3502d", color: "#241b14", borderRadius: "20px", padding: "9px 18px", transform: "rotate(-5deg)", boxShadow: "0 6px 12px rgba(245,234,216,0.25)" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "17px", letterSpacing: "1px", margin: 0, whiteSpace: "nowrap" }}>SCIKIT-LEARN</p>
              </div>
              <div style={{ position: "absolute", left: "1400px", top: "1150px", zIndex: 2, background: "#2e6e65", color: "#241b14", borderRadius: "20px", padding: "9px 18px", transform: "rotate(4deg)", boxShadow: "0 6px 12px rgba(0,0,0,0.35)" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "17px", letterSpacing: "1px", margin: 0, whiteSpace: "nowrap" }}>PANDAS</p>
              </div>
              <div style={{ position: "absolute", left: "1620px", top: "1280px", zIndex: 2, background: "#d9a441", color: "#241b14", borderRadius: "20px", padding: "9px 18px", transform: "rotate(-5deg)", boxShadow: "0 6px 12px rgba(0,0,0,0.35)" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "17px", letterSpacing: "1px", margin: 0, whiteSpace: "nowrap" }}>NUMPY</p>
              </div>

              {/* Sparkles */}
              <svg style={{ position: "absolute", left: "720px", top: "300px", zIndex: 1, opacity: 0.6 }} width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 0L11 7L18 9L11 11L9 18L7 11L0 9L7 7Z" fill="#f5ead8"></path></svg>
              <svg style={{ position: "absolute", left: "1780px", top: "900px", zIndex: 1, opacity: 0.5 }} width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="#f5ead8"></path></svg>
              <svg style={{ position: "absolute", left: "520px", top: "1560px", zIndex: 1, opacity: 0.55 }} width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="#f5ead8"></path></svg>
              <svg style={{ position: "absolute", left: "1870px", top: "1650px", zIndex: 1, opacity: 0.5 }} width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="#f5ead8"></path></svg>
              <svg style={{ position: "absolute", left: "980px", top: "1900px", zIndex: 1, opacity: 0.5 }} width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="#f5ead8"></path></svg>
              <svg style={{ position: "absolute", left: "1720px", top: "200px", zIndex: 1, opacity: 0.55 }} width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="#f5ead8"></path></svg>

              {/* Stop 1 (Curiosity First) */}
              <div style={{ position: "absolute", left: "315px", top: "206px", width: "70px", height: "70px", borderRadius: "50%", background: "#e8622c", border: "3px solid #f5ead8", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, boxShadow: "0 6px 14px rgba(245,234,216,0.3)" }}>
                <span style={{ color: "#241b14", fontSize: "30px", fontWeight: 700 }}>①</span>
              </div>
              <div data-nb-pop="" style={{ position: "absolute", left: "80px", top: "181px", width: "220px", background: "#241b14", borderRadius: "4px", padding: "20px 22px", transform: "rotate(-2.5deg)", boxShadow: "0 8px 18px rgba(245,234,216,0.2)", zIndex: 2 }}>
                <div style={{ position: "absolute", top: "-10px", left: "20px", width: "60px", height: "22px", background: "rgba(46,110,101,0.5)", transform: "rotate(-8deg)" }} />
                <h3 style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "22px", color: "#f5ead8", margin: "0 0 6px" }}>Curiosity First</h3>
                <p style={{ fontSize: "15px", lineHeight: 1.5, color: "#f5ead8", opacity: 0.8, margin: 0 }}>Wanting to understand how code, data, and intelligent systems work behind the scenes.</p>
              </div>
              <svg style={{ position: "absolute", left: "590px", top: "181px", zIndex: 2 }} width="46" height="46" viewBox="0 0 46 46" fill="none">
                <path d="M23 4C13 4 6 11 6 21c0 7 4 11 7 14v6h20v-6c3-3 7-7 7-14 0-10-7-17-17-17Z" stroke="#f5ead8" strokeWidth="2" fill="none" />
                <path d="M17 45h12" stroke="#f5ead8" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", left: "120px", top: "460px", zIndex: 2, background: "#241b14", border: "2px solid #f5ead8", borderRadius: "20px", padding: "9px 18px", transform: "rotate(6deg)", boxShadow: "0 6px 12px rgba(0,0,0,0.4)" }}>
                <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "15px", color: "#f5ead8", margin: 0 }}>no cap, it just works</p>
              </div>

              {/* Stop 2 (Photo Frame & Info) */}
              <svg style={{ position: "absolute", left: "320px", top: "930px", zIndex: 2, opacity: 0.9 }} width="48" height="40" viewBox="0 0 48 40" fill="none">
                <path d="M24 4L46 14L24 24L2 14Z" stroke="#f5ead8" strokeWidth="2" strokeLinejoin="round" fill="#e8622c" />
                <path d="M12 18v10c0 3 5 6 12 6s12-3 12-6V18" stroke="#f5ead8" strokeWidth="2" fill="none" />
                <path d="M46 14v12" stroke="#f5ead8" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", left: "385px", top: "757px", width: "70px", height: "70px", borderRadius: "50%", background: "#e8622c", border: "3px solid #f5ead8", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, boxShadow: "0 6px 14px rgba(245,234,216,0.3)" }}>
                <span style={{ color: "#241b14", fontSize: "30px", fontWeight: 700 }}>②</span>
              </div>
              <div data-nb-pop="" style={{ position: "absolute", left: "83px", top: "1004px", width: "220px", background: "#241b14", padding: "12px 12px 38px", transform: "rotate(-4deg)", boxShadow: "0 10px 22px rgba(245,234,216,0.28)", zIndex: 2 }}>
                <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%) rotate(-3deg)", width: "90px", height: "26px", background: "rgba(217,164,65,0.6)" }} />
                <img src="/images/journey-sunset.png" style={{ width: "220px", height: "219px", display: "block", objectFit: "cover" }} alt="Adarsh sunset picture" />
                <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "15px", color: "#f5ead8", textAlign: "center", margin: "10px 0 0" }} />
              </div>
              {/* Paperclip on the photo frame */}
              <svg style={{ position: "absolute", left: "245px", top: "975px", zIndex: 3, transform: "rotate(14deg)" }} width="34" height="78" viewBox="0 0 34 78" fill="none">
                <path d="M11 20v40a8 8 0 0016 0V16a12 12 0 00-24 0v46" stroke="#f5ead8" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />
              </svg>
              <div style={{ position: "absolute", left: "83px", top: "1275px", zIndex: 2, transform: "rotate(2deg)" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", lineHeight: 1.2, letterSpacing: "1px", color: "#f5ead8", margin: 0 }}>ADARSH</p>
                <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "15px", lineHeight: 1.4, color: "#f5ead8", opacity: 0.8, margin: "12px 0 0" }}>Production &amp; Industrial Engineering, NIT Jamshedpur</p>
                <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "15px", lineHeight: 1.4, color: "#f5ead8", opacity: 0.7, margin: "18px 0 0" }}>from Jamshedpur, Jharkhand · loves drawing &amp; photography</p>
              </div>
              <svg style={{ position: "absolute", left: "580px", top: "760px", zIndex: 2 }} width="42" height="42" viewBox="0 0 42 42" fill="none">
                <circle cx="21" cy="21" r="17" stroke="#f5ead8" strokeWidth="2" fill="none" strokeDasharray="4 5" />
                <path d="M21 21l8-8" stroke="#e8622c" strokeWidth="2.5" strokeLinecap="round" />
              </svg>

              {/* Stop 3 (Guiding Question) */}
              <div style={{ position: "absolute", left: "365px", top: "1017px", width: "70px", height: "70px", borderRadius: "50%", background: "#e8622c", border: "3px solid #f5ead8", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, boxShadow: "0 6px 14px rgba(245,234,216,0.3)" }}>
                <span style={{ color: "#241b14", fontSize: "30px", fontWeight: 700 }}>③</span>
              </div>
              <div data-nb-pop="" style={{ position: "absolute", left: "590px", top: "992px", width: "250px", background: "#241b14", borderRadius: "4px", padding: "20px 22px", transform: "rotate(2.5deg)", boxShadow: "0 8px 18px rgba(245,234,216,0.2)", zIndex: 2 }}>
                <div style={{ position: "absolute", top: "-10px", left: "24px", width: "60px", height: "22px", background: "rgba(46,110,101,0.5)", transform: "rotate(-6deg)" }} />
                <h3 style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "22px", color: "#f5ead8", margin: "0 0 6px" }}>The Guiding Question</h3>
                <p style={{ fontSize: "15px", lineHeight: 1.5, color: "#f5ead8", opacity: 0.8, margin: 0 }}>Can AI be useful without pretending to be perfect? I care about model evaluation, uncertainty, and explaining what a system can and cannot reliably predict.</p>
              </div>
              <svg style={{ position: "absolute", left: "120px", top: "1014px", zIndex: 2 }} width="46" height="46" viewBox="0 0 46 46" fill="none">
                <circle cx="23" cy="23" r="19" stroke="#f5ead8" strokeWidth="2" fill="none" />
                <path d="M23 23L30 14L26 25Z" fill="#e8622c" stroke="#f5ead8" strokeWidth="1.5" />
              </svg>
              <div style={{ position: "absolute", left: "210px", top: "1440px", zIndex: 2, background: "#e8622c", color: "#241b14", borderRadius: "20px", padding: "9px 20px", transform: "rotate(-4deg)", boxShadow: "0 6px 12px rgba(245,234,216,0.25)" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", letterSpacing: "1px", margin: 0, whiteSpace: "nowrap" }}>CERTIFIED OVERTHINKER</p>
              </div>

              {/* Stop 4 (RailCross) */}
              <div style={{ position: "absolute", left: "1615px", top: "228px", width: "70px", height: "70px", borderRadius: "50%", background: "#e8622c", border: "3px solid #f5ead8", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, boxShadow: "0 6px 14px rgba(245,234,216,0.3)" }}>
                <span style={{ color: "#241b14", fontSize: "30px", fontWeight: 700 }}>④</span>
              </div>
              <div data-nb-pop="" style={{ position: "absolute", left: "1300px", top: "181px", width: "250px", background: "#241b14", borderRadius: "4px", padding: "20px 22px", transform: "rotate(2deg)", boxShadow: "0 8px 18px rgba(245,234,216,0.2)", zIndex: 2 }}>
                <div style={{ position: "absolute", top: "-10px", left: "24px", width: "60px", height: "22px", background: "rgba(46,110,101,0.5)", transform: "rotate(-5deg)" }} />
                <h3 style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "22px", color: "#f5ead8", margin: "0 0 6px" }}>RailCross</h3>
                <p style={{ fontSize: "15px", lineHeight: 1.5, color: "#f5ead8", opacity: 0.8, margin: 0 }}>An uncertainty-aware railway delay assistant — my flagship build so far.</p>
              </div>
              <svg style={{ position: "absolute", left: "1720px", top: "167px", zIndex: 2 }} width="42" height="42" viewBox="0 0 42 42" fill="none">
                <path d="M8 4v22a13 8 0 0026 0V4Z" stroke="#f5ead8" strokeWidth="2" fill="none" />
                <path d="M21 30v8M14 38h14" stroke="#f5ead8" strokeWidth="2" strokeLinecap="round" />
              </svg>

              {/* Stop 5 (Stats) */}
              <div style={{ position: "absolute", left: "1565px", top: "489px", width: "70px", height: "70px", borderRadius: "50%", background: "#e8622c", border: "3px solid #f5ead8", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, boxShadow: "0 6px 14px rgba(245,234,216,0.3)" }}>
                <span style={{ color: "#241b14", fontSize: "30px", fontWeight: 700 }}>⑤</span>
              </div>
              <div data-nb-pop="" style={{ position: "absolute", left: "1300px", top: "463px", width: "250px", background: "#241b14", borderRadius: "4px", padding: "18px 22px", transform: "rotate(-2deg)", boxShadow: "0 8px 18px rgba(245,234,216,0.2)", zIndex: 2, textAlign: "center" }}>
                <div style={{ position: "absolute", top: "-10px", right: "24px", width: "60px", height: "22px", background: "rgba(217,164,65,0.55)", transform: "rotate(6deg)" }} />
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "64px", color: "#2e6e65", margin: 0, lineHeight: 1, letterSpacing: "2px" }}>4</p>
                <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "16px", color: "#f5ead8", margin: "6px 0 0" }}>end-to-end ML projects shipped</p>
              </div>
              <svg style={{ position: "absolute", left: "1720px", top: "442px", zIndex: 2 }} width="38" height="38" viewBox="0 0 38 38" fill="none">
                <path d="M19 3 L23 14 L35 14 L26 21 L29 34 L19 27 L9 34 L12 21 L3 14 L15 14Z" stroke="#f5ead8" strokeWidth="2" fill="#d9a441" />
              </svg>

              {/* Still Learning / Closing Story */}
              <div data-nb-pop="" style={{ position: "absolute", left: "1230px", top: "700px", width: "560px", background: "#241b14", borderRadius: "4px", padding: "32px 40px", transform: "rotate(1deg)", boxShadow: "0 10px 22px rgba(245,234,216,0.2)", zIndex: 2 }}>
                <div style={{ position: "absolute", top: "-12px", left: "36px", width: "90px", height: "24px", background: "rgba(217,164,65,0.55)", transform: "rotate(-5deg)" }} />
                <h3 style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "26px", color: "#e8622c", margin: "0 0 12px" }}>Still Learning, Always Building</h3>
                <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#f5ead8", opacity: 0.85, margin: "0 0 12px" }}>I now know the direction I want to grow in: building reliable ML systems that solve real problems, communicate uncertainty clearly, and are simple enough for people to actually use.</p>
                <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#f5ead8", opacity: 0.85, margin: 0 }}>Always up for talking ML, projects, or the next idea worth building — let&apos;s connect.</p>
              </div>
              <svg style={{ position: "absolute", left: "1780px", top: "1050px", zIndex: 2, opacity: 0.9 }} width="90" height="50" viewBox="0 0 90 50" fill="none">
                <path d="M4 6C40 2 40 44 86 30" stroke="#f5ead8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M74 22L87 30L74 40" stroke="#f5ead8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div style={{ position: "absolute", top: "978px", left: "1050px", width: "170px", background: "#14100c", border: "2px dashed #b3502d", borderRadius: "6px", padding: "16px 18px", transform: "rotate(6deg)", boxShadow: "0 8px 16px rgba(245,234,216,0.2)", zIndex: 2 }}>
                <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "15px", color: "#f5ead8", margin: 0 }}>crossing over to the next chapter...</p>
              </div>
              <svg style={{ position: "absolute", left: "1000px", top: "724px", zIndex: 2, opacity: 0.8 }} width="90" height="260" viewBox="0 0 90 260" fill="none">
                <path d="M10 7C60 43 20 87 60 123C90 152 40 174 45 184" stroke="#2e6e65" strokeWidth="2" strokeDasharray="3 8" fill="none" />
              </svg>

              {/* A Little More About Me Title */}
              <div style={{ position: "absolute", top: "1542px", left: "50%", transform: "translateX(-50%) rotate(-1.5deg)", textAlign: "center", zIndex: 3 }}>
                <div style={{ position: "absolute", top: "-9px", left: "50%", transform: "translateX(-50%) rotate(-3deg)", width: "130px", height: "26px", background: "rgba(46,110,101,0.5)", zIndex: -1 }} />
                <h2 style={{ fontFamily: "'Pacifico', cursive", fontWeight: 400, fontSize: "48px", color: "#b3502d", margin: 0 }}>A Little More About Me</h2>
              </div>

              {/* From Jamshedpur to NIT Jamshedpur text */}
              <div style={{ position: "absolute", top: "1680px", left: "200px", width: "1240px", zIndex: 2 }}>
                <svg style={{ position: "absolute", top: "-6px", left: "-70px" }} width="48" height="56" viewBox="0 0 48 56" fill="none">
                  <path d="M24 2C11 2 2 11 2 23c0 17 22 31 22 31s22-14 22-31C46 11 37 2 24 2Z" stroke="#e8622c" strokeWidth="2.5" fill="none" />
                  <circle cx="24" cy="22" r="8" stroke="#e8622c" strokeWidth="2.5" />
                </svg>
                <h3 style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "30px", color: "#e8622c", margin: "0 0 16px" }}>From Jamshedpur to NIT Jamshedpur</h3>
                <p style={{ fontSize: "18px", lineHeight: "1.7", color: "#f5ead8", opacity: 0.85, margin: "0 0 14px" }}>I'm from Jamshedpur, Jharkhand, currently pursuing Production and Industrial Engineering at NIT Jamshedpur — while building my real path in CS and AI alongside academics. Some days mean classes and assignments, others mean debugging a project or exploring a new ML concept.</p>
                <p style={{ fontSize: "18px", lineHeight: "1.7", color: "#f5ead8", opacity: 0.85, margin: 0 }}>I learn by trying things hands-on: breaking a complicated idea into smaller parts until it becomes something I can build, test, and understand. Outside coding, I enjoy drawing, clicking photos, and watching movies — reminders that good ideas come from observing the world, not just staring at a screen.</p>
              </div>

              {/* Jamshedpur Origin badge */}
              <div style={{ position: "absolute", top: "1629px", left: "1500px", width: "250px", background: "#14100c", border: "2px dashed #2e6e65", borderRadius: 6, padding: "18px 20px", transform: "rotate(5deg)", boxShadow: "0 8px 16px rgba(245,234,216,0.2)", zIndex: 2 }}>
                <div style={{ position: "absolute", top: "50%", left: "-9px", width: "18px", height: "18px", borderRadius: "50%", background: "#14100c", boxShadow: "0 0 0 2px #2e6e65 inset", transform: "translateY(-50%)" }} />
                <div style={{ position: "absolute", top: "50%", right: "-9px", width: "18px", height: "18px", borderRadius: "50%", background: "#14100c", boxShadow: "0 0 0 2px #2e6e65 inset", transform: "translateY(-50%)" }} />
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", lineHeight: 1.1, color: "#2e6e65", letterSpacing: "1px", margin: "0 0 16px", whiteSpace: "nowrap" }}>JAMSHEDPUR, JHARKHAND</p>
                <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "16px", lineHeight: 1.2, color: "#f5ead8", margin: 0 }}>est. NIT Jamshedpur</p>
              </div>

              {/* Snapshots badge */}
              <div style={{ position: "absolute", top: "1752px", left: "1500px", width: "170px", height: "170px", background: "#241b14", border: "3px dotted #b3502d", borderRadius: 2, padding: "16px", transform: "rotate(-8deg)", boxShadow: "0 8px 16px rgba(245,234,216,0.2)", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifycontent: "center", gap: "6px" }}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <rect x="6" y="14" width="40" height="30" rx="3" stroke="#f5ead8" strokeWidth="2" />
                  <path d="M18 14l4-6h8l4 6" stroke="#f5ead8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="26" cy="29" r="8" stroke="#e8622c" strokeWidth="2.5" />
                </svg>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", color: "#f5ead8", letterSpacing: "2px", margin: 0 }}>SNAPSHOTS</p>
              </div>

              <svg style={{ position: "absolute", left: "420px", top: "1925px", zIndex: 2 }} width="130" height="60" viewBox="0 0 130 60" fill="none">
                <path d="M4 7C40 3 80 29 120 22" stroke="#f5ead8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M108 14L121 22L106 28" stroke="#f5ead8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <p style={{ position: "absolute", left: "420px", top: "1978px", fontFamily: "'Gloria Hallelujah', cursive", fontSize: "18px", color: "#f5ead8", transform: "rotate(-3deg)", zIndex: 2, margin: 0 }}>drawing, photos, movies</p>

              <svg style={{ position: "absolute", left: "250px", top: "1919px", zIndex: 2, opacity: 0.9 }} width="60" height="100" viewBox="0 0 60 100" fill="none">
                <path d="M25 9v65a9 12 0 0024 0V27a5 7 0 00-10 0v33" stroke="#f5ead8" strokeWidth="3" fill="none" strokeLinecap="round" transform="rotate(-15 30 50)" />
              </svg>
              <div style={{ position: "absolute", top: "1955px", left: "1620px", width: "180px", background: "#14100c", borderRadius: "3px", padding: "14px 18px", transform: "rotate(4deg)", boxShadow: "0 8px 16px rgba(245,234,216,0.2)", zIndex: 2 }}>
                <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "15px", color: "#f5ead8", margin: 0 }}>always learning, always building...</p>
              </div>
              <svg style={{ position: "absolute", left: "1550px", top: "1999px", zIndex: 2, opacity: 0.85 }} width="60" height="40" viewBox="0 0 60 40" fill="none">
                <path d="M4 22C20 4 40 4 56 14" stroke="#b3502d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M44 9L57 14L45 22" stroke="#b3502d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>

              {/* Currently... lists */}
              <div style={{ position: "absolute", top: "2080px", left: "150px", width: "1700px", zIndex: 2 }}>
                <h3 style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "28px", color: "#e8622c", margin: "0 0 20px" }}>Currently...</h3>
                <div style={{ display: "flex", gap: "90px", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <svg width="64" height="46" viewBox="0 0 64 46" fill="none">
                      <rect x="2" y="2" width="60" height="42" rx="4" stroke="#f5ead8" strokeWidth="2" />
                      <circle cx="20" cy="23" r="9" stroke="#d9a441" strokeWidth="2" />
                      <circle cx="44" cy="23" r="9" stroke="#d9a441" strokeWidth="2" />
                      <path d="M14 10h10M40 10h10" stroke="#f5ead8" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "15px", color: "#f5ead8", margin: 0 }}>on repeat</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
                      <circle cx="23" cy="23" r="21" stroke="#f5ead8" strokeWidth="2" />
                      <circle cx="23" cy="23" r="6" fill="#e8622c" />
                      <circle cx="23" cy="23" r="14" stroke="#f5ead8" strokeWidth="1" strokeDasharray="2 4" />
                    </svg>
                    <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "15px", color: "#f5ead8", margin: 0 }}>movie night</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <svg width="64" height="46" viewBox="0 0 64 46" fill="none">
                      <path d="M4 8a4 4 0 014-4h48a4 4 0 014 4v18a4 4 0 01-4 4H32l-8 10v-10H8a4 4 0 01-4-4Z" stroke="#f5ead8" strokeWidth="2" fill="none" />
                      <circle cx="18" cy="17" r="2" fill="#f5ead8" />
                      <circle cx="32" cy="17" r="2" fill="#f5ead8" />
                      <circle cx="46" cy="17" r="2" fill="#f5ead8" />
                    </svg>
                    <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "15px", color: "#f5ead8", margin: 0 }}>brb, shipping code</p>
                  </div>
                </div>
              </div>

              <p style={{ position: "absolute", bottom: "43px", left: "50%", transform: "translateX(-50%) rotate(-1deg)", fontFamily: "'Gloria Hallelujah', cursive", fontSize: "22px", color: "#f5ead8", opacity: 0.75, margin: 0, zIndex: 2 }}>to be continued...</p>

              {/* Rubber stamp: slams down as the journey completes */}
              <div
                data-nb="stamp"
                style={{
                  position: "absolute",
                  left: "460px",
                  top: "2140px",
                  padding: "18px 32px",
                  border: "5px double #e8622c",
                  borderRadius: "10px",
                  color: "#e8622c",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "42px",
                  letterSpacing: "5px",
                  whiteSpace: "nowrap",
                  transform: "rotate(-12deg) scale(2.6)",
                  transformOrigin: "center",
                  opacity: 0,
                  zIndex: 3,
                  textShadow: "0 0 14px rgba(232,98,44,0.4)",
                  boxShadow: "inset 0 0 24px rgba(232,98,44,0.18)",
                  pointerEvents: "none"
                }}
              >
                CHAPTER 01 · LOGGED ✓
              </div>

              {/* Dotted paths */}
              <svg style={{ position: "absolute", inset: 0, zIndex: 1 }} width="2000" height="2470" viewBox="0 0 2000 2470" fill="none">
                <path
                  data-nb="line"
                  d={JOURNEY_PATH}
                  stroke="#f5ead8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="1 16"
                />
                <path
                  d={JOURNEY_PATH}
                  stroke="#e8622c"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="0.1 16"
                  opacity="0.6"
                />
                {/* Solid glowing ink the pen lays down over the pencil dots */}
                <path
                  data-nb="ink"
                  d={JOURNEY_PATH}
                  stroke="#e8622c"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.9"
                  style={{ filter: "drop-shadow(0 0 7px rgba(232,98,44,0.65))" }}
                />
                <circle data-nb="dot" r="10" fill="var(--color-sunset)" style={{ filter: "drop-shadow(0 0 8px var(--color-sunset))" }} />

                {/* Comet trail behind the traveling dot */}
                {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
                  <circle
                    key={i}
                    data-nb="trail"
                    r={Math.max(1.5, 7 - i * 0.7)}
                    fill={i % 2 ? "#d9a441" : "#e8622c"}
                    opacity="0"
                    style={{ filter: "blur(0.5px)" }}
                  />
                ))}

                {/* N2: the fountain pen that writes the whole journey */}
                <g data-nb="pen" style={{ opacity: 0 }}>
                  {/* nib (tip sits exactly on the path point at 0,0) */}
                  <path d="M0 0 L-5 -13 L5 -13 Z" fill="#3550b2" stroke="#f5ead8" strokeWidth="1" />
                  <line x1="0" y1="-3" x2="0" y2="-12" stroke="#f5ead8" strokeWidth="0.8" />
                  {/* grip + barrel */}
                  <path d="M-6 -13 L6 -13 L7 -24 L-7 -24 Z" fill="#1c140d" stroke="#f5ead8" strokeWidth="1" />
                  <rect x="-7" y="-58" width="14" height="34" rx="6" fill="#241b14" stroke="#f5ead8" strokeWidth="1.4" />
                  <rect x="-7" y="-44" width="14" height="5" fill="#d9a441" />
                  <rect x="-7" y="-36" width="14" height="3" fill="#e8622c" />
                  {/* cap finial */}
                  <circle cx="0" cy="-60" r="4.5" fill="#e8622c" stroke="#f5ead8" strokeWidth="1" />
                </g>

                {/* Arrow directors along the dotted lines */}
                <g transform="translate(420,442) rotate(60)"><path d="M0 0 L18 0 M18 0 L11 -7 M18 0 L11 7" stroke="#b3502d" strokeWidth="3" strokeLinecap="round" fill="none"></path></g>
                <g transform="translate(410,978) rotate(60)"><path d="M0 0 L18 0 M18 0 L11 -7 M18 0 L11 7" stroke="#b3502d" strokeWidth="3" strokeLinecap="round" fill="none"></path></g>
                <g transform="translate(1200,507) rotate(-40)"><path d="M0 0 L18 0 M18 0 L11 -7 M18 0 L11 7" stroke="#b3502d" strokeWidth="3" strokeLinecap="round" fill="none"></path></g>
                <g transform="translate(1640,724) rotate(60)"><path d="M0 0 L18 0 M18 0 L11 -7 M18 0 L11 7" stroke="#b3502d" strokeWidth="3" strokeLinecap="round" fill="none"></path></g>
              </svg>

              {/* ── N3: Living doodles (wake up as the pen passes) ── */}
              {/* Compass whose needle swings around */}
              <svg style={{ position: "absolute", left: "250px", top: "1560px", zIndex: 2, opacity: 0.92 }} width="120" height="120" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="52" stroke="#f5ead8" strokeWidth="2" />
                <circle cx="60" cy="60" r="38" stroke="#f5ead8" strokeWidth="1" strokeDasharray="2 4" />
                <text x="60" y="18" textAnchor="middle" fontSize="12" fill="#f5ead8" fontFamily="DM Sans">N</text>
                <g data-nb="dl-compass" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
                  <path d="M60 18 L69 60 L60 102 L51 60 Z" fill="#e8622c" stroke="#f5ead8" strokeWidth="1" />
                  <circle cx="60" cy="60" r="5" fill="#f5ead8" />
                </g>
              </svg>

              {/* Neural pulse — a bright dash races through the wires */}
              <svg style={{ position: "absolute", left: "600px", top: "400px", zIndex: 2, pointerEvents: "none" }} width="180" height="120" viewBox="0 0 180 120" fill="none">
                <path
                  data-nb="dl-pulse"
                  d="M20 60 L90 45 L160 60"
                  stroke="#d9a441"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="40 220"
                  strokeDashoffset="220"
                  opacity="0.95"
                  style={{ filter: "drop-shadow(0 0 6px rgba(217,164,65,0.9))" }}
                />
              </svg>

              {/* Little train drives along a dashed rail */}
              <svg style={{ position: "absolute", left: "520px", top: "2210px", zIndex: 2 }} width="380" height="72" viewBox="0 0 380 72" fill="none">
                <path d="M6 54 H374" stroke="#f5ead8" strokeWidth="2" strokeDasharray="6 8" opacity="0.45" />
                <g data-nb="dl-train">
                  <rect x="0" y="20" width="54" height="28" rx="5" stroke="#f5ead8" strokeWidth="2.5" fill="#241b14" />
                  <rect x="9" y="26" width="16" height="12" fill="#e8622c" />
                  <circle cx="15" cy="54" r="6" stroke="#f5ead8" strokeWidth="2.5" />
                  <circle cx="42" cy="54" r="6" stroke="#f5ead8" strokeWidth="2.5" />
                  <path d="M54 30 h10" stroke="#e8622c" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              </svg>

              {/* Steam rising off the coffee stain */}
              <svg data-nb="dl-steam" style={{ position: "absolute", left: "1210px", top: "2090px", zIndex: 2, opacity: 0 }} width="90" height="130" viewBox="0 0 90 130" fill="none">
                <path d="M26 128 C 12 100, 42 88, 28 58 C 16 34, 42 22, 32 4" stroke="#f5ead8" strokeWidth="3" strokeLinecap="round" opacity="0.55" fill="none" />
                <path d="M58 128 C 44 102, 72 90, 58 62 C 46 38, 70 26, 60 8" stroke="#f5ead8" strokeWidth="3" strokeLinecap="round" opacity="0.4" fill="none" />
              </svg>

              {/* Sparkle burst near the finish line */}
              {[
                { l: "1560px", t: "440px", s: "34px" },
                { l: "1670px", t: "520px", s: "26px" },
                { l: "1600px", t: "610px", s: "30px" }
              ].map((p, i) => (
                <div
                  key={i}
                  data-nb="dl-tw"
                  style={{ position: "absolute", left: p.l, top: p.t, zIndex: 2, opacity: 0, color: "#d9a441", fontSize: p.s, textShadow: "0 0 10px rgba(217,164,65,0.8)", pointerEvents: "none" }}
                >
                  ✦
                </div>
              ))}

              {/* Neural wire frame illustration STOP 1 */}
              <div style={{ position: "absolute", left: "600px", top: "400px", zIndex: 2, textAlign: "center" }}>
                <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
                  <circle cx="20" cy="30" r="7" stroke="#f5ead8" strokeWidth="2" />
                  <circle cx="20" cy="60" r="7" stroke="#f5ead8" strokeWidth="2" />
                  <circle cx="20" cy="90" r="7" stroke="#f5ead8" strokeWidth="2" />
                  <circle cx="90" cy="15" r="7" stroke="#e8622c" strokeWidth="2" />
                  <circle cx="90" cy="45" r="7" stroke="#e8622c" strokeWidth="2" />
                  <circle cx="90" cy="75" r="7" stroke="#e8622c" strokeWidth="2" />
                  <circle cx="90" cy="105" r="7" stroke="#e8622c" strokeWidth="2" />
                  <circle cx="160" cy="45" r="7" stroke="#2e6e65" strokeWidth="2" />
                  <circle cx="160" cy="75" r="7" stroke="#2e6e65" strokeWidth="2" />
                  <g stroke="#f5ead8" strokeWidth="1" opacity="0.6">
                    <path d="M27 30L83 15M27 30L83 45M27 30L83 75M27 60L83 15M27 60L83 45M27 60L83 75M27 60L83 105M27 90L83 45M27 90L83 75M27 90L83 105" />
                    <path d="M97 15L153 45M97 45L153 45M97 45L153 75M97 75L153 45M97 75L153 75M97 105L153 75" />
                  </g>
                </svg>
                <p style={{ fontFamily: "'Gloria Hallelujah', cursive", fontSize: "17px", color: "#f5ead8", margin: "6px 0 0", transform: "rotate(-1deg)" }}>teaching machines to think</p>
              </div>

              {/* More skills floating tags */}
              <div style={{ position: "absolute", left: "1470px", top: "100px", zIndex: 2, background: "#e8622c", color: "#241b14", borderRadius: "20px", padding: "9px 18px", transform: "rotate(4deg)", boxShadow: "0 6px 12px rgba(0,0,0,0.35)" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", letterSpacing: "1px", margin: 0, whiteSpace: "nowrap" }}>GIT</p>
              </div>
              <div style={{ position: "absolute", left: "900px", top: "1950px", zIndex: 2, background: "#241b14", border: "2px solid #f5ead8", color: "#f5ead8", borderRadius: "20px", padding: "9px 18px", transform: "rotate(-4deg)", boxShadow: "0 6px 12px rgba(0,0,0,0.4)" }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", letterSpacing: "1px", margin: 0, whiteSpace: "nowrap" }}>SQL</p>
              </div>
              <svg style={{ position: "absolute", left: "1050px", top: "1500px", zIndex: 1, opacity: 0.6 }} width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="#f5ead8"></path></svg>
              <svg style={{ position: "absolute", left: "700px", top: "1650px", zIndex: 1, opacity: 0.5 }} width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5Z" fill="#f5ead8"></path></svg>

              {/* ── N5: Hidden UV-ink layer — only visible inside the soft circle
                  that follows the cursor (mask centered on --ux/--uy). ── */}
              <div
                data-nb="uv"
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 6,
                  pointerEvents: "none",
                  WebkitMaskImage:
                    "radial-gradient(circle 260px at var(--ux, -9999px) var(--uy, -9999px), #000 32%, transparent 70%)",
                  maskImage:
                    "radial-gradient(circle 260px at var(--ux, -9999px) var(--uy, -9999px), #000 32%, transparent 70%)"
                }}
              >
                {[
                  { l: 470, t: 300, r: -5, s: 26, tx: "epoch 47 — cried a little 😅" },
                  { l: 1250, t: 360, r: 4, s: 24, tx: "TODO: sleep (someday)" },
                  { l: 300, t: 1500, r: -3, s: 26, tx: "it's ok to not know yet" },
                  { l: 1480, t: 1560, r: 6, s: 24, tx: "psst — try typing “train”" },
                  { l: 900, t: 2120, r: -2, s: 26, tx: "chai brewed here: ∞" },
                  { l: 1650, t: 900, r: 3, s: 22, tx: "if you found this — hi 👋" },
                  { l: 120, t: 820, r: -4, s: 22, tx: "git commit -m 'pls work'" }
                ].map((n, i) => (
                  <p
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${n.l}px`,
                      top: `${n.t}px`,
                      transform: `rotate(${n.r}deg)`,
                      margin: 0,
                      fontFamily: "'Gloria Hallelujah', cursive",
                      fontSize: `${n.s}px`,
                      color: "#b39cff",
                      textShadow: "0 0 12px rgba(157,123,255,0.9)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {n.tx}
                  </p>
                ))}
              </div>

              {/* Spotlight overlay container */}
              <div
                data-nb="overlay"
                className="pointer-events-none absolute inset-0 z-20"
                style={{
                  background:
                    "radial-gradient(circle 420px at 1500px 1235px, transparent 35%, rgba(20,16,12,0.96) 75%)",
                }}
              />
              </div>

              {/* The cover, hinged on the left edge of the right page (x = 1000px).
                  Two 3D faces: leather front outside, scribbled inside-cover that
                  you glimpse while it flips open. */}
              <div
                data-nb="cover"
                className="absolute z-30 shadow-[0_30px_80px_rgba(0,0,0,0.55)] rounded-r-lg"
                style={{
                  left: "1000px",
                  width: "1000px",
                  height: "2470px",
                  transformOrigin: "left center",
                  transformStyle: "preserve-3d"
                }}
              >
                {/* ── FRONT FACE: worn leather + gold foil ── */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    borderRadius: "0 14px 14px 0",
                    background: "linear-gradient(145deg, #8a3d22 0%, #6f2e18 45%, #55220f 100%)",
                    boxShadow: "inset 0 0 90px rgba(0,0,0,0.5), inset -8px 0 20px rgba(0,0,0,0.35)"
                  }}
                >
                  {/* leather grain speckle */}
                  <div
                    style={{
                      position: "absolute", inset: 0, opacity: 0.55, borderRadius: "0 14px 14px 0",
                      backgroundImage:
                        "radial-gradient(circle at 18% 26%, rgba(255,255,255,0.05) 0 3px, transparent 4px)," +
                        "radial-gradient(circle at 72% 64%, rgba(0,0,0,0.28) 0 2px, transparent 3px)," +
                        "radial-gradient(circle at 40% 82%, rgba(255,255,255,0.04) 0 2px, transparent 3px)," +
                        "radial-gradient(circle at 86% 14%, rgba(0,0,0,0.22) 0 2px, transparent 3px)",
                      backgroundSize: "120px 120px, 90px 90px, 150px 150px, 110px 110px",
                      pointerEvents: "none"
                    }}
                  />
                  {/* stitched border */}
                  <div style={{ position: "absolute", inset: "36px", border: "3px dashed rgba(245,234,216,0.28)", borderRadius: "8px", pointerEvents: "none" }} />
                  {/* stacked page edges peeking at the right edge */}
                  <div style={{ position: "absolute", top: "14px", bottom: "14px", right: "-8px", width: "14px", borderRadius: "0 6px 6px 0", background: "repeating-linear-gradient(to bottom, #efe4c8 0 5px, #d9cba6 5px 7px)", boxShadow: "2px 0 8px rgba(0,0,0,0.4)" }} />

                  {/* gold-foil embossed title */}
                  <p
                    className="font-script"
                    style={{
                      fontSize: "118px", lineHeight: 1.15, margin: 0, padding: "0 40px",
                      background: "linear-gradient(100deg, #7a5a26 0%, #f7e39b 32%, #d9a441 52%, #a97c2f 72%, #f1d98c 100%)",
                      WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                      filter: "drop-shadow(0 4px 3px rgba(0,0,0,0.6))"
                    }}
                  >
                    Field Notes
                  </p>
                  <svg width="300" height="26" viewBox="0 0 300 26" fill="none" style={{ marginTop: "18px", opacity: 0.9 }}>
                    <path d="M6 15 C 60 6, 120 24, 170 12 C 220 3, 260 20, 294 10" stroke="#d9a441" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </svg>
                  <p className="font-hand" style={{ fontSize: "40px", marginTop: "34px", color: "rgba(245,234,216,0.88)", textShadow: "0 2px 3px rgba(0,0,0,0.5)" }}>
                    Adarsh Sahu · NIT JSR
                  </p>
                  <p className="font-hand-alt uppercase tracking-widest" style={{ fontSize: "24px", marginTop: "90px", color: "rgba(245,234,216,0.6)" }}>
                    do not open (open it)
                  </p>

                  {/* elastic closure band */}
                  <div style={{ position: "absolute", top: 0, bottom: 0, right: "130px", width: "34px", background: "linear-gradient(90deg, #16100a, #3a241a 50%, #120c07)", boxShadow: "0 0 20px rgba(0,0,0,0.65), inset 0 0 8px rgba(245,234,216,0.08)", opacity: 0.95 }} />
                  {/* bookmark ribbon peeking out the bottom */}
                  <div
                    style={{
                      position: "absolute", bottom: "-64px", right: "250px", width: "62px", height: "150px",
                      background: "linear-gradient(180deg, #a32824, #7e1d1a)",
                      clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
                      boxShadow: "0 10px 18px rgba(0,0,0,0.45)"
                    }}
                  />
                </div>

                {/* ── BACK FACE: the inside cover, seen during the flip ── */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    borderRadius: "14px 0 0 14px",
                    background: "linear-gradient(160deg, #2b2016 0%, #1a130d 60%, #14100c 100%)",
                    boxShadow: "inset 0 0 70px rgba(0,0,0,0.6)"
                  }}
                >
                  <div style={{ position: "absolute", inset: "36px", border: "2px solid rgba(245,234,216,0.14)", borderRadius: "8px" }} />
                  <p className="font-hand" style={{ fontSize: "42px", color: "rgba(245,234,216,0.85)", transform: "rotate(-2deg)", margin: 0 }}>
                    property of Adarsh Sahu
                  </p>
                  <p className="font-hand" style={{ fontSize: "28px", color: "rgba(245,234,216,0.55)", transform: "rotate(-1deg)", marginTop: "26px" }}>
                    if found — return with chai ☕
                  </p>
                  <svg width="220" height="70" viewBox="0 0 130 60" fill="none" style={{ marginTop: "60px", opacity: 0.7 }}>
                    <rect x="8" y="14" width="52" height="30" rx="6" stroke="#f5ead8" strokeWidth="2.5" />
                    <rect x="60" y="22" width="44" height="22" rx="4" stroke="#f5ead8" strokeWidth="2.5" />
                    <circle cx="24" cy="52" r="6" stroke="#f5ead8" strokeWidth="2.5" />
                    <circle cx="48" cy="52" r="6" stroke="#f5ead8" strokeWidth="2.5" />
                    <circle cx="78" cy="52" r="6" stroke="#f5ead8" strokeWidth="2.5" />
                    <path d="M104 44h16M2 52h6" stroke="#e8622c" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaticNotebook() {
  return (
    <div className="bg-[#14100c] text-[#f5ead8] px-6 py-20 font-sans space-y-16">
      <div className="text-center relative max-w-xl mx-auto">
        <h1 className="font-script text-5xl text-[#e8622c] leading-tight">My Journey</h1>
        <p className="font-hand text-xl mt-2 opacity-80">a treasure map of the road so far</p>
      </div>

      <div className="max-w-xl mx-auto space-y-12">
        {/* Stop 1 */}
        <div className="relative border-l-2 border-[#e8622c] pl-8 space-y-2">
          <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-[#e8622c] flex items-center justify-center text-[#241b14] font-bold text-sm">1</div>
          <h3 className="font-hand text-2xl text-[#f5ead8]">Curiosity First</h3>
          <p className="opacity-80 text-base leading-relaxed">Wanting to understand how code, data, and intelligent systems work behind the scenes.</p>
        </div>

        {/* Stop 2 */}
        <div className="relative border-l-2 border-[#e8622c] pl-8 space-y-4">
          <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-[#e8622c] flex items-center justify-center text-[#241b14] font-bold text-sm">2</div>
          <h3 className="font-hand text-2xl text-[#f5ead8]">Adarsh</h3>
          <img src="/images/journey-sunset.png" className="w-56 rounded-md shadow-md border border-[#f5ead8]/10" alt="Adarsh sunset picture" />
          <div className="space-y-1 text-sm opacity-80 leading-relaxed">
            <p className="font-bold text-base">NIT Jamshedpur</p>
            <p>Production & Industrial Engineering</p>
            <p>from Jamshedpur, Jharkhand · loves drawing & photography</p>
          </div>
        </div>

        {/* Stop 3 */}
        <div className="relative border-l-2 border-[#e8622c] pl-8 space-y-2">
          <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-[#e8622c] flex items-center justify-center text-[#241b14] font-bold text-sm">3</div>
          <h3 className="font-hand text-2xl text-[#f5ead8]">The Guiding Question</h3>
          <p className="opacity-80 text-base leading-relaxed">Can AI be useful without pretending to be perfect? I care about model evaluation, uncertainty, and explaining what a system can and cannot reliably predict.</p>
        </div>

        {/* Stop 4 */}
        <div className="relative border-l-2 border-[#e8622c] pl-8 space-y-2">
          <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-[#e8622c] flex items-center justify-center text-[#241b14] font-bold text-sm">4</div>
          <h3 className="font-hand text-2xl text-[#f5ead8]">RailCross</h3>
          <p className="opacity-80 text-base leading-relaxed">An uncertainty-aware railway delay assistant — my flagship build so far.</p>
        </div>

        {/* Stop 5 */}
        <div className="relative border-l-2 border-[#e8622c] pl-8 space-y-2">
          <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-[#e8622c] flex items-center justify-center text-[#241b14] font-bold text-sm">5</div>
          <h3 className="font-hand text-2xl text-[#f5ead8]">4 Projects</h3>
          <p className="opacity-80 text-base leading-relaxed">End-to-end ML projects shipped.</p>
        </div>

        {/* Signature sign-off */}
        <div className="pt-10 text-center border-t border-[#e8622c]/20">
          <p className="font-hand text-sm text-[#f5ead8]/60 mb-2">the field notes — signed,</p>
          <p className="font-script text-4xl text-[#f5ead8]">Adarsh Sahu</p>
          <svg width="220" height="24" viewBox="0 0 360 30" fill="none" className="mx-auto mt-2">
            <path d="M6 16 C 70 6, 150 26, 210 14 C 260 5, 320 22, 354 11" stroke="#d9a441" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
          <p className="font-hand text-sm text-[#f5ead8]/60 mt-4">to be continued…</p>
        </div>
      </div>
    </div>
  );
}
