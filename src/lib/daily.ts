/**
 * Date-based seeding helpers.
 * Daily content is derived from the visitor's LOCAL date so that the
 * challenge resets at local midnight, and every visitor who opens the
 * site on the same calendar day gets identical content.
 */

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** FNV-1a — turns a date string into a 32-bit seed. */
export function seedFromString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small, fast, deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(arr: readonly T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** Deterministic daily pick — same date string, same picks, for everyone. */
export function pickDaily<T>(
  arr: readonly T[],
  count: number,
  dateKey: string
): T[] {
  const rng = mulberry32(seedFromString(`krillion:${dateKey}`));
  return shuffled(arr, rng).slice(0, count);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-11-10" -> "November 10, 2026" */
export function formatLongDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return dateKey;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function msUntilMidnight(now: Date = new Date()): number {
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  return Math.max(0, next.getTime() - now.getTime());
}

/** ms -> "04:12:37" */
export function countdownLabel(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function yesterdayKey(d: Date = new Date()): string {
  return todayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
}

/** Site launch date — the daily edition count starts here. */
export const LAUNCH_KEY = "2025-09-01";

/** Days since launch — today's daily edition number (1-based). */
export function dailyNumber(d: Date = new Date()): number {
  const launch = new Date(`${LAUNCH_KEY}T00:00:00`);
  const today = new Date(`${todayKey(d)}T00:00:00`);
  return Math.max(1, Math.round((today.getTime() - launch.getTime()) / 86400000));
}
