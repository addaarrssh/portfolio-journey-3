import { useEffect, useState } from "react";

// A small toast that greets the visitor based on THEIR local time (not Adarsh's),
// and remembers returning visitors via localStorage. Makes the site feel awake.
//
// It waits for the intro loader to finish (window.__introDone / "intro-complete")
// so it doesn't fight the loading screen, then shows once for a few seconds.
const VISIT_KEY = "portfolio_visit_count";

function buildMessage(hour, visits) {
  const returning = visits > 1;

  // Time-of-day flavour
  let line;
  if (hour >= 0 && hour < 5) {
    line = `browsing at ${fmt(hour)}? respect — that's my kind of schedule.`;
  } else if (hour < 12) {
    line = `good morning. someone's an early bird ☕`;
  } else if (hour < 17) {
    line = `afternoon! thanks for stopping by.`;
  } else if (hour < 22) {
    line = `evening browsing — the good hours.`;
  } else {
    line = `it's late. the lamp's still on over here too.`;
  }

  const prefix = returning ? "welcome back. " : "";
  return { prefix, line, returning };
}

function fmt(hour) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h12} ${ampm}`;
}

export default function TimeGreeter() {
  const [msg, setMsg] = useState(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let visits = 1;
    try {
      visits = (parseInt(localStorage.getItem(VISIT_KEY) || "0", 10) || 0) + 1;
      localStorage.setItem(VISIT_KEY, String(visits));
    } catch {
      /* localStorage blocked — treat as first visit */
    }

    const hour = new Date().getHours();
    const built = buildMessage(hour, visits);

    let showTimer = 0;
    let hideTimer = 0;

    const reveal = () => {
      setMsg(built);
      showTimer = window.setTimeout(() => setShown(true), 60);
      hideTimer = window.setTimeout(() => setShown(false), 7000);
    };

    if (window.__introDone) {
      showTimer = window.setTimeout(reveal, 600);
    } else {
      const onIntro = () => window.setTimeout(reveal, 600);
      window.addEventListener("intro-complete", onIntro, { once: true });
      return () => window.removeEventListener("intro-complete", onIntro);
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!msg) return null;

  return (
    <div
      className={`tg-toast ${shown ? "tg-in" : ""}`}
      role="status"
      onClick={() => setShown(false)}
    >
      <span className="tg-dot">● </span>
      {msg.prefix && <strong>{msg.prefix}</strong>}
      {msg.line}
    </div>
  );
}
