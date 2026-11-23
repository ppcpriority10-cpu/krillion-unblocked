"use client";

import { useState } from "react";
import { PROMPTS, type TierKey } from "@/data/prompts";
import {
  COMMON_ORDER,
  RARE_ORDER,
  tierForTierKey,
  type ScoringMode,
} from "@/lib/scoring";
import type { PromptResult } from "@/hooks/usePromptGame";
import { PixelSprite } from "./pixel/PixelSprite";

/* ============================================================
   Reference-style answers list for the finished screen:
   "▼ HIDE ANSWERS / OPEN A PROMPT TO SEE EXAMPLE ANSWERS",
   one row per prompt (number, creature, prompt, answer, points),
   each row expandable to show five example answers from the
   prompt's bank — the rarest for Krillion, the most common
   for Noillirk. "No catch" renders in hot pink.
   ============================================================ */

interface Example {
  text: string;
  points: number;
  tone: string;
}

function examplesFor(promptId: string, mode: ScoringMode): Example[] {
  const entry = PROMPTS.find((p) => p.id === promptId);
  if (!entry) return [];
  // Rarest 5 for Krillion (krillion 2 + deepCut 2 + rare 1),
  // most common 5 for Noillirk (plankton 3 + clever 2).
  const order = mode === "rare" ? RARE_ORDER : COMMON_ORDER;
  const rank = (k: TierKey) => order.indexOf(k);
  const all: { text: string; key: TierKey }[] = (
    Object.keys(entry.tiers) as TierKey[]
  ).flatMap((k) => entry.tiers[k].map((text) => ({ text, key: k })));
  return all
    .sort((a, b) => rank(a.key) - rank(b.key))
    .slice(0, 5)
    .map(({ text, key }) => {
      const tier = tierForTierKey(key, mode);
      return { text, points: tier.points, tone: tier.tone };
    });
}

export function ResultsLog({
  results,
  mode,
  clean,
}: {
  results: PromptResult[];
  mode: ScoringMode;
  clean?: boolean;
}) {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <button
          type="button"
          onClick={() => setHidden((v) => !v)}
          className={clean
            ? "font-game-ui text-[11px] font-extrabold tracking-[0.15em] text-white/75 transition-colors hover:text-white"
            : "font-pixel-ui text-[9px] font-bold tracking-[0.24em] text-white/70 transition-colors hover:text-white"}
        >
          {hidden ? "▶ SHOW ANSWERS" : "▼ HIDE ANSWERS"}
        </button>
        <span className={clean
          ? "font-game-ui text-[10px] font-semibold tracking-[0.1em] text-white/40"
          : "font-pixel-ui text-[8px] tracking-[0.18em] text-white/35"}>
          OPEN A PROMPT TO SEE EXAMPLE ANSWERS
        </span>
      </div>

      {!hidden && (
        <ol className="mt-2">
          {results.map((r, i) => {
            const isOpen = open === i;
            const examples = isOpen ? examplesFor(r.promptId, mode) : [];
            return (
              <li
                key={r.promptId}
                className="pd-anim-rise border-b border-white/8 py-2.5 last:border-0"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-3 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={clean
                    ? "w-4 shrink-0 text-right font-game-ui text-[12px] font-bold text-white/40"
                    : "w-4 shrink-0 text-right font-game-mono text-[11px] text-white/35"}>
                    {i + 1}
                  </span>
                  {clean ? (
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full"
                      style={{ background: r.tier.tone, boxShadow: `0 0 8px ${r.tier.tone}88` }}
                      aria-hidden="true"
                    />
                  ) : (
                    <PixelSprite name={r.tier.icon} pixel={2} />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={clean
                      ? "block truncate font-game-ui text-[10px] font-bold tracking-[0.12em] text-white/55"
                      : "block truncate font-pixel-ui text-[8px] tracking-[0.18em] text-white/50"}>
                      {r.promptText.toUpperCase()}
                    </span>
                    <span className={clean
                      ? "block truncate font-game-ui text-[14px] font-bold text-white"
                      : "block truncate font-game-mono text-[12px] font-bold text-white"}>
                      {r.answer ? (
                        r.answer
                      ) : (
                        <span className="text-[#F4407A]">No catch</span>
                      )}
                    </span>
                  </span>
                  <span
                    className={clean
                      ? "shrink-0 font-game-ui text-[13px] font-extrabold tabular-nums"
                      : "shrink-0 font-pixel-ui text-[11px] font-bold tabular-nums"}
                    style={{ color: r.tier.points === 0 ? "#8FA6BC" : r.tier.tone }}
                  >
                    {r.tier.points}
                  </span>
                  <span className={clean
                    ? "shrink-0 font-game-ui text-[10px] font-bold text-white/30"
                    : "shrink-0 font-pixel-ui text-[9px] text-white/25"}>
                    {isOpen ? "▼" : "▶"}
                  </span>
                </button>

                {isOpen && examples.length > 0 && (
                  <div className={clean
                    ? "ml-10 mt-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                    : "ml-10 mt-2 rounded-[6px] border border-white/10 bg-black/25 px-3 py-2"}>
                    <p className={clean
                      ? "font-game-ui text-[10px] font-bold tracking-[0.15em] text-white/45"
                      : "font-pixel-ui text-[8px] tracking-[0.22em] text-white/40"}>
                      {mode === "rare" ? "RAREST ANSWERS" : "MOST COMMON ANSWERS"}
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {examples.map((ex) => (
                        <li
                          key={ex.text}
                          className={clean
                            ? "flex items-center justify-between gap-3 font-game-ui text-[12px] font-semibold"
                            : "flex items-center justify-between gap-3 font-game-mono text-[10px]"}
                        >
                          <span className="truncate text-white/85">{ex.text}</span>
                          <span className="shrink-0 font-bold tabular-nums" style={{ color: ex.tone }}>
                            {ex.points} PTS
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
