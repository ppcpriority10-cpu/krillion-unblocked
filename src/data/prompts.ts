/**
 * Krillion / Noillirk prompt bank — tiered schema (2,555 prompts).
 *
 * Each prompt has 13 answers split into 6 rarity tiers:
 *   krillion  (2) — the rarest answers, almost nobody says them
 *   deepCut   (2)
 *   rare      (2)
 *   schooler  (2)
 *   clever    (2)
 *   plankton  (3) — the most obvious answers, everyone says them
 *
 * Krillion scores rare-wins (krillion = 100 pts); Noillirk inverts the
 * map (plankton = 100 pts). See `tierForTierKey` in `@/lib/scoring`.
 *
 * Daily decks are CURATED, not shuffled: `daily-sets.json` deals the
 * whole bank round-robin over 365 days x 7 prompts, so no prompt
 * repeats within the year. All three answer games (Krillion, Noillirk,
 * Krillion City) share the same 7 prompts each day — intentional hub
 * design, decided by the boss (see daily-sets note).
 */

import bank from "./prompts-bank.json";
import dailySets from "./daily-sets.json";

export type TierKey =
  | "krillion"
  | "deepCut"
  | "rare"
  | "schooler"
  | "clever"
  | "plankton";

export interface PromptTiers {
  krillion: string[];
  deepCut: string[];
  rare: string[];
  schooler: string[];
  clever: string[];
  plankton: string[];
}

export interface PromptEntry {
  id: string;
  text: string;
  category: string;
  tiers: PromptTiers;
}

export const PROMPTS: PromptEntry[] = bank as unknown as PromptEntry[];

/** Day index 0–364 → 7 prompt ids (curated deal, see daily-sets.json). */
const DAILY_SETS: string[][] = dailySets as unknown as string[][];

const BY_ID = new Map<string, PromptEntry>(
  PROMPTS.map((p) => [p.id, p] as [string, PromptEntry])
);

/** Day-of-year (1-based) for a local YYYY-MM-DD date key. */
export function dayOfYear(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return 1;
  const start = Date.UTC(y, 0, 0);
  const day = Date.UTC(y, m - 1, d);
  return Math.floor((day - start) / 86400000);
}

/**
 * The curated daily 7 for a date key — the same set for every answer
 * game that day. Leap-year day 366 reuses Day 1's set (mod 365).
 */
export function dailyPrompts(dateKey: string): PromptEntry[] {
  const idx = (dayOfYear(dateKey) - 1) % 365;
  const ids = DAILY_SETS[idx] ?? [];
  return ids
    .map((id) => BY_ID.get(id))
    .filter((p): p is PromptEntry => Boolean(p));
}
