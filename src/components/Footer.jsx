import { Mail } from "lucide-react";
import GithubIcon from "./icons/GithubIcon";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-ink bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-script text-3xl text-ink">Adarsh Sahu</p>
          <p className="mt-1 text-sm text-ink/60">
            ML/AI Engineer in training — NIT Jamshedpur.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/addaarrssh"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub profile"
            className="rounded-full border-2 border-ink p-3 text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            <GithubIcon size={18} />
          </a>
          <a
            href="mailto:adarshprivate678@gmail.com"
            aria-label="Send email"
            className="rounded-full border-2 border-ink p-3 text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            <Mail size={18} />
          </a>
        </div>
      </div>

      <p className="border-t border-ink/10 py-4 text-center text-xs text-ink/50">
        © {year} Adarsh Sahu. All rights reserved.
      </p>
    </footer>
  );
}
