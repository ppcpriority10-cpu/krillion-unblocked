"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePromptGame } from "@/hooks/usePromptGame";
import { MidnightCountdown } from "@/components/game/MidnightCountdown";
import { ForestScene } from "@/components/game/pixel/ForestScene";
import { PixelSprite } from "@/components/game/pixel/PixelSprite";
import { RarityReveal } from "@/components/game/RarityReveal";
import { ResultsLog } from "@/components/game/ResultsLog";
import {
  AnswerBar,
  DepthHud,
  DepthRuler,
  LoadingScreen,
  NavyButton,
  PipsChip,
  PixelCta,
  PixelLogo,
  PromptCard,
  QuitButton,
  SoundButton,
  SoundProvider,
  useGameSound,
} from "@/components/game/ArcadeUI";
import { startAmbience, stopAmbience } from "@/lib/sound";
import { formatNumber } from "@/lib/scoring";
import { difficultyFor } from "@/lib/categories";
import { clipboardCopy } from "@/lib/share";
import { todayKey, dailyNumber } from "@/lib/daily";

/**
 * The reversed daily — the MOST common answer wins, rebuilt against the
 * recorded reference gameplay: type → CLIMB → invalid? pink inline
 * error. valid? the balloon climber takes the tag and RISES through
 * the forest canopy, the altitude counter runs, then the rarity
 * reveal with the segmented meter and NEXT ↑ lands you at the next
 * prompt.
 *
 * HUD matches the reference: ALTITUDE box top-left, PROMPT n OF 7
 * with seven segment squares top-centre, dark Sound/QUIT top-right,
 * a vertical altitude ruler with a pink arrow marker down the right
 * edge, a wide dark prompt card, the balloon krill mid-canopy with
 * its answer tag underneath, and a bottom bar with a circular
 * countdown, a cyan-bordered input, PASS and a hot-pink CLIMB button.
 */

type Stage = "ask" | "rising" | "reveal";

function NoillirkInner() {
  const game = usePromptGame({
    gameKey: "noillirk",
    scoring: "common",
    daily: true,
    promptsPerGame: 7,
    secondsPerPrompt: 25,
  });
  const [typed, setTyped] = useState("");
  const [stage, setStage] = useState<Stage>("ask");
  const [invalid, setInvalid] = useState<string | null>(null);
  const [altitude, setAltitude] = useState(0);
  const [rising, setRising] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);
  const invalidTimer = useRef<number | null>(null);
  const stageTimer = useRef<number | null>(null);
  const { play, soundOn } = useGameSound();

  const playing = game.phase === "question" || game.phase === "reveal";
  const targetAlt = Math.min(7000, game.total * 10);

  /* ---------- animated altitude counter ---------- */
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const from = altitude;
    const delta = targetAlt - from;
    if (delta === 0) return;
    const t0 = performance.now();
    const dur = 1400;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setAltitude(Math.round(from + delta * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAlt]);

  useEffect(() => {
    if (game.phase === "question" && stage === "ask") inputRef.current?.focus();
  }, [game.phase, game.index, stage]);

  /* ticks over the final five seconds */
  const lastTick = useRef(99);
  useEffect(() => {
    if (game.phase !== "question" || stage !== "ask") return;
    const n = Math.ceil(game.timeLeft);
    if (n <= 5 && n > 0 && n !== lastTick.current) {
      lastTick.current = n;
      play("tick");
    }
    if (n > 5) lastTick.current = 99;
  }, [game.timeLeft, game.phase, stage, play]);

  /* forest ambience while climbing */
  useEffect(() => {
    if (playing) startAmbience("forest", soundOn);
    else stopAmbience();
    return () => stopAmbience();
  }, [playing, soundOn]);

  useEffect(() => {
    if (game.phase === "question" && game.index === 0 && game.results.length === 0) {
      play("whoosh");
    }
    if (game.phase === "finished") play("chime");
  }, [game.phase]);

  useEffect(() => {
    return () => {
      if (invalidTimer.current) window.clearTimeout(invalidTimer.current);
      if (stageTimer.current) window.clearTimeout(stageTimer.current);
    };
  }, []);

  const showInvalid = useCallback(
    (msg: string) => {
      play("buzz");
      setInvalid(msg);
      if (invalidTimer.current) window.clearTimeout(invalidTimer.current);
      invalidTimer.current = window.setTimeout(() => setInvalid(null), 2400);
    },
    [play]
  );

  /* timer expiry / PASS → the No Catch flow */
  useEffect(() => {
    if (game.phase === "reveal" && stage === "ask") {
      play("whoosh");
      stageTimer.current = window.setTimeout(() => setStage("reveal"), 650);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.phase]);

  const submitTyped = useCallback(() => {
    if (!typed.trim() || game.phase !== "question" || stage !== "ask") return;
    const tier = game.checkAnswer(typed);
    if (!tier) {
      showInvalid(`"${typed.trim()}" was not accepted`);
      return;
    }
    play("swoosh");
    game.submit(typed);
    setTyped("");
    setStage("rising");
    setRising(true);
    if (stageTimer.current) window.clearTimeout(stageTimer.current);
    stageTimer.current = window.setTimeout(() => {
      setStage("reveal");
      setRising(false);
      play("pop");
    }, 1500);
  }, [typed, game, stage, play, showInvalid]);

  const pass = useCallback(() => {
    if (game.phase !== "question" || stage !== "ask") return;
    play("whoosh");
    game.submit("");
    setTyped("");
    setStage("rising");
    setRising(false);
    if (stageTimer.current) window.clearTimeout(stageTimer.current);
    stageTimer.current = window.setTimeout(() => setStage("reveal"), 700);
  }, [game, stage, play]);

  const next = useCallback(() => {
    if (stageTimer.current) window.clearTimeout(stageTimer.current);
    setStage("ask");
    setInvalid(null);
    game.next();
  }, [game]);

  const share = useCallback(async () => {
    const ok = await clipboardCopy(game.shareText);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  }, [game.shareText]);

  const showTheatre = playing && stage !== "reveal";

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "max(560px, calc(100vh - 76px))" }}
      aria-label="Noillirk game"
    >
      {/* forest scene: the canopy sinks away as you climb */}
      <ForestScene
        climbTint={playing || game.phase === "finished" ? altitude / 7000 : 0}
        playing={playing}
      />

      {/* altitude ruler down the right edge */}
      {playing && <DepthRuler value={altitude} direction="up" />}

      {/* subtle scanline / CRT texture across the whole frame */}
      <div className="pd-scanlines pointer-events-none absolute inset-0 z-50" aria-hidden="true" />

      {/* HUD */}
      <div className="relative z-10 flex items-start justify-between gap-2 px-3 pt-3 sm:px-5 sm:pt-4">
        {playing ? (
          <>
            <DepthHud label="ALTITUDE" value={`${formatNumber(altitude)}m`} sub={`CLIMB NO. ${dailyNumber()}`} />
            <PipsChip index={game.index} total={game.deck.length || 7} />
          </>
        ) : (
          <span className="pd-chip inline-flex h-9 items-center gap-2 rounded-md px-3 font-pixel-ui text-[9px] tracking-[0.2em] text-white/60">
            MODE <span className="font-bold text-[#FFD98A]">THE DAILY CLIMB</span>
          </span>
        )}
        <div className="flex items-center gap-2">
          <SoundButton />
          {playing && <QuitButton onClick={() => window.location.assign("/noillirk")} />}
        </div>
      </div>

      <div className="relative z-10 flex min-h-[max(500px,calc(100vh-140px))] flex-col px-4 pb-6 sm:px-6">
        {/* locked */}
        {game.phase === "locked" && game.record && (
          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center py-8 text-center">
            <PixelLogo title="Climb complete" className="text-2xl sm:text-3xl" />
            <p className="pd-chip mt-3 rounded-md px-4 py-2 font-pixel-ui text-[10px] tracking-[0.2em] text-white/85">
              THE NEXT BALLOON LEAVES AT MIDNIGHT
            </p>
            <p className="mt-6 font-game-mono text-[15px] leading-relaxed text-white">
              You scored <strong className="text-[#FFD98A]">{game.record.total}</strong> of{" "}
              {game.record.max} and floated to{" "}
              <strong className="text-[#FFD98A]">
                {formatNumber(Math.min(7000, game.record.total * 10))}m
              </strong>
              .
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {(game.record.emojis ?? []).map((e, i) => (
                <span key={i} className="pd-chip flex h-9 w-9 items-center justify-center rounded-md text-base">
                  {e}
                </span>
              ))}
            </div>
            <div className="pd-chip mx-auto mt-6 flex items-center justify-center rounded-md px-5 py-3 font-game-mono text-sm">
              <MidnightCountdown />
            </div>
            <div className="mt-6">
              <NavyButton href="/krillion-unblocked">DIVE THE ORIGINAL</NavyButton>
            </div>
          </div>
        )}

        {/* ready */}
        {game.phase === "ready" && (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <PixelSprite name="balloonKrill" pixel={4} className="pd-anim-bob mb-6" />

            <PixelLogo title="Noillirk" className="pd-logo-anaglyph" />
            <p className="mt-4 font-pixel-ui text-[11px] font-bold tracking-[0.5em] text-[#F4407A] sm:text-[13px]">
              THE DAILY CLIMB | NO. {dailyNumber()}
            </p>

            <p className="pd-chip mx-auto mt-6 max-w-md rounded-md px-5 py-3 font-game-mono text-[14px] leading-relaxed text-white">
              Krillion upside down: the <strong>most popular</strong> answer scores highest.
              Same seven prompts as today&apos;s dive — opposite goal.
            </p>

            {/* stacked full-width menu bars — DAILY / CLASSIC / ENDLESS / BEGIN */}
            <div className="mx-auto mt-7 flex w-full max-w-md flex-col gap-2.5">
              <span className="flex h-12 items-center justify-center rounded-[6px] border-2 border-[#0B2233]/70 bg-[#7DE9F7] font-pixel-ui text-[13px] font-bold uppercase tracking-[0.22em] text-[#0B2233] shadow-[0_3px_0_0_#0B2233]">
                Daily
              </span>
              <Link
                href="/krillion-unblocked"
                className="flex h-12 items-center justify-center rounded-[6px] border-2 border-white/15 bg-[#0F2438]/70 font-pixel-ui text-[13px] font-bold uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm transition-colors hover:bg-[#0F2438]/90 hover:text-white"
              >
                Classic
              </Link>
              <Link
                href="/unlimited"
                className="flex h-12 items-center justify-center rounded-[6px] border-2 border-white/15 bg-[#0F2438]/70 font-pixel-ui text-[13px] font-bold uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm transition-colors hover:bg-[#0F2438]/90 hover:text-white"
              >
                Endless
              </Link>
              <PixelCta arrows="up" onClick={game.start} className="w-full">
                BEGIN ASCENT
              </PixelCta>
            </div>

            <p className="mt-8 font-pixel-ui text-[9px] tracking-[0.3em] text-white/55">
              FREE · NO ACCOUNT · RESETS AT MIDNIGHT
            </p>
          </div>
        )}

        {/* question theatre */}
        {showTheatre && game.prompt && (
          <div className="flex flex-1 flex-col justify-between pt-6 sm:pt-8">
            {/* wide dark prompt card — difficulty in cyan, pixel prompt */}
            {stage === "ask" ? (
              <div className="mx-auto mt-[18vh] w-full max-w-3xl">
                <PromptCard
                  key={game.index}
                  category={difficultyFor(game.prompt.id)}
                  question={game.prompt.text}
                  caption="common answers climb higher"
                  arrows="up"
                  sliding
                />
              </div>
            ) : (
              <div className="mx-auto mt-[18vh] w-full max-w-3xl" />
            )}

            {/* flexible gap — the balloon floats mid-canopy, tag underneath */}
            <div className="flex flex-1 items-center justify-center">
              <div
                className="relative flex flex-col items-center"
                style={{
                  transform: rising ? "translateY(-96px) scale(0.9)" : "translateY(0) scale(1)",
                  opacity: rising ? 0.85 : 1,
                  transition: "transform 1.45s ease-in, opacity 1.45s ease-in",
                }}
                aria-hidden="true"
              >
                <span className="pd-anim-bob block">
                  <PixelSprite name="balloonKrill" pixel={3} />
                </span>
                <span className="mt-2 flex h-8 items-start justify-center">
                  {stage === "ask" && typed.trim() !== "" && (
                    <span className="pd-anim-rise whitespace-nowrap rounded-[6px] border border-white/25 bg-[#15351F]/92 px-3 py-1.5 font-game-mono text-[11px] font-bold text-white shadow-[0_4px_0_0_rgba(0,0,0,0.3)]">
                      {typed.trim()} <span className="text-white/55">▴</span>
                    </span>
                  )}
                  {stage === "rising" && game.lastAnswer && (
                    <span className="whitespace-nowrap rounded-[6px] border border-white/25 bg-[#15351F]/92 px-3 py-1.5 font-game-mono text-[11px] font-bold text-white shadow-[0_4px_0_0_rgba(0,0,0,0.3)]">
                      {game.lastAnswer} <span className="text-[#FFD98A]">✓</span>
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* ---------- bottom dock ---------- */}
            <div className="mx-auto w-full max-w-2xl">
              <div className="flex h-6 items-center justify-center">
                {invalid && (
                  <p className="pd-anim-error font-game-mono text-[10px] font-bold tracking-[0.14em] text-[#FF5A72]" role="alert">
                    {invalid}
                  </p>
                )}
              </div>

              <AnswerBar
                inputRef={inputRef}
                value={typed}
                onChange={(v) => {
                  setTyped(v);
                  if (invalid) setInvalid(null);
                }}
                onSubmit={submitTyped}
                onPass={pass}
                seconds={game.timeLeft}
                totalSeconds={game.secondsPerPrompt}
                submitLabel="CLIMB"
                disabled={stage !== "ask"}
              />
            </div>
          </div>
        )}

        {/* finished: the climb log */}
        {game.phase === "finished" && (
          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-6">
            <div className="rounded-[10px] border border-white/15 bg-[#0B1A0F]/88 px-4 py-4 sm:px-6">
              <div className="text-center">
                <p
                  className="pd-anim-pop font-pixel text-[40px] font-bold leading-none text-[#FFD98A] sm:text-[50px]"
                  style={{ textShadow: "4px 4px 0 rgba(15,34,18,0.85)" }}
                >
                  {formatNumber(targetAlt)}m
                </p>
                <p className="mt-2 font-pixel-ui text-[10px] font-bold tracking-[0.3em] text-white/75">
                  {formatNumber(game.total)} POINTS
                </p>
              </div>

              <div className="mt-4">
                <ResultsLog results={game.results} mode="common" />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <PixelCta
                  arrows="up"
                  className="!min-h-[46px] !whitespace-nowrap !px-3 !text-[10px] !tracking-[0.08em]"
                  onClick={() => {
                    stopAmbience();
                    game.start();
                    setAltitude(0);
                    setStage("ask");
                  }}
                >
                  CLIMB AGAIN
                </PixelCta>
                <NavyButton className="justify-center" onClick={share}>
                  {copied ? "COPIED ✓" : "SHARE"}
                </NavyButton>
                <NavyButton className="justify-center" href="/noillirk">
                  MENU
                </NavyButton>
              </div>
            </div>

            <div className="pd-chip mx-auto mt-4 flex items-center justify-center rounded-md px-5 py-3 font-game-mono text-sm">
              <MidnightCountdown />
            </div>
          </div>
        )}
      </div>

      {/* ================= BOOT / LOADING ================= */}
      {game.phase === "boot" && <LoadingScreen sprite="balloonKrill" pixel={5} />}

      {/* ================= THE ANSWER REVEAL ================= */}
      {playing && stage === "reveal" && game.lastTier && (
        <RarityReveal
          key={`reveal-${game.index}`}
          tier={game.lastTier}
          answer={game.lastAnswer}
          mode="climb"
          onNext={next}
        />
      )}
    </section>
  );
}

export function NoillirkGame() {
  return (
    <SoundProvider>
      <NoillirkInner />
    </SoundProvider>
  );
}
