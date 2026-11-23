"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WORD_LIST, WORD_SET } from "@/data/wordlist";
import { mulberry32, pickDaily, seedFromString, formatLongDate, todayKey } from "@/lib/daily";
import { wordPoints } from "@/lib/scoring";
import {
  loadDailyRecord,
  saveDailyRecord,
  type DailyRecord,
} from "@/lib/storage";
import { wordHuntShare } from "@/lib/share";
import { MidnightCountdown } from "@/components/game/MidnightCountdown";
import { ShareBox } from "@/components/game/ShareBox";
import { SceneAmbience } from "@/components/game/SceneAmbience";
import { SoundProvider, useGameSound } from "@/components/game/ArcadeUI";

/* ============================================================
   Word Hunt — PlayDaily "classics" light style.
   White page, stats header with a divider, one dark-bordered
   light card holding the 4×4 tile board, Shuffle ×3 pill and
   soft neumorphic tiles. Click or type to hunt.
   ============================================================ */

/** Original 4x4 dice set (one face is the digraph "qu"). */
const DICE: string[][] = [
  ["e", "t", "l", "s", "r", "a"],
  ["o", "n", "i", "e", "a", "t"],
  ["m", "p", "c", "a", "e", "d"],
  ["r", "s", "i", "v", "g", "o"],
  ["h", "n", "o", "e", "t", "d"],
  ["y", "f", "i", "r", "l", "e"],
  ["u", "n", "k", "g", "w", "b"],
  ["m", "a", "s", "h", "o", "p"],
  ["t", "s", "c", "a", "l", "e"],
  ["d", "r", "o", "w", "n", "e"],
  ["qu", "b", "j", "k", "z", "v"],
  ["p", "l", "t", "e", "c", "d"],
  ["g", "u", "h", "r", "i", "n"],
  ["a", "o", "e", "f", "s", "b"],
  ["v", "t", "m", "r", "d", "l"],
  ["y", "c", "p", "e", "a", "r"],
];

interface Cell {
  letter: string;
  display: string;
  die: number;
}

interface WordRecord extends DailyRecord {
  words?: number;
  longest?: string;
  possible?: number;
}

function rollFaces(diceOrder: number[], seed: number): Cell[] {
  const rng = mulberry32(seed >>> 0);
  return diceOrder.map((die) => {
    const face = DICE[die][Math.floor(rng() * DICE[die].length)];
    return { letter: face, display: face === "qu" ? "Qu" : face.toUpperCase(), die };
  });
}

function buildGrid(dateKey: string): Cell[] {
  const order = pickDaily(DICE.map((_, i) => i), 16, dateKey);
  return rollFaces(order, seedFromString(`wordhunt:${dateKey}`));
}

const NEIGHBORS: number[][] = Array.from({ length: 16 }, (_, i) => {
  const r = Math.floor(i / 4);
  const c = i % 4;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) out.push(nr * 4 + nc);
    }
  }
  return out;
});

function findPath(word: string, cells: Cell[]): number[] | null {
  if (!word) return null;
  const used = new Array(16).fill(false);
  const path: number[] = [];

  const dfs = (idx: number, pos: number): boolean => {
    if (pos === word.length) return true;
    for (const n of NEIGHBORS[idx]) {
      if (used[n]) continue;
      const l = cells[n].letter;
      if (word.startsWith(l, pos)) {
        used[n] = true;
        path.push(n);
        if (dfs(n, pos + l.length)) return true;
        used[n] = false;
        path.pop();
      }
    }
    return false;
  };

  for (let start = 0; start < 16; start++) {
    const l = cells[start].letter;
    if (word.startsWith(l, 0)) {
      used[start] = true;
      path.push(start);
      if (dfs(start, l.length)) return path.slice();
      used[start] = false;
      path.pop();
    }
  }
  return null;
}

/** Count every dictionary word hidden in the grid (used on the result screen). */
function countPossibleWords(cells: Cell[]): number {
  let count = 0;
  for (const w of WORD_LIST) {
    if (w.length < 3) continue;
    if (findPath(w, cells)) count++;
  }
  return count;
}

type Phase = "boot" | "locked" | "ready" | "playing" | "finished";
const GAME_SECONDS = 90;

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.floor((sec * 100) % 100);
  return `${m}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function WordHuntInner() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [dateKey, setDateKey] = useState("");
  const [cells, setCells] = useState<Cell[]>([]);
  const [entries, setEntries] = useState<number[]>([]);
  const [typed, setTyped] = useState("");
  const [found, setFound] = useState<{ word: string; pts: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [flash, setFlash] = useState("");
  const [record, setRecord] = useState<WordRecord | null>(null);
  const [possible, setPossible] = useState<number | null>(null);
  const [shareText, setShareText] = useState("");
  const [shuffles, setShuffles] = useState(3);
  const { play } = useGameSound();

  /* ---------- boot ---------- */
  useEffect(() => {
    const dk = todayKey();
    setDateKey(dk);
    const rec = loadDailyRecord<WordRecord>("wordhunt", dk);
    if (rec) {
      setRecord(rec);
      setPhase("locked");
      return;
    }
    setCells(buildGrid(dk));
    setPhase("ready");
  }, []);

  /* ---------- timer ---------- */
  useEffect(() => {
    if (phase !== "playing") return;
    const started = Date.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, GAME_SECONDS - (Date.now() - started) / 1000);
      setTimeLeft(left);
      if (left <= 0) {
        window.clearInterval(id);
        setPhase("finished");
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase]);

  /* final-seconds ticks */
  const lastTick = useRef(99);
  useEffect(() => {
    if (phase !== "playing") return;
    const n = Math.ceil(timeLeft);
    if (n <= 10 && n > 0 && n !== lastTick.current) {
      lastTick.current = n;
      play("tick");
    }
  }, [timeLeft, phase, play]);

  const score = useMemo(() => found.reduce((s, f) => s + f.pts, 0), [found]);
  const longest = useMemo(
    () => found.reduce((best, f) => (f.word.length > best.length ? f.word : best), ""),
    [found]
  );

  /* ---------- persist + share on finish ---------- */
  useEffect(() => {
    if (phase !== "finished") return;
    play("chime");
    const rec: WordRecord = {
      date: dateKey,
      total: score,
      max: score,
      words: found.length,
      longest,
    };
    saveDailyRecord("wordhunt", rec);
    setRecord(rec);
    const t = window.setTimeout(() => {
      try {
        const p = countPossibleWords(cells);
        setPossible(p);
        rec.possible = p;
        saveDailyRecord("wordhunt", rec);
      } catch {
        setPossible(null);
      }
    }, 50);
    setShareText(wordHuntShare(formatLongDate(dateKey), score, found.length, longest));
    return () => window.clearTimeout(t);
     
  }, [phase]);

  const path: number[] = useMemo(() => {
    if (typed) {
      const p = findPath(typed, cells);
      return p ?? entries;
    }
    return entries;
  }, [typed, entries, cells]);

  const currentWord = typed || entries.map((i) => cells[i]?.letter ?? "").join("");

  const showFlash = useCallback(
    (msg: string) => {
      setFlash(msg);
      play("bad");
      window.setTimeout(() => setFlash(""), 1600);
    },
    [play]
  );

  const submitWord = useCallback(() => {
    const w = currentWord.toLowerCase();
    if (!w) return;
    if (w.length < 3) {
      showFlash("At least 3 letters");
      return;
    }
    if (found.some((f) => f.word === w)) {
      showFlash(`“${w.toUpperCase()}” already found`);
      setEntries([]);
      setTyped("");
      return;
    }
    if (!WORD_SET.has(w)) {
      showFlash(`“${w.toUpperCase()}” is not in our dictionary`);
      return;
    }
    if (!findPath(w, cells)) {
      showFlash("Letters are not connected");
      return;
    }
    play("good");
    setFound((f) => [...f, { word: w, pts: wordPoints(w.length) }]);
    setEntries([]);
    setTyped("");
  }, [currentWord, found, cells, showFlash, play]);

  /* ---------- keyboard input ---------- */
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") {
        e.preventDefault();
        submitWord();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        if (typed) setTyped((t) => t.slice(0, -1));
        else setEntries((en) => en.slice(0, -1));
        return;
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        const ch = e.key.toLowerCase();
        if (ch === "q") {
          setTyped((t) => t + "qu");
          setEntries([]);
          e.preventDefault();
          return;
        }
        const candidate = typed + ch;
        if (findPath(candidate, cells)) {
          setTyped(candidate);
          setEntries([]);
        } else if (!typed) {
          if (cells.some((c) => c.letter === ch)) {
            setTyped(ch);
          } else {
            showFlash(`No “${ch.toUpperCase()}” on the board`);
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, typed, cells, submitWord, showFlash]);

  /* ---------- tap input ---------- */
  const tapCell = (i: number) => {
    if (phase !== "playing") return;
    if (typed) {
      setTyped("");
      setEntries([]);
    }
    play("flip");
    setEntries((en) => {
      if (en.length === 0) return [i];
      if (en.includes(i)) return en;
      const last = en[en.length - 1];
      if (NEIGHBORS[last].includes(i)) return [...en, i];
      showFlash("Pick a neighbouring letter");
      return en;
    });
  };

  /* ---------- shuffle ×3 ---------- */
  const doShuffle = () => {
    if (phase !== "playing" || shuffles <= 0) return;
    play("shuffle");
    setShuffles((s) => s - 1);
    setCells((prev) =>
      rollFaces(
        prev.map((c) => c.die),
        seedFromString(`shuffle:${dateKey}:${Date.now()}`)
      )
    );
    setEntries([]);
    setTyped("");
  };

  /* ---------- shared board markup ---------- */
  const boardCells = (interactive: boolean) => (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
      {cells.map((c, i) => {
        const idx = path.indexOf(i);
        const selected = idx >= 0;
        return (
          <button
            key={i}
            type="button"
            onClick={() => interactive && tapCell(i)}
            aria-label={`Letter ${c.display}`}
            className={`wh-tile flex aspect-square items-center justify-center rounded-[14px] font-serif text-[26px] font-black transition-all duration-150 sm:text-[30px] ${
              selected
                ? "wh-tile-on scale-[1.05] text-[#4A3200]"
                : "text-[#3B2A08]"
            } ${interactive ? "cursor-pointer" : "cursor-default"}`}
          >
            {c.display}
          </button>
        );
      })}
    </div>
  );

  const statsRow = (
    <div className="pd-chip mt-3 flex items-center justify-center gap-6 rounded-2xl px-6 py-2.5">
      <span className="text-center">
        <span className="block font-mono text-2xl font-bold tabular-nums text-[#9FE0F2]">{score}</span>
        <span className="block text-[10px] font-bold tracking-[0.2em] text-white/60">SCORE</span>
      </span>
      <span className="h-9 w-px bg-white/25" aria-hidden="true" />
      <span className="text-center">
        <span
          className={`block font-mono text-2xl font-bold tabular-nums ${
            timeLeft <= 10 && phase === "playing" ? "text-[#FF9B8A]" : "text-white"
          }`}
        >
          {phase === "playing" ? formatClock(timeLeft) : formatClock(GAME_SECONDS)}
        </span>
        <span className="block text-[10px] font-bold tracking-[0.2em] text-white/60">TIME</span>
      </span>
    </div>
  );

  return (
    <section
      className="relative w-full bg-white"
      style={{ minHeight: "max(560px, calc(100vh - 76px))" }}
      aria-label="Word Hunt game"
    >
      <SceneAmbience kind="meadow" />
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center px-4 py-6 sm:py-8">
        {/* title block — playdaily style */}
        <h1 className="font-serif text-[30px] font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(6,40,24,0.55)]">Word Hunt</h1>
        <p className="mt-1 text-center text-[15px] font-medium text-white/95 drop-shadow-[0_1px_6px_rgba(6,40,24,0.5)]">
          Find words fast on a 4×4 grid with three same-letter shuffles.
        </p>
        {(phase === "playing" || phase === "finished") && statsRow}

        {/* the bordered card — deep grass board with cream tiles */}
        <div
          className="mt-4 w-full max-w-[430px] rounded-[22px] border-2 border-[#0A2E1C] p-3 shadow-[0_4px_0_0_#062015,0_18px_36px_-18px_rgba(6,40,24,0.55)]"
          style={{
            background: "linear-gradient(180deg,#11613B 0%,#0C4E30 100%)",
            boxShadow:
              "inset 0 2px 10px rgba(0,0,0,0.35), 0 4px 0 0 #062015, 0 20px 40px -20px rgba(6,40,24,0.6)",
          }}
        >
          {/* boot */}
          {phase === "boot" && (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-10 w-40 animate-pulse rounded-lg bg-[#E4E4E4]" />
            </div>
          )}

          {/* locked */}
          {phase === "locked" && record && (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
              <p className="text-xs font-bold tracking-[0.2em] text-[#BFE8CD]">GRID SOLVED</p>
              <p className="mt-3 font-serif text-3xl font-black text-white">{record.total} pts</p>
              <p className="mt-2 text-sm text-[#CFEAD9]">
                {record.words} words · longest{" "}
                <strong className="font-mono uppercase">{record.longest}</strong>
                {record.possible != null && <> · {record.possible} were hiding</>}
              </p>
              <div className="mt-5 w-full max-w-xs rounded-2xl bg-white p-3 shadow-sm">
                <MidnightCountdown />
              </div>
              <button
                type="button"
                onClick={() => {
                  play("click");
                  window.location.assign("/krillion-unblocked");
                }}
                className="mt-6 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border-2 border-[#14508C] bg-[#4E9BE8] px-7 text-sm font-bold text-white shadow-[0_3px_0_0_#14508C] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
              >
                Play Krillion <span aria-hidden="true">›</span>
              </button>
            </div>
          )}

          {/* ready — the reference shows a bare board with one Play pill */}
          {phase === "ready" && (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 text-center">
              <p className="text-sm font-medium text-[#D8F2E2]">90 seconds · same grid for everyone today</p>
              <button
                type="button"
                onClick={() => {
                  play("pop");
                  setPhase("playing");
                }}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border-2 border-[#0E3A54] bg-[#FFC250] px-8 text-sm font-bold text-[#2B1A02] shadow-[0_3px_0_0_#B27F14] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
              >
                Play <span aria-hidden="true">›</span>
              </button>
              <p className="text-xs text-[#A8D4B8]">{formatLongDate(dateKey)}</p>
            </div>
          )}

          {/* playing */}
          {phase === "playing" && cells.length === 16 && (
            <div className="p-1">
              {boardCells(true)}

              {/* current word + flash */}
              <div className="mt-3 text-center">
                <p
                  className={`mx-auto min-h-[1.9rem] break-all font-mono text-lg font-bold tracking-[0.2em] uppercase ${
                    currentWord ? "text-white" : "text-transparent"
                  }`}
                >
                  {currentWord || "·"}
                </p>
                {flash && <p className="pd-anim-pop text-xs font-bold text-[#FFD98A]">{flash}</p>}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      typed ? setTyped((t) => t.slice(0, -1)) : setEntries((e) => e.slice(0, -1))
                    }
                    className="rounded-full border border-white/25 bg-white/12 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
                  >
                    ⌫ Undo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEntries([]);
                      setTyped("");
                    }}
                    className="rounded-full border border-white/25 bg-white/12 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={submitWord}
                    disabled={!currentWord}
                    className="rounded-full border-2 border-[#0E3A54] bg-[#FFC250] px-6 py-2 text-xs font-bold text-[#2B1A02] shadow-[0_3px_0_0_#B27F14] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none disabled:opacity-55"
                  >
                    Submit word
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* finished — board freezes, result overlays below */}
          {phase === "finished" && cells.length === 16 && (
            <div className="p-1">{boardCells(false)}</div>
          )}
        </div>

        {/* shuffle pill — playdaily spot below the card */}
        {phase === "playing" && (
          <button
            type="button"
            onClick={doShuffle}
            disabled={shuffles <= 0}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-5 py-2.5 text-sm font-bold text-[#1A1A1A] shadow-sm transition-all hover:bg-[#F2F2F2] active:translate-y-0.5 disabled:opacity-45"
          >
            <span aria-hidden="true">⇄</span> Shuffle
            <span className="rounded-full bg-[#EFEFEF] px-2 py-0.5 text-[10px] font-bold text-[#6E6E6E]">
              ×{shuffles}
            </span>
          </button>
        )}

        {/* found words */}
        {(phase === "playing" || phase === "finished") && found.length > 0 && (
          <div className="mt-5 w-full max-w-[430px] rounded-2xl border border-[#E9E9E9] bg-white p-4">
            <p className="text-xs font-bold tracking-[0.16em] text-[#8A8A8A]">
              FOUND {found.length} WORD{found.length === 1 ? "" : "S"}
            </p>
            <div className="scroll-slim mt-2 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
              {found.map((f) => (
                <span
                  key={f.word}
                  className="rounded-full bg-[#EAF4E4] px-2.5 py-1 font-mono text-xs font-bold text-[#2F6B33]"
                >
                  {f.word.toUpperCase()} <span className="text-[#8CA955]">+{f.pts}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* finished summary */}
        {phase === "finished" && (
          <div className="mt-6 w-full max-w-[430px] text-center">
            <p className="font-serif text-3xl font-black text-[#1A1A1A]">{score} pts</p>
            <p className="mt-1 text-sm text-[#6E6E6E]">
              {found.length} words found
              {longest && (
                <>
                  {" "}· longest <strong className="font-mono uppercase">{longest}</strong>
                </>
              )}
              {possible !== null && <> · {possible} were hiding on this grid</>}
            </p>
            <div className="mt-4">
              <ShareBox text={shareText} />
            </div>
            <div className="mt-4 rounded-2xl bg-[#F7F7F7] p-4">
              <MidnightCountdown />
            </div>
            <button
              type="button"
              onClick={() => {
                play("click");
                window.location.assign("/whats-your-guess");
              }}
              className="mt-5 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border-2 border-[#14508C] bg-[#4E9BE8] px-7 text-sm font-bold text-white shadow-[0_3px_0_0_#14508C] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
            >
              Next: What&apos;s Your Guess? <span aria-hidden="true">›</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function WordHuntGame() {
  return (
    <SoundProvider>
      <WordHuntInner />
    </SoundProvider>
  );
}
