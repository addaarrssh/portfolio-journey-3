import { useEffect, useRef, useState } from "react";
import { ScrollText, Check } from "lucide-react";
import { soundManager } from "../config/soundManager";

// S2: a gamified explorer checklist. Interactions around the site dispatch
//   window.dispatchEvent(new CustomEvent("quest", { detail: "<id>" }))
// and this log ticks them off (persisted). Finish them all for a golden badge.
const QUESTS = [
  { id: "open", label: "open the notebook" },
  { id: "uv", label: "find the hidden ink" },
  { id: "train", label: "make the train whistle" },
  { id: "chai", label: "pour a chai" },
  { id: "polaroid", label: "develop 3 polaroids" },
  { id: "contact", label: "reach the sign-off" },
];
const STORE = "portfolio_quests";
const POLAROIDS_NEEDED = 3;

export default function QuestLog() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORE) || "[]"));
    } catch {
      return new Set();
    }
  });
  const [celebrated, setCelebrated] = useState(false);
  const polaroidCount = useRef(0);

  const complete = (id) => {
    setDone((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(STORE, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      soundManager.playPen();
      return next;
    });
  };

  useEffect(() => {
    const onQuest = (e) => {
      const id = e.detail;
      if (id === "polaroid") {
        polaroidCount.current += 1;
        if (polaroidCount.current >= POLAROIDS_NEEDED) complete("polaroid");
      } else if (id) {
        complete(id);
      }
    };
    window.addEventListener("quest", onQuest);

    // Self-detect the sign-off: Contact section entering view.
    let io;
    const contact = document.getElementById("contact");
    if (contact) {
      io = new IntersectionObserver(
        (entries) => entries.forEach((en) => en.isIntersecting && complete("contact")),
        { threshold: 0.3 }
      );
      io.observe(contact);
    }
    return () => {
      window.removeEventListener("quest", onQuest);
      if (io) io.disconnect();
    };
  }, []);

  const allDone = QUESTS.every((q) => done.has(q.id));

  useEffect(() => {
    if (allDone && !celebrated) {
      setCelebrated(true);
      setOpen(true);
      soundManager.playWarp();
    }
  }, [allDone, celebrated]);

  return (
    <div className="fixed bottom-11 left-4 z-[46] hidden sm:block">
      {/* the pull tab */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-t-lg border-2 border-b-0 border-ink bg-cream px-3 py-1.5 font-display text-[11px] uppercase tracking-widest text-ink shadow-[3px_-3px_0_rgba(36,27,20,0.6)] transition-transform hover:-translate-y-0.5"
        style={{ transform: open ? "translateY(0)" : "translateY(0)" }}
      >
        <ScrollText size={14} className="text-sunset" />
        Quest log
        <span className="rounded-full bg-ink px-1.5 text-[10px] text-cream">
          {done.size}/{QUESTS.length}
        </span>
      </button>

      {open && (
        <div className="w-64 rounded-lg rounded-bl-none border-2 border-ink bg-cream p-4 shadow-[4px_4px_0_rgba(36,27,20,0.5)]">
          <ul className="space-y-2">
            {QUESTS.map((q) => {
              const ok = done.has(q.id);
              return (
                <li key={q.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      ok ? "border-teal bg-teal text-cream" : "border-ink/40"
                    }`}
                  >
                    {ok && <Check size={11} />}
                  </span>
                  <span
                    className={`font-hand ${ok ? "text-ink line-through opacity-60" : "text-ink/80"}`}
                  >
                    {q.label}
                    {q.id === "polaroid" && !ok && (
                      <span className="ml-1 text-xs text-ink/40">
                        ({Math.min(polaroidCount.current, POLAROIDS_NEEDED)}/{POLAROIDS_NEEDED})
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>

          {allDone && (
            <div className="mt-3 flex flex-col items-center gap-1 border-t-2 border-ink/10 pt-3 text-center">
              <span className="qlog-badge rounded-full bg-accent px-3 py-1 font-display text-[11px] uppercase tracking-widest text-ink">
                ★ Certified Explorer ★
              </span>
              <p className="font-hand text-xs text-ink/60">you found everything. respect.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
