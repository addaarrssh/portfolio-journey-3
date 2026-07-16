import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { scrollToTarget } from "../lib/lenis";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-cream text-ink shadow-[4px_4px_0_rgba(20,18,43,0.9)] transition-transform hover:scale-110 hover:bg-ink hover:text-cream"
    >
      <ArrowUp size={20} />
    </button>
  );
}
