"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePromptGame } from "@/hooks/usePromptGame";
import { dailyNumber } from "@/lib/daily";
import { MidnightCountdown } from "@/components/game/MidnightCountdown";
import { OceanScene } from "@/components/game/pixel/OceanScene";
import { KrillSwimmer } from "@/components/game/pixel/PixelSprite";
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
  PixelTabs,
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
 * The hero game — rebuilt against the recorded reference gameplay:
 *
 *   type → DIVE → invalid? pink "…was not accepted" inline error,
 *   prompt survives. valid? the krillion takes the answer tag and
 *   SINKS — the whole trench world scrolls, the depth counter runs —
 *   then the full-screen rarity reveal: glowing creature, pixel tier
 *   title, 6-segment COMMON↔RARE bar, quoted answer, •PTS • sink
 *   •food — NEXT ↓ lands you at the next prompt. QUIT → the dive log.
 *
 * HUD matches the reference: DEPTH box top-left, PROMPT n OF 7 with
 * seven segment squares top-centre, dark Sound/QUIT top-right, a
 * vertical depth ruler with a pink arrow marker down the right edge,
 * a wide dark prompt card, the krill mid-water with its answer tag
 * underneath, and a bottom bar with a circular countdown, a
 * cyan-bordered input, PASS and a hot-pink DIVE button.
 */

type Stage = "ask" | "sinking" | "reveal";

/* v35: the ocean's real zones, by depth — shown under the DEPTH
   box while playing so the dive reads as a journey down. */
function zoneName(depthM: number): string {
  if (depthM < 200) return "SUNLIGHT ZONE";
  if (depthM < 1000) return "TWILIGHT ZONE";
  if (depthM < 4000) return "MIDNIGHT ZONE";
  if (depthM < 6000) return "THE ABYSS";
  return "HADAL ZONE";
}

function KrillionInner({ mode = "daily" }: { mode?: "daily" | "unlimited" }) {
  const game = usePromptGame({
    gameKey: "krillion",
    scoring: "rare",
    daily: mode === "daily",
    promptsPerGame: 7,
    secondsPerPrompt: 25,
  });
  const [typed, setTyped] = useState("");
  const [stage, setStage] = useState<Stage>("ask");
  const [invalid, setInvalid] = useState<string | null>(null);
  const [depth, setDepth] = useState(0); // animated depth in metres
  // v35: milestone toast — shown briefly each time the dive passes
  // another whole kilometre (1000m, 2000m, ...). The ref tracks
  // the highest kilometre already celebrated.
  const [milestone, setMilestone] = useState<number | null>(null);
  const milestoneRef = useRef(0);
  const milestoneTimer = useRef<number | null>(null);
  const [sinking, setSinking] = useState(false); // fish drifts down
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);
  const depthFrom = useRef(0);
  const depthTo = useRef(0);
  const invalidTimer = useRef<number | null>(null);
  const stageTimer = useRef<number | null>(null);
  const { play, soundOn } = useGameSound();
  const isUnlimited = mode === "unlimited";

  const playing = game.phase === "question" || game.phase === "reveal";
  const targetDepth = Math.min(7000, game.total * 10);

  /* ---------- animated depth counter (rAF ease-out) ---------- */
  useEffect(() => {
    depthFrom.current = depth;
    depthTo.current = targetDepth;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (depth === targetDepth) return;
    const t0 = performance.now();
    const dur = 1400;
    const from = depthFrom.current;
    const delta = depthTo.current - from;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDepth(Math.round(from + delta * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDepth]);

  /* v35: celebrate each whole kilometre passed (1000m, 2000m,
     ...) with a brief toast. Fires once per kilometre per dive. */
  useEffect(() => {
    const km = Math.floor(depth / 1000);
    if (km > milestoneRef.current && depth >= 1000) {
      milestoneRef.current = km;
      setMilestone(km * 1000);
      if (milestoneTimer.current) window.clearTimeout(milestoneTimer.current);
      milestoneTimer.current = window.setTimeout(() => setMilestone(null), 2600);
    }
    if (depth === 0) milestoneRef.current = 0;
  }, [depth]);

  /* focus the input on every new prompt */
  useEffect(() => {
    if (game.phase === "question" && stage === "ask") inputRef.current?.focus();
  }, [game.phase, game.index, stage]);

  /* countdown ticks over the final five seconds */
  const lastTick = useRef(99);
  /* v20: shared camera ref — the canvas publishes { camY, h, ppm }
     into this every frame and the depth ruler reads it, so the
     ruler's marker sits exactly where the world is (0m on the
     waterline at 0m). Initial values are overwritten on the
     canvas's first frame. */
  const cameraRef = useRef({ camY: 0, h: 270, ppm: 0.42 });
  useEffect(() => {
    if (game.phase !== "question" || stage !== "ask") return;
    const n = Math.ceil(game.timeLeft);
    if (n <= 5 && n > 0 && n !== lastTick.current) {
      lastTick.current = n;
      play("tick");
    }
    if (n > 5) lastTick.current = 99;
  }, [game.timeLeft, game.phase, stage, play]);

  /* underwater ambience while a dive is running */
  useEffect(() => {
    if (playing) startAmbience("ocean", soundOn);
    else stopAmbience();
    return () => stopAmbience();
  }, [playing, soundOn]);

  /* splash on the very first descent, fanfare at the log */
  useEffect(() => {
    if (game.phase === "question" && game.index === 0 && game.results.length === 0) {
      play("splash");
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
      /* the reference: a wrong word never consumes the prompt */
      showInvalid(`"${typed.trim()}" was not accepted`);
      return;
    }
    play("swoosh");
    game.submit(typed);
    setTyped("");
    setStage("sinking");
    setSinking(true);
    if (stageTimer.current) window.clearTimeout(stageTimer.current);
    stageTimer.current = window.setTimeout(() => {
      setStage("reveal");
      setSinking(false);
      play("splash");
    }, 1500);
  }, [typed, game, stage, play, showInvalid]);

  const pass = useCallback(() => {
    if (game.phase !== "question" || stage !== "ask") return;
    play("whoosh");
    game.submit("");
    setTyped("");
    setStage("sinking");
    setSinking(false);
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
    if (isUnlimited) {
      window.location.reload();
    } else {
      window.location.assign("/krillion-unblocked");
    }
  };

  const showTheatre = playing && stage !== "reveal";
  const depthNow = depth;
  const hudSub = isUnlimited
    ? game.unlimitedBest > 0
      ? `BEST: ${formatNumber(game.unlimitedBest * 10)}m`
      : "NO BEST YET"
    : `DIVE NO. ${dailyNumber()}`;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "max(560px, calc(100vh - 76px))" }}
      aria-label="Krillion Unblocked game"
    >
      {/* the trench world — genuinely scrolls as the depth runs */}
      <OceanScene
        depth={playing || game.phase === "finished" ? depthNow : 0}
        playing={playing}
        viewTint={game.phase === "finished" ? 0.75 : undefined}
        cameraRef={cameraRef}
      />


      {/* v34: the side rocks as a TALL STACK that scrolls with
          the sea (their top tracks the waterline, unclamped, so
          the stack slides up as you dive and deeper rocks come
          into view). Sharp native images, exactly as given. */}
      <SideRocks cameraRef={cameraRef} />

      {/* depth ruler down the right edge */}
      {playing && <DepthRuler value={depthNow} direction="down" cameraRef={cameraRef} clean />}

      {/* "play today" watermark — mid-scene while playing, like the
          reference (Noillirk shows the same pill on its climb).
          v36: hidden on phones — it collided with the depth-ruler
          labels on narrow screens. */}
      {playing && (
        <p className="game-glass pointer-events-none absolute bottom-[24%] left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-full px-3.5 py-1.5 font-game-ui text-[10px] font-bold tracking-[0.12em] text-white/70 sm:block">
          PLAY TODAY AT KRILLIONUNBLOCKED.COM
        </p>
      )}

      {/* (v5: scanline/CRT texture removed — the 3D scene renders read
          as a film, not a retro screen; a scanline filter would cheapen
          the look. Noillirk keeps its own.) */}

      {/* ================= HUD ================= */}
      <div className="relative z-10 flex items-start justify-between gap-2 px-3 pt-3 sm:px-5 sm:pt-4">
        {playing ? (
          <>
            <div className="flex flex-col items-start gap-1.5">
              <DepthHud label="DEPTH" value={`${formatNumber(depthNow)}m`} sub={hudSub} clean />
              {/* v35: current ocean zone — the dive's journey down */}
              <span
                key={zoneName(depthNow)}
                className="game-glass animate-[fadeIn_0.5s_ease] rounded-full px-3 py-1 font-game-ui text-[10px] font-bold tracking-[0.18em] text-[#7DE9F7]"
              >
                {zoneName(depthNow)}
              </span>
            </div>
            {isUnlimited ? (
              <PipsChip clean
                index={game.index % 7}
                total={7}
                label={`ENDLESS · PROMPT ${game.session.count + 1}`}
              />
            ) : (
              <PipsChip index={game.index} total={game.deck.length || 7} clean />
            )}
          </>
        ) : (
          <span className="game-glass inline-flex h-10 items-center gap-2 rounded-full px-4 font-game-ui text-[11px] font-bold tracking-[0.15em] text-white/65">
            MODE <span className="font-bold text-[#7DE9F7]">{isUnlimited ? "ENDLESS" : "THE DAILY DIVE"}</span>
          </span>
        )}
        <div className="flex items-center gap-2">
          <SoundButton clean />
          {playing && <QuitButton onClick={quit} clean />}
        </div>
      </div>

      {/* v35: kilometre milestone toast — brief celebration each
          whole kilometre passed (1km, 2km, ...). */}
      {milestone !== null && playing && (
        <div className="pointer-events-none absolute left-1/2 top-[16%] z-20 -translate-x-1/2 text-center">
          <p className="animate-[fadeIn_0.4s_ease] rounded-full bg-[#FF2E63]/90 px-6 py-2.5 font-game-ui text-[15px] font-black tracking-[0.14em] text-white shadow-[0_8px_30px_rgba(255,46,99,0.45)]">
            {milestone >= 1000 ? `${milestone / 1000} KM DEEP!` : `${milestone}m!`}
          </p>
        </div>
      )}

      {/* ================= CONTENT ================= */}
      {/* v36: shorter minimum height on phones (100vh-220px) so the
          two-row dock stays inside the viewport — with the old
          100vh-140px the PASS/DIVE row fell below the fold on a
          390x844 phone. Desktop unchanged. */}
      <div className="relative z-10 flex min-h-[max(420px,calc(100vh-220px))] flex-col px-4 pb-6 sm:min-h-[max(500px,calc(100vh-140px))] sm:px-6">
        {/* ---------- already played today ---------- */}
        {game.phase === "locked" && game.record && (
          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center py-8 text-center">
            <PixelLogo title="Dive complete" className="text-2xl sm:text-3xl" clean />
            <p className="game-glass mt-3 rounded-full px-5 py-2 font-game-ui text-[11px] font-bold tracking-[0.15em] text-white/85">
              THE OCEAN REFILLS AT MIDNIGHT
            </p>
            <p className="mt-6 font-game-ui text-[16px] font-semibold leading-relaxed text-white/90">
              You scored <strong className="text-[#7DE9F7]">{game.record.total}</strong> of{" "}
              {game.record.max} and reached{" "}
              <strong className="text-[#7DE9F7]">
                {formatNumber(Math.min(7000, game.record.total * 10))}m
              </strong>{" "}
              deep.
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
              <NavyButton href="/unlimited" clean>KEEP DIVING</NavyButton>
              <NavyButton href="/noillirk" clean>PLAY NOILLIRK</NavyButton>
            </div>
          </div>
        )}

        {/* ---------- ready screen ---------- */}
        {game.phase === "ready" && (
          <div className="relative flex flex-1 flex-col items-center justify-center py-8 text-center">
            {/* promo card — right side, competitor style: our own other
                game, no fake counts */}
            <Link
              href="/noillirk"
              className="game-glass absolute right-[3%] top-[55%] z-10 hidden w-[230px] rounded-2xl p-4 text-left transition-transform hover:-translate-y-0.5 lg:block"
            >
              <p className="font-game-ui text-[13px] font-bold text-white">
                Psst... Try the flip side?
              </p>
              <p className="mt-1 font-game-ui text-[10px] font-bold tracking-[0.12em] text-white/60">
                THE MOST COMMON WINS
              </p>
              <span className="mt-2.5 inline-flex h-9 items-center rounded-full bg-[#F5C242] px-4 font-game-ui text-[11px] font-extrabold tracking-[0.08em] text-[#0B2233]">
                PLAY NOILLIRK ›
              </span>
              {/* v36: the balloonKrill overlapping the card's corner
                  rendered as a tiny broken-looking blob — removed
                  for a clean card. */}
            </Link>

            <PixelLogo clean
              title={isUnlimited ? "Krillion Unlimited" : "Krillion Unblocked"}
              accentWords={[2]}
            />
            {/* daily subtitle in dark navy like the competitor's
                "THE CLASSIC DIVE"; unlimited keeps the pink "UNLIMITED" */}
            <p
              className={`mt-4 font-game-ui text-[12px] font-extrabold tracking-[0.35em] sm:text-[14px] ${
                isUnlimited ? "text-[#F4407A]" : "text-[#0B2233]/85"
              }`}
            >
              {isUnlimited ? "UNLIMITED" : `THE DAILY DIVE | NO. ${dailyNumber()}`}
            </p>

            {/* v11: watermark pill REMOVED on ready — it duplicated the
                bottom-right site line (same URL twice on one screen).
                The competitor shows the site line only. The pill
                stays in-play, where it does not compete. */}

            {/* small side-by-side mode toggles, then the big CTA */}
            <div className="mt-7">
              {isUnlimited ? (
                <PixelTabs clean
                  items={[
                    { label: "Classic", href: "/krillion-unblocked" },
                    { label: "Endless", active: true },
                  ]}
                />
              ) : (
                <PixelTabs clean
                  items={[
                    { label: "Classic", active: true },
                    { label: "Endless", href: "/unlimited" },
                  ]}
                />
              )}
            </div>

            <div className="mx-auto mt-3 w-full max-w-md">
              <PixelCta arrows="down" onClick={game.start} className="w-full" clean>
                {isUnlimited ? "BEGIN PRACTICE" : "BEGIN DESCENT"}
              </PixelCta>
            </div>

            <p className="mt-8 font-game-ui text-[11px] font-bold tracking-[0.2em] text-white/60">
              {isUnlimited
                ? "FREE · NO ACCOUNT · PRACTICE FOREVER"
                : "FREE · NO ACCOUNT · RESETS AT MIDNIGHT"}
            </p>

            {/* bottom-right site line, competitor style */}
            <p className="absolute bottom-1 right-1 font-game-ui text-[10px] font-semibold tracking-[0.15em] text-white/55">
              {isUnlimited
                ? "THE ENDLESS DIVE IS AT KRILLIONUNBLOCKED.COM"
                : "THE DAILY DIVE IS AT KRILLIONUNBLOCKED.COM"}
            </p>
          </div>
        )}

        {/* ---------- question theatre ---------- */}
        {showTheatre && game.prompt && (
          <div className="flex flex-1 flex-col justify-between pt-6 sm:pt-8">
            {/* the question box + the krill — v30: the krill dives
                with the answer. During "ask" it perches on the card's
                top edge (v29, the user's reference). When the user
                answers, the card goes away and the krill itself dives
                down through the water (38vh over the 1.5s dive) —
                the user asked where the krill goes when we answer
                ("krill ko hi dive krna chayie"). On a pass there is
                no dive, so the krill leaves with the card. The typed
                answer tag sits beside the krill on the card's top
                edge while asking. */}
            <div className="relative mx-auto mt-2 w-full max-w-3xl">
              {(stage === "ask" || sinking) && (
                <div
                  className="absolute -top-4 left-6 z-10"
                  style={{
                    transform: sinking
                      ? "translateY(38vh) scale(0.85)"
                      : "translateY(0) scale(1)",
                    opacity: sinking ? 0.9 : 1,
                    transition: "transform 1.45s ease-in, opacity 1.45s ease-in",
                  }}
                  aria-hidden="true"
                >
                  <span className="pd-anim-bob block">
                    <KrillSwimmer pixel={2} />
                  </span>
                </div>
              )}
              {stage === "ask" && (
                <div className="absolute -top-4 left-24 z-10 flex h-8 items-center">
                  {typed.trim() !== "" && (
                    <span className="game-glass pd-anim-rise whitespace-nowrap rounded-full px-4 py-2 font-game-ui text-[13px] font-bold text-white">
                      {typed.trim()} <span className="text-white/50">▾</span>
                    </span>
                  )}
                </div>
              )}
              {stage === "ask" ? (
                <PromptCard clean
                  key={game.index}
                  category={difficultyFor(game.prompt.id)}
                  question={game.prompt.text}
                  caption="rarer answers sink deeper"
                  arrows="down"
                  sliding
                />
              ) : (
                <div className="h-[132px]" />
              )}
            </div>

            {/* flexible gap — the water above the krill stays open */}
            <div className="flex-1" />

            {/* ---------- bottom dock: error + countdown + input ----------
                v36: side padding on phones so the dock clears the
                side rocks (the DIVE button was cut off at the edge). */}
            <div className="mx-auto w-full max-w-2xl px-14 sm:px-0">
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
                submitLabel="DIVE"
                disabled={stage !== "ask"}
              />
            </div>
          </div>
        )}

        {/* ---------- finished: the dive log ---------- */}
        {game.phase === "finished" && (
          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-6">
            <div className="game-glass rounded-3xl px-5 py-5 sm:px-7">
              {/* big depth + points */}
              <div className="text-center">
                <p
                  className="pd-anim-pop font-game-ui text-[48px] font-black leading-none text-[#7DE9F7] sm:text-[56px]"
                  style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
                >
                  {formatNumber(targetDepth)}m
                </p>
                <p className="mt-2 font-game-ui text-[12px] font-extrabold tracking-[0.2em] text-white/75">
                  {formatNumber(game.total)} POINTS {game.streak > 1 ? `· STREAK ${game.streak}` : ""}
                </p>
              </div>

              {/* dive log rows — the reference ANSWERS list */}
              <div className="mt-4">
                <ResultsLog results={game.results} mode="rare" clean />
              </div>

              {/* actions */}
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <PixelCta clean
                  arrows="down"
                  className="!min-h-[48px] !whitespace-nowrap !px-4 !text-[12px]"
                  onClick={() => {
                    stopAmbience();
                    game.start();
                    setDepth(0);
                    setStage("ask");
                  }}
                >
                  DIVE AGAIN
                </PixelCta>
                <NavyButton className="justify-center" onClick={share} clean>
                  {copied ? "COPIED ✓" : "SHARE"}
                </NavyButton>
                <NavyButton className="justify-center" href="/krillion-unblocked" clean>
                  MENU
                </NavyButton>
              </div>
            </div>

            {mode !== "unlimited" && (
              <div className="game-glass mx-auto mt-4 flex items-center justify-center rounded-full px-5 py-3 font-game-ui text-[15px] font-bold">
                <MidnightCountdown />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= BOOT / LOADING ================= */}
      {game.phase === "boot" && <LoadingScreen sprite="krill" pixel={6} clean />}

      {/* ================= THE ANSWER REVEAL ================= */}
      {playing && stage === "reveal" && game.lastTier && (
        <RarityReveal
          key={`reveal-${game.index}`}
          tier={game.lastTier}
          answer={game.lastAnswer}
          mode="dive"
          onNext={next}
          clean
        />
      )}
    </section>
  );
}

/* v36: the side rocks — a tall stack per side (10 images,
   alternating the two rocks so the pattern varies) that scrolls
   1:1 with the sea. The stack's top IS the waterline: at the
   surface it starts at the waterline, and as you dive the whole
   stack slides up, so deeper rocks come into view — the rocks
   move with the depth, like the sea. Unclamped (the top goes
   negative once submerged); the stack is tall enough (10 tiles)
   to cover the full 7000m dive. Direct DOM style updates — no
   React re-render per frame. v36: the playdaily-style blue rocks
   (tall-rock-*.png, 400x2000) replace the old grey photo rocks;
   the -deep tiles are the same rocks darkened. Narrower on
   phones (56px min) so the channel and the dock get more room. */
function SideRocks({
  cameraRef,
}: {
  cameraRef: { current: { camY: number; h: number; ppm: number } };
}) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let lastTop = -1;
    const poll = () => {
      const c = cameraRef.current;
      const left = leftRef.current;
      const right = rightRef.current;
      if (c && left && right && c.h > 0) {
        // the canvas fills the section, so the waterline's CSS px
        // = -camY scaled by (section height / logical height).
        // NOT clamped: once submerged the top goes negative and
        // the stack scrolls up with the sea.
        const sectionH = left.parentElement?.clientHeight ?? 0;
        if (sectionH > 0) {
          const wlY = (-c.camY * sectionH) / c.h;
          if (Math.abs(wlY - lastTop) > 0.5) {
            lastTop = wlY;
            left.style.top = `${wlY}px`;
            right.style.top = `${wlY}px`;
          }
        }
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(raf);
  }, [cameraRef]);
  // 10 tiles per side, alternating the two rocks (rock 1 / rock 3
  // left, rock 4 / rock 2 right). Each tile is the image at its
  // natural 1:5 aspect; tiles overlap 12px so the faded edges
  // blend with no seam line. (v37's 20-image depth-graded set was
  // reverted 2026-11-22 — the user preferred the v36 rocks and
  // the 20 images slowed the page load.)
  const leftTiles = Array.from({ length: 10 }, (_, k) =>
    k % 2 === 0 ? "/sprites/krillion/tall-rock-left.png" : "/sprites/krillion/tall-rock-left-deep.png"
  );
  const rightTiles = Array.from({ length: 10 }, (_, k) =>
    k % 2 === 0 ? "/sprites/krillion/tall-rock-right.png" : "/sprites/krillion/tall-rock-right-deep.png"
  );
  const tileCls = "block w-full object-cover";
  return (
    <>
      <div
        ref={leftRef}
        aria-hidden="true"
        style={{ top: "52%" }}
        className="pointer-events-none absolute bottom-auto left-0 w-[clamp(56px,14vw,200px)]"
      >
        {leftTiles.map((src, k) => (
          <img key={k} src={src} alt="" className={tileCls} style={{ marginTop: k === 0 ? 0 : -12 }} />
        ))}
      </div>
      <div
        ref={rightRef}
        aria-hidden="true"
        style={{ top: "52%" }}
        className="pointer-events-none absolute bottom-auto right-0 w-[clamp(56px,14vw,200px)] -scale-x-100"
      >
        {rightTiles.map((src, k) => (
          <img key={k} src={src} alt="" className={tileCls} style={{ marginTop: k === 0 ? 0 : -12 }} />
        ))}
      </div>
    </>
  );
}

export function KrillionGame({ mode = "daily" }: { mode?: "daily" | "unlimited" }) {
  return (
    <SoundProvider>
      <KrillionInner mode={mode} />
    </SoundProvider>
  );
}
