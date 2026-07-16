// Single source of truth for animation timing/easing across the site.

export const EASE = {
  out: "power3.out",
  inOut: "power2.inOut",
  expo: "expo.out",
  soft: "power2.out",
};

export const DURATION = {
  fast: 0.4,
  base: 0.7,
  slow: 1.1,
  loading: 1.6,
};

export const STAGGER = {
  tight: 0.06,
  base: 0.12,
  loose: 0.2,
};

export const SCROLL_TRIGGER_DEFAULTS = {
  start: "top 82%",
  toggleActions: "play none none reverse",
};
