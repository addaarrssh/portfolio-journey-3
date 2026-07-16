import React from "react";

export function SectionTag({ n, label, color = "accent" }) {
  const colorClasses =
    color === "cream"
      ? "text-cream border-cream/30 bg-cream/5"
      : "text-sunset-deep border-sunset/30 bg-sunset/5";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-[10px] uppercase tracking-widest ${colorClasses}`}
    >
      <span className="font-bold">{n}</span>
      <span className="h-1 w-1 rounded-full bg-current opacity-40" />
      <span className="opacity-60">{label}</span>
    </div>
  );
}

export function QuickNote({ title, children, className = "" }) {
  return (
    <div className={`max-w-xs rounded-xl border border-ink/10 bg-ink/[0.02] p-4 text-xs ${className}`}>
      <p className="font-display font-bold uppercase tracking-wider text-ink/70">{title}</p>
      <p className="mt-1 text-ink/65 leading-relaxed">{children}</p>
    </div>
  );
}

export function HoverTitle({ text }) {
  return (
    <span className="inline-flex">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="hover-letter inline-block transition-all duration-200 ease-out cursor-default"
          style={{ transformOrigin: "center bottom" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

// Faint dot-grid backdrop for a "graph paper" feel. Absolutely positioned;
// drop inside a `relative` section.
export function GridBackdrop({ opacity = 0.06, color = "255,255,255" }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(rgba(${color},${opacity}) 1px, transparent 1.4px)`,
        backgroundSize: "34px 34px",
      }}
    />
  );
}
