"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadBest, saveBestIfHigher } from "@/lib/storage";
import { sequenceShare } from "@/lib/share";
import { ShareBox } from "@/components/game/ShareBox";
import { SceneAmbience } from "@/components/game/SceneAmbience";
import { SoundProvider, useGameSound } from "@/components/game/ArcadeUI";

/* ============================================================
   Sequence — neon arcade light style.
   Illustrated arcade backdrop, one dark arena card, four glossy
   colour pads with hard shadows and a neon flash on press.
   Watch · echo · grow.
   ============================================================ */

type Phase = "idle" | "showing" | "input" | "success" | "over";

/** Chunky flat pads — hard offset shadows, electric active state. */
const PADS = [
  { base: "#4E9BE8", active: "#2E7CC3", deep: "#14508C", glow: "rgba(96,178,255,0.75)", tone: 261.63, label: "Blue pad" },
  { base: "#58B04C", active: "#3F9134", deep: "#256B1F", glow: "rgba(118,232,110,0.75)", tone: 329.63, label: "Green pad" },
  { base: "#F4407A", active: "#D12E63", deep: "#9C1B47", glow: "rgba(255,110,160,0.75)", tone: 392.0, label: "Pink pad" },
  { base: "#FFC250", active: "#E8A62E", deep: "#A87214", glow: "rgba(255,210,110,0.8)", tone: 523.25, label: "Gold pad" },
];

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

function SequenceInner() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seq, setSeq] = useState<number[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [inputIdx, setInputIdx] = useState(0);
  const [best, setBest] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [shareText, setShareText] = useState("");
  const [isNewBest, setIsNewBest] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const timersRef = useRef<number[]>([]);
  const { play } = useGameSound();

  useEffect(() => {
    setBest(loadBest("sequence"));
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const playTone = useCallback(
    (pad: number) => {
      if (!soundOn) return;
      try {
        if (!audioRef.current) {
          const Ctx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext;
          if (!Ctx) return;
          audioRef.current = new Ctx();
        }
        const ctx = audioRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = PADS[pad].tone;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch {
        // audio unsupported — the game works silently
      }
    },
    [soundOn]
  );

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  /* playback of the current sequence */
  useEffect(() => {
    if (phase !== "showing") return;
    let cancelled = false;
    clearTimers();
    const speed = Math.max(280, 640 - seq.length * 28);

    seq.forEach((pad, i) => {
      const t1 = window.setTimeout(() => {
        if (cancelled) return;
        setActive(pad);
        playTone(pad);
        const t2 = window.setTimeout(() => {
          if (cancelled) return;
          setActive(null);
        }, speed * 0.55);
        timersRef.current.push(t2);
      }, i * speed + 500);
      timersRef.current.push(t1);
    });

    const end = window.setTimeout(() => {
      if (cancelled) return;
      setActive(null);
      setInputIdx(0);
      setPhase("input");
    }, seq.length * speed + 650);
    timersRef.current.push(end);

    return () => {
      cancelled = true;
    };
  }, [phase, seq, playTone]);

  const startGame = () => {
    setSeq([Math.floor(Math.random() * 4)]);
    setIsNewBest(false);
    setShareText("");
    setPhase("showing");
  };

  const pressPad = (pad: number) => {
    if (phase !== "input") return;
    setActive(pad);
    playTone(pad);
    window.setTimeout(() => setActive(null), 180);

    if (seq[inputIdx] === pad) {
      play("flip");
      if (inputIdx + 1 >= seq.length) {
        setPhase("success");
        play("good");
        window.setTimeout(() => {
          setSeq((s) => [...s, Math.floor(Math.random() * 4)]);
          setPhase("showing");
        }, 700);
      } else {
        setInputIdx((i) => i + 1);
      }
    } else {
      play("bad");
      const finished = Math.max(0, seq.length - 1);
      const b = saveBestIfHigher("sequence", finished);
      setIsNewBest(finished > 0 && finished >= b && finished > best);
      setBest(b);
      setShareText(sequenceShare(finished, b, finished > 0 && finished >= b && finished > best));
      setPhase("over");
    }
  };

  const statusLabel =
    phase === "showing"
      ? "Watch the pattern…"
      : phase === "success"
        ? "Perfect! Growing…"
        : "Your turn — repeat it";

  return (
    <section
      className="relative w-full bg-white"
      style={{ minHeight: "max(560px, calc(100vh - 76px))" }}
      aria-label="Sequence memory game"
    >
      <SceneAmbience kind="arcade" />
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center px-4 py-6 sm:py-8">
        <h1 className="font-serif text-[30px] font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(4,12,32,0.6)]">Sequence</h1>
        <p className="mt-1 text-center text-[15px] font-medium text-white/95 drop-shadow-[0_1px_6px_rgba(4,12,32,0.55)]">
          Echo the pattern — it grows one step each round.
        </p>

        {(phase === "showing" || phase === "input" || phase === "success") && (
          <div className="pd-chip mt-3 flex items-center justify-center gap-6 rounded-2xl px-6 py-2.5">
            <span className="text-center">
              <span className="block font-mono text-2xl font-bold tabular-nums text-[#9FE0F2]">{seq.length}</span>
              <span className="block text-[10px] font-bold tracking-[0.2em] text-white/60">LENGTH</span>
            </span>
            <span className="h-9 w-px bg-white/25" aria-hidden="true" />
            <span className="text-center">
              <span className="block font-mono text-2xl font-bold tabular-nums text-white">{best || seq.length}</span>
              <span className="block text-[10px] font-bold tracking-[0.2em] text-white/60">BEST</span>
            </span>
          </div>
        )}

        {/* the arcade arena card */}
        <div
          className="mt-4 w-full max-w-[430px] rounded-[22px] border-2 border-[#050B18] p-4"
          style={{
            background: "linear-gradient(180deg,#101A32 0%,#0B1226 100%)",
            boxShadow:
              "inset 0 2px 12px rgba(0,0,0,0.5), 0 4px 0 0 #050B18, 0 20px 40px -20px rgba(4,12,32,0.7)",
          }}
        >
          {/* idle */}
          {phase === "idle" && (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-5 text-center">
              <div className="grid w-full max-w-[240px] grid-cols-2 gap-3" aria-hidden="true">
                {PADS.map((p, i) => (
                  <span
                    key={i}
                    className="sq-pad block aspect-square w-full rounded-2xl"
                    style={{ backgroundColor: p.base, boxShadow: `0 4px 0 0 ${p.deep}, 0 10px 22px -10px ${p.glow}` }}
                  />
                ))}
              </div>
              <p className="max-w-xs text-[15px] leading-relaxed text-[#C9D6F2]">
                Four pads flash a pattern, one step longer each round. Echo it back perfectly and
                it grows again — the pattern speeds up as you climb. One slip ends the run.
              </p>
              <PillButton onClick={startGame}>Play ›</PillButton>
              <p className="text-xs text-[#8FA3CC]">Unlimited runs · personal best {best || "—"}</p>
            </div>
          )}

          {/* active play */}
          {(phase === "showing" || phase === "input" || phase === "success") && (
            <div className="min-h-[400px]">
              <p
                className={`text-center font-mono text-xs font-bold uppercase tracking-[0.22em] ${
                  phase === "input" ? "text-[#8FC8FF]" : phase === "success" ? "text-[#9BE88F]" : "text-[#8FA3CC]"
                }`}
              >
                {statusLabel}
              </p>

              <div className="mx-auto mt-5 grid max-w-[260px] grid-cols-2 gap-3.5">
                {PADS.map((p, i) => {
                  const isActive = active === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pressPad(i)}
                      disabled={phase !== "input"}
                      aria-label={p.label}
                      className={`sq-pad flex aspect-square items-center justify-center rounded-2xl transition-all duration-150 ${
                        isActive ? "sq-pad-on ku-anim-pad scale-[1.05]" : ""
                      } ${phase === "input" && !isActive ? "hover:-translate-y-1 cursor-pointer" : "cursor-default"}`}
                      style={{
                        backgroundColor: isActive ? p.active : p.base,
                        boxShadow: isActive
                          ? `0 0 0 4px rgba(255,255,255,0.9), 0 0 34px 8px ${p.glow}`
                          : `0 4px 0 0 ${p.deep}, 0 12px 26px -12px ${p.glow}`,
                        "--sq-glow": p.glow,
                      } as React.CSSProperties}
                    >
                      <span
                        className="font-mono text-3xl font-black text-white/95 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]"
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSoundOn((s) => !s)}
                  aria-pressed={soundOn}
                  className="rounded-full border border-white/25 bg-white/12 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
                >
                  Pad tones: {soundOn ? "ON ♪" : "OFF ✕"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearTimers();
                    setPhase("idle");
                    setSeq([]);
                  }}
                  className="rounded-full border border-white/25 bg-white/12 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
                >
                  End run
                </button>
              </div>
            </div>
          )}

          {/* over */}
          {phase === "over" && (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <p className="font-serif text-xl font-bold text-white">
                {isNewBest ? "🏆 New personal best" : "Pattern broken"}
              </p>
              <p className="pd-anim-pop mt-4 font-serif text-6xl font-black tabular-nums text-white">
                {Math.max(0, seq.length - 1)}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8FA3CC]">
                longest sequence completed · personal best {best}
              </p>
              {shareText && (
                <div className="mt-5 w-full">
                  <ShareBox text={shareText} label="Share your run" />
                </div>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <PillButton onClick={startGame}>Play again ›</PillButton>
                <button
                  type="button"
                  onClick={() => {
                    play("click");
                    window.location.assign("/colour-memory");
                  }}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/25 bg-white/12 px-6 text-sm font-bold text-white transition-colors hover:bg-white/20"
                >
                  Try Colour Memory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function SequenceGame() {
  return (
    <SoundProvider>
      <SequenceInner />
    </SoundProvider>
  );
}
