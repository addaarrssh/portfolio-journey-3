import Lenis from "lenis";

// Single shared Lenis instance. main.jsx drives its raf loop; any component
// that needs to programmatically scroll (nav links, back-to-top) should call
// lenis.scrollTo(...) here instead of native scrollIntoView/scrollTo — mixing
// native scroll calls with Lenis' virtualized scroll causes the position to
// fight itself and jump.
let instance = null;

export function createLenis(options) {
  instance = new Lenis(options);
  return instance;
}

export function getLenis() {
  return instance;
}

export function scrollToTarget(target, options = {}) {
  if (instance) {
    instance.scrollTo(target, { duration: 1.2, ...options });
  } else if (typeof target === "string") {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else {
    target?.scrollIntoView({ behavior: "smooth" });
  }
}
