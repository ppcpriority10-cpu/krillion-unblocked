"use client";

import { useEffect } from "react";
import type { Tier } from "@/lib/scoring";
import { PixelSprite } from "./pixel/PixelSprite";
import { useGameSound } from "./ArcadeUI";

/* ============================================================
   PlayDaily-style full-screen rarity reveal — rebuilt from the
   recorded reference gameplay:

     [glowing pixel creature]
     PLANKTON                      ← big pixel title, tier colour
     COMMON ▮▯▯▯▯▯ RARE            ← 6 discrete segments lit to tier
     "Chess"                       ← the accepted answer
     •10 PTS • sink 100m •100 🐟   ← stats row (PTS in tier colour)
     Everyone said it. You drift.  ← one line of flavour
     [ NEXT ↓ ]                    ← pink button
   ============================================================ */

/** Segment colours, COMMON → RARE, straight from the reference bar. */
const BAR_SEGMENTS = ["#3E6FE8", "#39C6D6", "#59D9A4", "#F5A623", "#5C7FD6", "#B18CFF"];
const SEGMENT_OFF = "rgba(10, 26, 42, 0.9)";

/** 6-segment COMMON↔RARE bar lit up to the tier's level. */
export function RaritySegments({
  level,
  leftLabel,
  rightLabel,
  className,
  clean,
}: {
  /** 0..6 — how many segments are lit. */
  level: number;
  leftLabel: string;
  rightLabel: string;
  className?: string;
  clean?: boolean;
}) {
  return (
    <div
      className={className}
      role="img"
      aria-label={`${leftLabel} to ${rightLabel}: ${level} of 6`}
    >
      <div className={clean
        ? "flex items-center gap-2 font-game-ui text-[11px] font-bold tracking-[0.15em] text-white/60"
        : "flex items-center gap-2 font-pixel-ui text-[9px] font-bold tracking-[0.22em] text-white/55"}>
        <span>{leftLabel}</span>
        <div className="flex items-center gap-[3px]">
          {BAR_SEGMENTS.map((color, i) => {
            const lit = i < level;
            return (
              <span
                key={i}
                className={clean
                  ? "pd-anim-seg block h-2.5 w-[26px] rounded-full"
                  : "pd-anim-seg block h-[9px] w-[26px] rounded-[2px] border border-black/40"}
                style={{
                  background: lit ? color : SEGMENT_OFF,
                  boxShadow: lit ? `0 0 8px ${color}66` : "inset 0 1px 0 rgba(255,255,255,0.06)",
                  animationDelay: `${i * 55}ms`,
                }}
              />
            );
          })}
        </div>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

export function RarityReveal({
  tier,
  answer,
  mode,
  onNext,
  clean,
}: {
  tier: Tier;
  answer: string;
  /** "dive" = krillion, "climb" = noillirk */
  mode: "dive" | "climb";
  onNext: () => void;
  clean?: boolean;
}) {
  const { play } = useGameSound();

  /* NEXT also fires on Enter — the flow never stalls */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext]);

  const dive = mode === "dive";
  const noCatch = tier.points === 0;
  const moveM = tier.points * 10;
  const level = tier.barLevel ?? Math.max(1, Math.round(tier.rarity * 6));
  const moveLabel = noCatch
    ? dive
      ? "sink 0m"
      : "rise 0m"
    : dive
      ? `sink ${moveM}m`
      : `rise ${moveM}m`;

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-5 pb-6 text-center"
      role="status"
      aria-live="polite"
    >
      {/* deep veil behind the panel — flat dark like the reference, no blur */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onNext}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(3, 14, 25, 0.74)" }}
      />

      <div className="relative flex max-w-lg flex-col items-center gap-2">
        {/* glowing creature — smooth SVG fish in clean mode */}
        <span
          className="pd-anim-iconpop mb-1"
          aria-hidden="true"
          style={{ filter: `drop-shadow(0 0 14px ${tier.tone}88) drop-shadow(0 0 34px ${tier.tone}44)` }}
        >
          {clean ? (
            <svg width="84" height="52" viewBox="0 0 84 52" aria-hidden="true">
              <path
                d="M6 26 C 14 8, 34 4, 52 10 C 64 14, 74 20, 78 26 C 74 32, 64 38, 52 42 C 34 48, 14 44, 6 26 Z"
                fill={tier.tone}
              />
              <path
                d="M10 26 L 0 14 L 2 26 L 0 38 Z"
                fill={tier.tone}
                opacity="0.85"
              />
              <path
                d="M34 10 C 38 2, 48 2, 52 10 Z"
                fill={tier.tone}
                opacity="0.85"
              />
              <circle cx="62" cy="20" r="3.5" fill="#06202F" />
              <circle cx="63.2" cy="18.8" r="1.2" fill="#FFFFFF" opacity="0.9" />
              <ellipse cx="46" cy="34" rx="20" ry="5" fill="#FFFFFF" opacity="0.25" />
            </svg>
          ) : (
            <PixelSprite name={tier.icon} pixel={7} />
          )}
        </span>

        {/* rarity title — pixel font, tier colour, hard offset shadow */}
        <p
          className={clean
            ? "pd-anim-rise font-game-ui text-[34px] font-black leading-none tracking-[0.02em] sm:text-[42px]"
            : "pd-anim-rise font-pixel text-[30px] font-bold leading-none tracking-[0.08em] sm:text-[38px]"}
          style={{
            color: tier.tone,
            animationDelay: "50ms",
            textShadow: clean ? "0 4px 24px rgba(0,0,0,0.5)" : "3px 3px 0 rgba(2, 10, 18, 0.9)",
          }}
        >
          {tier.name.toUpperCase()}
        </p>

        {/* segmented COMMON ↔ RARE meter */}
        <div className="pd-anim-rise mt-2" style={{ animationDelay: "140ms" }}>
          <RaritySegments
            level={level}
            leftLabel={dive ? "COMMON" : "RARE"}
            rightLabel={dive ? "RARE" : "COMMON"}
            clean={clean}
          />
        </div>

        {/* the accepted answer */}
        <p
          className={clean
            ? "pd-anim-rise mt-2 font-game-ui text-[18px] font-bold text-white sm:text-[20px]"
            : "pd-anim-rise mt-2 font-game-mono text-[16px] font-bold text-white sm:text-[18px]"}
          style={{ animationDelay: "220ms", textShadow: clean ? "0 2px 12px rgba(0,0,0,0.6)" : "2px 2px 0 rgba(2,10,18,0.8)" }}
        >
          &ldquo;{answer || "no catch"}&rdquo;
        </p>

        {/* stats row — •60 PTS • sink 600m •600 [fish] */}
        <p
          className={clean
            ? "pd-anim-rise mt-1 flex flex-wrap items-center justify-center gap-x-2 font-game-ui text-[13px] font-extrabold tracking-[0.06em]"
            : "pd-anim-rise mt-1 flex flex-wrap items-center justify-center gap-x-2 font-pixel-ui text-[11px] font-bold tracking-[0.16em]"}
          style={{ animationDelay: "300ms" }}
        >
          <span style={{ color: tier.tone }}>{noCatch ? "•0 PTS" : `•${tier.points} PTS`}</span>
          <span className="text-white/90">·</span>
          <span className="text-white">{moveLabel}</span>
          <span className="text-white/90">·</span>
          <span className="inline-flex items-center gap-1.5 text-[#7DE9F7]">
            {noCatch ? "•0" : `•${tier.points * 10}`}
            {clean ? (
              <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true">
                <path d="M1 5 C 3 1, 7 1, 10 3 L 13 1 L 12 5 L 13 9 L 10 7 C 7 9, 3 9, 1 5 Z" fill="currentColor" />
              </svg>
            ) : (
              <PixelSprite name="foodFish" pixel={2} />
            )}
          </span>
        </p>

        {/* flavour */}
        <p
          className={clean
            ? "pd-anim-rise mt-1.5 font-game-ui text-[14px] font-medium text-white/65"
            : "pd-anim-rise mt-1.5 font-game-mono text-[13px] text-white/60"}
          style={{ animationDelay: "380ms" }}
        >
          {tier.flavor}
        </p>

        <div className="pd-anim-rise mt-5" style={{ animationDelay: "460ms" }}>
          <button
            type="button"
            onClick={() => { play("click"); onNext(); }}
            className={clean
              ? "inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#FF5C8A] to-[#F4407A] px-10 font-game-ui text-[14px] font-extrabold tracking-[0.12em] text-white shadow-[0_10px_30px_rgba(244,64,122,0.45)] transition-all hover:brightness-110 active:scale-[0.98]"
              : "inline-flex min-h-[52px] items-center justify-center gap-3 rounded-[8px] border-2 border-[#C22B60] bg-[#F4407A] px-10 font-pixel-ui text-[13px] font-bold tracking-[0.24em] text-white shadow-[0_4px_0_0_#0B2233] transition-all hover:brightness-110 active:translate-y-[4px] active:shadow-none"}
          >
            <span>NEXT</span>
            <span aria-hidden="true">{dive ? "▼" : "▲"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
