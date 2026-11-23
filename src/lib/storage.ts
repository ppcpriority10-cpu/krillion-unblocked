/**
 * Safe localStorage helpers. Everything the site remembers lives in the
 * visitor's own browser — there is no server, no account and no tracking.
 */

const NS = "krillion";

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked — fail silently, the game still plays
  }
}

/** Key for a finished daily game, e.g. krillion:krillion:d:2026-11-10 */
export function dailyResultKey(game: string, dateKey: string): string {
  return `${NS}:${game}:d:${dateKey}`;
}

export interface DailyRecord {
  date: string;
  total: number;
  max: number;
}

export function loadDailyRecord<T extends DailyRecord>(
  game: string,
  dateKey: string
): T | null {
  return readJSON<T | null>(dailyResultKey(game, dateKey), null);
}

export function saveDailyRecord(game: string, record: DailyRecord): void {
  writeJSON(dailyResultKey(game, record.date), record);
}

export interface Streak {
  last: string; // date key of the last completed daily
  count: number;
}

function yesterdayOf(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** Update and return the streak after completing the daily on dateKey. */
export function bumpStreak(game: string, dateKey: string): Streak {
  const key = `${NS}:${game}:streak`;
  const current = readJSON<Streak>(key, { last: "", count: 0 });
  let next: Streak;
  if (current.last === dateKey) {
    next = current;
  } else if (current.last === yesterdayOf(dateKey)) {
    next = { last: dateKey, count: current.count + 1 };
  } else {
    next = { last: dateKey, count: 1 };
  }
  writeJSON(key, next);
  return next;
}

export function loadStreak(game: string): Streak {
  return readJSON<Streak>(`${NS}:${game}:streak`, { last: "", count: 0 });
}

export function loadBest(game: string): number {
  return readJSON<number>(`${NS}:${game}:best`, 0);
}

export function saveBestIfHigher(game: string, value: number): number {
  const best = loadBest(game);
  if (value > best) {
    writeJSON(`${NS}:${game}:best`, value);
    return value;
  }
  return best;
}
