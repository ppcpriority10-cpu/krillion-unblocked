"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GUESS_QUESTIONS, type GuessQuestion } from "@/data/questions";
import { pickDaily, formatLongDate, todayKey } from "@/lib/daily";
import { guessPoints, guessRatio, guessLogPos, formatNumber } from "@/lib/scoring";
import {
  loadDailyRecord,
  saveDailyRecord,
  bumpStreak,
  type DailyRecord,
} from "@/lib/storage";
import { guessShare } from "@/lib/share";
import { MidnightCountdown } from "@/components/game/MidnightCountdown";
import { ShareBox } from "@/components/game/ShareBox";
import { SceneAmbience } from "@/components/game/SceneAmbience";
import { SoundProvider, useGameSound } from "@/components/game/ArcadeUI";
import { guessCategory } from "@/lib/categories";

/* ============================================================
   What's Your Guess? — fermi card under a cosmic sky.
   Illustrated cosmos backdrop, one warm card: pink wave header
   with the noodle bowl, plum question type, pill estimate input
   with unit, scratch-pad calculator and glowing reveal bars.
   ============================================================ */

type Phase = "boot" | "locked" | "ready" | "asking" | "reveal" | "finished";

interface GuessRecord extends DailyRecord {
  avg?: number;
}

function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[,\s]/g, "").replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/* ---------- the noodle-bowl illustration ---------- */
function BowlArt() {
  return (
    <svg viewBox="0 0 120 84" className="h-20 w-auto drop-shadow-sm" aria-hidden="true">
      {/* steam */}
      <g fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.85">
        <path d="M46 22c-3-6 3-8 0-14" className="pd-anim-steamer" />
        <path d="M60 20c-3-7 3-9 0-15" className="pd-anim-steamer" style={{ animationDelay: "-1.2s" }} />
        <path d="M74 22c-3-6 3-8 0-14" className="pd-anim-steamer" style={{ animationDelay: "-2s" }} />
      </g>
      {/* chopsticks */}
      <g stroke="#C98A4B" strokeWidth="3.4" strokeLinecap="round">
        <path d="M74 8 L98 30" />
        <path d="M80 5 L102 26" />
      </g>
      {/* noodles */}
      <path d="M34 40 q26 -14 52 0 l-3 8 q-23 -11 -46 0 z" fill="#F5D66B" />
      {/* bowl */}
      <path d="M28 42 h64 a32 20 0 0 1 -64 0 z" fill="#3D6FD6" />
      <path d="M28 42 h64 a32 20 0 0 1 -64 0 z" fill="url(#bowlShade)" />
      <ellipse cx="60" cy="42" rx="32" ry="8" fill="#2B57B0" />
      {/* bowl pattern */}
      <circle cx="48" cy="52" r="3.4" fill="#fff" opacity="0.9" />
      <circle cx="62" cy="56" r="3.4" fill="#FF8A5C" opacity="0.95" />
      <circle cx="74" cy="51" r="3.4" fill="#fff" opacity="0.9" />
      {/* spoon */}
      <ellipse cx="14" cy="56" rx="8" ry="5" fill="#E8EEF7" transform="rotate(-24 14 56)" />
      <path d="M20 52 L36 44" stroke="#E8EEF7" strokeWidth="3.4" strokeLinecap="round" />
      <defs>
        <linearGradient id="bowlShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#0D2C74" stopOpacity="0.25" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ---------- scratch-pad calculator ---------- */
function Calculator({ onClose }: { onClose: () => void }) {
  const [expr, setExpr] = useState("");
  const keys = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "=", "+"];
  const press = (k: string) => {
    if (k === "=") {
      try {
         
        const val = Function(`"use strict";return (${expr.replace(/÷/g, "/").replace(/×/g, "*").replace(/−/g, "-")})`)();
        setExpr(Number.isFinite(val) ? String(Math.round(val * 1e6) / 1e6) : "");
      } catch {
        setExpr("");
      }
      return;
    }
    setExpr((e) => (e + k).slice(0, 14));
  };
  return (
    <div className="absolute bottom-16 left-0 z-30 w-56 rounded-2xl border border-[#E5DFF2] bg-white p-3 shadow-xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-[#6B6398]">Scratch pad</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setExpr("")}
            className="rounded-md bg-[#F3F1FA] px-2 py-1 text-[10px] font-bold text-[#6B6398] hover:bg-[#E9E5F5]"
          >
            C
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close calculator"
            className="rounded-md bg-[#F3F1FA] px-2 py-1 text-[10px] font-bold text-[#6B6398] hover:bg-[#E9E5F5]"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="mb-2 rounded-lg bg-[#F7F5FC] px-3 py-2 text-right font-mono text-sm text-[#3E2F63]">
        {expr || "0"}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className={`h-9 rounded-lg text-sm font-bold transition-colors ${
              k === "="
                ? "bg-[#F0806E] text-white hover:brightness-105"
                : "bg-[#F3F1FA] text-[#3E2F63] hover:bg-[#E9E5F5]"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- the reference-style log-scale answer bar ---------- */
function ScaleBar({ guess, truth }: { guess: number; truth: number }) {
  const pos = guessLogPos(guess, truth); // -1..1, 0 = exact
  const inTen = guessRatio(guess, truth).factor <= 10;
  const pct = ((pos + 1) / 2) * 100; // 0..100 on the bar
  const segments = [13.5, 13.5, 13.5, 13.5, 13.5, 13.5];
  return (
    <div className="mx-auto mt-5 max-w-md">
      {/* the track: grey segments, the miss-side tail glows red */}
      <div className="relative flex h-3 items-center gap-1.5">
        {segments.map((w, i) => (
          <span
            key={i}
            className="h-2.5 rounded-full"
            style={{
              width: `${w}%`,
              background:
                (pos > 0 && i >= 4) || (pos < 0 && i <= 1)
                  ? inTen
                    ? "#F2C4BC"
                    : "#F4407A"
                  : "#E7E0D4",
              boxShadow:
                (pos > 0 && i >= 4) || (pos < 0 && i <= 1)
                  ? inTen
                    ? "none"
                    : "0 0 10px 1px rgba(244,64,122,0.45)"
                  : "none",
            }}
          />
        ))}
        {/* centre tick = the true answer */}
        <span className="absolute left-1/2 top-[-6px] h-[22px] w-[3px] rounded-full bg-[#4A2545]" />
        {/* You marker */}
        <span
          className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-700 ease-out"
          style={{ left: `${Math.max(1, Math.min(99, pct))}%` }}
        >
          <span className="relative block">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#163E70] shadow-[0_2px_6px_rgba(22,62,112,0.5)]">
              <span className="h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-md bg-[#163E70] px-2 py-0.5 text-[10px] font-bold text-white">
              You
            </span>
          </span>
        </span>
      </div>
      <div className="mt-4 flex justify-between px-1 font-mono text-[10px] font-semibold text-[#B08D7E]">
        <span>100× low</span>
        <span>spot on</span>
        <span>100× high</span>
      </div>
    </div>
  );
}

function GuessInner() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [dateKey, setDateKey] = useState("");
  const [questions, setQuestions] = useState<GuessQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [points, setPoints] = useState<{ pts: number; acc: number; guess: number }[]>([]);
  const [current, setCurrent] = useState<{ pts: number; acc: number; guess: number } | null>(null);
  const [record, setRecord] = useState<GuessRecord | null>(null);
  const [shareText, setShareText] = useState("");
  const [error, setError] = useState("");
  const [calcOpen, setCalcOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { play } = useGameSound();

  /* boot */
  useEffect(() => {
    const dk = todayKey();
    setDateKey(dk);
    const rec = loadDailyRecord<GuessRecord>("guess", dk);
    if (rec) {
      setRecord(rec);
      setPhase("locked");
      return;
    }
    setQuestions(pickDaily(GUESS_QUESTIONS, 5, dk));
    setPhase("ready");
  }, []);

  useEffect(() => {
    if (phase === "asking") inputRef.current?.focus();
  }, [phase, index]);

  const total = useMemo(() => points.reduce((s, p) => s + p.pts, 0), [points]);
  const avg = useMemo(
    () => (points.length ? Math.round(points.reduce((s, p) => s + p.acc, 0) / points.length) : 0),
    [points]
  );

  /* persist + share on finish */
  useEffect(() => {
    if (phase !== "finished") return;
    play("chime");
    const rec: GuessRecord = { date: dateKey, total, max: 500, avg };
    saveDailyRecord("guess", rec);
    const st = bumpStreak("guess", dateKey);
    rec.avg = avg;
    setStreak(st.count);
    setRecord(rec);
    setShareText(guessShare(formatLongDate(dateKey), total, avg));
     
  }, [phase]);

  const submit = () => {
    if (phase !== "asking") return;
    const n = parseNumber(typed);
    if (n === null) {
      setError("Type a number — any number. A wild guess beats no guess.");
      play("bad");
      return;
    }
    const q = questions[index];
    const pts = guessPoints(n, q.answer);
    const entry = {
      pts,
      acc: Math.round((Math.min(n, q.answer) / Math.max(n, q.answer)) * 100),
      guess: n,
    };
    setCurrent(entry);
    setPoints((p) => [...p, entry]);
    setPhase("reveal");
    if (pts >= 70) play("good");
    else play("pop");
  };

  const next = () => {
    setTyped("");
    setError("");
    setCurrent(null);
    setCalcOpen(false);
    if (index + 1 >= questions.length) {
      setPhase("finished");
    } else {
      setIndex((i) => i + 1);
      setPhase("asking");
      play("whoosh");
    }
  };

  const q = questions[index];
  const cat = q ? guessCategory(q.question) : null;

  return (
    <section
      className="relative w-full bg-white"
      style={{ minHeight: "max(560px, calc(100vh - 76px))" }}
      aria-label="What's Your Guess? game"
    >
      <SceneAmbience kind="cosmos" />
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col px-4 py-6 sm:py-8">
        {/* ============ the fermi card ============ */}
        <div className="overflow-hidden rounded-[24px] border border-[#EFE7DA] bg-[#FFF9F0] shadow-[0_18px_50px_-24px_rgba(90,50,60,0.35)]">
          {/* pink wave header */}
          <div className="relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg,#FAD4CC 0%,#F6B3A6 62%,#F2A294 100%)",
              }}
            />
            <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <path d="M0 78 Q 60 60 120 76 T 260 74 T 400 70 V120 H0 Z" fill="#F49B8C" opacity="0.75" />
              <path d="M0 96 Q 80 82 170 94 T 400 90 V120 H0 Z" fill="#EF8C7D" opacity="0.8" />
            </svg>
            <div className="relative flex items-center justify-between px-5 pb-5 pt-4">
              <span className="flex items-center gap-1.5 text-sm font-bold text-[#5A2B33]">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#3D6FD6]" />
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#F4407A]" />
                What&apos;s Your Guess?
              </span>
              <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-[#5A2B33]">
                {phase === "asking" || phase === "reveal"
                  ? `${points.length} in a row`
                  : streak > 0
                    ? `${streak} in a row`
                    : record?.avg != null
                      ? `${record.avg}% avg`
                      : "0 in a row"}
              </span>
            </div>
            <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2">
              <BowlArt />
            </div>
          </div>

          {/* body */}
          <div className="px-6 pb-7 pt-6 sm:px-8">
            {/* boot */}
            {phase === "boot" && (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
                <div className="h-6 w-52 animate-pulse rounded bg-[#F3E7DC]" />
                <div className="h-14 w-full animate-pulse rounded-2xl bg-[#F3E7DC]" />
              </div>
            )}

            {/* locked */}
            {phase === "locked" && record && (
              <div className="min-h-[280px] text-center">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B08D7E]">Answers in</p>
                <p className="mt-4 font-serif text-3xl font-black text-[#4A2545]">
                  {record.total}
                  <span className="text-lg text-[#4A2545]/55"> / 500</span>
                </p>
                <p className="mt-2 text-[15px] text-[#6E5566]">
                  Average accuracy <strong>{record.avg}%</strong> — fresh questions at midnight.
                </p>
                <div className="mx-auto mt-6 max-w-xs rounded-2xl bg-white/80 p-4">
                  <MidnightCountdown />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    play("click");
                    window.location.assign("/word-hunt");
                  }}
                  className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#4E9BE8] px-8 text-sm font-bold text-white shadow-[0_3px_0_0_#163E70] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
                >
                  Play Word Hunt ›
                </button>
              </div>
            )}

            {/* ready */}
            {phase === "ready" && (
              <div className="min-h-[280px] text-center">
                <p className="font-serif text-[22px] font-bold leading-snug text-[#4A2545]">
                  Five estimation questions a day.
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-[#6E5566]">
                  Type a number for each one — your accuracy percentage becomes your score.
                  Being 90% close earns 90 points. No googling; wild guesses welcome.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      play("pop");
                      setPhase("asking");
                    }}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#4E9BE8] px-9 text-sm font-bold text-white shadow-[0_3px_0_0_#163E70] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
                  >
                    Show question 1 ›
                  </button>
                </div>
                <p className="mt-4 text-xs text-[#B08D7E]">{formatLongDate(dateKey)}</p>
              </div>
            )}

            {/* asking */}
            {phase === "asking" && q && cat && (
              <div className="min-h-[300px]">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#8A7A6A]">
                  <span aria-hidden="true">{cat.icon === "utensils" ? "🍴" : cat.icon === "planet" ? "🪐" : cat.icon === "paw" ? "🐾" : cat.icon === "map" ? "🗺️" : cat.icon === "person" ? "🧍" : cat.icon === "clock" ? "⏱️" : cat.icon === "droplet" ? "💧" : "✨"}</span>
                  {cat.label}
                </p>
                <h2 className="pd-anim-slide mt-3 font-serif text-[24px] font-bold leading-snug text-[#4A2545] sm:text-[26px]">
                  {q.question}
                </h2>

                <div className="mt-10">
                  <div
                    className="flex h-14 items-center rounded-full border border-[#CFC6EE] bg-white/70 px-5 shadow-sm transition-shadow focus-within:ring-4 focus-within:ring-[#CFC6EE]/50"
                  >
                    <input
                      ref={inputRef}
                      value={typed}
                      onChange={(e) => {
                        setTyped(e.target.value);
                        play("type");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submit();
                      }}
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder=""
                      aria-label="Your estimate"
                      className="h-full flex-1 bg-transparent font-mono text-lg font-semibold text-[#4A2545] focus:outline-none"
                    />
                    <span className="ml-3 text-sm font-semibold text-[#8A7A8A]">{q.unit}</span>
                  </div>
                </div>

                {error && <p className="mt-3 text-center text-xs font-bold text-[#C2554B]">{error}</p>}

                <div className="relative mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      play("flip");
                      setCalcOpen((v) => !v);
                    }}
                    aria-label="Open scratch-pad calculator"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E5DFF2] bg-[#F7F5FC] text-lg shadow-sm transition-colors hover:bg-[#EFEBF8]"
                  >
                    🧮
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!typed.trim()}
                    className="h-12 flex-1 rounded-full bg-[#EFEDF7] text-sm font-bold text-[#6B6398] shadow-sm transition-all hover:bg-[#E7E3F4] hover:text-[#4E4578] disabled:opacity-55"
                  >
                    Check estimate
                  </button>
                  {calcOpen && <Calculator onClose={() => setCalcOpen(false)} />}
                </div>
              </div>
            )}

            {/* reveal — the reference answer visual */}
            {phase === "reveal" && q && current && cat && (
              <div className="min-h-[300px] text-center">
                <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#8A7A6A]">
                  <span aria-hidden="true">🍴</span> {cat.label}
                </p>

                {/* two stat boxes: your guess vs the real answer */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-left">
                  <div className="rounded-2xl bg-[#EFE7F5] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#6B6398]">You guessed</p>
                    <p className="mt-0.5 font-mono text-[22px] font-black leading-tight tabular-nums text-[#4A2545]">
                      {formatNumber(current.guess)}
                      <span className="ml-1.5 text-[11px] font-bold text-[#6B6398]">{q.unit}</span>
                    </p>
                  </div>
                  <div className="pd-anim-pop rounded-2xl bg-[#DFF0EA] px-4 py-3" style={{ animationDelay: "120ms" }}>
                    <p className="text-[11px] font-semibold text-[#3F7A63]">Answer</p>
                    <p className="mt-0.5 font-mono text-[22px] font-black leading-tight tabular-nums text-[#1F5540]">
                      {formatNumber(q.answer)}
                      <span className="ml-1.5 text-[11px] font-bold text-[#3F7A63]">{q.unit}</span>
                    </p>
                  </div>
                </div>

                {/* verdict: "10× too high" + the streak pill */}
                {(() => {
                  const r = guessRatio(current.guess, q.answer);
                  const inside = r.factor <= 10;
                  return (
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <p className="font-serif text-3xl font-black tabular-nums text-[#4A2545]">
                        {r.dir === "exact" ? (
                          "Exact!"
                        ) : (
                          <>
                            {formatNumber(r.factor)}
                            <span className="text-xl">×</span>{" "}
                            <span className="text-xl font-bold">too {r.dir}</span>
                          </>
                        )}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          inside
                            ? "bg-[#DFF0EA] text-[#1F5540]"
                            : "bg-[#F4407A] text-white"
                        }`}
                      >
                        {inside ? "In" : "Out"}
                      </span>
                    </div>
                  );
                })()}

                {/* log-scale bar with the You marker */}
                <ScaleBar guess={current.guess} truth={q.answer} />

                <p className="mt-3 font-mono text-sm font-bold text-[#B0574C]">
                  <span className="pd-anim-pop inline-block">{current.acc}% accurate · +{current.pts} pts</span>
                </p>

                {/* how it adds up */}
                <details className="group mx-auto mt-4 max-w-md overflow-hidden rounded-2xl bg-white/70 text-left">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-[#4A2545] [&::-webkit-details-marker]:hidden">
                    How it adds up
                    <span className="text-[#8A7A8A] transition-transform group-open:rotate-180">⌃</span>
                  </summary>
                  <p className="border-t border-[#EFE4D6] px-4 py-3 text-sm italic leading-relaxed text-[#8A7468]">
                    {q.explanation}
                  </p>
                </details>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={next}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#4E9BE8] px-9 text-sm font-bold text-white shadow-[0_3px_0_0_#163E70] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
                  >
                    {index + 1 >= questions.length ? "See results ›" : "Next question ›"}
                  </button>
                </div>
              </div>
            )}

            {/* finished */}
            {phase === "finished" && (
              <div className="min-h-[300px] text-center">
                <p className="font-serif text-2xl font-bold text-[#4A2545]">
                  {total >= 400 ? "Uncannily close!" : total >= 250 ? "Solid estimates." : "Big-if-true energy."}
                </p>
                <p className="pd-anim-pop mt-4 font-serif text-5xl font-black tabular-nums text-[#4A2545]">
                  {total}
                  <span className="text-2xl text-[#4A2545]/50"> / 500</span>
                </p>
                <p className="mt-2 text-sm text-[#6E5566]">Average accuracy {avg}%</p>

                <div className="mt-6 space-y-2 text-left">
                  {points.map((p, i) => (
                    <div
                      key={i}
                      className="pd-anim-rise flex items-center justify-between gap-3 rounded-2xl border border-[#F0E4D8] bg-white px-4 py-2.5"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <span className="min-w-0 truncate text-sm font-semibold text-[#4A2545]">
                        {questions[i].question}
                      </span>
                      <span className="shrink-0 rounded-full bg-[#FBEDE4] px-2.5 py-1 font-mono text-xs font-bold text-[#B0574C]">
                        {p.acc}% · +{p.pts}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <ShareBox text={shareText} />
                </div>

                <div className="mt-5 rounded-2xl bg-white/80 p-4 text-center text-sm text-[#6E5566]">
                  <MidnightCountdown />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    play("click");
                    window.location.assign("/colour-memory");
                  }}
                  className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#4E9BE8] px-8 text-sm font-bold text-white shadow-[0_3px_0_0_#163E70] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
                >
                  Next: Colour Memory ›
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-[#B9AFA5]">
          Being 90% close scores 90 · five fresh questions every midnight
        </p>
      </div>
    </section>
  );
}

export function GuessGame() {
  return (
    <SoundProvider>
      <GuessInner />
    </SoundProvider>
  );
}
