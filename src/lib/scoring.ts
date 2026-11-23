/**
 * Scoring rules shared across games.
 *
 * Tiered bank: every answer belongs to one of 6 rarity tiers.
 * Krillion (rare wins): krillion = 100 pts, plankton = 10 pts.
 * Noillirk (common wins): the same tiers, read from the top —
 * plankton = 100 pts, krillion = 10 pts.
 */

export interface Tier {
  name: string;
  points: number;
  /** Tailwind classes for the badge pill. */
  badge: string;
  /** Spoiler-free emoji square used in the share text. */
  emoji: string;
  /** Short hint shown under the badge after answering. */
  hint: string;
  /** 0 = the most common answer, 1 = the rarest — the reveal meter marker. */
  rarity: number;
  /** Pixel-sprite key rendered above the reveal title. */
  icon: string;
  /** Colour of the big reveal title. */
  tone: string;
  /** One-line flavour text under the points row. */
  flavor: string;
  /** 1..6 — how many segments of the COMMON↔RARE bar light up (0 = no catch). */
  barLevel?: number;
}

export const KRILLION_TIERS: Tier[] = [
  { name: "One in a Krillion", points: 100, badge: "border-violet-300 bg-violet-100 text-violet-900", emoji: "🟪", hint: "Almost nobody says this — spectacular.", rarity: 0.97, icon: "crown", tone: "#B18CFF", flavor: "Almost nobody said it. You dive where no one looks.", barLevel: 6 },
  { name: "Deep Cut", points: 85, badge: "border-sky-300 bg-sky-100 text-sky-900", emoji: "🟦", hint: "A genuinely rare answer. Well dived.", rarity: 0.8, icon: "jelly", tone: "#7DA2FF", flavor: "A deep cut. The school never even saw it.", barLevel: 5 },
  { name: "Rare", points: 60, badge: "border-emerald-300 bg-emerald-100 text-emerald-900", emoji: "🟩", hint: "Nicely uncommon — the crowd missed it.", rarity: 0.62, icon: "jellyGold", tone: "#F5A623", flavor: "Few would reach for that.", barLevel: 4 },
  { name: "Schooler", points: 30, badge: "border-amber-300 bg-amber-100 text-amber-900", emoji: "🟨", hint: "A solid mid-frequency answer.", rarity: 0.42, icon: "school", tone: "#59D9A4", flavor: "Right in the middle of the school.", barLevel: 3 },
  { name: "Too Clever", points: 15, badge: "border-orange-300 bg-orange-100 text-orange-900", emoji: "🟧", hint: "More common than you thought.", rarity: 0.25, icon: "school", tone: "#39C6D6", flavor: "The clever pick. The school thought of it too.", barLevel: 2 },
  { name: "Plankton", points: 10, badge: "border-stone-300 bg-stone-100 text-stone-800", emoji: "⬜", hint: "Everyone floats this one up.", rarity: 0.08, icon: "plankton", tone: "#6E8FF0", flavor: "Everyone said it. You drift.", barLevel: 1 },
  { name: "No Catch", points: 0, badge: "border-zinc-300 bg-zinc-200 text-zinc-700", emoji: "⬛", hint: "Not on our survey board. Ouch!", rarity: 0.5, icon: "noCatch", tone: "#8FA6BC", flavor: "Not on the board. The current takes it.", barLevel: 0 },
];

export const NOILLIRK_TIERS: Tier[] = [
  { name: "Crowd Favourite", points: 100, badge: "border-sky-300 bg-sky-100 text-sky-900", emoji: "🟦", hint: "The answer the whole world gives.", rarity: 0.97, icon: "plane", tone: "#F4407A", flavor: "Top of the crowd. You ride the jet stream.", barLevel: 6 },
  { name: "Headline Act", points: 85, badge: "border-teal-300 bg-teal-100 text-teal-900", emoji: "🟩", hint: "Right at the top of the crowd's mind.", rarity: 0.8, icon: "plane", tone: "#FFB05C", flavor: "Top four. So close to the very top.", barLevel: 5 },
  { name: "Open Skies", points: 60, badge: "border-emerald-300 bg-emerald-100 text-emerald-900", emoji: "🟨", hint: "A comfortably popular answer.", rarity: 0.62, icon: "birdFlock", tone: "#59D9A4", flavor: "Comfortably popular. Clear skies ahead.", barLevel: 4 },
  { name: "Gentle Breeze", points: 30, badge: "border-amber-300 bg-amber-100 text-amber-900", emoji: "🟧", hint: "Somewhere mid-pack of the crowd.", rarity: 0.42, icon: "birdFlock", tone: "#FFD98A", flavor: "Mid-pack of the crowd. A steady breeze.", barLevel: 3 },
  { name: "Drifting Cloud", points: 15, badge: "border-orange-300 bg-orange-100 text-orange-900", emoji: "🟪", hint: "Only a few others said this.", rarity: 0.25, icon: "birdFlock", tone: "#B18CFF", flavor: "Only a few others said it. You drift.", barLevel: 2 },
  { name: "Faint Whisper", points: 10, badge: "border-stone-300 bg-stone-100 text-stone-800", emoji: "⬜", hint: "A lonely answer today.", rarity: 0.08, icon: "featherSprig", tone: "#A9B8FF", flavor: "A lonely answer today. Barely a whisper.", barLevel: 1 },
  { name: "No Catch", points: 0, badge: "border-zinc-300 bg-zinc-200 text-zinc-700", emoji: "⬛", hint: "Not on our survey board. Ouch!", rarity: 0.5, icon: "noCatch", tone: "#8FA6BC", flavor: "Not on the board. The wind drops you.", barLevel: 0 },
];

export type ScoringMode = "rare" | "common";

/** Tier keys in the bank, rarest first. */
export type TierKey =
  | "krillion"
  | "deepCut"
  | "rare"
  | "schooler"
  | "clever"
  | "plankton";

/** Tier order for "rarest first" (Krillion examples, rare mode). */
export const RARE_ORDER: TierKey[] = [
  "krillion",
  "deepCut",
  "rare",
  "schooler",
  "clever",
  "plankton",
];

/** Tier order for "most common first" (Noillirk examples, common mode). */
export const COMMON_ORDER: TierKey[] = [
  "plankton",
  "clever",
  "schooler",
  "rare",
  "deepCut",
  "krillion",
];

/** The "No Catch" tier (answer not on the board) for either mode. */
export function missedTier(mode: ScoringMode): Tier {
  return (mode === "rare" ? KRILLION_TIERS : NOILLIRK_TIERS)[6];
}

/**
 * Map a bank tier to its display Tier for a scoring mode.
 * Rare mode: krillion -> 100 pts ... plankton -> 10 pts.
 * Common mode (Noillirk): inverted — plankton -> 100 pts ... krillion -> 10 pts.
 */
export function tierForTierKey(key: TierKey, mode: ScoringMode): Tier {
  if (mode === "rare") {
    return KRILLION_TIERS[RARE_ORDER.indexOf(key)];
  }
  return NOILLIRK_TIERS[COMMON_ORDER.indexOf(key)];
}

/** Normalise a typed answer: lowercase, strip punctuation/articles/spaces. */
export function normalizeAnswer(raw: string): string {
  let s = raw.toLowerCase().trim();
  s = s.replace(/['’`]/g, "");
  s = s.replace(/[^a-z0-9 ]+/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  s = s.replace(/^(a|an|the) /, "");
  return s;
}

export type AnswerIndex = Map<string, TierKey>;

/** Build a lookup map from a prompt's tiers: answer -> tier key. */
export function buildAnswerIndex(tiers: {
  krillion: string[];
  deepCut: string[];
  rare: string[];
  schooler: string[];
  clever: string[];
  plankton: string[];
}): AnswerIndex {
  const map: AnswerIndex = new Map();
  for (const key of RARE_ORDER) {
    for (const answer of tiers[key]) {
      const norm = normalizeAnswer(answer);
      if (norm && !map.has(norm)) map.set(norm, key);
    }
  }
  return map;
}

const MISS = { tier: null as TierKey | null, matched: null as string | null };

/** Look up an answer with light plural tolerance (cat/cats, berry/berries). */
export function lookupAnswer(
  input: string,
  index: AnswerIndex
): { tier: TierKey | null; matched: string | null } {
  const typed = normalizeAnswer(input);
  if (!typed) return MISS;
  if (index.has(typed)) return { tier: index.get(typed) as TierKey, matched: typed };
  const variants = [`${typed}s`, `${typed}es`];
  if (typed.endsWith("s")) variants.push(typed.slice(0, -1));
  if (typed.endsWith("ies")) variants.push(`${typed.slice(0, -3)}y`);
  for (const v of variants) {
    if (index.has(v)) return { tier: index.get(v) as TierKey, matched: v };
  }
  return MISS;
}

/* ---------------- Word Hunt ---------------- */

export function wordPoints(len: number): number {
  if (len <= 3) return 1;
  if (len === 4) return 2;
  if (len === 5) return 4;
  if (len === 6) return 7;
  if (len === 7) return 11;
  return 15;
}

/* ---------------- Colour Memory ---------------- */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function rgbDistance(a: RGB, b: RGB): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/** 0–100 points: 100 = perfect match across the full RGB cube. */
export function colourMatchPoints(a: RGB, b: RGB): number {
  const d = rgbDistance(a, b);
  const accuracy = 100 - (d / 441.67) * 100;
  return Math.max(0, Math.round(accuracy));
}

/* ---------------- What's Your Guess? ---------------- */

/** Percentage accuracy: min/max of guess vs truth, 0–100. */
export function guessAccuracy(guess: number, truth: number): number {
  if (!Number.isFinite(guess) || guess <= 0 || truth <= 0) return 0;
  return (Math.min(guess, truth) / Math.max(guess, truth)) * 100;
}

export function guessPoints(guess: number, truth: number): number {
  return Math.round(guessAccuracy(guess, truth));
}

/** How many times too high/low the guess was — "10× too high". */
export function guessRatio(guess: number, truth: number): { factor: number; dir: "high" | "low" | "exact" } {
  if (!Number.isFinite(guess) || guess <= 0 || truth <= 0) return { factor: 0, dir: "exact" };
  const ratio = guess > truth ? guess / truth : truth / guess;
  if (Math.abs(guess - truth) / truth < 0.005) return { factor: 1, dir: "exact" };
  const rounded = ratio >= 100 ? Math.round(ratio) : Math.round(ratio * 10) / 10;
  return { factor: rounded, dir: guess > truth ? "high" : "low" };
}

/**
 * Position of a guess on a logarithmic scale bar centred on the truth.
 * Returns -1..1: 0 = exactly right, +1 = 100× too high, -1 = 100× too low.
 */
export function guessLogPos(guess: number, truth: number): number {
  if (!Number.isFinite(guess) || guess <= 0 || truth <= 0) return -1;
  const r = Math.max(1e-6, Math.min(1e6, guess / truth));
  return Math.max(-1, Math.min(1, Math.log10(r) / 2));
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
