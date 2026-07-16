import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { useGsapAnimation } from "../hooks/useGsapAnimation";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { CATEGORIES, CATEGORY_LABELS, projects, featuredProjectIds } from "../data/projects";
import ProjectCard from "./ProjectCard";
import { DURATION, EASE, SCROLL_TRIGGER_DEFAULTS, STAGGER } from "../config/animations";
import { SectionTag, QuickNote, HoverTitle } from "./SectionKit";

gsap.registerPlugin(ScrollTrigger, Draggable);

const TABS = Object.values(CATEGORIES);
const featured = featuredProjectIds.map((id) => projects.find((p) => p.id === id)).filter(Boolean);

// A draggable horizontal rail of the featured projects — drag, use the
// arrow buttons, or arrow keys (when focused) to move between cards.
function FeaturedRail() {
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const draggableRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const cardWidth = 340; // px, matches the fixed card width below

  useEffect(() => {
    if (reducedMotion || !trackRef.current || !viewportRef.current) return;

    const maxX = -(trackRef.current.scrollWidth - viewportRef.current.clientWidth);
    const bounds = { minX: Math.min(maxX, 0), maxX: 0 };

    const [inst] = Draggable.create(trackRef.current, {
      type: "x",
      bounds,
      inertia: false,
      edgeResistance: 0.7,
      cursor: "grab",
      activeCursor: "grabbing",
    });
    draggableRef.current = inst;

    return () => inst.kill();
  }, [reducedMotion]);

  const nudge = (dir) => {
    const inst = draggableRef.current;
    if (!inst) return;
    const next = gsap.utils.clamp(inst.minX, inst.maxX, inst.x - dir * cardWidth);
    gsap.to(trackRef.current, { x: next, duration: 0.5, ease: "power3.out" });
    inst.update();
  };

  return (
    <div className="relative">
      <div ref={viewportRef} className="overflow-hidden" data-cursor="drag">
        <div ref={trackRef} className="flex gap-6" style={{ width: "max-content" }}>
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} className="w-[320px] shrink-0" />
          ))}
        </div>
      </div>

      {!reducedMotion && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => nudge(1)}
            aria-label="Previous project"
            className="rounded-full border-2 border-ink p-2 text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => nudge(-1)}
            aria-label="Next project"
            className="rounded-full border-2 border-ink p-2 text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.ALL);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  const scope = useGsapAnimation((scope) => {
    gsap.from(scope.current.querySelectorAll("[data-anim='project-grid'] [data-anim='project-card']"), {
      y: reducedMotion ? 0 : 24,
      opacity: 0,
      scale: reducedMotion ? 1 : 0.96,
      duration: DURATION.base,
      stagger: STAGGER.tight,
      ease: EASE.out,
      scrollTrigger: { trigger: scope.current, ...SCROLL_TRIGGER_DEFAULTS },
    });
  }, [reducedMotion, activeCategory, shuffleSeed]);

  const filtered = useMemo(() => {
    const base =
      activeCategory === CATEGORIES.ALL ? projects : projects.filter((p) => p.category === activeCategory);
    if (shuffleSeed === 0) return base;
    const arr = [...base];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [activeCategory, shuffleSeed]);

  return (
    <section id="projects" ref={scope} className="relative z-20 bg-paper pt-10 pb-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div>
            <SectionTag n="02" label="Projects" />
            <h2 className="section-heading mt-5">
              <HoverTitle text="Best Work" />
            </h2>
            <p className="mt-4 max-w-2xl text-ink/60">
              Drag, or use the arrows, to browse the projects I&apos;m proudest of.
              <span className="ml-1 font-hand text-ink/50">(hover the title — go on)</span>
            </p>
          </div>

          <QuickNote title="Short on time?" className="mt-2 shrink-0">
            The featured rail is the highlight reel. Everything else lives in the
            full grid below, filterable by type.
          </QuickNote>
        </div>

        <div className="mt-10">
          <FeaturedRail />
        </div>

        <div className="mt-24">
          <p className="font-hand text-2xl text-ink/70">
            All {projects.length} public repositories
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Project categories">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeCategory === tab}
                  onClick={() => setActiveCategory(tab)}
                  className={`rounded-full px-4 py-2 font-display text-xs uppercase tracking-wider transition-colors ${
                    activeCategory === tab
                      ? "bg-ink text-cream"
                      : "border-2 border-ink/30 text-ink/70 hover:border-ink"
                  }`}
                >
                  {CATEGORY_LABELS[tab]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShuffleSeed((s) => s + 1)}
              aria-label="Shuffle projects"
              className="ml-auto inline-flex items-center gap-2 rounded-full border-2 border-sunset/50 px-4 py-2 font-display text-xs uppercase tracking-wider text-sunset-deep transition-colors hover:bg-sunset hover:text-cream"
            >
              <Shuffle size={14} /> Shuffle
            </button>
          </div>

          <div data-anim="project-grid" className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
