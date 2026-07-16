import { useEffect, useState } from "react";

// S5: type "credits" anywhere → the page rolls end-credits, film-style, with
// letterbox bars and grain. Escape (or click) to cut.
const WORD = "credits";

const LINES = [
  { t: "ADARSH SAHU", big: true },
  { t: "a field-notes production", small: true },
  { sp: true },
  { role: "Directed by", who: "Adarsh Sahu" },
  { role: "Written & Debugged by", who: "Adarsh, at 2:14 AM" },
  { role: "Cinematography", who: "GSAP & one very tired laptop" },
  { role: "Flagship Model", who: "RailCross" },
  { role: "Powered by", who: "Python · PyTorch · chai" },
  { role: "Chai consumed", who: "∞ cups" },
  { role: "Bugs squashed", who: "most of them" },
  { sp: true },
  { t: "No models were overfit", small: true },
  { t: "in the making of this site.", small: true },
  { sp: true },
  { role: "Special thanks", who: "curiosity, coffee & you" },
  { sp: true },
  { t: "🚂  … see you down the line.", small: true },
];

export default function CreditsMode() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    let buf = "";
    const onKey = (e) => {
      const typing =
        /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;
      if (e.key === "Escape") return setOn(false);
      if (typing || e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-WORD.length);
      if (buf === WORD) {
        buf = "";
        setOn(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!on) return null;

  return (
    <div className="credits-wrap" onClick={() => setOn(false)} role="dialog" aria-label="Credits">
      <div className="credits-grain" />
      <div className="credits-bar credits-bar-top" />
      <div className="credits-bar credits-bar-bottom" />
      <div className="credits-viewport">
        <div className="credits-roll">
          {LINES.map((l, i) => {
            if (l.sp) return <div key={i} style={{ height: "38px" }} />;
            if (l.big) return <p key={i} className="credits-title">{l.t}</p>;
            if (l.small) return <p key={i} className="credits-small">{l.t}</p>;
            return (
              <p key={i} className="credits-line">
                <span className="credits-role">{l.role}</span>
                <span className="credits-who">{l.who}</span>
              </p>
            );
          })}
        </div>
      </div>
      <p className="credits-hint">press esc to cut</p>
    </div>
  );
}
