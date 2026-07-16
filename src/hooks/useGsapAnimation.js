import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Scopes all gsap/ScrollTrigger calls made inside `callback` to the returned
// ref's subtree, and reverts them (killing tweens + ScrollTrigger instances)
// on unmount or when `deps` change.
export function useGsapAnimation(callback, deps = []) {
  const scope = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      callback(scope);
    }, scope.current || undefined);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scope;
}
