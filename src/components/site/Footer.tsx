import Link from "next/link";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";
import { GAMES } from "@/data/games";

const resources = [
  { href: "/how-to-play", label: "How to Play" },
  { href: "/stories", label: "Stories" },
  { href: "/faq", label: "FAQ" },
  { href: "/unlimited", label: "Unlimited Mode" },
];

const company = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const legal = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="font-serif text-lg font-bold tracking-tight">
              Krillion <span className="text-steel">Unblocked</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm italic leading-relaxed text-muted-foreground">
            Seven original free browser games with a new daily challenge every midnight.
            No account, no download — your scores live in your browser.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            <a className="underline underline-offset-2 hover:text-foreground" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </p>
        </div>

        <nav aria-label="Games">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Games</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {GAMES.map((g) => (
              <li key={g.slug}>
                <Link className="text-foreground/75 transition-colors hover:text-steel" href={`/${g.slug}`}>
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Resources">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Resources</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {resources.map((l) => (
              <li key={l.href}>
                <Link className="text-foreground/75 transition-colors hover:text-steel" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company and legal">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Company &amp; Legal</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[...company, ...legal].map((l) => (
              <li key={l.href}>
                <Link className="text-foreground/75 transition-colors hover:text-steel" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Playable anywhere a browser goes. Always follow your school or workplace network rules.</p>
        </div>
      </div>
    </footer>
  );
}
