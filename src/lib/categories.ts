/**
 * Deterministic fun category label for a prompt — gives the question
 * cards the PlayDaily "WORDPLAY / FILM & TV" flavour.
 */

const CATEGORIES = [
  "WORDPLAY",
  "EVERYDAY LIFE",
  "FOOD & DRINK",
  "ANIMAL KINGDOM",
  "SCREEN & SONG",
  "AROUND TOWN",
  "BIG IF TRUE",
];

export function categoryFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return CATEGORIES[h % CATEGORIES.length];
}

/* ---------- difficulty flavour (playdaily-style prompt label) ---------- */

const DIFFICULTIES = ["VERY EASY", "EASY", "MEDIUM", "HARD"] as const;

/**
 * Deterministic difficulty label for a prompt — visual flavour only,
 * stable per prompt id (same prompt always shows the same label).
 */
export function difficultyFor(id: string): (typeof DIFFICULTIES)[number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 37 + id.charCodeAt(i)) >>> 0;
  return DIFFICULTIES[h % DIFFICULTIES.length];
}

/* ---------- estimation-question flavour (fermi style) ---------- */

const GUESS_RULES: [RegExp, string, string][] = [
  [/food|drink|eat|cook|soda|coffee|pizza|sugar|calorie/i, "Food and drink", "utensils"],
  [/space|moon|star|planet|sun|orbit|rocket|mars/i, "Space", "planet"],
  [/animal|bird|fish|dog|cat|insect|shark|whale/i, "Animals", "paw"],
  [/city|country|build|street|bridge|house|room/i, "Places", "map"],
  [/human|body|sleep|walk|hair|heart|born/i, "People", "person"],
  [/time|day|year|hour|minute|age|old/i, "Time", "clock"],
  [/water|ocean|sea|rain|river|lake/i, "Nature", "droplet"],
];

export function guessCategory(question: string): { label: string; icon: string } {
  for (const [re, label, icon] of GUESS_RULES) {
    if (re.test(question)) return { label, icon };
  }
  return { label: "Big if true", icon: "sparkles" };
}
