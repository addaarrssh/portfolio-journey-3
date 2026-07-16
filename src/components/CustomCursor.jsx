import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const textRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [cursorText, setCursorText] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Disable on mobile/touch devices or reduced motion
    if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!cursor || !dot || !ring) return;

    // Show cursor container
    setIsActive(true);
    gsap.set(cursor, { opacity: 0 });

    // Quick setters for performance
    const setCursorX = gsap.quickSetter(cursor, "x", "px");
    const setCursorY = gsap.quickSetter(cursor, "y", "px");

    const setRingX = gsap.quickSetter(ring, "x", "px");
    const setRingY = gsap.quickSetter(ring, "y", "px");

    let mouse = { x: 0, y: 0 };
    let cursorCoords = { x: 0, y: 0 };
    let ringCoords = { x: 0, y: 0 };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      // Reveal on first move
      gsap.to(cursor, { opacity: 1, duration: 0.2 });
    };

    // Smooth animation ticker
    const tick = () => {
      // Lerp for follow effect
      // Dot is fast
      cursorCoords.x += (mouse.x - cursorCoords.x) * 0.25;
      cursorCoords.y += (mouse.y - cursorCoords.y) * 0.25;
      setCursorX(cursorCoords.x);
      setCursorY(cursorCoords.y);

      // Ring has slightly more lag (inertia)
      ringCoords.x += (mouse.x - ringCoords.x) * 0.12;
      ringCoords.y += (mouse.y - ringCoords.y) * 0.12;
      setRingX(ringCoords.x - cursorCoords.x); // Offset relative to container
      setRingY(ringCoords.y - cursorCoords.y);
    };

    window.addEventListener("pointermove", onMouseMove);
    gsap.ticker.add(tick);

    // Context detection (Hover states)
    const onMouseOver = (e) => {
      const target = e.target.closest("[data-cursor], button, a, [role='button']");
      if (!target) {
        // Reset states
        setCursorText("");
        gsap.to(dot, { scale: 1, duration: 0.2 });
        gsap.to(ring, { scale: 1, width: 32, height: 32, borderRadius: "50%", duration: 0.3 });
        return;
      }

      const cursorType = target.getAttribute("data-cursor");
      
      if (cursorType === "drag") {
        setCursorText("DRAG");
        gsap.to(dot, { scale: 0, duration: 0.2 });
        gsap.to(ring, {
          scale: 1.6,
          backgroundColor: "rgba(217, 164, 65, 0.2)",
          borderColor: "var(--color-accent)",
          duration: 0.3
        });
      } else if (cursorType === "orbit") {
        setCursorText("ORBIT");
        gsap.to(dot, { scale: 0, duration: 0.2 });
        gsap.to(ring, {
          scale: 1.6,
          backgroundColor: "rgba(232, 98, 44, 0.2)",
          borderColor: "var(--color-sunset)",
          duration: 0.3
        });
      } else if (cursorType === "grab") {
        setCursorText("GRAB");
        gsap.to(dot, { scale: 0, duration: 0.2 });
        gsap.to(ring, {
          scale: 1.5,
          backgroundColor: "rgba(46, 110, 101, 0.2)",
          borderColor: "var(--color-teal)",
          duration: 0.3
        });
      } else if (cursorType === "view") {
        setCursorText("VIEW");
        gsap.to(dot, { scale: 0, duration: 0.2 });
        gsap.to(ring, {
          scale: 1.5,
          backgroundColor: "rgba(217, 164, 65, 0.15)",
          borderColor: "var(--color-accent)",
          duration: 0.3
        });
      } else {
        // Standard button / link hover (click state)
        setCursorText("");
        gsap.to(dot, { scale: 1.5, backgroundColor: "var(--color-sunset)", duration: 0.2 });
        gsap.to(ring, {
          scale: 1.3,
          borderColor: "var(--color-sunset)",
          duration: 0.2
        });
      }
    };

    const onMouseDown = () => {
      gsap.to(ring, { scale: 0.8, duration: 0.1 });
    };

    const onMouseUp = () => {
      gsap.to(ring, {
        scale: 1.1,
        duration: 0.15,
        onComplete: () => {
          gsap.to(ring, { scale: 1, duration: 0.1 });
        },
      });
    };

    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    // Hide default cursor
    document.body.classList.add("custom-cursor-active");

    return () => {
      window.removeEventListener("pointermove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      gsap.ticker.remove(tick);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [reducedMotion]);

  if (!isActive) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] -translate-x-1/2 -translate-y-1/2 select-none mix-blend-difference"
    >
      {/* Outer Ring */}
      <div
        ref={ringRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cream bg-transparent transition-all duration-100 ease-out"
        style={{ width: "32px", height: "32px" }}
      />

      {/* Central Dot */}
      <div
        ref={dotRef}
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream"
      />

      {/* Label Text */}
      {cursorText && (
        <span
          ref={textRef}
          className="font-hand-alt absolute top-5 left-5 rounded border border-cream bg-ink px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-cream uppercase shadow-sm"
        >
          {cursorText}
        </span>
      )}
    </div>
  );
}
