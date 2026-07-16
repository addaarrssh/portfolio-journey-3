import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import GithubIcon from "./icons/GithubIcon";
import { useGsapAnimation } from "../hooks/useGsapAnimation";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { DURATION, EASE, SCROLL_TRIGGER_DEFAULTS } from "../config/animations";
import { SectionTag } from "./SectionKit";

gsap.registerPlugin(ScrollTrigger);

const CONTACT_EMAIL = "adarshprivate678@gmail.com";
const GITHUB_URL = "https://github.com/addaarrssh";

function validate({ name, email, message }) {
  const errors = {};
  if (!name.trim()) errors.name = "Name is required.";
  if (!email.trim()) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email.";
  if (!message.trim()) errors.message = "Message is required.";
  else if (message.trim().length < 10) errors.message = "Message should be at least 10 characters.";
  return errors;
}

export default function Contact() {
  const reducedMotion = usePrefersReducedMotion();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const formRef = useRef(null);

  const scope = useGsapAnimation((scope) => {
    gsap.from(scope.current.querySelectorAll("[data-anim='contact-el']"), {
      y: reducedMotion ? 0 : 24,
      opacity: 0,
      duration: DURATION.base,
      stagger: 0.1,
      ease: EASE.out,
      scrollTrigger: { trigger: scope.current, ...SCROLL_TRIGGER_DEFAULTS },
    });
  }, [reducedMotion]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // TODO: this form has no backend yet. Wire this handler to a real form
    // service (e.g. Formspree, EmailJS, or a custom API route) before
    // relying on it to actually deliver messages.
    setStatus("submitting");

    // Fold the form into a paper plane and fly it off before confirming.
    const el = formRef.current;
    if (el && !reducedMotion) {
      el.classList.add("pp-fly");
      window.setTimeout(() => {
        el.classList.remove("pp-fly");
        setStatus("success");
      }, 900);
    } else {
      window.setTimeout(() => setStatus("success"), 900);
    }
  };

  return (
    <section id="contact" ref={scope} className="bg-sunset py-28 text-cream">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex justify-center" data-anim="contact-el">
          <SectionTag n="05" label="Say Hi" color="cream" />
        </div>
        <h2 className="section-heading mt-5 text-center text-cream" data-anim="contact-el">
          Let&apos;s Build Something
        </h2>

        <div className="mt-10 flex flex-wrap justify-center gap-4" data-anim="contact-el">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 rounded-full border-2 border-cream/40 px-5 py-2.5 text-sm text-cream/90 transition-colors hover:border-accent hover:text-accent"
          >
            <Mail size={16} /> {CONTACT_EMAIL}
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-full border-2 border-cream/40 px-5 py-2.5 text-sm text-cream/90 transition-colors hover:border-accent hover:text-accent"
          >
            <GithubIcon size={16} /> github.com/addaarrssh
          </a>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          data-anim="contact-el"
          className="glass-card mt-12 grid grid-cols-1 gap-5"
        >
          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 size={40} className="text-sunset" />
              <p className="font-display text-lg text-ink">Message received.</p>
              <p className="max-w-sm text-sm text-ink/60">
                This is a simulated confirmation — the form isn&apos;t wired to a
                real backend yet. In the meantime, email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-sunset underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                directly.
              </p>
            </div>
          ) : (
            <>
              <Field label="Name" id="contact-name" value={form.name} onChange={handleChange("name")} error={errors.name} />
              <Field
                label="Email"
                id="contact-email"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                error={errors.email}
              />
              <Field
                label="Message"
                id="contact-message"
                as="textarea"
                rows={5}
                value={form.message}
                onChange={handleChange("message")}
                error={errors.message}
              />

              <button type="submit" disabled={status === "submitting"} className="btn-primary justify-center">
                {status === "submitting" ? "Sending…" : "Send Message"} <Send size={16} />
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

function Field({ label, id, error, as = "input", ...props }) {
  const Tag = as;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-display text-xs uppercase tracking-wider text-ink/70">
        {label}
      </label>
      <Tag
        id={id}
        {...props}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-xl border-2 border-ink/20 bg-white/60 px-4 py-3 text-ink placeholder-ink/30 outline-none transition-colors focus:border-sunset"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
