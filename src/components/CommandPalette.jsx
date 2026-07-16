import { useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  BookOpen,
  FileText,
  FolderGit2,
  Mail,
  Copy,
  Check,
  Command as CommandIcon,
} from "lucide-react";
import { scrollToTarget } from "../lib/lenis";

const CONTACT_EMAIL = "adarshprivate678@gmail.com";
const GITHUB_URL = "https://github.com/addaarrssh";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const actions = useMemo(
    () => [
      { id: "home", label: "Go to Home", hint: "top", icon: Home, run: () => scrollToTarget("#home") },
      { id: "about", label: "Open The Notebook", hint: "my journey", icon: BookOpen, run: () => scrollToTarget("#about") },
      { id: "skills", label: "Go to the CV / Toolbox", hint: "skills", icon: FileText, run: () => scrollToTarget("#skills") },
      { id: "projects", label: "Browse Projects", hint: "best work", icon: FolderGit2, run: () => scrollToTarget("#projects") },
      { id: "contact", label: "Go to Contact", hint: "say hi", icon: Mail, run: () => scrollToTarget("#contact") },
      {
        id: "copy",
        label: "Copy email address",
        hint: CONTACT_EMAIL,
        icon: copied ? Check : Copy,
        keepOpen: true,
        run: async () => {
          try {
            await navigator.clipboard.writeText(CONTACT_EMAIL);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* clipboard blocked — ignore */
          }
        },
      },
      { id: "github", label: "Open GitHub", hint: "@addaarrssh", icon: FolderGit2, run: () => window.open(GITHUB_URL, "_blank", "noopener") },
    ],
    [copied]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => (a.label + " " + a.hint).toLowerCase().includes(q));
  }, [actions, query]);

  // Global open/close hotkeys
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const runAction = (a) => {
    if (!a) return;
    a.run();
    if (!a.keepOpen) setOpen(false);
  };

  const onListKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runAction(filtered[active]);
    }
  };

  return (
    <>
      {/* Launcher pill */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open quick menu"
        className="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-2 rounded-full border-2 border-ink/70 bg-cream/90 px-4 py-2 font-display text-xs uppercase tracking-widest text-ink shadow-[3px_3px_0_rgba(36,27,20,0.8)] backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:-translate-x-1/2 sm:flex"
      >
        <CommandIcon size={14} /> Quick menu
        <kbd className="rounded bg-ink px-1.5 py-0.5 text-[10px] text-cream">/</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[95] flex items-start justify-center bg-ink/60 p-4 pt-[15vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Quick menu"
            className="w-full max-w-lg overflow-hidden rounded-2xl border-2 border-ink bg-paper shadow-[8px_8px_0_rgba(36,27,20,0.6)]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onListKey}
          >
            <div className="flex items-center gap-3 border-b-2 border-ink/10 px-4 py-3">
              <CommandIcon size={18} className="text-sunset" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a section, copy my email…"
                className="w-full bg-transparent font-body text-ink placeholder-ink/40 outline-none"
              />
              <kbd className="rounded border border-ink/20 px-1.5 py-0.5 font-display text-[10px] uppercase text-ink/50">Esc</kbd>
            </div>

            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center font-hand text-ink/50">no matches — try &quot;projects&quot;</li>
              )}
              {filtered.map((a, i) => {
                const Icon = a.icon;
                return (
                  <li key={a.id}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => runAction(a)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        active === i ? "bg-ink text-cream" : "text-ink hover:bg-ink/5"
                      }`}
                    >
                      <Icon size={16} className={active === i ? "text-accent" : "text-sunset"} />
                      <span className="font-display text-sm">{a.label}</span>
                      <span className={`ml-auto font-hand text-xs ${active === i ? "text-cream/60" : "text-ink/40"}`}>
                        {a.id === "copy" && copied ? "copied!" : a.hint}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
