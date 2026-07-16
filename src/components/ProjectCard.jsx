import { useEffect, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import GithubIcon from "./icons/GithubIcon";
import RailCrossMini from "./RailCrossMini";

export default function ProjectCard({ project, className = "" }) {
  const [showCaseStudy, setShowCaseStudy] = useState(false);
  const cardRef = useRef(null);

  // Pointer-reactive 3D tilt — the card leans toward the cursor.
  const handleTilt = (e) => {
    const el = cardRef.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-4px)`;
  };
  const resetTilt = () => {
    const el = cardRef.current;
    if (el) el.style.transform = "";
  };

  useEffect(() => {
    if (!showCaseStudy) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowCaseStudy(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showCaseStudy]);

  return (
    <>
      <article
        ref={cardRef}
        data-anim="project-card"
        data-cursor="view"
        onMouseMove={handleTilt}
        onMouseLeave={resetTilt}
        className={`glass-card flex flex-col overflow-hidden transition-transform duration-200 [transform-style:preserve-3d] ${className}`}
      >
        <h3 className="font-display text-lg font-bold text-ink">{project.title}</h3>
        <p className="mt-2 line-clamp-4 flex-1 text-sm text-ink/70">
          {project.description}
        </p>

        {project.id === "railcross" && <RailCrossMini />}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tech.slice(0, 5).map((t) => (
            <span
              key={t}
              className="rounded-full border border-ink/20 px-2.5 py-1 text-[11px] text-ink/70"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`View ${project.title} on GitHub`}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1.5 text-xs text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            <GithubIcon size={14} /> Code
          </a>

          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Open live demo of ${project.title}`}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-sunset px-3 py-1.5 text-xs text-sunset transition-colors hover:bg-sunset hover:text-cream"
            >
              <ExternalLink size={14} /> Live Demo
            </a>
          )}

          <button
            onClick={() => setShowCaseStudy(true)}
            className="font-hand ml-auto text-base text-sunset-deep underline-offset-2 hover:underline"
          >
            Case Study
          </button>
        </div>
      </article>

      {showCaseStudy && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${project.id}-modal-title`}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/70 p-6 backdrop-blur-sm"
          onClick={() => setShowCaseStudy(false)}
        >
          <div
            className="glass-card max-h-[80vh] w-full max-w-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3
                id={`${project.id}-modal-title`}
                className="font-display text-2xl font-bold text-ink"
              >
                {project.title}
              </h3>
              <button
                onClick={() => setShowCaseStudy(false)}
                aria-label="Close case study"
                className="text-ink/60 hover:text-ink"
              >
                <X size={22} />
              </button>
            </div>

            {project.year && (
              <p className="mt-1 font-hand text-lg text-sunset-deep">{project.year}</p>
            )}

            <p className="mt-4 text-ink/80">{project.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-ink/20 px-3 py-1 text-xs text-ink/70"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href={project.repo} target="_blank" rel="noreferrer noopener" className="btn-secondary">
                <GithubIcon size={16} /> View Repository
              </a>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer noopener" className="btn-primary">
                  <ExternalLink size={16} /> Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
