import { useEffect, useRef, useState } from "react";

// Handwritten margin notes that fade in when their section scrolls into view —
// like Adarsh went back through his own site with a red pen. Purely decorative,
// pointer-events-none, and hidden on narrow screens (see .mg-layer CSS).
//
// Each note targets a section by id and pins itself to a fixed spot in the
// margin. It reveals while that section overlaps the viewport (Intersection
// Observer), so notes never all show at once.
const NOTES = [
  {
    target: "skills",
    pos: { top: "24%", left: "2.5%" },
    rot: -4,
    tone: "",
    body: (
      <>
        <span className="mg-arrow">↖</span>
        everything here was once a{" "}
        <span className="mg-strike">tutorial I paused</span> real project.
      </>
    ),
  },
  {
    target: "skills",
    pos: { top: "62%", right: "2.5%" },
    rot: 3,
    tone: "mg-teal",
    body: (
      <>
        <span className="mg-strike">expert</span> enthusiastic beginner in
        half of these, honestly.
      </>
    ),
  },
  {
    target: "projects",
    pos: { top: "30%", left: "2.5%" },
    rot: -3,
    tone: "mg-ink",
    body: (
      <>
        this one broke 14 times
        <br /> before it worked. <span className="mg-arrow">↘</span>
      </>
    ),
  },
  {
    target: "projects",
    pos: { top: "70%", right: "2.5%" },
    rot: 4,
    tone: "",
    body: <>drag the cards. go on, I built it for that.</>,
  },
  {
    target: "timeline",
    pos: { top: "34%", right: "3%" },
    rot: -5,
    tone: "mg-teal",
    body: (
      <>
        CGPA 7.45{" "}
        <span className="mg-strike">is fine</span> (the assignments fought
        back).
      </>
    ),
  },
  {
    target: "contact",
    pos: { top: "26%", left: "3%" },
    rot: -3,
    tone: "mg-ink",
    body: (
      <>
        <span className="mg-arrow">↓</span> this actually works. I checked
        twice.
      </>
    ),
  },
];

export default function Marginalia() {
  const [active, setActive] = useState(() => new Set());
  const layerRef = useRef(null);

  useEffect(() => {
    // Respect reduced motion — still show, just no fancy reveal timing.
    const targets = [...new Set(NOTES.map((n) => n.target))]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        setActive((prev) => {
          const next = new Set(prev);
          entries.forEach((e) => {
            if (e.isIntersecting) next.add(e.target.id);
            else next.delete(e.target.id);
          });
          return next;
        });
      },
      { rootMargin: "-25% 0px -25% 0px", threshold: 0.01 }
    );

    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <div className="mg-layer" ref={layerRef} aria-hidden="true">
      {NOTES.map((n, i) => (
        <span
          key={i}
          className={`mg-note ${n.tone} ${active.has(n.target) ? "mg-in" : ""}`}
          style={{ ...n.pos, "--mg-rot": `${n.rot}deg` }}
        >
          {n.body}
        </span>
      ))}
    </div>
  );
}
