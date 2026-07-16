import { useEffect, useState } from "react";
import { Coffee, X } from "lucide-react";
import { soundManager } from "../config/soundManager";

// "?" opens a little field-guide to everything hidden on the site — because a
// site this playful should reward the curious without making them hunt blindly.
// Also home to the chai counter: a pure toy that pours a cup and keeps a tally
// across visits (localStorage). My own addition to tie the interactions together.
const CHAI_KEY = "portfolio_chai_cups";

const SECRETS = [
  { keys: ["/"], text: "Command palette — jump anywhere, copy my email." },
  { keys: ["?"], text: "This guide (you found it)." },
  { keys: ["type", "adarsh"], text: "Flip the site into blueprint debug mode." },
  { keys: ["type", "train"], text: "The little train whistles and dashes across." },
  { keys: ["scroll"], text: "The Notebook opens, reads itself, then closes." },
  { keys: ["hover"], text: "“Best Work” — the letters come alive." },
  { keys: ["drag"], text: "Sticky notes & project cards move. Try it." },
  { keys: ["hover"], text: "Polaroids on the corkboard develop like film." },
];

export default function SecretsOverlay() {
  const [open, setOpen] = useState(false);
  const [cups, setCups] = useState(0);
  const [pouring, setPouring] = useState(false);

  useEffect(() => {
    try {
      setCups(parseInt(localStorage.getItem(CHAI_KEY) || "0", 10) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const typing =
        /^(input|textarea|select)$/i.test(e.target.tagName) ||
        e.target.isContentEditable;
      if (typing) return;
      if (e.key === "?") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pourChai = () => {
    setCups((c) => {
      const next = c + 1;
      try {
        localStorage.setItem(CHAI_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    soundManager.playTick();
    window.dispatchEvent(new CustomEvent("quest", { detail: "chai" }));
    setPouring(true);
    window.setTimeout(() => setPouring(false), 450);
  };

  return (
    <>
      <button
        className="sec-launch"
        aria-label="Show keyboard secrets"
        title="Secrets ( ? )"
        onClick={() => setOpen(true)}
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[96] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site secrets"
            className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[8px_8px_0_rgba(36,27,20,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-ink/10 px-5 py-4">
              <p className="font-display text-lg uppercase tracking-widest text-ink">
                Field guide to the hidden bits
              </p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1 text-ink/60 transition-colors hover:bg-ink/10 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <ul className="max-h-[52vh] space-y-3 overflow-y-auto px-5 py-4">
              {SECRETS.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex shrink-0 flex-wrap gap-1 pt-0.5">
                    {s.keys.map((k, j) => (
                      <span key={j} className="sec-kbd">
                        {k}
                      </span>
                    ))}
                  </span>
                  <span className="font-body text-sm text-ink/80">{s.text}</span>
                </li>
              ))}
            </ul>

            {/* Chai counter */}
            <div className="flex items-center justify-between border-t-2 border-ink/10 bg-cream/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Coffee
                  size={20}
                  className={`text-sunset transition-transform ${pouring ? "-rotate-12" : ""}`}
                />
                <span className="font-hand text-ink">
                  chai poured together: <strong>{cups}</strong>
                </span>
              </div>
              <button
                onClick={pourChai}
                className="rounded-full border-2 border-sunset px-4 py-1.5 font-display text-xs uppercase tracking-wider text-sunset-deep transition-colors hover:bg-sunset hover:text-cream"
              >
                Pour a cup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
