"use client";

import { CSSProperties } from "react";
import { PixelSprite } from "./PixelSprite";

/* ============================================================
   Immersive pixel-art forest scene — the Noillirk canvas.
   Sunlit glade: glowing sky, tall trunks with canopies, light
   rays, a lily pond, grass, flowers, mushrooms, butterflies
   and fireflies. `climbTint` (0..1) lifts you towards the sky.
   ============================================================ */

/* Tall trunks frame the sides like the reference glade — dense
   clusters left and right, thin distant trunks in the middle-back,
   and a clear view down the dirt path. */
const TRUNKS = [
  { left: "1%", w: 30, h: 70, tone: "#6B4C32" },
  { left: "5%", w: 38, h: 86, tone: "#7A5A3C" },
  { left: "10%", w: 24, h: 60, tone: "#8A6A4A" },
  { left: "15%", w: 30, h: 78, tone: "#6B4C32" },
  { left: "34%", w: 14, h: 42, tone: "#5C4230" },
  { left: "44%", w: 12, h: 38, tone: "#66492F" },
  { left: "60%", w: 14, h: 44, tone: "#5C4230" },
  { left: "82%", w: 28, h: 72, tone: "#6B4C32" },
  { left: "88%", w: 36, h: 84, tone: "#7A5A3C" },
  { left: "94%", w: 24, h: 62, tone: "#8A6A4A" },
  { left: "97%", w: 30, h: 74, tone: "#6B4C32" },
];

const RAYS = [
  { left: "18%", w: 90, dur: 8, delay: 0 },
  { left: "46%", w: 120, dur: 11, delay: -3 },
  { left: "72%", w: 100, dur: 9, delay: -6 },
];

const FLOWERS = [
  { sprite: "flower", left: "8%", bottom: "4%", pixel: 3 },
  { sprite: "flowerGold", left: "18%", bottom: "9%", pixel: 3 },
  { sprite: "flower", left: "34%", bottom: "3%", pixel: 2 },
  { sprite: "flowerGold", left: "55%", bottom: "8%", pixel: 3 },
  { sprite: "flower", left: "70%", bottom: "4%", pixel: 2 },
  { sprite: "flowerGold", left: "88%", bottom: "9%", pixel: 3 },
];

const BUTTERFLIES = [
  { top: "38%", dur: 34, delay: -5, blue: false },
  { top: "52%", dur: 46, delay: -22, blue: true },
];

const FIREFLIES = [
  { left: "14%", top: "60%", dur: 2.8, delay: 0 },
  { left: "30%", top: "70%", dur: 3.4, delay: -1.2 },
  { left: "62%", top: "64%", dur: 3, delay: -2 },
  { left: "82%", top: "72%", dur: 3.6, delay: -0.6 },
  { left: "92%", top: "56%", dur: 2.6, delay: -1.8 },
];

const LEAVES = [
  { left: "22%", dur: 12, delay: 0, color: "#8FCB6A" },
  { left: "48%", dur: 15, delay: -6, color: "#C9E07A" },
  { left: "74%", dur: 13, delay: -9, color: "#8FCB6A" },
];

function PixelCanopy({ scale, tone }: { scale: number; tone: string }) {
  return (
    <span
      className="relative block"
      style={{
        width: 16 * scale,
        height: 10 * scale,
      }}
    >
      <span
        className="absolute left-0 top-0 block"
        style={{
          width: scale,
          height: scale,
          boxShadow: [
            // bottom layer — widest
            ...blob(1, 7, scale, 14, tone),
            // middle layer
            ...blob(3, 4, scale, 10, shade(tone)),
            // top layer — narrowest
            ...blob(5, 1, scale, 6, tone),
          ].join(", "),
        }}
      />
    </span>
  );
}

/** lighten/darken helper for canopy depth */
function shade(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + 18);
  const g = Math.min(255, ((n >> 8) & 255) + 18);
  const b = Math.min(255, (n & 255) + 18);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** tiny helper: filled rect of pixels as box-shadow entries */
function blob(x: number, y: number, s: number, w: number, color: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < 3; j++) {
      out.push(`${(x + i) * s}px ${(y + j) * s}px 0 0 ${color}`);
    }
  }
  return out;
}

export function ForestScene({
  climbTint = 0,
  playing = false,
  className,
  style,
}: {
  /** 0 = forest floor, 1 = above the canopy. Brightens + warms. */
  climbTint?: number;
  /** in-play: shows the "play today" watermark, like the reference */
  playing?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const tint = Math.min(1, Math.max(0, climbTint));
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`} style={style}>
      {/* ---------- sky glow ---------- */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg,#FFFBE0 0%,#F3F7C6 26%,#CBE8A8 58%,#8CC77C 100%)",
        }}
      />

      {/* light rays through the canopy */}
      {RAYS.map((r, i) => (
        <div
          key={i}
          className="pd-anim-sway absolute top-[-6%] h-[70%]"
          style={{
            left: r.left,
            width: r.w,
            animationDuration: `${r.dur}s`,
            animationDelay: `${r.delay}s`,
            background: "linear-gradient(180deg, rgba(255,252,214,0.55), rgba(255,252,214,0.12) 60%, transparent 82%)",
            transform: "skewX(-14deg)",
          }}
        />
      ))}

      {/* high-altitude clouds — drift in as you climb */}
      <div
        className="absolute inset-x-0 top-0 transition-opacity duration-1000"
        style={{ opacity: Math.min(1, tint * 1.4) }}
      >
        <div className="pd-anim-cloud absolute top-[8%]" style={{ animationDuration: "120s", animationDelay: "-30s" }}>
          <span className="block h-[10px] w-[70px] rounded-full bg-white/90 shadow-[30px_-9px_0_11px_rgba(255,255,255,0.92),-34px_-5px_0_9px_rgba(255,255,255,0.88)]" style={{ transform: "scale(2.4)" }} />
        </div>
        <div className="pd-anim-cloud absolute top-[20%]" style={{ animationDuration: "150s", animationDelay: "-80s" }}>
          <span className="block h-[10px] w-[70px] rounded-full bg-white/85 shadow-[26px_-8px_0_10px_rgba(255,255,255,0.85),-28px_-4px_0_8px_rgba(255,255,255,0.8)]" style={{ transform: "scale(1.8)" }} />
        </div>
        <div className="pd-anim-cloud absolute top-[33%]" style={{ animationDuration: "135s", animationDelay: "-55s" }}>
          <span className="block h-[10px] w-[70px] rounded-full bg-white/80 shadow-[24px_-7px_0_9px_rgba(255,255,255,0.8),-26px_-4px_0_7px_rgba(255,255,255,0.75)]" style={{ transform: "scale(1.4)" }} />
        </div>
      </div>

      {/* ---------- ground group — sinks away as you climb ---------- */}
      <div
        className="absolute inset-0 transition-transform duration-[1400ms] ease-in-out"
        style={{ transform: `translateY(${tint * 92}%)` }}
      >

      {/* winding dirt path down the middle, like the reference glade */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 200"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-[43%] h-[58%] w-[15%]"
        style={{ shapeRendering: "crispEdges", opacity: 0.95 }}
      >
        <polygon points="34,200 66,200 60,150 64,104 56,52 52,0 42,0 46,52 38,104 42,150" fill="#C9A96E" />
        <polygon points="34,200 42,150 38,104 46,52 42,0 37,0 41,52 33,104 36,150 28,200" fill="#BA945D" />
        <rect x="46" y="30" width="3" height="3" fill="#A8814C" />
        <rect x="53" y="78" width="3" height="3" fill="#A8814C" />
        <rect x="47" y="120" width="4" height="3" fill="#A8814C" />
        <rect x="54" y="160" width="3" height="3" fill="#A8814C" />
      </svg>

      {/* fallen log with growth rings, left side */}
      <div className="absolute bottom-[17%] left-[4%] flex items-center" aria-hidden="true">
        <span
          className="relative block h-8 w-28 rounded-full"
          style={{
            background: "linear-gradient(180deg,#9A7850 0%,#9A7850 52%,#7A5C3A 52%,#7A5C3A 100%)",
            boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.16), 0 3px 0 #5E4630",
          }}
        >
          <span
            className="absolute -right-3 top-0 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-[#7A5C3A] bg-[#D9BC85]"
            style={{ boxShadow: "inset 0 0 0 3px #C0A267, inset 0 0 0 6px #D9BC85" }}
          />
          <span className="absolute left-4 top-2 h-1.5 w-10 rounded-full bg-[#6B8F52]/70" />
          <span className="absolute left-8 top-5 h-1.5 w-8 rounded-full bg-[#6B8F52]/60" />
        </span>
      </div>

      {/* cattails by the pond */}
      <PixelSprite name="cattail" pixel={3} className="absolute bottom-[22%] left-[30%]" />
      <PixelSprite name="cattail" pixel={2} className="absolute bottom-[21%] left-[62%]" flip />
      <PixelSprite name="cattail" pixel={3} className="absolute bottom-[24%] right-[18%]" />

      {/* distant trunks with attached canopies */}
      {TRUNKS.map((t, i) => (
        <span
          key={i}
          className="absolute bottom-0"
          style={{ left: t.left, width: t.w, height: `${t.h}%` }}
        >
          {/* canopy sits directly on the trunk top */}
          <span
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: "100%", marginBottom: 4 }}
          >
            <PixelCanopy scale={Math.max(3, t.w / 3.5)} tone={i % 2 ? "#6FA85E" : "#5C964E"} />
          </span>
          <span className="absolute inset-0" style={{ background: t.tone }}>
            <span className="absolute inset-x-0 top-0 h-[6px] bg-black/15" />
          </span>
        </span>
      ))}

      {/* falling leaves */}
      {LEAVES.map((l, i) => (
        <span
          key={i}
          className="pd-anim-leaf absolute top-[-4%]"
          style={{
            left: l.left,
            width: 5,
            height: 5,
            animationDuration: `${l.dur}s`,
            animationDelay: `${l.delay}s`,
            background: l.color,
          }}
        />
      ))}

      {/* fireflies */}
      {FIREFLIES.map((f, i) => (
        <span
          key={i}
          className="gd-anim-twinkle absolute"
          style={{
            left: f.left,
            top: f.top,
            width: 4,
            height: 4,
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
            background: "#FFF7AE",
            boxShadow: "0 0 8px 3px rgba(255,247,174,0.55)",
          }}
        />
      ))}

      {/* ---------- pond (off-centre, left of the path, like the reference) ---------- */}
      <div className="absolute bottom-[10%] left-[24%] -translate-x-1/2">
        <div
          className="relative h-16 w-64 rounded-[50%] sm:w-80"
          style={{
            background: "radial-gradient(60% 70% at 50% 42%, #7FC2E4 0%, #4E93C4 58%, #3B78A4 100%)",
            boxShadow: "inset 0 3px 0 rgba(255,255,255,0.45), 0 3px 0 #2E5E38",
          }}
        >
          <span className="pd-anim-glint absolute left-[18%] top-[30%] h-[3px] w-10 bg-white/70" />
          <span className="pd-anim-glint absolute right-[20%] top-[52%] h-[3px] w-8 bg-white/60" style={{ animationDelay: "-1.4s" }} />
          <PixelSprite name="lily" pixel={3} className="absolute left-[12%] top-[26%]" />
          <PixelSprite name="lily" pixel={2} flip className="absolute right-[16%] top-[42%]" />
        </div>
      </div>

      {/* grass floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[12%]"
        style={{
          background: "linear-gradient(180deg,#5EA84C 0%,#4E9B3F 100%)",
          boxShadow: "inset 0 4px 0 rgba(255,255,255,0.18)",
        }}
      />
      {/* grass tufts */}
      {["6%", "16%", "27%", "44%", "58%", "72%", "86%", "95%"].map((l, i) => (
        <span
          key={i}
          className="absolute bottom-[9%] block"
          style={{
            left: l,
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderBottom: `10px solid ${i % 2 ? "#3F8F4E" : "#69B757"}`,
          }}
        />
      ))}

      {/* flowers + mushrooms + frog */}
      {FLOWERS.map((f, i) => (
        <PixelSprite
          key={i}
          name={f.sprite}
          pixel={f.pixel}
          className="absolute"
          style={{ left: f.left, bottom: f.bottom }}
        />
      ))}
      <PixelSprite name="mushroom" pixel={3} className="absolute bottom-[3%] left-[12%]" />
      <PixelSprite name="mushroom" pixel={2} flip className="absolute bottom-[6%] right-[9%]" />
      <PixelSprite name="mushroom" pixel={2} className="absolute bottom-[13%] left-[74%]" />
      <PixelSprite name="mushroom" pixel={2} flip className="absolute bottom-[28%] left-[16%]" />
      <PixelSprite name="frog" pixel={3} className="absolute bottom-[2%] left-[46%] hidden sm:block" />

      {/* a fox watching from the treeline, right side */}
      <PixelSprite name="fox" pixel={3} flip className="absolute bottom-[34%] right-[10%] pd-anim-sway-soft" style={{ animationDelay: "-2s" }} />

      {/* ferns scattered around the glade */}
      <PixelSprite name="seaweed" pixel={3} className="absolute bottom-[8%] left-[30%]" />
      <PixelSprite name="seaweed" pixel={2} flip className="absolute bottom-[12%] right-[30%]" />
      <PixelSprite name="seaweed" pixel={2} className="absolute bottom-[30%] left-[8%]" />

      {/* butterflies */}
      {BUTTERFLIES.map((b, i) => (
        <div
          key={i}
          className="pd-anim-fly absolute"
          style={{ top: b.top, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
        >
          <span className="pd-anim-flap relative block">
            <PixelSprite name={b.blue ? "butterflyBlue" : "butterfly"} pixel={3} />
            <PixelSprite
              name={b.blue ? "butterflyBlue" : "butterflyUp"}
              pixel={3}
              className="pd-flap-alt absolute left-0 top-0"
            />
          </span>
        </div>
      ))}
      </div>{/* /ground group */}

      {/* climb tint overlay — brightens towards the sky */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-linear"
        style={{
          background: "linear-gradient(180deg,#FFFBE0 0%,transparent 70%)",
          opacity: tint * 0.5,
        }}
      />

      {/* "play today" watermark — floats mid-scene while climbing */}
      {playing && (
        <p className="absolute bottom-[30%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[#0B1A0F]/55 px-2.5 py-1 font-pixel-ui text-[8px] tracking-[0.18em] text-white/65">
          PLAY TODAY AT KRILLIONUNBLOCKED.COM/NOILLIRK
        </p>
      )}
    </div>
  );
}
