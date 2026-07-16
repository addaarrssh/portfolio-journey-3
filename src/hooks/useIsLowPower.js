import { useEffect, useState } from "react";

function computeIsLowPower() {
  if (typeof window === "undefined") return false;
  const fewCores = (navigator.hardwareConcurrency || 8) <= 4;
  const isMobileWidth = window.innerWidth < 768;
  const saveData = navigator.connection?.saveData === true;
  return (fewCores && isMobileWidth) || saveData;
}

// Heuristic gate for disabling heavy 3D / particle effects on weak devices.
export function useIsLowPower() {
  const [lowPower, setLowPower] = useState(computeIsLowPower);

  useEffect(() => {
    const onResize = () => setLowPower(computeIsLowPower());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return lowPower;
}
