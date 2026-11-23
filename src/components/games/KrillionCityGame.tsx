"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePromptGame } from "@/hooks/usePromptGame";
import { dailyNumber } from "@/lib/daily";
import { MidnightCountdown } from "@/components/game/MidnightCountdown";
import { CityCanvas } from "@/components/game/pixel/CityCanvas";
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

/**
 * Krillion City — the same daily answer game as Krillion, but you
 * climb UP a city skyline instead of diving down. The rarest answer
 * scores highest (100 points = 1,000 metres up). Seven prompts,
 * 25 seconds each, one attempt a day.
 *
 *   type → CLIMB → invalid? pink "…was not accepted" inline error,
 *   prompt survives. valid? the bird takes the answer tag and FLIES
 *   UP — the whole city scrolls down, the height counter runs —
 *   then the full-screen rarity reveal. NEXT ↑ lands you at the
 *   next prompt. QUIT → the climb log.
 *
 * HUD matches Krillion's clean style: HEIGHT box top-left, PROMPT
 * n OF 7 with seven segment squares top-centre, dark Sound/QUIT
 * top-right, a vertical altitude ruler with a pink arrow marker
 * down the right edge, a wide dark prompt card, the bird perched
 * on the card's top edge with its answer tag beside it, and a
 * bottom bar with a circular countdown, a cyan-bordered input,
 * PASS and a hot-pink CLIMB button.
 */

type Stage = "ask" | "rising" | "reveal";

/* the city's real layers, by height — shown under the HEIGHT box
   while playing so the climb reads as a journey up. */
function zoneName(altM: number): string {
  if (altM < 200) return "STREET LEVEL";
  if (altM < 1000) return "ROOFTOPS";
  if (altM < 4000) return "SKYLINE";
  if (altM < 6000) return "ABOVE THE CLOUDS";
  return "EDGE OF SPACE";
}

/* The city bird — a clean SVG pigeon (not pixel art, to match
   Krillion's clean look). Wings flap via a self-contained CSS
   keyframe; the body bobs gently. */
function BirdSwimmer({ pixel = 2 }: { pixel?: number }) {
  const w = 30 * pixel; // 60px at pixel=2 (same size as the krill)
  return (
    <svg
      width={w}
      height={w * 0.62}
      viewBox="0 0 120 74"
      role="img"
      aria-label="City bird"
      style={{ overflow: "visible" }}
    >
      <style>{`
        @keyframes birdFlap { 0%,100% { transform: rotate(14deg); } 50% { transform: rotate(-22deg); } }
        @keyframes birdBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        .bird-body { animation: birdBob 1.6s ease-in-out infinite; transform-origin: 60px 44px; }
        .bird-wing { animation: birdFlap 0.55s ease-in-out infinite; transform-origin: 58px 42px; }
        .bird-wing-back { animation: birdFlap 0.55s ease-in-out infinite; transform-origin: 62px 40px; animation-delay: 0.08s; }
      `}</style>
      <g className="bird-body">
        {/* back wing (darker, behind the body) */}
        <path className="bird-wing-back" d="M62 40 C 52 18, 38 10, 30 12 C 40 26, 50 38, 60 44 Z" fill="#5B6B7A" />
        {/* tail */}
        <path d="M28 48 L 8 40 L 10 52 L 28 54 Z" fill="#7A8A99" />
        <path d="M28 50 L 12 52 L 26 56 Z" fill="#5B6B7A" />
        {/* body — plump pigeon */}
        <ellipse cx="60" cy="46" rx="34" ry="20" fill="#8A9BA8" />
        <ellipse cx="66" cy="52" rx="24" ry="12" fill="#B8C4CE" />
        {/* neck + head */}
        <ellipse cx="90" cy="30" rx="12" ry="16" fill="#7A8A99" transform="rotate(18 90 30)" />
        <circle cx="94" cy="20" r="11" fill="#8A9BA8" />
        {/* iridescent neck patch */}
        <ellipse cx="88" cy="30" rx="6" ry="10" fill="#3E9B8A" opacity="0.85" transform="rotate(18 88 30)" />
        {/* beak */}
        <path d="M104 18 L 114 21 L 104 25 Z" fill="#E8912D" />
        {/* eye */}
        <circle cx="96" cy="18" r="2.6" fill="#1A2433" />
        <circle cx="97" cy="17" r="0.9" fill="#FFFFFF" />
        {/* front wing (flapping) */}
        <path className="bird-wing" d="M58 42 C 50 16, 34 6, 24 10 C 36 26, 46 40, 56 48 Z" fill="#6B7B8A" />
        {/* feet (tucked) */}
        <path d="M52 64 L 52 68 M 62 64 L 62 68" stroke="#E8912D" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function KrillionCityInner() {
  const game = usePromptGame({
    gameKey: "krillion-city",
    scoring: "rare",
    daily: true,
    promptsPerGame: 7,
    secondsPerPrompt: 25,
  });
  const [typed, setTyped] = useState("");
  const [stage, setStage] = useState<Stage>("ask");
  const [invalid, setInvalid] = useState<string | null>(null);
  const [altitude, setAltitude] = useState(0); // animated height in metres
  // milestone toast — shown briefly each time the climb passes
  // another whole kilometre (1000m, 2000m, ...). The ref tracks
  // the highest kilometre already celebrated.
  const [milestone, setMilestone] = useState<number | null>(null);
  const milestoneRef = useRef(0);
  const milestoneTimer = useRef<number | null>(null);
  const [rising, setRising] = useState(false); // bird flies up
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);
  const altFrom = useRef(0);
  const altTo = useRef(0);
  const invalidTimer = useRef<number | null>(null);
  const stageTimer = useRef<number | null>(null);
  const { play, soundOn } = useGameSound();

  const playing = game.phase === "question" || game.phase === "reveal";
  const targetAlt = Math.min(7000, game.total * 10);

  /* ---------- animated height counter (rAF ease-out) ---------- */
  useEffect(() => {
    altFrom.current = altitude;
    altTo.current = targetAlt;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (altitude === targetAlt) return;
    const t0 = performance.now();
    const dur = 1400;
    const from = altFrom.current;
    const delta = altTo.current - from;
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

  /* celebrate each whole kilometre passed (1000m, 2000m, ...)
     with a brief toast. Fires once per kilometre per climb. */
  useEffect(() => {
    const km = Math.floor(altitude / 1000);
    if (km > milestoneRef.current && altitude >= 1000) {
      milestoneRef.current = km;
      setMilestone(km * 1000);
      if (milestoneTimer.current) window.clearTimeout(milestoneTimer.current);
      milestoneTimer.current = window.setTimeout(() => setMilestone(null), 2600);
    }
    if (altitude === 0) milestoneRef.current = 0;
  }, [altitude]);

  /* focus the input on every new prompt */
  useEffect(() => {
    if (game.phase === "question" && stage === "ask") inputRef.current?.focus();
  }, [game.phase, game.index, stage]);

  /* countdown ticks over the final five seconds */
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

  /* warm breeze ambience while a climb is running (the forest
     bed is a breeze + birds — the closest bed to a city sky) */
  useEffect(() => {
    if (playing) startAmbience("forest", soundOn);
    else stopAmbience();
    return () => stopAmbience();
  }, [playing, soundOn]);

  /* whoosh on the very first climb, fanfare at the log */
  useEffect(() => {
    if (game.phase === "question" && game.index === 0 && game.results.length === 0) {
      play("whoosh");
    }
    if (game.phase === "finished") play("chime");
  }, [game.phase]);

  /* clear pending timers */
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

  /* ---------- timer expiry / PASS → the No Catch flow ---------- */
  useEffect(() => {
    if (game.phase === "reveal" && stage === "ask") {
      // the hook auto-passed on expiry — brief pause, then reveal
      play("whoosh");
      stageTimer.current = window.setTimeout(() => setStage("reveal"), 650);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.phase]);

  const submitTyped = useCallback(() => {
    if (!typed.trim() || game.phase !== "question" || stage !== "ask") return;
    const tier = game.checkAnswer(typed);
    if (!tier) {
      /* a wrong word never consumes the prompt */
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

  const quit = () => {
    stopAmbience();
    window.location.assign("/krillion-city");
  };

  const showTheatre = playing && stage !== "reveal";
  const altNow = altitude;
  const hudSub = `CLIMB NO. ${dailyNumber()}`;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "max(560px, calc(100vh - 76px))" }}
      aria-label="Krillion City game"
    >
      {/* the city — genuinely scrolls down as the height runs up */}
      <CityCanvas
        altitude={playing || game.phase === "finished" ? altNow : 0}
        playing={playing}
      />

      {/* altitude ruler down the right edge */}
      {playing && <DepthRuler value={altNow} direction="up" clean />}

      {/* "play today" watermark — mid-scene while playing */}
      {playing && (
        <p className="game-glass pointer-events-none absolute bottom-[24%] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-3.5 py-1.5 font-game-ui text-[10px] font-bold tracking-[0.12em] text-white/70">
          PLAY TODAY AT KRILLIONUNBLOCKED.COM
        </p>
      )}

      {/* ================= HUD ================= */}
      <div className="relative z-10 flex items-start justify-between gap-2 px-3 pt-3 sm:px-5 sm:pt-4">
        {playing ? (
          <>
            <div className="flex flex-col items-start gap-1.5">
              <DepthHud label="HEIGHT" value={`${formatNumber(altNow)}m`} sub={hudSub} clean />
              {/* current city layer — the climb's journey up */}
              <span
                key={zoneName(altNow)}
                className="game-glass animate-[fadeIn_0.5s_ease] rounded-full px-3 py-1 font-game-ui text-[10px] font-bold tracking-[0.18em] text-[#FFD98A]"
              >
                {zoneName(altNow)}
              </span>
            </div>
            <PipsChip index={game.index} total={game.deck.length || 7} clean />
          </>
        ) : (
          <span className="game-glass inline-flex h-10 items-center gap-2 rounded-full px-4 font-game-ui text-[11px] font-bold tracking-[0.15em] text-white/65">
            MODE <span className="font-bold text-[#FFD98A]">THE DAILY CLIMB</span>
          </span>
        )}
        <div className="flex items-center gap-2">
          <SoundButton clean />
          {playing && <QuitButton onClick={quit} clean />}
        </div>
      </div>

      {/* kilometre milestone toast — brief celebration each whole
          kilometre passed (1km, 2km, ...). */}
      {milestone !== null && playing && (
        <div className="pointer-events-none absolute left-1/2 top-[16%] z-20 -translate-x-1/2 text-center">
          <p className="animate-[fadeIn_0.4s_ease] rounded-full bg-[#FF2E63]/90 px-6 py-2.5 font-game-ui text-[15px] font-black tracking-[0.14em] text-white shadow-[0_8px_30px_rgba(255,46,99,0.45)]">
            {milestone >= 1000 ? `${milestone / 1000} KM UP!` : `${milestone}m!`}
          </p>
        </div>
      )}

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 flex min-h-[max(500px,calc(100vh-140px))] flex-col px-4 pb-6 sm:px-6">
        {/* ---------- already played today ---------- */}
        {game.phase === "locked" && game.record && (
          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center py-8 text-center">
            <PixelLogo title="Climb complete" className="text-2xl sm:text-3xl" clean />
            <p className="game-glass mt-3 rounded-full px-5 py-2 font-game-ui text-[11px] font-bold tracking-[0.15em] text-white/85">
              THE NEXT CLIMB STARTS AT MIDNIGHT
            </p>
            <p className="mt-6 font-game-ui text-[16px] font-semibold leading-relaxed text-white/90">
              You scored <strong className="text-[#FFD98A]">{game.record.total}</strong> of{" "}
              {game.record.max} and reached{" "}
              <strong className="text-[#FFD98A]">
                {formatNumber(Math.min(7000, game.record.total * 10))}m
              </strong>{" "}
              high.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {(game.record.emojis ?? []).map((e, i) => (
                <span key={i} className="game-glass flex h-10 w-10 items-center justify-center rounded-full text-base">
                  {e}
                </span>
              ))}
            </div>
            <div className="game-glass mx-auto mt-6 flex items-center justify-center rounded-full px-5 py-3 font-game-ui text-[15px] font-bold">
              <MidnightCountdown />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <NavyButton href="/krillion-unblocked" clean>PLAY KRILLION</NavyButton>
              <NavyButton href="/noillirk" clean>PLAY NOILLIRK</NavyButton>
            </div>
          </div>
        )}

        {/* ---------- ready screen ---------- */}
        {game.phase === "ready" && (
          <div className="relative flex flex-1 flex-col items-center justify-center py-8 text-center">
            {/* promo card — right side: the original dive game */}
            <Link
              href="/krillion-unblocked"
              className="game-glass absolute right-[3%] top-[55%] z-10 hidden w-[230px] rounded-2xl p-4 text-left transition-transform hover:-translate-y-0.5 lg:block"
            >
              <p className="font-game-ui text-[13px] font-bold text-white">
                Psst... Try the original dive?
              </p>
              <p className="mt-1 font-game-ui text-[10px] font-bold tracking-[0.12em] text-white/60">
                THE RARER, THE DEEPER
              </p>
              <span className="mt-2.5 inline-flex h-9 items-center rounded-full bg-[#F5C242] px-4 font-game-ui text-[11px] font-extrabold tracking-[0.08em] text-[#0B2233]">
                PLAY KRILLION ›
              </span>
              <span className="absolute -bottom-3 -right-2" aria-hidden="true">
                <PixelSprite name="krill" pixel={2} />
              </span>
            </Link>

            {/* the city bird, above the title */}
            <span className="mb-4 block" aria-hidden="true">
              <BirdSwimmer pixel={3} />
            </span>

            <PixelLogo clean title="Krillion City" accentWords={[2]} />
            <p className="mt-4 font-game-ui text-[12px] font-extrabold tracking-[0.35em] text-[#0B2233]/85 sm:text-[14px]">
              {`THE DAILY CLIMB | NO. ${dailyNumber()}`}
            </p>

            <p className="game-glass mx-auto mt-6 max-w-md rounded-2xl px-5 py-3 font-game-ui text-[14px] font-semibold leading-relaxed text-white/90">
              Krillion above the streets: the <strong className="text-[#FFD98A]">rarest</strong>{" "}
              answer scores highest. Same seven prompts as today&apos;s dive — but you fly
              up the skyline instead of down the trench.
            </p>

            <div className="mx-auto mt-7 w-full max-w-md">
              <PixelCta arrows="up" onClick={game.start} className="w-full" clean>
                BEGIN CLIMB
              </PixelCta>
            </div>

            <p className="mt-8 font-game-ui text-[11px] font-bold tracking-[0.2em] text-white/60">
              FREE · NO ACCOUNT · RESETS AT MIDNIGHT
            </p>

            {/* bottom-right site line */}
            <p className="absolute bottom-1 right-1 font-game-ui text-[10px] font-semibold tracking-[0.15em] text-white/55">
              THE DAILY CLIMB IS AT KRILLIONUNBLOCKED.COM
            </p>
          </div>
        )}

        {/* ---------- question theatre ---------- */}
        {showTheatre && game.prompt && (
          <div className="flex flex-1 flex-col justify-between pt-6 sm:pt-8">
            {/* the question box + the bird — during "ask" it perches
                on the card's top edge. When the user answers, the
                card goes away and the bird itself flies up through
                the sky (38vh over the 1.5s climb) — the bird rises
                with the answer. On a pass there is no flight, so
                the bird leaves with the card. The typed answer tag
                sits beside the bird on the card's top edge while
                asking. */}
            <div className="relative mx-auto mt-2 w-full max-w-3xl">
              {(stage === "ask" || rising) && (
                <div
                  className="absolute -top-4 left-6 z-10"
                  style={{
                    transform: rising
                      ? "translateY(-38vh) scale(0.85)"
                      : "translateY(0) scale(1)",
                    opacity: rising ? 0.9 : 1,
                    transition: "transform 1.45s ease-in, opacity 1.45s ease-in",
                  }}
                  aria-hidden="true"
                >
                  <span className="pd-anim-bob block">
                    <BirdSwimmer pixel={2} />
                  </span>
                </div>
              )}
              {stage === "ask" && (
                <div className="absolute -top-4 left-24 z-10 flex h-8 items-center">
                  {typed.trim() !== "" && (
                    <span className="game-glass pd-anim-rise whitespace-nowrap rounded-full px-4 py-2 font-game-ui text-[13px] font-bold text-white">
                      {typed.trim()} <span className="text-white/50">▴</span>
                    </span>
                  )}
                </div>
              )}
              {stage === "ask" ? (
                <PromptCard clean
                  key={game.index}
                  category={difficultyFor(game.prompt.id)}
                  question={game.prompt.text}
                  caption="rarer answers climb higher"
                  arrows="up"
                  sliding
                />
              ) : (
                <div className="h-[132px]" />
              )}
            </div>

            {/* flexible gap — the sky above the bird stays open */}
            <div className="flex-1" />

            {/* ---------- bottom dock: error + countdown + input ---------- */}
            <div className="mx-auto w-full max-w-2xl">
              {/* invalid answer — pink inline error, prompt survives */}
              <div className="flex h-6 items-center justify-center">
                {invalid && (
                  <p className="pd-anim-error font-game-ui text-[12px] font-bold tracking-[0.06em] text-[#FF5A72]" role="alert">
                    {invalid}
                  </p>
                )}
              </div>

              <AnswerBar clean
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

        {/* ---------- finished: the climb log ---------- */}
        {game.phase === "finished" && (
          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-6">
            <div className="game-glass rounded-3xl px-5 py-5 sm:px-7">
              {/* big height + points */}
              <div className="text-center">
                <p
                  className="pd-anim-pop font-game-ui text-[48px] font-black leading-none text-[#FFD98A] sm:text-[56px]"
                  style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
                >
                  {formatNumber(targetAlt)}m
                </p>
                <p className="mt-2 font-game-ui text-[12px] font-extrabold tracking-[0.2em] text-white/75">
                  {formatNumber(game.total)} POINTS {game.streak > 1 ? `· STREAK ${game.streak}` : ""}
                </p>
              </div>

              {/* climb log rows — the reference ANSWERS list */}
              <div className="mt-4">
                <ResultsLog results={game.results} mode="rare" clean />
              </div>

              {/* actions */}
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <PixelCta clean
                  arrows="up"
                  className="!min-h-[48px] !whitespace-nowrap !px-4 !text-[12px]"
                  onClick={() => {
                    stopAmbience();
                    game.start();
                    setAltitude(0);
                    setStage("ask");
                  }}
                >
                  CLIMB AGAIN
                </PixelCta>
                <NavyButton className="justify-center" onClick={share} clean>
                  {copied ? "COPIED ✓" : "SHARE"}
                </NavyButton>
                <NavyButton className="justify-center" href="/krillion-city" clean>
                  MENU
                </NavyButton>
              </div>
            </div>

            <div className="game-glass mx-auto mt-4 flex items-center justify-center rounded-full px-5 py-3 font-game-ui text-[15px] font-bold">
              <MidnightCountdown />
            </div>
          </div>
        )}
      </div>

      {/* ================= BOOT / LOADING ================= */}
      {game.phase === "boot" && <LoadingScreen sprite="bird" pixel={6} clean />}

      {/* ================= THE ANSWER REVEAL ================= */}
      {playing && stage === "reveal" && game.lastTier && (
        <RarityReveal
          key={`reveal-${game.index}`}
          tier={game.lastTier}
          answer={game.lastAnswer}
          mode="climb"
          onNext={next}
          clean
        />
      )}
    </section>
  );
}

export function KrillionCityGame() {
  return (
    <SoundProvider>
      <KrillionCityInner />
    </SoundProvider>
  );
}
