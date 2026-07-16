import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapAnimation } from "../hooks/useGsapAnimation";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 82;

export default function IronManScrollEffect() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [images, setImages] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);

  // Preload all 82 images on component mount
  useEffect(() => {
    const loadedImages = [];
    let loaded = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/images/ironman-3d/${i}.png`;
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === TOTAL_FRAMES) {
          setImages(loadedImages);
        }
      };
      loadedImages.push(img);
    }
  }, []);

  const scope = useGsapAnimation((scope) => {
    if (images.length < TOTAL_FRAMES) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    
    // Set internal canvas resolution
    canvas.width = 1000;
    canvas.height = 1000;

    const drawFrame = (index) => {
      const img = images[index];
      if (img && img.complete) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image centered
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      }
    };

    // Draw frame 0 initially
    drawFrame(0);

    const frameObj = { frame: 0 };

    gsap.to(frameObj, {
      frame: TOTAL_FRAMES - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
      },
      onUpdate: () => {
        drawFrame(Math.floor(frameObj.frame));
      }
    });

  }, [images]);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[300vh] bg-black text-cream overflow-hidden flex items-center"
      style={{ contentVisibility: "auto" }}
    >
      {/* Sticky viewport container */}
      <div className="sticky top-0 left-0 w-full h-screen flex items-center px-8 md:px-24">
        
        {/* Left Side: Large 3D Video Canvas */}
        <div className="w-full md:w-3/5 flex items-center justify-center h-full">
          {loadedCount < TOTAL_FRAMES ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-sunset border-t-transparent rounded-full animate-spin" />
              <p className="font-display uppercase tracking-widest text-cream/70 text-sm">
                Initializing HUD... {Math.round((loadedCount / TOTAL_FRAMES) * 100)}%
              </p>
            </div>
          ) : (
            <canvas 
              ref={canvasRef}
              className="w-full max-w-[650px] md:max-w-[900px] lg:max-w-[1100px] h-[85vh] aspect-square object-contain"
              style={{
                filter: "drop-shadow(0 15px 45px rgba(198, 40, 40, 0.55)) drop-shadow(0 0 80px rgba(255, 179, 0, 0.25))"
              }}
            />
          )}
        </div>

        {/* Right Side: Text & Content Space */}
        <div className="hidden md:flex w-2/5 flex-col justify-center px-8 lg:px-16 z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sunset-deep/20 border border-sunset/30 w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-sunset animate-pulse" />
            <span className="font-display text-xs uppercase tracking-widest text-sunset font-bold">Stark HUD Active</span>
          </div>
          <h2 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight text-cream">
            Interactive Showcase
          </h2>
          <p className="font-body text-cream/80 text-lg leading-relaxed max-w-lg">
            This space is prepared for your showcase content. As you scroll, the Iron Man armor rotates dynamically in high-fidelity 3D, keeping page context and active animations synchronized.
          </p>
        </div>

      </div>
    </section>
  );
}
