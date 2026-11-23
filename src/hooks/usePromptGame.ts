"use client";

/**
 * Shared engine for the two answer games.
 * Krillion (mode "rare") and Noillirk (mode "common") both run this
 * state machine; the components only differ in theme and copy.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PROMPTS, dailyPrompts, type PromptEntry } from "@/data/prompts";
import {
  buildAnswerIndex,
  lookupAnswer,
  missedTier,
  tierForTierKey,
  type AnswerIndex,
  type ScoringMode,
  type Tier,
} from "@/lib/scoring";
import {
  formatLongDate,
  mulberry32,
  shuffled,
  todayKey,
} from "@/lib/daily";
import {
  bumpStreak,
  loadBest,
  loadDailyRecord,
  saveBestIfHigher,
  saveDailyRecord,
  type DailyRecord,
} from "@/lib/storage";
import { krillionCityShare, krillionShare, noillirkShare } from "@/lib/share";

export interface PromptResult {
  promptId: string;
  promptText: string;
  answer: string;
  tier: Tier;
}

export type PromptPhase =
  | "boot"
  | "locked"
  | "ready"
  | "question"
  | "reveal"
  | "finished";

export interface PromptDailyRecord extends DailyRecord {
  emojis?: string[];
  streak?: number;
}

interface Options {
  gameKey: string;
  scoring: ScoringMode;
  daily: boolean;
  promptsPerGame: number;
  secondsPerPrompt: number;
}

export function usePromptGame(opts: Options) {
  const [phase, setPhase] = useState<PromptPhase>("boot");
  const [dateKey, setDateKey] = useState("");
  const [deck, setDeck] = useState<PromptEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<PromptResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(opts.secondsPerPrompt);
  const [lastTier, setLastTier] = useState<Tier | null>(null);
  const [lastAnswer, setLastAnswer] = useState("");
  const [streak, setStreak] = useState(0);
  const [record, setRecord] = useState<PromptDailyRecord | null>(null);
  const [session, setSession] = useState({ score: 0, count: 0 });
  const [unlimitedBest, setUnlimitedBest] = useState(0);

  const answeredRef = useRef(false);

  /* ---------- boot: resolve date, lock state and deck ---------- */
  useEffect(() => {
    const dk = todayKey();
    setDateKey(dk);
    setUnlimitedBest(loadBest(`${opts.gameKey}-unlimited`));
    if (opts.daily) {
      const rec = loadDailyRecord<PromptDailyRecord>(opts.gameKey, dk);
      if (rec) {
        setRecord(rec);
        setPhase("locked");
        return;
      }
      setDeck(dailyPrompts(dk));
    } else {
      setDeck(shuffled(PROMPTS, mulberry32(Date.now() >>> 0)));
    }
    setPhase("ready");
  }, []);

  /* ---------- stable submit for the timer ---------- */
  const submitRef = useRef<(raw: string) => void>(() => undefined);

  /* ---------- per-question timer ---------- */
  useEffect(() => {
    if (phase !== "question") return;
    answeredRef.current = false;
    setTimeLeft(opts.secondsPerPrompt);
    const started = Date.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, opts.secondsPerPrompt - (Date.now() - started) / 1000);
      setTimeLeft(left);
      if (left <= 0) {
        window.clearInterval(id);
        submitRef.current("");
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, index]);

  const submit = useCallback(
    (raw: string) => {
      if (phase !== "question" || answeredRef.current) return;
      answeredRef.current = true;
      const prompt = deck[index];
      if (!prompt) return;
      const idx = buildAnswerIndex(prompt.tiers);
      const hit = lookupAnswer(raw, idx);
      const tier =
        hit.matched && hit.tier
          ? tierForTierKey(hit.tier, opts.scoring)
          : missedTier(opts.scoring);
      setLastTier(tier);
      setLastAnswer(raw.trim());
      setResults((r) => [
        ...r,
        { promptId: prompt.id, promptText: prompt.text, answer: raw.trim(), tier },
      ]);
      if (!opts.daily) {
        setSession((s) => ({ score: s.score + tier.points, count: s.count + 1 }));
      }
      setPhase("reveal");
    },
    [phase, deck, index, opts.scoring, opts.daily]
  );

  /**
   * Preview an answer without committing it — used to reject invalid
   * answers inline (red "not in our list" style error) exactly like the
   * reference, where a wrong word never consumes the prompt.
   */
  const checkAnswer = useCallback(
    (raw: string): Tier | null => {
      const prompt = deck[index];
      if (!prompt) return null;
      const idx: AnswerIndex = buildAnswerIndex(prompt.tiers);
      const hit = lookupAnswer(raw, idx);
      return hit.matched && hit.tier
        ? tierForTierKey(hit.tier, opts.scoring)
        : null;
    },
    [deck, index, opts.scoring]
  );

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  const finishDaily = useCallback(
    (rs: PromptResult[]) => {
      const total = rs.reduce((s, r) => s + r.tier.points, 0);
      const rec: PromptDailyRecord = {
        date: todayKey(),
        total,
        max: rs.length * 100,
        emojis: rs.map((r) => r.tier.emoji),
      };
      saveDailyRecord(opts.gameKey, rec);
      const st = bumpStreak(opts.gameKey, rec.date);
      rec.streak = st.count;
      setStreak(st.count);
      setRecord(rec);
    },
    [opts.gameKey]
  );

  const next = useCallback(() => {
    if (opts.daily) {
      if (index + 1 >= deck.length) {
        setPhase("finished");
        finishDaily(results);
      } else {
        setIndex((i) => i + 1);
        setPhase("question");
      }
    } else {
      setIndex((i) => {
        const ni = i + 1;
        if (ni >= deck.length) {
          setDeck(shuffled(PROMPTS, mulberry32((Date.now() ^ ni) >>> 0)));
          return 0;
        }
        return ni;
      });
      setPhase("question");
    }
  }, [opts.daily, index, deck.length, results, finishDaily]);

  const start = useCallback(() => {
    setIndex(0);
    setResults([]);
    setLastTier(null);
    setPhase("question");
  }, []);

  /* ---------- persist unlimited best ---------- */
  useEffect(() => {
    if (!opts.daily && session.score > 0) {
      const b = saveBestIfHigher(`${opts.gameKey}-unlimited`, session.score);
      setUnlimitedBest(b);
    }
  }, [session.score]);

  const total = useMemo(
    () => results.reduce((s, r) => s + r.tier.points, 0),
    [results]
  );

  const shareText = useMemo(() => {
    const { daily: isDaily, scoring: mode } = opts;
    if (phase !== "finished" || !isDaily) return "";
    const emojis = results.map((r) => r.tier.emoji);
    if (opts.gameKey === "krillion-city") {
      return krillionCityShare(formatLongDate(dateKey), total, emojis, streak);
    }
    if (mode === "rare") {
      return krillionShare(formatLongDate(dateKey), total, emojis, streak);
    }
    return noillirkShare(formatLongDate(dateKey), total, emojis);
  }, [phase, results, streak, dateKey, total, opts]);

  return {
    phase,
    dateKey,
    deck,
    index,
    prompt: deck[index] as PromptEntry | undefined,
    results,
    total,
    max: opts.daily ? opts.promptsPerGame * 100 : 0,
    timeLeft,
    secondsPerPrompt: opts.secondsPerPrompt,
    lastTier,
    lastAnswer,
    streak,
    record,
    session,
    unlimitedBest,
    shareText,
    start,
    submit,
    checkAnswer,
    next,
  };
}
