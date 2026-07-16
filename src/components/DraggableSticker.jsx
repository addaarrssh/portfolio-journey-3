import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { soundManager } from "../config/soundManager";

gsap.registerPlugin(Draggable);

export default function DraggableSticker({
  children,
  id,
  initialX = 0,
  initialY = 0,
  initialRotate = 0,
  className = "",
}) {
  const containerRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [isLifted, setIsLifted] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    // Load persisted positions if available
    const savedPos = localStorage.getItem(`sticker_pos_${id}`);
    let startPos = { x: initialX, y: initialY };
    if (savedPos) {
      try {
        startPos = JSON.parse(savedPos);
      } catch (e) {
        // Fallback to defaults
      }
    }

    // Set initial transform states
    gsap.set(el, {
      x: startPos.x,
      y: startPos.y,
      rotation: initialRotate,
    });

    const [inst] = Draggable.create(el, {
      type: "x,y",
      edgeResistance: 0.5,
      bounds: document.body,
      cursor: "grab",
      activeCursor: "grabbing",
      onPress() {
        setIsLifted(true);
        // Bring to front
        gsap.set(el, { zIndex: 1000 });
        soundManager.playPaper();

        // Animate tilt & lift shadow
        gsap.to(el, {
          scale: 1.05,
          rotation: "+=3",
          duration: 0.15,
          ease: "power2.out",
        });
      },
      onRelease() {
        setIsLifted(false);
        soundManager.playPaper();

        // Drop animation (reset scale and random slight rotation)
        const snapRotate = initialRotate + (Math.random() * 6 - 3);
        gsap.to(el, {
          scale: 1.0,
          rotation: snapRotate,
          duration: 0.25,
          ease: "elastic.out(1, 0.75)",
        });

        // Save position
        localStorage.setItem(
          `sticker_pos_${id}`,
          JSON.stringify({ x: this.x, y: this.y })
        );
      },
      onDrag() {
        // Minor dynamic tilt depending on speed
        const speedX = this.deltaX * 0.8;
        gsap.to(el, {
          skewX: gsap.utils.clamp(-8, 8, speedX),
          duration: 0.1,
        });
      },
    });

    return () => {
      inst.kill();
    };
  }, [id, initialX, initialY, initialRotate, reducedMotion]);

  return (
    <div
      ref={containerRef}
      data-cursor="grab"
      className={`draggable-sticker select-none pointer-events-auto absolute transition-shadow duration-200 ${
        isLifted ? "lifted-sticker" : "settled-sticker"
      } ${className}`}
    >
      {children}
    </div>
  );
}
