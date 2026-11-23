"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { mulberry32, seedFromString, formatLongDate, todayKey } from "@/lib/daily";
import { colourMatchPoints, type RGB } from "@/lib/scoring";
import {
  loadDailyRecord,
  saveDailyRecord,
  type DailyRecord,
} from "@/lib/storage";
import { colourShare } from "@/lib/share";
import { MidnightCountdown } from "@/components/game/MidnightCountdown";
import { ShareBox } from "@/components/game/ShareBox";
import { SceneAmbience } from "@/components/game/SceneAmbience";
import { SoundProvider, useGameSound } from "@/components/game/ArcadeUI";

/* ============================================================
   Colour Memory — dark colour-lab style.
   Illustrated studio backdrop, one dark lab card, glowing
   swatches and RGB sliders. Stare · memorise · recreate.
   ============================================================ */

type Phase = "boot" | "locked" | "ready" | "show" | "input" | "result" | "finished";

interface ColourRecord extends DailyRecord {
  best?: number;
}

const SHOW_SECONDS = 3;

function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function makeTargets(dateKey: string, rounds: number): RGB[] {
  const rng = mulberry32(seedFromString(`colour:${dateKey}`));
  const out: RGB[] = [];
  for (let i = 0; i < rounds; i++) {
    const h = rng() * 360;
    const s = 0.35 + rng() * 0.6;
    const l = 0.25 + rng() * 0.5;
    out.push(hslToRgb(h, s, l));
  }
  return out;
}

const css = (c: RGB) => `rgb(${c.r}, ${c.g}, ${c.b})`;

/** playdaily-style pill button (blue, dark border, offset shadow) */
function PillButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const { play } = useGameSound();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          play("click");
          onClick?.();
        }
      }}
      className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border-2 border-[#14508C] bg-[#4E9BE8] px-7 text-sm font-bold text-white shadow-[0_3px_0_0_#14508C] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none disabled:opacity-55 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

function ColourMemoryInner() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [dateKey, setDateKey] = useState("");
  const [targets, setTargets] = useState<RGB[]>([]);
  const [round, setRound] = useState(0);
  const [sliders, setSliders] = useState<RGB>({ r: 128, g: 128, b: 128 });
  const [points, setPoints] = useState<number[]>([]);
  const [last, setLast] = useState<{ target: RGB; guess: RGB; pts: number } | null>(null);
  const [showLeft, setShowLeft] = useState(SHOW_SECONDS);
  const [record, setRecord] = useState<ColourRecord | null>(null);
  const [shareText, setShareText] = useState("");
  const { play } = useGameSound();

  /* boot */
  useEffect(() => {
    const dk = todayKey();
    setDateKey(dk);
    const rec = loadDailyRecord<ColourRecord>("colour", dk);
    if (rec) {
      setRecord(rec);
      setPhase("locked");
      return;
    }
    setTargets(makeTargets(dk, 5));
    setPhase("ready");
  }, []);

  /* 3-second reveal countdown */
  useEffect(() => {
    if (phase !== "show") return;
    const started = Date.now();
    setShowLeft(SHOW_SECONDS);
    play("flip");
    const id = window.setInterval(() => {
      const left = Math.max(0, SHOW_SECONDS - (Date.now() - started) / 1000);
      setShowLeft(left);
      if (left <= 0) {
        window.clearInterval(id);
        setSliders({ r: 128, g: 128, b: 128 });
        setPhase("input");
      }
    }, 100);
    return () => window.clearInterval(id);
     
  }, [phase, round]);

  const total = useMemo(() => points.reduce((s, p) => s + p, 0), [points]);
  const best = useMemo(() => (points.length ? Math.max(...points) : 0), [points]);

  /* persist + share on finish */
  useEffect(() => {
    if (phase !== "finished") return;
    play("chime");
    const rec: ColourRecord = { date: dateKey, total, max: 500, best };
    saveDailyRecord("colour", rec);
    setRecord(rec);
    setShareText(colourShare(formatLongDate(dateKey), total, best));
     
  }, [phase]);

  const target = targets[round];

  const submitMatch = () => {
    if (phase !== "input" || !target) return;
    const pts = colourMatchPoints(target, sliders);
    setLast({ target, guess: sliders, pts });
    setPoints((p) => [...p, pts]);
    setPhase("result");
    play(pts >= 70 ? "good" : pts >= 40 ? "pop" : "bad");
  };

  const nextRound = () => {
    if (round + 1 >= targets.length) {
      setPhase("finished");
    } else {
      setRound((r) => r + 1);
      setPhase("show");
    }
  };

  const sliderRows: { key: keyof RGB; label: string; track: string }[] = [
    { key: "r", label: "Red", track: "linear-gradient(to right, #000, #f00)" },
    { key: "g", label: "Green", track: "linear-gradient(to right, #000, #0f0)" },
    { key: "b", label: "Blue", track: "linear-gradient(to right, #000, #00f)" },
  ];

  return (
    <section
      className="relative w-full bg-white"
      style={{ minHeight: "max(560px, calc(100vh - 76px))" }}
      aria-label="Colour Memory game"
    >
      <SceneAmbience kind="studio" />
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center px-4 py-6 sm:py-8">
        <h1 className="font-serif text-[30px] font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(16,10,30,0.6)]">Colour Memory</h1>
        <p className="mt-1 text-center text-[15px] font-medium text-white/95 drop-shadow-[0_1px_6px_rgba(16,10,30,0.55)]">
          Stare, memorise, recreate — five colours a day.
        </p>

        {(phase === "show" || phase === "input" || phase === "result") && (
          <div className="pd-chip mt-3 flex items-center justify-center gap-6 rounded-2xl px-6 py-2.5">
            <span className="text-center">
              <span className="block font-mono text-2xl font-bold tabular-nums text-[#C9B4F5]">
                {round + 1}/{targets.length || 5}
              </span>
              <span className="block text-[10px] font-bold tracking-[0.2em] text-white/60">ROUND</span>
            </span>
            <span className="h-9 w-px bg-white/25" aria-hidden="true" />
            <span className="text-center">
              <span className="block font-mono text-2xl font-bold tabular-nums text-white">{total}</span>
              <span className="block text-[10px] font-bold tracking-[0.2em] text-white/60">SCORE</span>
            </span>
          </div>
        )}

        {/* the lab card */}
        <div
          className="mt-4 w-full max-w-[430px] rounded-[22px] border-2 border-[#0E0A18] p-4"
          style={{
            background: "linear-gradient(180deg,#221C33 0%,#171221 100%)",
            boxShadow:
              "inset 0 2px 12px rgba(0,0,0,0.45), 0 4px 0 0 #0E0A18, 0 20px 40px -20px rgba(16,10,30,0.7)",
          }}
        >
          {/* boot */}
          {phase === "boot" && (
            <div className="flex min-h-[380px] items-center justify-center">
              <div className="h-10 w-40 animate-pulse rounded-lg bg-white/15" />
            </div>
          )}

          {/* locked */}
          {phase === "locked" && record && (
            <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
              <p className="text-xs font-bold tracking-[0.2em] text-[#C9B4F5]">COLOURS MATCHED</p>
              <p className="mt-3 font-serif text-3xl font-black text-white">
                {record.total}
                <span className="text-lg text-white/50"> / 500</span>
              </p>
              <p className="mt-1 text-sm text-[#B7ABD4]">
                Best round <strong>{record.best}%</strong> match
              </p>
              <div className="mt-5 w-full max-w-xs rounded-2xl bg-white p-3 shadow-sm">
                <MidnightCountdown />
              </div>
              <PillButton className="mt-6" onClick={() => window.location.assign("/sequence")}>
                Train memory in Sequence ›
              </PillButton>
            </div>
          )}

          {/* ready */}
          {phase === "ready" && (
            <div className="flex min-h-[380px] flex-col items-center justify-center gap-5 text-center">
              <p className="max-w-xs text-[15px] leading-relaxed text-[#CFC4E8]">
                A colour appears for exactly three seconds, then vanishes. Recreate it with the
                RGB sliders — the closer the match, the bigger the score.
              </p>
              <div className="flex items-center justify-center gap-2" aria-hidden="true">
                {["#F4407A", "#FFC250", "#4ADE80", "#22D3EE", "#8B5CF6"].map((c, i) => (
                  <span
                    key={c}
                    className="gd-anim-twinkle h-7 w-7 rounded-full border-2 border-white/70 shadow-[0_0_14px_2px_rgba(139,92,246,0.45)]"
                    style={{ background: c, animationDelay: `${i * 0.45}s` }}
                  />
                ))}
              </div>
              <PillButton onClick={() => setPhase("show")}>Show round 1 ›</PillButton>
              <p className="text-xs text-[#9A8CBC]">{formatLongDate(dateKey)}</p>
            </div>
          )}

          {/* show phase */}
          {phase === "show" && target && (
            <div className="min-h-[380px]">
              <div
                className="ku-anim-pop flex aspect-video w-full items-end justify-center rounded-2xl"
                style={{
                  backgroundColor: css(target),
                  boxShadow: `0 0 44px 2px ${css(target)}66, 0 14px 30px -14px rgba(0,0,0,0.55)`,
                }}
              >
                <span className="mb-3 rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  Memorise this colour
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[#C9B4F5] transition-[width] duration-100 ease-linear"
                  style={{ width: `${(showLeft / SHOW_SECONDS) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-center font-mono text-sm font-bold tabular-nums text-[#B7ABD4]">
                {Math.ceil(showLeft)}s
              </p>
            </div>
          )}

          {/* input phase */}
          {phase === "input" && (
            <div className="min-h-[380px]">
              <p className="text-center font-serif text-lg font-bold text-white">
                Rebuild the colour from memory
              </p>
              <div className="mt-4 flex flex-col gap-4">
                <div
                  className="h-16 w-full rounded-2xl border border-white/15"
                  style={{
                    backgroundColor: css(sliders),
                    boxShadow: `0 0 26px 1px ${css(sliders)}55, inset 0 2px 6px rgba(255,255,255,0.25)`,
                  }}
                  aria-hidden="true"
                />
                {sliderRows.map((row) => (
                  <div key={row.key}>
                    <div className="flex items-center justify-between font-mono text-xs font-bold text-[#B7ABD4]">
                      <span>{row.label}</span>
                      <span className="tabular-nums text-white">{sliders[row.key]}</span>
                    </div>
                    <Slider
                      value={[sliders[row.key]]}
                      min={0}
                      max={255}
                      step={1}
                      onValueChange={(vals) => {
                        setSliders((s) => ({ ...s, [row.key]: vals[0] ?? 0 }));
                      }}
                      onValueCommit={() => play("type")}
                      aria-label={`${row.label} channel`}
                      className="mt-2"
                    />
                    <div
                      className="mt-1 h-1.5 w-full rounded-full opacity-60"
                      style={{ background: row.track }}
                      aria-hidden="true"
                    />
                  </div>
                ))}
                <PillButton onClick={submitMatch} className="w-full">
                  Lock in my colour
                </PillButton>
              </div>
            </div>
          )}

          {/* result phase */}
          {phase === "result" && last && (
            <div className="min-h-[380px] text-center">
              <p className="font-serif text-lg font-bold text-white">Round {round + 1} result</p>
              <div className="mx-auto mt-4 flex max-w-xs items-stretch justify-center gap-3">
                <div className="flex-1">
                  <div
                    className="aspect-square w-full rounded-2xl"
                    style={{
                      backgroundColor: css(last.target),
                      boxShadow: `0 0 30px 1px ${css(last.target)}55`,
                    }}
                  />
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#B7ABD4]">
                    Target
                  </p>
                </div>
                <div className="flex-1">
                  <div
                    className="aspect-square w-full rounded-2xl"
                    style={{
                      backgroundColor: css(last.guess),
                      boxShadow: `0 0 30px 1px ${css(last.guess)}55`,
                    }}
                  />
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#B7ABD4]">
                    Yours
                  </p>
                </div>
              </div>
              <p className="pd-anim-pop mt-4 font-serif text-5xl font-black tabular-nums text-white">
                {last.pts}%
              </p>
              <p className="mt-1 text-sm text-[#B7ABD4]">
                <strong className="text-white">+{last.pts} pts</strong> · running total {points.reduce((s, p) => s + p, 0)}
              </p>
              <div className="mt-6">
                <PillButton onClick={nextRound}>
                  {round + 1 >= targets.length ? "See results ›" : "Next colour ›"}
                </PillButton>
              </div>
            </div>
          )}

          {/* finished */}
          {phase === "finished" && (
            <div className="min-h-[380px] text-center">
              <p className="pd-anim-pop font-serif text-5xl font-black tabular-nums text-white">
                {total}
                <span className="text-2xl text-white/50"> / 500</span>
              </p>
              <p className="mt-2 text-sm text-[#B7ABD4]">
                Best round: <strong className="text-white">{best}%</strong> match
              </p>
              <div className="mt-5 space-y-2 text-left">
                {points.map((p, i) => (
                  <div
                    key={i}
                    className="pd-anim-rise flex items-center justify-between gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-2.5"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="font-serif text-sm font-semibold text-white">Round {i + 1}</span>
                    <span
                      className="h-5 w-10 rounded border border-white/20"
                      style={{ backgroundColor: css(targets[i]) }}
                      aria-label={`Target colour round ${i + 1}`}
                    />
                    <span className="rounded-full bg-[#EAF4E4] px-2.5 py-1 font-mono text-xs font-bold text-[#2F6B33]">
                      +{p}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <ShareBox text={shareText} />
              </div>
              <div className="mt-5 rounded-2xl bg-white p-4 text-sm text-[#6E6E6E]">
                <MidnightCountdown />
              </div>
              <PillButton className="mt-6" onClick={() => window.location.assign("/sequence")}>
                Next: Sequence ›
              </PillButton>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function ColourMemoryGame() {
  return (
    <SoundProvider>
      <ColourMemoryInner />
    </SoundProvider>
  );
}
