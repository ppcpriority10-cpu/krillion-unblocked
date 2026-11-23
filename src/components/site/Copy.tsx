import Link from "next/link";
import type { ReactNode } from "react";
import { GAMES } from "@/data/games";

/** Styled h2 for long-form copy sections — editorial with a hairline rule. */
export function SectionTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="mt-14 scroll-mt-24 border-b border-border pb-3 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
    >
      {children}
    </h2>
  );
}

/** Q/A pair used in on-page FAQs. */
export function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="border-b border-border pb-5">
      <h3 className="font-serif text-lg font-bold text-foreground">{q}</h3>
      <div className="mt-2 space-y-2 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

/** Cross-links to the other games (internal linking + discovery). */
export function MoreGames({ exclude }: { exclude: string[] }) {
  const others = GAMES.filter((g) => !exclude.includes(g.slug));
  return (
    <div className="mt-14 rounded-xl border border-border bg-card p-6">
      <h2 className="font-serif text-xl font-bold tracking-tight text-foreground">
        More free games to play
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Every game is free, needs no download, and works on your phone.
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {others.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/${g.slug}`}
              className="inline-block rounded-full border border-border bg-muted px-4 py-2 text-sm font-bold text-foreground transition-colors hover:border-steel/40 hover:text-steel"
            >
              {g.name} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Shared table shell for scoring/rule tables — hairline editorial style. */
export function CopyTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-muted">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border bg-card">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Paragraph with comfortable reading measure. */
export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
      {children}
    </p>
  );
}

/** Numbered/bulleted step list. */
export function Steps({ items, ordered = true }: { items: ReactNode[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={`mt-4 max-w-3xl space-y-3 text-[15px] leading-relaxed text-muted-foreground ${
        ordered ? "list-decimal" : "list-disc"
      } space-y-3 pl-5 marker:text-steel`}
    >
      {items.map((item, i) => (
        <li key={i} className="pl-1">
          {item}
        </li>
      ))}
    </Tag>
  );
}

/** Bulleted tips with bold lead-in. */
export function Tips({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ul className="mt-5 space-y-4">
      {items.map((t) => (
        <li key={t.title} className="rounded-xl border border-border bg-card p-4">
          <p className="font-serif font-bold text-foreground">{t.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {t.body}
          </p>
        </li>
      ))}
    </ul>
  );
}
