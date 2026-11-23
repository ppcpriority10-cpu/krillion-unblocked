import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { GAMES } from "@/data/games";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <Logo size={64} />
      <p className="mt-6 font-mono text-sm font-bold uppercase tracking-[0.2em] text-steel">
        Error 404 · Lost at sea
      </p>
      <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        This page sank without a trace
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        The page you were diving for does not exist — or it swam away. The games are all
        still there, though, and one of them resets tonight.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back to the homepage
        </Link>
        <Link
          href="/krillion-unblocked"
          className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-steel/40 hover:text-steel"
        >
          Play today&apos;s dive
        </Link>
      </div>
      <div className="mt-12 w-full rounded-xl border border-border bg-muted/40 p-6 text-left">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Or jump straight into a game
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {GAMES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/${g.slug}`}
                className="inline-block rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition-colors hover:border-steel/40 hover:text-steel"
              >
                {g.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
