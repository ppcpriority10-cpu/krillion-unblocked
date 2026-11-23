"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import {
  playBlip,
  readSoundPref,
  stopAmbience,
  writeSoundPref,
  type SoundKind,
} from "@/lib/sound";
import { KrillSwimmer, PixelSprite } from "./pixel/PixelSprite";
import type { OceanCameraState } from "./pixel/LiveOceanCanvas";

/* ============================================================
   PlayDaily-style arcade UI kit — navy chips, pixel tabs, pink
   CTAs, terminal prompt cards and the bottom answer bar.
   Fonts: --font-pixel (logos), --font-pixel-ui (labels/CTAs),
   --font-game-mono (questions, inputs, numbers).

   v23 CLEAN VARIANT: every component below also takes `clean`
   (Krillion only — Noillirk keeps the pixel style). With clean,
   the component uses the rounded Nunito UI font, soft glass
   panels, round pills and soft shadows instead of pixel fonts,
   square chips and hard offset shadows.
   ============================================================ */

/* ---------------- sound context ---------------- */

interface SoundCtx {
  soundOn: boolean;
  toggle: () => void;
  play: (kind: SoundKind) => void;
}

const SoundContext = createContext<SoundCtx>({
  soundOn: true,
  toggle: () => {},
  play: () => {},
});

export function useGameSound() {
  return useContext(SoundContext);
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(readSoundPref());
  }, []);

  const toggle = useCallback(() => {
    setSoundOn((v) => {
      writeSoundPref(!v);
      return !v;
    });
  }, []);

  const value = useMemo<SoundCtx>(
    () => ({
      soundOn,
      toggle,
      play: (kind: SoundKind) => playBlip(kind, soundOn),
    }),
    [soundOn, toggle]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

/* ---------------- top HUD row ---------------- */

/** Dark navy chip — "DEPTH 0m", "MODE ENDLESS", counters. */
export function PixelChip({
  label,
  value,
  valueClass,
  className,
  icon,
}: {
  label?: string;
  value: ReactNode;
  valueClass?: string;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "pd-chip inline-flex h-11 items-center gap-2 rounded-md px-3.5 font-pixel-ui text-[11px]",
        className
      )}
    >
      {icon}
      {label && (
        <span className="text-[9px] tracking-[0.18em] text-white/55">{label}</span>
      )}
      <span className={cn("font-bold tabular-nums text-white", valueClass)}>{value}</span>
    </span>
  );
}

/** Sound toggle in the playdaily spot (top-right, dark square). */
export function SoundButton({ className, clean }: { className?: string; clean?: boolean }) {
  const { soundOn, toggle, play } = useGameSound();
  return (
    <button
      type="button"
      onClick={() => {
        play("click");
        toggle();
      }}
      aria-pressed={soundOn}
      aria-label={soundOn ? "Mute game sounds" : "Unmute game sounds"}
      className={cn(
        clean
          ? "game-glass flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95"
          : "pd-chip flex h-9 w-9 items-center justify-center rounded-md text-white transition-transform hover:text-white active:translate-y-0.5",
        className
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {soundOn ? (
          <>
            <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
            <path
              d="M15.5 9c1 .8 1.5 1.8 1.5 3s-.5 2.2-1.5 3M18 6.5c1.7 1.4 2.5 3.2 2.5 5.5S19.7 16.1 18 17.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
            <path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  );
}

/** QUIT-style dark square button, top-right. */
export function QuitButton({
  label = "QUIT",
  onClick,
  href,
  className,
  clean,
}: {
  label?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  clean?: boolean;
}) {
  const { play } = useGameSound();
  const cls = cn(
    clean
      ? "game-glass inline-flex h-10 items-center rounded-full px-4 font-game-ui text-[12px] font-extrabold tracking-[0.08em] text-white/90 transition-all hover:scale-105 hover:text-white active:scale-95"
      : "pd-chip inline-flex h-9 items-center rounded-md px-3 font-pixel-ui text-[10px] font-bold tracking-[0.14em] text-white/90 transition-transform hover:text-white active:translate-y-0.5",
    className
  );
  if (href) {
    return (
      <Link href={href} className={cls} onClick={() => { play("click"); stopAmbience(); }}>
        {label}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={cls}
      onClick={() => {
        play("click");
        stopAmbience();
        onClick?.();
      }}
    >
      {label}
    </button>
  );
}

/**
 * "PROMPT 1 OF 7" chip with square progress pips — reference colours:
 * done = blue, current = orange, upcoming = grey.
 */
export function PipsChip({
  index,
  total,
  label,
  className,
  clean,
}: {
  index: number;
  total: number;
  /** override the caption line (e.g. endless mode) */
  label?: string;
  className?: string;
  clean?: boolean;
}) {
  return (
    <span className={cn(
      clean
        ? "game-glass inline-flex h-12 flex-col items-center justify-center gap-1.5 rounded-2xl px-4"
        : "pd-chip inline-flex h-11 flex-col items-center justify-center gap-1 rounded-md px-3",
      className
    )}>
      <span className="flex gap-[4px]" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn("block", clean ? "h-2 w-2 rounded-full" : "h-[7px] w-[10px] border border-white/25")}
            style={{
              background:
                i < index ? "#5B8DEF" : i === index ? "#F5A623" : "rgba(255,255,255,0.14)",
            }}
          />
        ))}
      </span>
      <span className={clean
        ? "whitespace-nowrap font-game-ui text-[11px] font-bold tracking-[0.12em] text-white/80"
        : "whitespace-nowrap font-pixel-ui text-[9px] tracking-[0.2em] text-white/75"}>
        {label ?? `PROMPT ${Math.min(index + 1, total)} OF ${total}`}
      </span>
    </span>
  );
}

/**
 * Top-left HUD box — DEPTH / ALTITUDE label, big cyan pixel value,
 * and a small sub-line (best depth or edition number).
 */
export function DepthHud({
  label,
  value,
  sub,
  className,
  clean,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
  clean?: boolean;
}) {
  return (
    <span
      className={cn(
        clean
          ? "game-glass inline-flex min-h-12 min-w-[92px] flex-col items-start justify-center gap-0.5 rounded-2xl px-4 py-1.5"
          : "pd-chip inline-flex min-h-11 min-w-[86px] flex-col items-start justify-center gap-0.5 rounded-md px-3 py-1.5",
        className
      )}
    >
      <span className={clean
        ? "font-game-ui text-[10px] font-extrabold tracking-[0.2em] text-white/60"
        : "font-pixel-ui text-[8px] tracking-[0.3em] text-white/55"}>{label}</span>
      <span className={clean
        ? "font-game-ui text-[20px] font-black leading-none text-[#7DE9F7]"
        : "font-pixel text-[15px] font-bold leading-none text-[#7DE9F7]"}>{value}</span>
      {sub && (
        <span className={clean
          ? "font-game-ui text-[10px] font-semibold tracking-[0.08em] text-white/60"
          : "font-pixel-ui text-[8px] tracking-[0.14em] text-white/55"}>{sub}</span>
      )}
    </span>
  );
}

/** Black loading screen — pink krill + LOADING, like the reference. */
export function LoadingScreen({
  sprite = "krill",
  pixel = 6,
  clean,
}: {
  sprite?: string;
  pixel?: number;
  clean?: boolean;
}) {
  return (
    <div className={cn(
      "absolute inset-0 z-40 flex flex-col items-center justify-center gap-5",
      clean ? "bg-[#031525]" : "bg-[#020810]"
    )}>
      <span className="pd-anim-bob block">
        {sprite === "krill" ? (
          <KrillSwimmer pixel={pixel} />
        ) : (
          <PixelSprite name={sprite} pixel={pixel} />
        )}
      </span>
      <p className={clean
        ? "font-game-ui text-[13px] font-extrabold tracking-[0.4em] text-[#7DE9F7]"
        : "font-pixel-ui text-[11px] font-bold tracking-[0.5em] text-[#7DE9F7]"}>
        LOADING
      </p>
    </div>
  );
}

/* ---------------- tabs + buttons ---------------- */

/** CLASSIC / ENDLESS style mode tabs. */
export function PixelTabs({
  items,
  size = "md",
  className,
  clean,
}: {
  items: { label: string; active?: boolean; href?: string; onClick?: () => void }[];
  size?: "md" | "lg";
  className?: string;
  clean?: boolean;
}) {
  const { play } = useGameSound();
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2.5", className)} role="tablist">
      {items.map((t) => {
        const cls = cn(
          clean
            ? "inline-flex items-center justify-center rounded-full border font-game-ui font-extrabold uppercase tracking-[0.1em] transition-all active:scale-95"
            : "inline-flex items-center justify-center rounded-[6px] border-2 font-pixel-ui font-bold uppercase tracking-[0.14em] transition-all active:translate-y-0.5",
          size === "lg" ? "h-12 px-7 text-[13px]" : "h-10 px-5 text-[11px]",
          t.active
            ? clean
              ? "border-transparent bg-[#7DE9F7] text-[#0B2233] shadow-[0_8px_20px_rgba(125,233,247,0.4)]"
              : "border-[#0B2233]/70 bg-[#7DE9F7] text-[#0B2233] shadow-[0_3px_0_0_#0B2233]"
            : clean
              ? "border-white/15 bg-[#0F2740]/70 text-[#BFE3F5] backdrop-blur-md hover:bg-[#15324E] hover:text-white"
              : "border-[#3A5A76] bg-[#0F2740]/90 text-[#BFE3F5] hover:bg-[#15324E] hover:text-white"
        );
        const inner = <span className={cls} aria-current={t.active ? "true" : undefined} aria-selected={!!t.active} role="tab">{t.label}</span>;
        if (t.href) {
          return (
            <Link key={t.label} href={t.href} role="tab" onClick={() => play("click")}>
              {inner}
            </Link>
          );
        }
        return (
          <button key={t.label} type="button" role="tab" onClick={() => { play("click"); t.onClick?.(); }}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}

/** The big pink arcade CTA — "▼ BEGIN DESCENT ▼". */
export function PixelCta({
  children,
  onClick,
  arrows,
  disabled,
  className,
  type = "button",
  clean,
}: {
  children: ReactNode;
  onClick?: () => void;
  arrows?: "down" | "up" | "play";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  clean?: boolean;
}) {
  const { play } = useGameSound();
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          play("click");
          onClick?.();
        }
      }}
      className={cn(
        clean
          ? "inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#FF5C8A] to-[#F4407A] px-10 font-game-ui text-[16px] font-extrabold tracking-[0.1em] text-white shadow-[0_10px_30px_rgba(244,64,122,0.45)] transition-all hover:brightness-110 active:scale-[0.98]"
          : "pd-cta inline-flex min-h-[58px] items-center justify-center gap-4 rounded-[8px] border-2 border-[#C22B60] bg-[#F4407A] px-10 font-pixel-ui text-[15px] font-bold tracking-[0.22em] text-white transition-all shadow-[0_5px_0_0_#0B2233] hover:brightness-110 active:translate-y-[5px] active:shadow-none",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {arrows === "down" && <span aria-hidden="true">▼</span>}
      {arrows === "up" && <span aria-hidden="true">▲</span>}
      {arrows === "play" && <span aria-hidden="true">▶</span>}
      <span>{children}</span>
      {arrows === "down" && <span aria-hidden="true">▼</span>}
      {arrows === "up" && <span aria-hidden="true">▲</span>}
    </button>
  );
}

/** Navy secondary button — "PLAY MULTIPLAYER ■ 744 PLAYING" style. */
export function NavyButton({
  children,
  accent,
  onClick,
  href,
  className,
  clean,
}: {
  children: ReactNode;
  /** cyan trailing accent text, e.g. "744 PLAYING" */
  accent?: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  clean?: boolean;
}) {
  const { play } = useGameSound();
  const cls = cn(
    clean
      ? "game-glass inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full px-6 font-game-ui text-[12px] font-extrabold tracking-[0.1em] text-white/90 transition-all hover:scale-105 hover:text-white active:scale-95"
      : "inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-[8px] border-2 border-[#0B2233] bg-[#12283B] px-6 font-pixel-ui text-[11px] font-bold tracking-[0.16em] text-white/90 shadow-[0_4px_0_0_#0B2233] transition-all hover:bg-[#17324A] active:translate-y-1 active:shadow-none",
    className
  );
  const inner = (
    <>
      <span>{children}</span>
      {accent != null && (
        <span className="flex items-center gap-1.5 text-[#7DE9F7]">
          <span className={cn("inline-block h-2 w-2 bg-[#7DE9F7]", clean && "rounded-full")} aria-hidden="true" />
          {accent}
        </span>
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls} onClick={() => play("click")}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={() => { play("click"); onClick?.(); }}>
      {inner}
    </button>
  );
}

/* ---------------- prompt card + answer bar ---------------- */

/** Dark navy question card — cyan difficulty label, white pixel prompt. */
export function PromptCard({
  category,
  question,
  caption,
  tone = "cyan",
  arrows = "down",
  sliding = false,
  className,
  clean,
}: {
  category: string;
  question: string;
  caption?: string;
  /** cyan label (krillion) or amber label (noillirk accent) */
  tone?: "cyan" | "red" | "amber";
  /** hint arrows point down (dive) or up (climb) */
  arrows?: "down" | "up";
  sliding?: boolean;
  className?: string;
  clean?: boolean;
}) {
  const toneCls =
    tone === "red" ? "text-[#FF8A9B]" : tone === "amber" ? "text-[#FFD98A]" : "text-[#7DE9F7]";
  const arrow = arrows === "up" ? "▲" : "▼";
  return (
    <div
      className={cn(
        clean
          ? "game-glass w-full rounded-3xl px-7 py-6 sm:px-8"
          : "w-full rounded-[10px] border border-white/12 bg-[#0F2438]/95 px-6 py-5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] sm:px-8",
        sliding && "pd-anim-slide",
        className
      )}
    >
      <p className={cn(
        clean
          ? "font-game-ui text-[11px] font-extrabold tracking-[0.25em]"
          : "font-pixel-ui text-[10px] font-bold tracking-[0.3em]",
        toneCls
      )}>
        {category}
      </p>
      <p className={clean
        ? "mt-3 font-game-ui text-[17px] font-bold leading-snug text-white sm:text-[19px]"
        : "mt-3 font-pixel text-[13px] leading-[1.75] text-white sm:text-[15px]"}>
        {question}
      </p>
      {caption && (
        <p className={clean
          ? "mt-3 font-game-ui text-[11px] font-semibold tracking-[0.12em] text-white/60"
          : "mt-3 font-pixel-ui text-[9px] tracking-[0.24em] text-white/55"}>
          {arrow} {caption} {arrow}
        </p>
      )}
    </div>
  );
}

/** Round countdown badge for the answer bar — dark disc, cyan ring. */
export function TimerBadge({ seconds, total, clean }: { seconds: number; total: number; clean?: boolean }) {
  const n = Math.ceil(seconds);
  const urgent = n <= 5;
  const frac = Math.max(0, Math.min(1, seconds / total));
  const ring = urgent ? "#F4407A" : "#39C6E8";
  return (
    <span
      className={cn(
        "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white",
        clean
          ? "border border-white/20 bg-[#04121F]/80 font-game-ui text-[16px] font-black tabular-nums shadow-lg backdrop-blur-md"
          : "border-2 border-[#0B2233] bg-[#04121F] font-pixel-ui text-[13px] font-bold tabular-nums shadow-[0_3px_0_0_rgba(0,0,0,0.35)]"
      )}
      aria-label={`${n} seconds left`}
    >
      {n}
      <svg className="absolute inset-0" viewBox="0 0 48 48" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="3"
        />
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke={ring}
          strokeWidth="3"
          strokeLinecap={clean ? "round" : "square"}
          strokeDasharray={`${frac * 131.9} 131.9`}
          transform="rotate(-90 24 24)"
          className="transition-[stroke-dasharray] duration-150 ease-linear"
        />
      </svg>
    </span>
  );
}

/** The bottom bar: timer + glowing input + PASS + DIVE. */
export function AnswerBar({
  inputRef,
  value,
  onChange,
  onSubmit,
  onPass,
  seconds,
  totalSeconds,
  passLabel = "PASS",
  submitLabel = "DIVE",
  inputLabel = "Type one answer…",
  disabled = false,
  autoFocus = true,
  dir = "ltr",
  clean,
}: {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onPass: () => void;
  seconds: number;
  totalSeconds: number;
  passLabel?: string;
  submitLabel?: string;
  inputLabel?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  dir?: "ltr" | "rtl";
  clean?: boolean;
}) {
  const { play } = useGameSound();
  const has = value.trim().length > 0;
  /* v36: two-row dock on phones — timer + input on the first row,
     PASS + DIVE side by side on the second. On a 390px phone the
     old single row squeezed the input to ~120px and cut the DIVE
     button off at the edge. The sm:contents wrappers vanish on
     desktop, so the single-row layout there is unchanged. */
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
      <div className="flex w-full items-center gap-2.5 sm:contents">
      <TimerBadge seconds={seconds} total={totalSeconds} clean={clean} />
      <input
        ref={inputRef}
        dir={dir}
        value={value}
        autoFocus={autoFocus}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          if (e.target.value.length > value.length) play("type");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        maxLength={48}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder={inputLabel}
        aria-label="Your answer"
        className={clean
          ? "h-12 min-w-0 flex-1 rounded-full border border-[#39C6E8]/50 bg-[#0D2438]/80 px-5 font-game-ui text-[15px] font-semibold text-white shadow-[0_0_18px_rgba(57,198,232,0.25)] backdrop-blur-md placeholder:font-normal placeholder:text-[#7DA2BC] focus:border-[#39C6E8] focus:outline-none focus:ring-4 focus:ring-[#39C6E8]/25 disabled:opacity-60"
          : "h-12 min-w-0 flex-1 rounded-[8px] border-2 border-[#39C6E8] bg-[#0D2438] px-4 font-game-mono text-[13px] text-white shadow-[0_0_18px_rgba(57,198,232,0.35),inset_0_0_10px_rgba(0,0,0,0.35)] placeholder:text-[#7DA2BC] focus:outline-none focus:ring-4 focus:ring-[#39C6E8]/30 disabled:opacity-60"}
      />
      </div>
      <div className="flex w-full gap-2.5 sm:contents">
      <button
        type="button"
        onClick={() => {
          play("click");
          onPass();
        }}
        disabled={disabled}
        className={clean
          ? "game-glass inline-flex h-12 flex-1 shrink-0 items-center justify-center rounded-full px-4 font-game-ui text-[12px] font-extrabold tracking-[0.08em] text-white/85 transition-all hover:scale-105 hover:text-white active:scale-95 disabled:opacity-60 sm:flex-none sm:px-5"
          : "pd-chip inline-flex h-12 flex-1 shrink-0 items-center justify-center rounded-[8px] px-3 font-pixel-ui text-[10px] font-bold tracking-[0.18em] text-white/85 hover:text-white disabled:opacity-60 sm:flex-none sm:px-4"}
      >
        {passLabel}
      </button>
      <button
        type="button"
        onClick={() => {
          if (!has) return;
          play("swoosh");
          onSubmit();
        }}
        disabled={!has || disabled}
        className={cn(
          clean
            ? "inline-flex h-12 flex-1 shrink-0 items-center justify-center rounded-full px-5 font-game-ui text-[13px] font-extrabold tracking-[0.08em] transition-all active:scale-95 sm:flex-none sm:px-6"
            : "inline-flex h-12 flex-1 shrink-0 items-center justify-center rounded-[8px] border-2 px-4 font-pixel-ui text-[10px] font-bold tracking-[0.18em] transition-all active:translate-y-0.5 sm:flex-none sm:px-5",
          has && !disabled
            ? clean
              ? "bg-gradient-to-b from-[#FF5C8A] to-[#F4407A] text-white shadow-[0_8px_20px_rgba(244,64,122,0.4)] hover:brightness-110"
              : "border-[#C22B60] bg-[#F4407A] text-white shadow-[0_3px_0_0_#0B2233] hover:brightness-110"
            : clean
              ? "cursor-not-allowed bg-white/10 text-white/50"
              : "cursor-not-allowed border-[#4A4664] bg-[#8E8AA8] text-[#E7E4F4]/80"
        )}
      >
        {submitLabel}
      </button>
      </div>
    </div>
  );
}

/* ---------------- floating answer chip (over the scene) ---------------- */

/** The submitted answer chip that floats beside the krillion. */
export function AnswerChip({
  text,
  state,
  points,
  className,
  style,
  clean,
}: {
  text: string;
  state: "typing" | "checking" | "accepted" | "rejected";
  points?: number;
  className?: string;
  style?: CSSProperties;
  clean?: boolean;
}) {
  return (
    <div
      className={cn(
        clean
          ? "pointer-events-none absolute z-20 flex items-center gap-2 rounded-full px-4 py-2 font-game-ui text-[14px] font-bold shadow-lg backdrop-blur-md"
          : "pointer-events-none absolute z-20 flex items-center gap-2 rounded-[6px] border px-3 py-1.5 font-game-mono text-[13px] font-bold shadow-[0_4px_0_0_rgba(0,0,0,0.35)]",
        state === "rejected"
          ? clean
            ? "border border-[#FF8A9B]/50 bg-[#3A1220]/85 text-[#FFB3BE]"
            : "border-[#FF8A9B]/60 bg-[#3A1220]/95 text-[#FFB3BE]"
          : clean
            ? "border border-white/20 bg-[#0F2438]/80 text-white"
            : "border-white/20 bg-[#0F2438]/95 text-white",
        className
      )}
      style={style}
      role="status"
    >
      <span className="max-w-[180px] truncate">{text}</span>
      {state === "checking" && (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#7DE9F7] border-t-transparent" aria-hidden="true" />
      )}
      {state === "accepted" && points != null && (
        <span className={clean ? "font-game-ui text-[12px] font-extrabold text-[#7DE9F7]" : "font-pixel-ui text-[10px] text-[#7DE9F7]"}>+{points}</span>
      )}
    </div>
  );
}

/* ---------------- depth / altitude ruler ---------------- */

/** "1km", "1.25km", "2km" — trims trailing zeroes. */
function rulerLabel(m: number): string {
  if (m < 1000) return `${m}m`;
  const km = m / 1000;
  const s =
    km % 1 === 0 ? String(km) : km.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${s}km`;
}

/**
 * Right-edge depth/altitude ruler, like the reference: a vertical line
 * with tick labels that slide as you move, a pink arrow marker, and a
 * red label with the exact current value beside it.
 * `direction="down"` sinks (ocean), `"up"` climbs (forest).
 *
 * v20 CAMERA MODE (Krillion only): when `cameraRef` is passed, the
 * marker and ticks are placed by the SAME mapping the canvas uses
 * (screenY = depth*ppm − camY), polled from the shared ref in a
 * rAF loop — so the 0m mark sits exactly on the waterline at 0m
 * (the canvas frames the surface at 30%) and the ticks track the
 * world as the camera dives, like the competitor's ruler. Without
 * `cameraRef` (Noillirk) the legacy behaviour is unchanged: the
 * marker pins at 45% and ticks spread on a zoomed span scale.
 */
export function DepthRuler({
  value,
  direction = "down",
  className,
  cameraRef,
  clean,
}: {
  /** current depth / altitude in metres */
  value: number;
  direction?: "down" | "up";
  className?: string;
  /** optional shared ref the canvas publishes its camera into (Krillion) */
  cameraRef?: { current: OceanCameraState };
  clean?: boolean;
}) {
  const v = Math.max(0, value);
  const cameraMode = direction === "down" && !!cameraRef;
  const [cam, setCam] = useState<OceanCameraState | null>(null);

  // Poll the shared camera ref; re-render only while it moves.
  useEffect(() => {
    if (!cameraMode || !cameraRef) return;
    let raf = 0;
    let lastY = Number.NaN;
    let lastH = 0;
    const poll = () => {
      const c = cameraRef.current;
      if (c && (Math.abs(c.camY - lastY) > 0.5 || c.h !== lastH)) {
        lastY = c.camY;
        lastH = c.h;
        setCam({ camY: c.camY, h: c.h, ppm: c.ppm });
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(raf);
  }, [cameraMode, cameraRef]);

  // ---- camera-mapped positions (Krillion) ----
  // The container spans panel 10%..94%; convert a panel fraction
  // (0 = panel top) into a % of the container.
  const toPct = (frac: number) => ((frac - 0.1) / 0.84) * 100;
  let marks: { m: number; pct: number }[] = [];
  let markerPct = 45;
  let markerVisible = true;
  if (cameraMode && cam && cam.h > 0 && cam.ppm > 0) {
    const frac = (m: number) => (m * cam.ppm - cam.camY) / cam.h;
    const step = 100;
    const mMin = Math.max(
      0,
      Math.floor(cam.camY / cam.ppm / step) * step
    );
    const mMax = Math.ceil(((cam.camY + cam.h) / cam.ppm / step) * step);
    for (let m = mMin; m <= mMax; m += step) {
      if (Math.abs(m - v) < step / 2) continue; // the red label covers it
      const pct = toPct(frac(m));
      if (pct < -2 || pct > 102) continue;
      marks.push({ m, pct });
    }
    markerPct = toPct(frac(v));
    markerVisible = markerPct >= -2 && markerPct <= 102;
  } else {
    // ---- legacy span scale (Noillirk, and Krillion's first frame) ----
    const step = v < 500 ? 100 : v < 2000 ? 250 : 500;
    const span = v < 500 ? 500 : v < 1500 ? 1000 : 2000;
    const first = Math.max(0, Math.ceil((v - span * 0.45) / step) * step);
    for (let m = first; m <= v + span * 0.55; m += step) {
      if (Math.abs(m - v) < step / 4) continue; // the red label covers it
      const delta = direction === "down" ? m - v : v - m;
      const pct = 45 + (delta / span) * 100;
      if (pct < 0 || pct > 100) continue;
      marks.push({ m, pct });
    }
    markerPct = 45;
    markerVisible = true;
  }

  return (
    <div
      className={cn("pointer-events-none absolute bottom-[6%] right-0 top-[10%] w-16 sm:w-20", className)}
      aria-hidden="true"
    >
      {/* vertical line at the right edge */}
      <div className="absolute bottom-0 right-2 top-0 w-[2px] bg-white/40" />

      {marks.map(({ m, pct }) => (
        <span key={m} className="absolute right-3" style={{ top: `${pct}%`, transform: "translateY(-50%)" }}>
          <span className="flex items-center gap-1">
            <span className={clean
              ? "whitespace-nowrap rounded-full border border-white/10 bg-[#04121F]/80 px-2 py-0.5 font-game-ui text-[10px] font-bold text-white/85 backdrop-blur-sm"
              : "whitespace-nowrap rounded-[3px] border border-white/10 bg-[#04121F]/80 px-1.5 py-0.5 font-pixel-ui text-[8px] font-bold text-white/80"}>
              {rulerLabel(m)}
            </span>
            <span className="block h-px w-[7px] bg-white/45" />
          </span>
        </span>
      ))}

      {/* current-value marker — pink arrow on the line + red label */}
      {markerVisible && (
        <>
          <span
            className={clean
              ? "absolute right-8 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#04121F]/80 px-2 py-0.5 font-game-ui text-[10px] font-extrabold text-[#FF5A72] backdrop-blur-sm"
              : "absolute right-8 -translate-y-1/2 whitespace-nowrap rounded-[3px] border border-white/10 bg-[#04121F]/80 px-1.5 py-0.5 font-pixel-ui text-[8px] font-bold text-[#FF5A72]"}
            style={{ top: `${markerPct}%` }}
          >
            {v.toLocaleString("en-US")}m
          </span>
          <span
            className="absolute right-[3px] -translate-y-1/2"
            style={{
              top: `${markerPct}%`,
              width: 0,
              height: 0,
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              borderRight: "8px solid #F4407A",
              filter: "drop-shadow(0 0 4px rgba(244,64,122,0.8))",
            }}
          />
        </>
      )}
    </div>
  );
}

/* ---------------- logo ---------------- */

/** Two-tone pixel logo with hard shadow — "KRILLION" / "NOILLIRK". */
export function PixelLogo({
  title,
  accentWords,
  className,
  clean,
}: {
  title: string;
  /** words (1-indexed) rendered in pink; rest white */
  accentWords?: number[];
  className?: string;
  clean?: boolean;
}) {
  const words = title.split(" ");
  return (
    <h2 className={cn(
      clean ? "game-logo text-center font-game-ui font-black" : "pd-logo text-center font-pixel",
      className
    )}>
      {words.map((w, i) => (
        <span
          key={i}
          className={cn(
            "mr-[0.5em] inline-block last:mr-0",
            accentWords?.includes(i + 1) ? "text-[#F4407A]" : "text-white"
          )}
        >
          {w}
        </span>
      ))}
    </h2>
  );
}

/** Small pixel krill mascot that can float beside the logo. */
export function KrillMascot({ className }: { className?: string }) {
  return (
    <span className={cn("pd-anim-bob pointer-events-none absolute", className)} aria-hidden="true">
      <PixelSprite name="krill" pixel={4} />
    </span>
  );
}
