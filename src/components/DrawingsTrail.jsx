import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const TOTAL_DRAWINGS = 38;
const SPAWN_THRESHOLD = 140; // Pixels to move before spawning next image
const MAX_IMAGES = 15;

export default function DrawingsTrail() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  
  const lastX = useRef(0);
  const lastY = useRef(0);
  const imgIndex = useRef(1);
  const activeImages = useRef([]);

  useEffect(() => {
    // Cleanup active images on unmount
    return () => {
      activeImages.current.forEach((img) => {
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }
      });
      activeImages.current = [];
    };
  }, []);

  const handleMouseMove = (e) => {
    // Disable on mobile/touch or reduced motion
    if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dist = Math.hypot(x - lastX.current, y - lastY.current);
    if (dist > SPAWN_THRESHOLD) {
      lastX.current = x;
      lastY.current = y;
      spawnImage(x, y);
    }
  };

  const spawnImage = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get current drawing src
    const src = `/images/drawings/${imgIndex.current}.jpg`;
    imgIndex.current = (imgIndex.current % TOTAL_DRAWINGS) + 1;

    // Create img element
    const img = document.createElement("img");
    img.src = src;

    // Responsive dimensions
    const baseWidth = window.innerWidth < 768 ? 160 : window.innerWidth <= 1440 ? 240 : 300;
    const scale = 0.85 + Math.random() * 0.3; // 0.85x to 1.15x scale
    const rot = (Math.random() - 0.5) * 20; // -10 to +10 degrees rotation
    const offsetX = (Math.random() - 0.5) * 60; // Subtle offset for human touch
    const offsetY = (Math.random() - 0.5) * 60;

    img.className = "absolute origin-center rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.65)] border border-cream/10 pointer-events-none will-change-transform";
    img.style.width = `${baseWidth}px`;
    img.style.height = "auto";
    img.style.left = `${x + offsetX}px`;
    img.style.top = `${y + offsetY}px`;
    img.style.transform = `translate(-50%, -50%) scale(0.7) rotate(${rot - 8}deg)`;
    img.style.opacity = "0";

    canvas.appendChild(img);
    activeImages.current.push(img);

    // Fade and scale in animation
    gsap.to(img, {
      opacity: 1,
      scale: scale,
      rotation: rot,
      duration: 1.0,
      ease: "power2.out",
      overwrite: "auto"
    });

    // Limit active images to maintain performance
    if (activeImages.current.length > MAX_IMAGES) {
      const oldest = activeImages.current.shift();
      removeImage(oldest);
    }

    // Auto fade-out after 3 seconds
    const timeoutId = setTimeout(() => {
      if (activeImages.current.includes(img)) {
        const idx = activeImages.current.indexOf(img);
        if (idx > -1) activeImages.current.splice(idx, 1);
        removeImage(img);
      }
    }, 3000);

    // Save timeout ID to clear on destruction if needed
    img.dataset.timeoutId = timeoutId;
  };

  const removeImage = (img) => {
    if (img.dataset.timeoutId) {
      clearTimeout(Number(img.dataset.timeoutId));
    }

    gsap.to(img, {
      opacity: 0,
      scale: 0.7,
      rotation: "+=10",
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }
      }
    });
  };

  return (
    <section 
      id="drawings"
      ref={containerRef}
      className="relative w-full h-screen bg-[#060609] overflow-hidden flex items-center justify-center cursor-crosshair"
      style={{ contentVisibility: "auto" }}
    >
      {/* Dynamic glow in background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(198,40,40,0.06),transparent_60%)] pointer-events-none" />

      {/* Typography Overlay (Centered, behind interactive images) */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center w-full text-center pointer-events-none select-none">
        <h2 className="font-hand leading-[0.75] text-center select-none flex flex-col items-center">
          <span className="text-[12vw] md:text-[8vw] xl:text-[5.5vw] text-sunset font-bold uppercase tracking-tight">I Like To</span>
          <span className="text-[16vw] md:text-[11vw] xl:text-[8.5vw] text-cream uppercase -mt-2">Draw</span>
        </h2>
        <div className="mt-8">
          <div className="text-cream/60 border border-cream/10 px-6 py-2.5 rounded-full text-xs font-bold tracking-[0.25em] font-sans uppercase flex items-center gap-3">
            <span className="w-2 h-2 bg-sunset rounded-full animate-pulse shadow-[0_0_8px_rgba(198,40,40,0.8)]"></span> 
            Move cursor around to see my sketches
          </div>
        </div>
      </div>

      {/* Interactive hover canvas */}
      <div 
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        className="relative w-full h-full z-20 overflow-hidden pointer-events-auto"
      />
    </section>
  );
}
