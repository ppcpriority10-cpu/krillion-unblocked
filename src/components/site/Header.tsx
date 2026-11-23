"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo, LogoWordmark } from "./Logo";
import { GameIcon } from "./GameIcon";
import { GAMES } from "@/data/games";

/** Games shown as icon pills in the floating bar (playdaily-style shortcuts). */
const SHORTCUTS = GAMES.slice(0, 3);
const EXTRA_GAMES = GAMES.length - SHORTCUTS.length;

const NAV = [
  { href: "/stories", label: "Stories" },
  { href: "/how-to-play", label: "How to Play" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={`mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 rounded-2xl border px-3 transition-shadow sm:rounded-full sm:px-5 ${
          scrolled
            ? "border-border bg-white/92 shadow-[0_10px_30px_-12px_rgba(10,31,48,0.25)] backdrop-blur"
            : "border-transparent bg-white/70 backdrop-blur"
        }`}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Krillion Unblocked home"
          onClick={() => setOpen(false)}
        >
          <Logo size={32} />
          <LogoWordmark />
        </Link>

        {/* game shortcut pills — the playdaily signature */}
        <nav
          className="hidden min-w-0 items-center gap-1 rounded-full border border-border bg-muted/60 p-1.5 lg:flex"
          aria-label="Game shortcuts"
        >
          {SHORTCUTS.map((g) => (
            <Link
              key={g.slug}
              href={`/${g.slug}`}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold text-foreground/80 transition-colors hover:bg-white hover:text-foreground hover:shadow-sm"
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${g.chip} text-white`}>
                <GameIcon name={g.icon} className="h-3.5 w-3.5" />
              </span>
              <span className="max-w-[120px] truncate">{g.name}</span>
            </Link>
          ))}
          <Link
            href="/#games"
            className="flex items-center rounded-full px-2.5 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            +{EXTRA_GAMES}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/krillion-unblocked"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 hover:shadow-md sm:inline-flex sm:items-center sm:gap-1.5"
          >
            Play <span aria-hidden="true">›</span>
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="mx-auto mt-2 max-w-5xl rounded-2xl border border-border bg-white/97 p-3 shadow-xl backdrop-blur lg:hidden"
          aria-label="Mobile navigation"
        >
          <p className="px-2 pb-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Games
          </p>
          {GAMES.map((g) => (
            <Link
              key={g.slug}
              href={`/${g.slug}`}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-[15px] font-semibold text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${g.chip} text-white`}>
                <GameIcon name={g.icon} className="h-4 w-4" />
              </span>
              {g.name}
            </Link>
          ))}
          <div className="my-2 border-t border-border" />
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-xl px-3 py-2.5 text-[15px] font-semibold text-foreground/80 hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/krillion-unblocked"
            className="mt-2 block rounded-xl bg-primary px-3 py-3 text-center text-[15px] font-bold text-primary-foreground"
            onClick={() => setOpen(false)}
          >
            Play today&apos;s dive
          </Link>
        </nav>
      )}
    </header>
  );
}
