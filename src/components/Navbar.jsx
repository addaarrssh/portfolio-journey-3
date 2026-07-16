import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { scrollToTarget } from "../lib/lenis";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "The Notebook" },
  { id: "skills", label: "CV" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    scrollToTarget(`#${id}`);
    setIsOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-8 z-50 flex flex-col sm:flex-row text-sm">
      <button
        onClick={() => scrollToSection("home")}
        className="bg-ink px-6 py-3 font-hand text-lg text-cream text-left"
      >
        Adarsh Sahu <span className="text-white/50">| ML/AI Engineer</span>
      </button>

      <div className="flex flex-1 items-center justify-between bg-cream px-6 py-3">
        <ul className="hidden gap-6 md:flex">
          {LINKS.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => scrollToSection(link.id)}
                className={`font-display text-xs uppercase tracking-wider transition-colors ${
                  activeSection === link.id ? "text-sunset" : "text-ink/70 hover:text-ink"
                }`}
                aria-current={activeSection === link.id ? "true" : undefined}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
        <p className="hidden font-hand text-base text-ink/80 md:block">
          Short on time? Skip to Projects →
        </p>

        <button
          className="text-ink md:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <ul className="flex flex-col gap-1 bg-cream px-6 py-4 md:hidden">
          {LINKS.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => scrollToSection(link.id)}
                className={`w-full py-2 text-left font-display text-sm uppercase tracking-wider ${
                  activeSection === link.id ? "text-sunset" : "text-ink/80"
                }`}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
