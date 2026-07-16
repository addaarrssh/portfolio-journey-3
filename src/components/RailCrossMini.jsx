import { useState } from "react";

// A tiny, self-contained illustration of RailCross's core idea: predict a
// level-crossing's state AND report confidence — abstaining ("UNKNOWN") when
// it isn't sure. Synthetic data, purely illustrative.
const CROSSINGS = [
  { id: "A", name: "MG Road", state: "CLOSED", conf: 0.92 },
  { id: "B", name: "Bistupur", state: "OPEN", conf: 0.79 },
  { id: "C", name: "Sakchi", state: "UNKNOWN", conf: 0.47 },
];

const STATE_STYLES = {
  OPEN: { color: "#319795", label: "OPEN" }, // Teal
  CLOSED: { color: "#e8622c", label: "CLOSED" }, // Sunset orange
  UNKNOWN: { color: "#d9a441", label: "UNKNOWN" }, // Accent gold
};

export default function RailCrossMini() {
  const [sel, setSel] = useState(0);
  const c = CROSSINGS[sel];
  const s = STATE_STYLES[c.state];

  return (
    <div
      className="mt-4 rounded-xl border border-ink/15 bg-ink/[0.03] p-3 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-[10px] uppercase tracking-widest text-ink/50">
          Try it · tap a crossing
        </p>
        <span
          className="rounded-full px-2 py-0.5 font-display text-[10px] uppercase tracking-wider"
          style={{ background: s.color, color: "#f5ead8" }}
        >
          {s.label}
        </span>
      </div>

      {/* mini track */}
      <div className="relative mt-3 mb-1 flex items-center justify-between px-1">
        <div className="absolute left-1 right-1 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/15" />
        <div
          className="absolute left-1 top-1/2 h-[3px] -translate-y-1/2 rounded-full transition-all duration-300"
          style={{ width: `${(sel / (CROSSINGS.length - 1)) * 100}%`, background: s.color }}
        />
        {CROSSINGS.map((cr, i) => {
          const active = i === sel;
          const st = STATE_STYLES[cr.state];
          return (
            <button
              key={cr.id}
              onClick={() => setSel(i)}
              aria-label={`Crossing ${cr.name}`}
              className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
              style={{
                borderColor: st.color,
                background: active ? st.color : "#f7f0e1",
              }}
            >
              <span
                className="font-display text-[10px] font-bold"
                style={{ color: active ? "#f5ead8" : st.color }}
              >
                {cr.id}
              </span>
            </button>
          );
        })}
      </div>

      {/* confidence bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between font-hand text-xs text-ink/60">
          <span>{c.name}</span>
          <span>confidence {Math.round(c.conf * 100)}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${c.conf * 100}%`, background: s.color }}
          />
        </div>
        {/* abstention band marker */}
        <p className="mt-1.5 font-hand text-[11px] text-ink/50">
          {c.state === "UNKNOWN"
            ? "below the confidence threshold → the model abstains instead of guessing."
            : "above threshold → confident enough to call it."}
        </p>
      </div>
    </div>
  );
}
