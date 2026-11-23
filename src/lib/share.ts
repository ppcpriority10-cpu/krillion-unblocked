/** Spoiler-free share text builders + clipboard helper. */
import { SITE } from "./site";

export function clipboardCopy(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => legacyCopy(text));
  }
  return Promise.resolve(legacyCopy(text));
}

function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export const SITE_URL = SITE.url;

export function krillionShare(
  dateLong: string,
  score: number,
  emojis: string[],
  streak: number
): string {
  const depth = Math.min(7000, score * 10);
  return [
    `🦑 Krillion Unblocked — ${dateLong}`,
    `Depth: ${depth.toLocaleString("en-US")} m of 7,000 m · Score ${score}/700`,
    emojis.join(""),
    streak > 1 ? `Streak: ${streak} days` : "",
    `Play today's dive: ${SITE_URL}/krillion-unblocked`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function krillionCityShare(
  dateLong: string,
  score: number,
  emojis: string[],
  streak: number
): string {
  const height = Math.min(7000, score * 10);
  return [
    `🏙️ Krillion City — ${dateLong}`,
    `Height: ${height.toLocaleString("en-US")} m of 7,000 m · Score ${score}/700`,
    emojis.join(""),
    streak > 1 ? `Streak: ${streak} days` : "",
    `Play today's climb: ${SITE_URL}/krillion-city`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function noillirkShare(
  dateLong: string,
  score: number,
  emojis: string[]
): string {
  const altitude = Math.min(7000, score * 10);
  return [
    `🎈 Noillirk — ${dateLong}`,
    `Altitude: ${altitude.toLocaleString("en-US")} m · Score ${score}/700`,
    emojis.join(""),
    `Play today's climb: ${SITE_URL}/noillirk`,
  ].join("\n");
}

export function wordHuntShare(
  dateLong: string,
  score: number,
  words: number,
  longest: string
): string {
  return [
    `🔤 Word Hunt — ${dateLong}`,
    `Score ${score} pts · ${words} word${words === 1 ? "" : "s"} found${longest ? ` · Longest: ${longest.toUpperCase()}` : ""}`,
    `Play today's grid: ${SITE_URL}/word-hunt`,
  ].join("\n");
}

export function guessShare(
  dateLong: string,
  score: number,
  avgAccuracy: number
): string {
  return [
    `🎯 What's Your Guess? — ${dateLong}`,
    `Score ${score}/500 · Average accuracy ${avgAccuracy}%`,
    `Play today's questions: ${SITE_URL}/whats-your-guess`,
  ].join("\n");
}

export function colourShare(
  dateLong: string,
  score: number,
  bestRound: number
): string {
  return [
    `🎨 Colour Memory — ${dateLong}`,
    `Score ${score}/500 · Best round ${bestRound}%`,
    `Play today's colours: ${SITE_URL}/colour-memory`,
  ].join("\n");
}

export function sequenceShare(score: number, best: number, isNewBest: boolean): string {
  return [
    `🧠 Sequence${isNewBest ? " — new personal best!" : ""}`,
    `I repeated a pattern of ${score} flash${score === 1 ? "" : "es"} from memory.${best > 0 ? ` Personal best: ${best}.` : ""}`,
    `Play: ${SITE_URL}/sequence`,
  ].join("\n");
}
