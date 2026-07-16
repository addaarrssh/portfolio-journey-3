import { useState, useEffect, useRef } from "react";

export default function F1Navigator() {
  const [visible, setVisible] = useState(false);
  const [xPos, setXPos] = useState(50);
  const [yPos, setYPos] = useState(15);
  const [frame, setFrame] = useState(1);
  const lastScrollY = useRef(0);

  // Configuration for 3D turntable alignment
  const totalFrames = 82;
  const frameOffset = 41; // Alignment adjustment to map frames to correct heading direction
  const isClockwise = true;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      // Determine visibility (show after scrolling 80px)
      if (scrollY > 80) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      // Calculate progress (0 to 1)
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

      // Determine scroll direction
      let currentDirection = "down";
      if (scrollY > lastScrollY.current) {
        currentDirection = "down";
      } else if (scrollY < lastScrollY.current) {
        currentDirection = "up";
      }
      lastScrollY.current = scrollY;

      // Winding road math
      const W = window.innerWidth;
      const H = window.innerHeight;
      const amplitude = W < 768 ? 15 : 28;
      
      // Calculate positions on winding curve
      const p1 = progress;
      const x1 = 50 + Math.sin(p1 * Math.PI * 2.5) * amplitude;
      const y1 = 15 + p1 * 70;

      setXPos(x1);
      setYPos(y1);

      // Tangent vector calculation for rotation angle
      const delta = 0.002;
      const p2 = Math.min(1, p1 + delta);
      const x2 = 50 + Math.sin(p2 * Math.PI * 2.5) * amplitude;
      const y2 = 15 + p2 * 70;

      const px1 = (x1 / 100) * W;
      const py1 = (y1 / 100) * H;
      const px2 = (x2 / 100) * W;
      const py2 = (y2 / 100) * H;

      let dx = px2 - px1;
      let dy = py2 - py1;

      if (currentDirection === "up") {
        dx = -dx;
        dy = -dy;
      }

      // Angle in degrees from 0 to 360
      let deg = Math.atan2(dy, dx) * (180 / Math.PI);
      if (deg < 0) deg += 360;

      // Map angle to frame index (1 to 82)
      let rawFrame = Math.round(((deg + frameOffset) / 360) * totalFrames) % totalFrames;
      
      if (!isClockwise) {
        rawFrame = (totalFrames - rawFrame) % totalFrames;
      }
      
      const frameIndex = rawFrame + 1;
      setFrame(frameIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Preloader for all 82 transparent Iron Man frames to prevent flickering during scroll */}
      <div className="hidden" aria-hidden="true">
        {Array.from({ length: totalFrames }, (_, i) => (
          <img key={i} src={`/images/ironman-3d/${i + 1}.png`} alt="" />
        ))}
      </div>

      <div
        className="fixed z-50 pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: `${xPos}%`,
          top: `${yPos}vh`,
          opacity: visible ? 0.95 : 0,
          transform: "translate(-50%, -50%)",
          transitionProperty: "opacity, left, top"
        }}
      >
        <img
          src={`/images/ironman-3d/${frame}.png`}
          alt="Iron Man Navigator"
          className="w-16 md:w-20 h-auto select-none"
          style={{
            filter: "drop-shadow(0 4px 12px rgba(198,40,40,0.45)) drop-shadow(0 0 20px rgba(255,179,0,0.25))"
          }}
        />
      </div>
    </>
  );
}
