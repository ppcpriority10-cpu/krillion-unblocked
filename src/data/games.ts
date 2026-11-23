import type { GameIconName } from "@/components/site/GameIcon";
import type { GameArtKind } from "@/components/site/GameArt";

export type GameCategory = "Answer Games" | "Word & Puzzle" | "Brain Games";

export interface GameMeta {
  /** URL path segment, e.g. "krillion-unblocked" -> /krillion-unblocked */
  slug: string;
  name: string;
  icon: GameIconName;
  category: GameCategory;
  tagline: string;
  description: string;
  badge: "Daily" | "Unlimited";
  /** Card icon chip gradient (literal Tailwind classes). */
  chip: string;
  /** Illustrated key art scene shown on the card thumbnail. */
  artKind: GameArtKind;
}

export const GAMES: GameMeta[] = [
  {
    slug: "krillion-unblocked",
    name: "Krillion Unblocked",
    icon: "squid",
    category: "Answer Games",
    tagline: "The rarer your answer, the deeper you dive.",
    description:
      "Seven prompts, 25 seconds each. Give the most UNCOMMON answer you can think of — obvious picks sink, deep cuts score. One attempt a day.",
    badge: "Daily",
    chip: "bg-gradient-to-br from-cyan-500 to-sea-800",
    artKind: "ocean",
  },
  {
    slug: "noillirk",
    name: "Noillirk",
    icon: "balloon",
    category: "Answer Games",
    tagline: "The reverse dive — most common answer wins.",
    description:
      "The same prompts, flipped upside down: the MOST popular answer scores highest. Think like the crowd and float to 7,000 metres of altitude.",
    badge: "Daily",
    chip: "bg-gradient-to-br from-sky-400 to-sky-700",
    artKind: "sky",
  },
  {
    slug: "krillion-city",
    name: "Krillion City",
    icon: "city",
    category: "Answer Games",
    tagline: "The rarer your answer, the higher you climb.",
    description:
      "Same daily prompts as Krillion, opposite direction: fly up the skyline from street level to the edge of space. Seven prompts, 25 seconds each, one attempt a day.",
    badge: "Daily",
    chip: "bg-gradient-to-br from-indigo-500 to-slate-800",
    artKind: "sky",
  },
  {
    slug: "word-hunt",
    name: "Word Hunt",
    icon: "grid",
    category: "Word & Puzzle",
    tagline: "Chase words across a 4×4 letter grid.",
    description:
      "Link neighbouring letters into words before the 90-second timer drains. Longer words score steeply — a fresh grid is dealt every day.",
    badge: "Daily",
    chip: "bg-gradient-to-br from-amber-400 to-orange-600",
    artKind: "meadow",
  },
  {
    slug: "whats-your-guess",
    name: "What's Your Guess?",
    icon: "gauge",
    category: "Brain Games",
    tagline: "How close can you get to the truth?",
    description:
      "Five estimation questions a day. Type a number, see the real answer and your accuracy — being 90% close scores 90 points.",
    badge: "Daily",
    chip: "bg-gradient-to-br from-emerald-400 to-emerald-700",
    artKind: "space",
  },
  {
    slug: "colour-memory",
    name: "Colour Memory",
    icon: "palette",
    category: "Brain Games",
    tagline: "Stare. Memorise. Recreate the exact colour.",
    description:
      "A colour flashes for three seconds, then vanishes. Recreate it with RGB sliders and score by how close your match lands. Five rounds a day.",
    badge: "Daily",
    chip: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    artKind: "studio",
  },
  {
    slug: "sequence",
    name: "Sequence",
    icon: "pulse",
    category: "Brain Games",
    tagline: "Watch the pattern. Repeat it. Repeat it longer.",
    description:
      "Coloured pads flash a growing pattern. Echo it back correctly and it grows by one. How long can your memory stretch? Unlimited play.",
    badge: "Unlimited",
    chip: "bg-gradient-to-br from-rose-400 to-rose-600",
    artKind: "arcade",
  },
];

export const GAME_CATEGORIES: { name: GameCategory; blurb: string }[] = [
  {
    name: "Answer Games",
    blurb: "Type one answer per prompt. Either dive for rare answers or think with the crowd.",
  },
  {
    name: "Word & Puzzle",
    blurb: "Letter grids and vocabulary chases against the clock.",
  },
  {
    name: "Brain Games",
    blurb: "Estimation, colour perception and pure memory training.",
  },
];

export function getGame(slug: string): GameMeta | undefined {
  return GAMES.find((g) => g.slug === slug);
}
