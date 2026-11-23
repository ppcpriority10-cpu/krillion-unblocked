"use client";

import { useEffect, useMemo, useRef } from "react";

/* ============================================================
   LiveOceanCanvas — the Krillion ocean as a LIVING, SCROLLING
   pixel-art world drawn on a low-res HTML5 canvas, upscaled
   with image-rendering: pixelated. No background images at all:
   every rock, coral, fish, bubble and jellyfish is drawn and
   animated every frame, and the camera descends through the
   canyon as depth increases — the way the competitor's world
   behaves (their scene is pixel art AND fully animated AND
   scrolling with depth).

   World model:
   - worldY is in canvas pixels; 1 metre = PPM px (0.42).
   - worldY 0 = the waterline. Sky lives above it (negative y);
     the trench runs 0..7000m below it.
   - the canyon walls are SEEDED, deterministic profiles — the
     layout never reshuffles; only the living things move.
   - cameraY eases toward depth*PPM while playing, or toward
     the surface view on the ready screen, so BEGIN DESCENT
     feels like a real dive.
   - all horizontal layout is stored as fractions of the canvas
     width, so the same world reads on desktop and portrait.
   ============================================================ */

const PPM = 0.42; // canvas px per metre of depth
const MAX_DEPTH = 7000;
const WORLD_H = MAX_DEPTH * PPM; // 2940px of trench
const EDGE_STEP = 4; // px between wall-profile samples
const MAX_DIM = 480; // longest internal canvas side (pixelated upscale)

/* ---------------- small helpers ---------------- */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** deterministic 0..1 hash of integer coords (stable across frames) */
function hash2(x: number, y: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** v19: smooth 2D value noise — bilinearly interpolated hash grid.
    The craggy wall face needs ORGANIC tone variation: per-cell
    independent jitter reads as a salt-and-pepper mosaic, and
    hard block fields read as patches. Smooth value noise makes
    neighbouring cells correlate, so the quantized tones form
    irregular organic facets of many sizes — the competitor's
    rock. Sampled in world coordinates, so it scrolls with the
    wall. */
function vnoise(x: number, y: number, cell: number, seed: number): number {
  const gx = x / cell;
  const gy = y / cell;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const fx = smooth(gx - x0);
  const fy = smooth(gy - y0);
  const h = (ix: number, iy: number) => hash2(ix * 3 + seed, iy * 7 + seed * 5);
  const v00 = h(x0, y0);
  const v10 = h(x0 + 1, y0);
  const v01 = h(x0, y0 + 1);
  const v11 = h(x0 + 1, y0 + 1);
  return lerp(lerp(v00, v10, fx), lerp(v01, v11, fx), fy);
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
/** smoothstep ramp 0..1 between two values */
const ramp = (v: number, from: number, to: number) =>
  smooth(clamp((v - from) / (to - from), 0, 1));

/* ---------------- depth-driven palette ---------------- */

type RGB = [number, number, number];
const hx = (s: string): RGB => [
  parseInt(s.slice(1, 3), 16),
  parseInt(s.slice(3, 5), 16),
  parseInt(s.slice(5, 7), 16),
];
type Stop = [number, RGB];
const S = (d: number, c: string): Stop => [d, hx(c)];

/* v24: the water follows the user's OWN ocean spec
   (krillion-ocean-code.html — "the final one I gave you"):
   #3fb2d4 → #2596bd → #17719a → #0f5578, bright turquoise
   shallows. At the surface frame the gradient runs from his
   top colour to his bottom colour; with depth it darkens
   toward the same abyss as before, so the dive still feels
   deep — only the shallows changed. */
const WATER_TOP: Stop[] = [
  S(0, "#3FB2D4"), S(250, "#2E9CC2"), S(600, "#1F7FA8"), S(1000, "#14638A"),
  S(1500, "#0D4A6B"), S(2500, "#082F47"), S(4000, "#041A2C"), S(7000, "#010710"),
];
const WATER_BOT: Stop[] = [
  S(0, "#2596BD"), S(250, "#1D86AB"), S(600, "#0F5578"), S(1000, "#0A4060"),
  S(1500, "#072E47"), S(2500, "#041C2E"), S(4000, "#020F1C"), S(7000, "#000307"),
];
/* v14: LIGHTENED to the competitor's sampled 0m wall tones (measured
   from competitor-krillion-play-0m-v2.png: wall median ~#1E6B8C,
   ledge highlights ~#368CB3–#4E93B2, shadows ~#165A7B; water median
   ~#218AB1). The v13 stops (#33596E face) were far too dark — the
   walls read as black-blue voids. The shallow rock is now mid
   blue-teal, close in brightness to the water itself, and only the
   deep rock goes dark. */
const ROCK_FACE: Stop[] = [
  S(0, "#2A7596"), S(250, "#256A89"), S(600, "#1F5978"), S(1000, "#1A4A64"),
  S(1500, "#133650"), S(2500, "#0D2438"), S(4000, "#081725"), S(7000, "#040C14"),
];
const ROCK_DARK: Stop[] = [
  S(0, "#175A76"), S(250, "#15506A"), S(600, "#12445C"), S(1000, "#0F3649"),
  S(1500, "#0B2839"), S(2500, "#081A28"), S(4000, "#05101B"), S(7000, "#030810"),
];
const ROCK_RIM: Stop[] = [
  S(0, "#8FC8E2"), S(250, "#79B4D4"), S(600, "#5F97BC"), S(1000, "#4A7699"),
  S(1500, "#345873"), S(2500, "#223A4E"), S(4000, "#152739"), S(7000, "#0A1624"),
];
const DEEP_BLUE: RGB = [4, 16, 28];

function sample(stops: Stop[], d: number): RGB {
  if (d <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (d <= stops[i][0]) {
      const [d0, c0] = stops[i - 1];
      const [d1, c1] = stops[i];
      const t = (d - d0) / (d1 - d0);
      return [lerp(c0[0], c1[0], t), lerp(c0[1], c1[1], t), lerp(c0[2], c1[2], t)];
    }
  }
  return stops[stops.length - 1][1];
}
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/* ---------------- v14 walls: LIGHT SCULPTED ROCK + FACE LEDGES ----------------
   FOURTH attempt at the walls — the three previous approaches all
   failed on the live site, and the user rejected all three:
   - v9/v11 pixel-art rock TILES read as busy noisy speckle (the user's
     complaint: "pixels look bad", "rocks look weird").
   - v12 smooth STACKED LEDGE BLOCKS read as grey STAIRCASES/slides
     (evenly-sized repeating rectangles with hard horizontal lines =
     man-made; the user: "what have you done").
   - v13 dark SMOOTH ORGANIC MASSES read as dark navy VOIDS — big
     black-blue curtains with no visible internal form (the user:
     "why isn't it like our competitor?").
   The competitor sits BETWEEN v12 and v13: organic curved ledges,
   VISIBLE structure, LIGHT tones, no regularity, no noise. Sampled
   from the competitor's 0m frame: wall median ~#1E6B8C, ledge
   highlights ~#368CB3–#4E93B2, shadows ~#165A7B — the rock is only
   slightly darker than the bright turquoise water. So v14 keeps
   v13's organic bezier silhouette, LIGHTENS the palette to those
   sampled tones, and adds VISIBLE FACE LEDGES: smooth curved slabs
   jutting from the wall into the water, each with a soft highlight
   on its domed top and a soft shadow beneath — irregular sizes and
   spacing, never straight lines, never a rhythm. The rock's form is
   now visible at a glance instead of lost in flat darkness. */

/* v24: the caustic WEB is deleted — the user asked for the
   lines to go. The light dapples are now soft blurred ellipses
   drawn inline in drawScene (his ocean spec's caustics). */

/* v11: the caustic light-web tile is DELETED. On the live site the
   overlapping arcs read as odd visible rings in the water (clearly
   visible in the user's screenshot) — a calm gradient with god rays
   is better than strange rings. Less is more. */

/* ---------------- v23: photo assets — NON-LIVING ONLY ----------------
   v23 rebuild (2026-11-13): the user wants NO pictures of living
   things — every creature is drawn + animated in code (see the
   smooth draw functions below). Photos remain ONLY for things
   that don't move like creatures: the rock walls + ledges +
   pillars, and the surface island + boats. Everything else that
   used to load here (pixel fish, ruins, coral, seaweed, bubbles,
   and the v22 photo creatures) is deleted — the code draws all of
   it now, smooth and alive.
   NOTE: these PNGs cannot go through the GitHub push (push_files
   rejects binaries) — they reach production only via the Vercel CLI
   deploy from this VM. Do NOT add them to the git manifest. */

const SPRITE_BASE = "/sprites/krillion";
const SPRITE_NAMES = [
  "island-photo", "boat-photo", "sailboat-photo",
] as const;
type Sprites = Record<string, HTMLImageElement | null>;

/** browser-only: call inside useEffect, never at module scope (SSR). */
function loadSprites(): Sprites {
  const out: Sprites = {};
  for (const name of SPRITE_NAMES) {
    const img = new Image();
    img.src = `${SPRITE_BASE}/${name}.png`;
    out[name] = img;
  }
  return out;
}

/** true once the image has actually arrived (and isn't a 404). */
function spriteReady(img: HTMLImageElement | null | undefined): img is HTMLImageElement {
  return !!img && img.complete && img.naturalWidth > 0;
}

const JELLY_HUES: RGB[] = [
  hx("#7FE3FF"), hx("#B79CFF"), hx("#FF9AD5"), hx("#9CFFD9"),
];
const FISH_SHALLOW: RGB[] = [
  hx("#C9A94A"), hx("#D98A5F"), hx("#6FA3C9"), hx("#D98A9B"), hx("#C97A4A"),
];
const FISH_MID: RGB[] = [hx("#5FA8A0"), hx("#7AA8C9"), hx("#8A7BA8")];
const FISH_DEEP: RGB[] = [hx("#5A7A94"), hx("#7A6A9A")];

/* ---------------- the seeded world ---------------- */

/** face: 0 = hug the inner edge (old behaviour); >0 = fraction of the
    wall width from the OUTER edge, so coral grows ON the rock face.
    Right wall keeps face >= 0.2 so the depth-ruler strip stays clear. */
interface Fish { y: number; fx: number; speed: number; dir: 1 | -1; size: number; body: RGB; phase: number; kind: number }
interface School { y: number; fx: number; speed: number; dir: 1 | -1; n: number; seed: number; body: RGB }
interface Jelly { y: number; fx: number; size: number; phase: number; hue: RGB }
interface GlowMote { y: number; fx: number; size: number; phase: number; hue: RGB }
interface Lure { y: number; fx: number; phase: number }
interface Bubble { fx: number; speed: number; size: number; phase: number }
interface Snow { fx: number; speed: number; size: number; phase: number; alpha: number; cyan: boolean }

interface World {
  fish: Fish[];
  schools: School[];
  jellies: Jelly[];
  motes: GlowMote[];
  lures: Lure[];
  bubbles: Bubble[];
  snow: Snow[];
}

function genWorld(seed: number): World {
  const rng = mulberry32(seed);
  const fish: Fish[] = [];
  const fishBand = (count: number, d0: number, d1: number, palette: RGB[]) => {
    for (let i = 0; i < count; i++) {
      const r = rng();
      fish.push({
        y: (d0 + rng() * (d1 - d0)) * PPM,
        fx: 0.2 + rng() * 0.6,
        speed: 6 + rng() * 16,
        dir: rng() < 0.5 ? 1 : -1,
        // v24: fish BIGGER (12–20, was 7–14) — the user said the
        // fish sizes need setting: at 7–14 they read as tiny
        // specks next to the turtle and shark. Reef fish are now
        // clearly visible, with the shark/manta still the giants.
        size: 12 + rng() * 8,
        body: palette[Math.floor(rng() * palette.length)],
        phase: rng() * Math.PI * 2,
        // 0 striped, 1 spotted, 2 tang, 5 needle, 6 puffer,
        // 7 reef red, 8 eel — 7 detailed species, not one blob shape
        kind:
          r < 0.22 ? 0 : r < 0.42 ? 1 : r < 0.6 ? 2 : r < 0.74 ? 5
          : r < 0.86 ? 6 : r < 0.94 ? 7 : 8,
      });
    }
  };
  // v11: fewer fish (5 shallow / 4 mid, was 12 / 6) with muted
  // colours — the v10 water was crowded with bright fish. Shallow
  // fish start at 150m so the READY frame's upper water (the first
  // impression) is calm and nearly fish-free, like the competitor's.
  fishBand(5, 150, 420, FISH_SHALLOW);
  fishBand(4, 300, 1200, FISH_MID);
  fishBand(4, 1200, 2200, FISH_DEEP);
  // big dark silhouettes, like the competitor's shark at ~700m and the
  // manta in the shallows — slow, unmistakable, one each. The manta
  // is lighter and bigger than v9's (it never read on screen there).
  fish.push({ y: 700 * PPM, fx: 0.3, speed: 4, dir: 1, size: 38, body: hx("#16293A"), phase: 0, kind: 3 });
  fish.push({ y: 380 * PPM, fx: 0.6, speed: 5, dir: -1, size: 40, body: hx("#33506A"), phase: 1, kind: 4 });
  // v35: new deep creatures — gulper eels (1600m, 2800m) and
  // vampire squid (900m, 2000m). Slow, dark, glowing — the deep
  // was mostly jellies below 2000m.
  fish.push({ y: 1600 * PPM, fx: 0.25, speed: 3, dir: 1, size: 16, body: hx("#1A1A2E"), phase: 0.5, kind: 9 });
  fish.push({ y: 2800 * PPM, fx: 0.65, speed: 2.5, dir: -1, size: 18, body: hx("#141428"), phase: 2.1, kind: 9 });
  fish.push({ y: 900 * PPM, fx: 0.7, speed: 2, dir: -1, size: 15, body: hx("#4A0E2E"), phase: 1.2, kind: 10 });
  fish.push({ y: 2000 * PPM, fx: 0.35, speed: 2, dir: 1, size: 17, body: hx("#3D0B26"), phase: 3.4, kind: 10 });

  // small SCHOOLS of tiny fish in the shallows — the competitor's
  // water has darting shoals, not only lone fish. v11: 2 schools
  // of 4–6 (was 5 of 6–9), muted colours, starting at 180m so the
  // ready frame's upper water stays calm.
  const schools: School[] = [];
  for (let i = 0; i < 2; i++) {
    schools.push({
      y: (180 + rng() * 270) * PPM,
      fx: rng(),
      speed: 10 + rng() * 10,
      dir: rng() < 0.5 ? 1 : -1,
      n: 4 + Math.floor(rng() * 3),
      seed: 100 + i * 17,
      body: FISH_SHALLOW[Math.floor(rng() * FISH_SHALLOW.length)],
    });
  }

  // jellyfish: uniform across the deep so several are always in view,
  // PLUS a dense field 1200–3000m — the competitor's 1300m frame has
  // ~12 glowing jellies across the frame, ours had 2–3.
  const jellies: Jelly[] = [];
  for (let i = 0; i < 42; i++) {
    jellies.push({
      y: (600 + rng() * 6200) * PPM,
      fx: 0.12 + rng() * 0.76,
      size: 6 + rng() * 7,
      phase: rng() * Math.PI * 2,
      hue: JELLY_HUES[Math.floor(rng() * JELLY_HUES.length)],
    });
  }
  for (let i = 0; i < 16; i++) {
    jellies.push({
      y: (1200 + rng() * 1800) * PPM,
      fx: 0.12 + rng() * 0.72,
      size: 6 + rng() * 6,
      phase: rng() * Math.PI * 2,
      hue: JELLY_HUES[Math.floor(rng() * JELLY_HUES.length)],
    });
  }
  // and a second thickening 2400–4200m, so the deep frames (2500m+)
  // keep a visible jelly field instead of going empty
  for (let i = 0; i < 10; i++) {
    jellies.push({
      y: (2400 + rng() * 1800) * PPM,
      fx: 0.12 + rng() * 0.72,
      size: 6 + rng() * 6,
      phase: rng() * Math.PI * 2,
      hue: JELLY_HUES[Math.floor(rng() * JELLY_HUES.length)],
    });
  }
  // v10: a third deep thickening 2000–4200m — the v9 3000m frame was
  // sparse (3 jellies); the abyss should feel alive, not empty
  for (let i = 0; i < 12; i++) {
    jellies.push({
      y: (2000 + rng() * 2200) * PPM,
      fx: 0.1 + rng() * 0.76,
      size: 7 + rng() * 6,
      phase: rng() * Math.PI * 2,
      hue: JELLY_HUES[Math.floor(rng() * JELLY_HUES.length)],
    });
  }

  // glowing motes: tiny twinkling cyan/white/pink dots in the deep
  // (1200–5000m) — the competitor's abyss sparkles with light
  const motes: GlowMote[] = [];
  const MOTE_HUES: RGB[] = [...JELLY_HUES, hx("#FFFFFF"), hx("#FFD6EC")];
  for (let i = 0; i < 30; i++) {
    motes.push({
      y: (1200 + rng() * 3800) * PPM,
      fx: 0.08 + rng() * 0.84,
      size: rng() < 0.7 ? 1 : 2,
      phase: rng() * Math.PI * 2,
      hue: MOTE_HUES[Math.floor(rng() * MOTE_HUES.length)],
    });
  }

  // anglerfish lure lights — the competitor has a glowing yellow lure
  // at ~700m; ours had none. Small dark body, glowing dot on a stalk.
  const lures: Lure[] = [
    { y: 700 * PPM, fx: 0.25, phase: 0 },
    { y: 1900 * PPM, fx: 0.7, phase: 2 },
    { y: 3200 * PPM, fx: 0.4, phase: 4 },
  ];

  const bubbles: Bubble[] = [];
  for (let i = 0; i < 16; i++) {
    bubbles.push({ fx: rng(), speed: 12 + rng() * 20, size: rng() < 0.6 ? 2 : 3, phase: rng() });
  }
  const snow: Snow[] = [];
  for (let i = 0; i < 110; i++) {
    snow.push({
      fx: rng(),
      speed: 4 + rng() * 8,
      size: rng() < 0.75 ? 1 : 2,
      phase: rng(),
      alpha: 0.25 + rng() * 0.4,
      // ~40% cyan-tinted, like the competitor's glowing particles
      cyan: rng() < 0.4,
    });
  }

  // keep the edge accessor out of the hot path: store it on the object
  return { fish, schools, jellies, motes, lures, bubbles, snow };
}

/** wall edge fraction at a worldY (linear interp between samples) */
/* ---------------- drawing ---------------- */

interface Pal {
  waterTop: RGB;
  waterBot: RGB;
  rockFace: RGB;
  rockDark: RGB;
  rockRim: RGB;
  /** 0 = sunlit shallows, 1 = abyss — dims coral/rock detail */
  dark01: number;
}

function paletteFor(depthM: number): Pal {
  return {
    waterTop: sample(WATER_TOP, depthM),
    waterBot: sample(WATER_BOT, depthM),
    rockFace: sample(ROCK_FACE, depthM),
    rockDark: sample(ROCK_DARK, depthM),
    rockRim: sample(ROCK_RIM, depthM),
    dark01: ramp(depthM, 250, 1600),
  };
}

/** fill a rect, coordinates floored for chunky pixels */
function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c: string
) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
}

/* ---------- the surface world (ready screen) ---------- */

/** v23: a smooth sky — a soft gradient, a glowing sun with a
    wide halo, and soft drifting clouds made of blurred ellipses.
    No pixel sun, no pixel clouds, no gulls. */
function drawSky(
  ctx: CanvasRenderingContext2D,
  W: number,
  wlY: number,
  t: number
) {
  // v27: a REAL sky — the v24 pale sky (from the user's ocean
  // spec) read as flat white, and its white-on-white clouds were
  // invisible ("sky real nhi lag rha", "cloud nazr hi nhi a rhy").
  // Now: a true blue gradient (deep at the top, pale at the
  // horizon), a visible sun disc with a warm glow, and four puffy
  // white clouds with soft grey undersides, clearly visible
  // against the blue. The WATER keeps the user's spec exactly —
  // only the sky above it changes.
  const skyH = Math.max(1, wlY);
  const g = ctx.createLinearGradient(0, 0, 0, skyH);
  g.addColorStop(0, "#4A8FC2");
  g.addColorStop(0.55, "#7FB9E2");
  g.addColorStop(1, "#CFE4EC");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, Math.max(0, wlY));

  // sun: a bright disc with a warm glow, up in the sky where you
  // can actually see it (v24's glow sat mostly off-screen)
  const sunX = W * 0.72;
  const sunY = wlY * 0.3;
  const sunR = W * 0.045;
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 4);
  glow.addColorStop(0, "rgba(255,244,190,0.85)");
  glow.addColorStop(0.35, "rgba(255,244,190,0.35)");
  glow.addColorStop(1, "rgba(255,244,190,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - sunR * 4, sunY - sunR * 4, sunR * 8, sunR * 8);
  ctx.fillStyle = "#FFFBE8";
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // clouds: four puffy cumulus clouds, each a cluster of white
  // ellipses with a soft grey-blue underside, drifting slowly.
  // White against the blue sky — clearly visible now.
  const clouds: [number, number, number, number][] = [
    // [x fraction, y fraction of sky, scale, speed]
    [0.1, 0.2, 1.0, 1.1],
    [0.38, 0.42, 0.7, 0.8],
    [0.62, 0.15, 1.3, 1.4],
    [0.85, 0.38, 0.8, 1.0],
  ];
  for (const [fx, fy, sc, speed] of clouds) {
    const span = W + 220;
    const cx = ((fx * span + t * speed) % span) - 110;
    const cy = fy * wlY;
    const u = sc * W * 0.055; // unit size for this cloud's puffs
    // soft grey-blue underside (the cloud's shadow side)
    ctx.fillStyle = "rgba(185,208,224,0.9)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + u * 0.28, u * 1.7, u * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    // puffy white top: a row of overlapping domes
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    const puffs: [number, number, number, number][] = [
      // [dx, dy, rx, ry] in units of u
      [-1.1, 0.1, 0.85, 0.55],
      [-0.35, -0.3, 0.95, 0.7],
      [0.45, -0.2, 0.9, 0.65],
      [1.15, 0.12, 0.8, 0.5],
      [0.05, 0.15, 1.5, 0.5],
    ];
    for (const [dx, dy, rx, ry] of puffs) {
      ctx.beginPath();
      ctx.ellipse(cx + dx * u, cy + dy * u, rx * u, ry * u, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawIsland(
  ctx: CanvasRenderingContext2D,
  W: number,
  wlY: number,
  t: number,
  spr: Sprites | null
) {
  // v22: the user's PHOTO island (rocky island, trees, red/white
  // lighthouse). v32: the old code-drawn pixel island fallback is
  // deleted permanently — while the photo loads, no island shows
  // at all, so there is never a second island. The photo's own
  // lighthouse keeps the slow sweeping beam.
  const iimg = spr ? spr["island-photo"] : null;
  if (iimg && spriteReady(iimg)) {
    const iw = W * 0.17;
    const ih = (iw * iimg.naturalHeight) / iimg.naturalWidth;
    const ix = W * 0.015;
    const iy = wlY - ih;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(iimg, Math.floor(ix), Math.floor(iy), Math.round(iw), Math.round(ih));
    ctx.restore();
    // sweeping beam from the photo lighthouse's lamp (~70% across,
    // ~12% down the image)
    const ang = Math.sin(t * 0.35) * 0.55;
    ctx.save();
    ctx.translate(ix + iw * 0.7, iy + ih * 0.12);
    ctx.rotate(ang);
    ctx.fillStyle = "rgba(255,240,170,0.14)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(34, -4);
    ctx.lineTo(34, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }
  // v32: NO fallback island. The code-drawn pixel island used to
  // show here while the photo loaded, and the user saw it as a
  // duplicate island (pixel first, photo second). It is deleted
  // permanently — until the photo is ready, no island is drawn.
}

function drawBoats(
  ctx: CanvasRenderingContext2D,
  W: number,
  wlY: number,
  t: number,
  spr: Sprites | null
) {
  // v22: the user's PHOTO dive boat (white inflatable, dive flag).
  // v33: the old code-drawn boat fallback is deleted permanently —
  // until the photo is ready, no boat is drawn.
  const bimg = spr ? spr["boat-photo"] : null;
  if (bimg && spriteReady(bimg)) {
    const bw = 48;
    const bh = (bw * bimg.naturalHeight) / bimg.naturalWidth;
    const bob = Math.sin(t * 0.9) * 1.4;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bimg, Math.floor(W * 0.3), Math.floor(wlY - bh + 2 + bob), Math.round(bw), Math.round(bh));
    ctx.restore();
  }

  // v22: the user's PHOTO sailboat. v33: the old code-drawn
  // sailboat fallback is deleted permanently — until the photo is
  // ready, no sailboat is drawn.
  const simg = spr ? spr["sailboat-photo"] : null;
  if (simg && spriteReady(simg)) {
    const sw = 22;
    const sh = (sw * simg.naturalHeight) / simg.naturalWidth;
    const sbob = Math.sin(t * 0.8 + 2) * 1.2;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(simg, Math.floor(W * 0.78), Math.floor(wlY - sh + 1 + sbob), Math.round(sw), Math.round(sh));
    ctx.restore();
    return;
  }
  // v33: NO fallback sailboat. The code-drawn pixel sailboat is
  // deleted permanently (same as the island and the dive boat) —
  // until the photo is ready, no sailboat is drawn.
}

/* ---------- living things (v23: SMOOTH + ALIVE, drawn in code) ----------
   The v23 rebuild draws every creature with smooth curves and
   animates it like the real animal — tails wag, fins flap, bodies
   undulate, eyes blink, mouths open, animals pause and dart. No
   pictures, no pixel maps, no sprite frames: a photo can't move
   its fins, so the life has to be drawn. Every draw function below
   works in a local space where the creature faces +x (right); the
   caller flips it for left-swimming animals. */

/** A smooth reef fish: curved body with a gradient belly, a wagging
    forked tail, flapping dorsal + pectoral fins, a blinking eye and
    a mouth that opens now and then. The tail beats faster when the
    fish surges (its effort rises and falls slowly, so it pauses
    and darts instead of gliding at one flat speed). */
function drawFish(
  ctx: CanvasRenderingContext2D,
  f: Fish,
  fx: number,
  fy: number,
  t: number
) {
  const s = f.size;
  const dir = f.dir;
  const dM = f.y / PPM;
  // ALIVE: effort rises and falls slowly — the fish surges and
  // eases instead of gliding at one flat speed
  const surge = 0.5 + 0.5 * Math.sin(t * 0.45 + f.phase * 2.1);
  const wob = Math.sin(t * 3 + f.phase) * 1.2;
  const x = fx + surge * 3 * dir;
  const y = fy + wob;
  const wagF = 5 + surge * 4; // tail beats faster when surging
  const wag = Math.sin(t * wagF + f.phase);
  const bodyC = f.body;
  const darkC = mix(bodyC, [0, 0, 0], 0.25);
  const bellyC = mix(bodyC, [255, 255, 255], 0.4);

  ctx.save();
  ctx.translate(x, y);
  if (dir === -1) ctx.scale(-1, 1);
  // the fish faces +x from here on

  if (f.kind === 3) {
    // ---- shark: long smooth torpedo, slow powerful tail sway,
    // tall dorsal fin, gill slits, pale belly
    const L = s * 2.2;
    const H = s * 0.5;
    const sway = Math.sin(t * 2.2 + f.phase) * 0.35;
    // tail (upper lobe longer — a real shark's tail)
    ctx.save();
    ctx.translate(-L * 0.48, 0);
    ctx.rotate(sway * 0.5);
    ctx.fillStyle = rgba(darkC, 1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-L * 0.12, -H * 0.9, -L * 0.2, -H * 1.1);
    ctx.quadraticCurveTo(-L * 0.1, -H * 0.25, 0, 0);
    ctx.quadraticCurveTo(-L * 0.08, H * 0.2, -L * 0.13, H * 0.45);
    ctx.quadraticCurveTo(-L * 0.05, H * 0.15, 0, 0);
    ctx.fill();
    ctx.restore();
    // body
    const g = ctx.createLinearGradient(0, -H / 2, 0, H / 2);
    g.addColorStop(0, rgba(bodyC, 1));
    g.addColorStop(0.6, rgba(mix(bodyC, bellyC, 0.4), 1));
    g.addColorStop(1, rgba(bellyC, 0.9));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-L * 0.48, 0);
    ctx.bezierCurveTo(-L * 0.2, -H * 0.62, L * 0.2, -H * 0.6, L * 0.5, -H * 0.08);
    ctx.quadraticCurveTo(L * 0.52, 0, L * 0.5, H * 0.08);
    ctx.bezierCurveTo(L * 0.2, H * 0.6, -L * 0.2, H * 0.62, -L * 0.48, 0);
    ctx.fill();
    // dorsal fin
    ctx.fillStyle = rgba(darkC, 1);
    ctx.beginPath();
    ctx.moveTo(-L * 0.05, -H * 0.45);
    ctx.quadraticCurveTo(L * 0.02, -H * 1.25, L * 0.12, -H * 0.5);
    ctx.quadraticCurveTo(L * 0.03, -H * 0.35, -L * 0.05, -H * 0.45);
    ctx.fill();
    // pectoral fin
    ctx.beginPath();
    ctx.moveTo(L * 0.12, H * 0.25);
    ctx.quadraticCurveTo(L * 0.05, H * 0.9, -L * 0.02, H * 0.75);
    ctx.quadraticCurveTo(L * 0.02, H * 0.35, L * 0.12, H * 0.25);
    ctx.fill();
    // gill slits
    ctx.strokeStyle = "rgba(10,25,35,0.55)";
    ctx.lineWidth = 1;
    for (let gi = 0; gi < 4; gi++) {
      const gx = L * (0.3 - gi * 0.045);
      ctx.beginPath();
      ctx.moveTo(gx, -H * 0.18);
      ctx.quadraticCurveTo(gx - 1, 0, gx, H * 0.18);
      ctx.stroke();
    }
    // eye
    ctx.fillStyle = "#06202F";
    ctx.beginPath();
    ctx.arc(L * 0.38, -H * 0.12, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(L * 0.38 + 0.5, -H * 0.12 - 0.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (f.kind === 4) {
    // ---- manta ray: wide smooth wings flapping slowly, long tail
    const L = s * 1.9;
    const flap = Math.sin(t * 2.2 + f.phase);
    const wingY = flap * 3;
    ctx.fillStyle = rgba(bodyC, 1);
    // left wing (trailing)
    ctx.beginPath();
    ctx.moveTo(-L * 0.1, 0);
    ctx.quadraticCurveTo(-L * 0.35, -4 - wingY, -L * 0.5, -1 - wingY);
    ctx.quadraticCurveTo(-L * 0.3, 2, -L * 0.1, 1);
    ctx.fill();
    // right wing (leading)
    ctx.beginPath();
    ctx.moveTo(L * 0.1, 0);
    ctx.quadraticCurveTo(L * 0.35, -4 + wingY, L * 0.5, -1 + wingY);
    ctx.quadraticCurveTo(L * 0.3, 2, L * 0.1, 1);
    ctx.fill();
    // central body
    ctx.beginPath();
    ctx.ellipse(0, 0, L * 0.22, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // pale belly
    ctx.fillStyle = "rgba(200,230,245,0.5)";
    ctx.beginPath();
    ctx.ellipse(0, 1.5, L * 0.16, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    // long thin tail
    ctx.strokeStyle = rgba(bodyC, 1);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-L * 0.2, 1);
    ctx.quadraticCurveTo(-L * 0.35, 2 + flap, -L * 0.45, 5);
    ctx.stroke();
    // eye glints
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(L * 0.1, -1, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (f.kind === 8) {
    // ---- eel: a long smooth ribbon rippling through the water
    const L = s * 2.4;
    const H = s * 0.28;
    ctx.fillStyle = rgba(bodyC, 1);
    ctx.beginPath();
    const segs = 8;
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const ex = -L / 2 + u * L;
      const ey = Math.sin(t * 4 + f.phase + u * 4.5) * 2.2 * (0.4 + 0.6 * u);
      const wdt = H * (1 - u * 0.55);
      if (i === 0) ctx.moveTo(ex, ey - wdt / 2);
      else ctx.lineTo(ex, ey - wdt / 2);
    }
    for (let i = segs; i >= 0; i--) {
      const u = i / segs;
      const ex = -L / 2 + u * L;
      const ey = Math.sin(t * 4 + f.phase + u * 4.5) * 2.2 * (0.4 + 0.6 * u);
      const wdt = H * (1 - u * 0.55);
      ctx.lineTo(ex, ey + wdt / 2);
    }
    ctx.closePath();
    ctx.fill();
    // belly stripe
    ctx.strokeStyle = rgba(bellyC, 0.7);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const ex = -L / 2 + u * L;
      const ey = Math.sin(t * 4 + f.phase + u * 4.5) * 2.2 * (0.4 + 0.6 * u) + H * 0.12;
      if (i === 0) ctx.moveTo(ex, ey);
      else ctx.lineTo(ex, ey);
    }
    ctx.stroke();
    // eye at the head
    const hx = L / 2 - 2;
    const hy = Math.sin(t * 4 + f.phase + 4.5) * 2.2 - 1;
    ctx.fillStyle = "#06202F";
    ctx.beginPath();
    ctx.arc(hx, hy, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (f.kind === 9) {
    // ---- v35 gulper eel: a long thin ribbon like the eel, but
    // with a HUGE gaping mouth (a quarter of its body — the real
    // gulper's mouth is enormous) and a glowing pink tail tip
    // that pulses. Near-black body, slow deep undulation.
    const L = s * 2.6;
    const H = s * 0.22;
    const und = (u: number) => Math.sin(t * 2.2 + f.phase + u * 3.8) * 2.4 * (0.3 + 0.7 * u);
    ctx.fillStyle = rgba(mix(bodyC, [0, 0, 0], 0.3), 1);
    ctx.beginPath();
    const segs = 10;
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const ex = -L / 2 + u * L;
      const ey = und(u);
      const wdt = H * (1 - u * 0.5);
      if (i === 0) ctx.moveTo(ex, ey - wdt / 2);
      else ctx.lineTo(ex, ey - wdt / 2);
    }
    for (let i = segs; i >= 0; i--) {
      const u = i / segs;
      const ex = -L / 2 + u * L;
      const ey = und(u);
      const wdt = H * (1 - u * 0.5);
      ctx.lineTo(ex, ey + wdt / 2);
    }
    ctx.closePath();
    ctx.fill();
    // the giant mouth: a wide open jaw at the head (+x end),
    // opening and closing slowly
    const hx = L / 2 - 1;
    const hy = und(1);
    const gape = 2.5 + 2 * (0.5 + 0.5 * Math.sin(t * 1.1 + f.phase));
    ctx.fillStyle = "#0A0A14";
    ctx.beginPath();
    ctx.moveTo(hx - 8, hy - 1);
    ctx.quadraticCurveTo(hx + 2, hy - gape, hx + 4, hy - 0.5);
    ctx.quadraticCurveTo(hx + 2, hy + gape, hx - 8, hy + 1.5);
    ctx.closePath();
    ctx.fill();
    // tiny eye above the mouth
    ctx.fillStyle = "#9FE8FF";
    ctx.beginPath();
    ctx.arc(hx - 4, hy - 3, 1, 0, Math.PI * 2);
    ctx.fill();
    // glowing pink tail tip, pulsing
    const tx = -L / 2;
    const ty = und(0);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.5 + f.phase);
    ctx.fillStyle = `rgba(255,150,200,${0.5 + 0.5 * pulse})`;
    ctx.beginPath();
    ctx.arc(tx, ty, 1.6 + pulse * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (f.kind === 10) {
    // ---- v35 vampire squid: a dark crimson cloak drifting in the
    // deep, with two LARGE glowing blue eyes and a webbed arm
    // veil that pulses open and closed. It drifts mantle-first
    // (+x), arms trailing behind.
    const breathe = 0.5 + 0.5 * Math.sin(t * 1.4 + f.phase);
    // webbed arm veil trailing behind (-x), pulsing
    const veilW = s * 1.1 * (0.85 + 0.3 * breathe);
    const veilH = s * 0.9 * (0.9 + 0.2 * breathe);
    ctx.fillStyle = rgba(mix(bodyC, [60, 10, 30], 0.4), 0.95);
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, -veilH * 0.4);
    ctx.quadraticCurveTo(-veilW, -veilH * 0.5, -veilW, 0);
    ctx.quadraticCurveTo(-veilW, veilH * 0.5, -s * 0.2, veilH * 0.4);
    ctx.closePath();
    ctx.fill();
    // arm tips poking out of the veil's edge
    ctx.strokeStyle = rgba(mix(bodyC, [255, 255, 255], 0.15), 0.9);
    ctx.lineWidth = 1;
    for (let a = 0; a < 4; a++) {
      const ay = -veilH * 0.3 + a * veilH * 0.2;
      ctx.beginPath();
      ctx.moveTo(-veilW + 2, ay);
      ctx.quadraticCurveTo(-veilW - 4, ay + Math.sin(t * 2 + a) * 1.5, -veilW - 6, ay + 2);
      ctx.stroke();
    }
    // mantle (the body): a rounded dome at the front
    ctx.fillStyle = rgba(bodyC, 1);
    ctx.beginPath();
    ctx.ellipse(s * 0.15, 0, s * 0.55, s * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    // two LARGE glowing blue eyes (the vampire squid's eyes are
    // huge for its size — the biggest eyes of any animal, relatively)
    const eyeGlow = 0.7 + 0.3 * Math.sin(t * 1.8 + f.phase);
    for (const ey of [-s * 0.14, s * 0.14]) {
      ctx.fillStyle = `rgba(120,220,255,${0.35 * eyeGlow})`;
      ctx.beginPath();
      ctx.arc(s * 0.45, ey, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0A2438";
      ctx.beginPath();
      ctx.arc(s * 0.45, ey, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#EAFBFF";
      ctx.beginPath();
      ctx.arc(s * 0.48, ey - s * 0.03, s * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }
    // small glowing dots along the mantle
    ctx.fillStyle = `rgba(140,230,255,${0.5 + 0.3 * breathe})`;
    for (let d = 0; d < 3; d++) {
      ctx.beginPath();
      ctx.arc(-s * 0.1 + d * s * 0.18, -s * 0.28 + (d % 2) * s * 0.1, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (dM >= 1500) {
    // ---- deep anglerfish: a dark round hunter with a glowing lure
    const R = s * 0.75;
    ctx.fillStyle = rgba(mix(bodyC, [5, 10, 18], 0.5), 1);
    ctx.beginPath();
    ctx.ellipse(0, 0, R, R * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    // tail
    ctx.save();
    ctx.translate(-R * 0.9, 0);
    ctx.rotate(wag * 0.4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-R * 0.5, -R * 0.4);
    ctx.lineTo(-R * 0.5, R * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // big mouth
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(R * 0.45, R * 0.1, R * 0.4, 0.3, Math.PI - 0.6);
    ctx.stroke();
    // eye
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(R * 0.35, -R * 0.3, 1.3, 0, Math.PI * 2);
    ctx.fill();
    // lure stalk + glowing dot
    const sway = Math.sin(t * 1.4 + f.phase) * 0.3;
    const lx = R * 0.1 + Math.sin(sway) * 3;
    const ly = -R - 4;
    ctx.strokeStyle = rgba(mix(bodyC, [5, 10, 18], 0.5), 1);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(R * 0.1, -R * 0.7);
    ctx.quadraticCurveTo(R * 0.1 + 2, -R - 2, lx, ly);
    ctx.stroke();
    const pulse = 0.85 + Math.sin(t * 2 + f.phase) * 0.15;
    const halo = ctx.createRadialGradient(lx, ly, 0, lx, ly, 9);
    halo.addColorStop(0, `rgba(255,214,90,${0.55 * pulse})`);
    halo.addColorStop(1, "rgba(255,214,90,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(lx, ly, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFD65A";
    ctx.beginPath();
    ctx.arc(lx, ly, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // ---- regular reef fish (kinds 0,1,2,5,6,7)
  const needle = f.kind === 5;
  const puffer = f.kind === 6;
  const L = needle ? s * 3 : puffer ? s * 1.5 : s * 1.9;
  const H = needle ? s * 0.34 : puffer ? s * 1.3 : s * 0.85;
  // tail — forked, wagging with the swim beat
  ctx.save();
  ctx.translate(-L * 0.48, 0);
  ctx.rotate(wag * 0.45);
  ctx.fillStyle = rgba(darkC, 1);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-L * 0.12, -H * 0.55, -L * 0.2, -H * 0.6);
  ctx.quadraticCurveTo(-L * 0.12, -H * 0.1, -L * 0.2, H * 0.6);
  ctx.quadraticCurveTo(-L * 0.12, H * 0.55, 0, 0);
  ctx.fill();
  ctx.restore();
  // body — smooth, gradient belly
  const g = ctx.createLinearGradient(0, -H / 2, 0, H / 2);
  g.addColorStop(0, rgba(bodyC, 1));
  g.addColorStop(0.65, rgba(mix(bodyC, bellyC, 0.35), 1));
  g.addColorStop(1, rgba(bellyC, 0.95));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-L * 0.48, 0);
  ctx.bezierCurveTo(-L * 0.15, -H * 0.62, L * 0.2, -H * 0.6, L * 0.5, -H * 0.06);
  ctx.quadraticCurveTo(L * 0.54, 0, L * 0.5, H * 0.06);
  ctx.bezierCurveTo(L * 0.2, H * 0.6, -L * 0.15, H * 0.62, -L * 0.48, 0);
  ctx.fill();
  // kind patterns, clipped to the body
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-L * 0.48, 0);
  ctx.bezierCurveTo(-L * 0.15, -H * 0.62, L * 0.2, -H * 0.6, L * 0.5, -H * 0.06);
  ctx.quadraticCurveTo(L * 0.54, 0, L * 0.5, H * 0.06);
  ctx.bezierCurveTo(L * 0.2, H * 0.6, -L * 0.15, H * 0.62, -L * 0.48, 0);
  ctx.clip();
  if (f.kind === 0) {
    // striped: dark vertical bars
    ctx.fillStyle = "rgba(20,30,40,0.55)";
    for (let b = 0; b < 3; b++) {
      const bx = -L * 0.2 + b * L * 0.22;
      ctx.fillRect(bx, -H, L * 0.07, H * 2);
    }
  } else if (f.kind === 1) {
    // spotted
    ctx.fillStyle = "rgba(20,30,40,0.5)";
    const spots: [number, number][] = [[-0.25, -0.15], [0.05, 0.2], [0.25, -0.2], [0.1, -0.3], [-0.05, 0.05]];
    for (const [sx, sy] of spots) {
      ctx.beginPath();
      ctx.arc(L * sx, H * sy, Math.max(0.8, s * 0.09), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (f.kind === 2) {
    // tang: dark top band
    ctx.fillStyle = "rgba(15,35,60,0.5)";
    ctx.fillRect(-L * 0.5, -H * 0.55, L, H * 0.4);
  } else if (f.kind === 7) {
    // reef red: white stripe
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillRect(-L * 0.35, -H * 0.08, L * 0.7, H * 0.16);
  } else if (puffer) {
    // puffer spots
    ctx.fillStyle = "rgba(20,30,40,0.45)";
    const spots: [number, number][] = [[-0.2, -0.2], [0.15, 0.15], [0.25, -0.25], [-0.05, 0.25]];
    for (const [sx, sy] of spots) {
      ctx.beginPath();
      ctx.arc(L * sx, H * sy, Math.max(0.7, s * 0.08), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  if (puffer) {
    // puffer spikes: tiny triangles around the body
    ctx.fillStyle = rgba(darkC, 0.9);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const px0 = Math.cos(a) * L * 0.42;
      const py0 = Math.sin(a) * H * 0.42;
      ctx.beginPath();
      ctx.moveTo(px0, py0);
      ctx.lineTo(px0 + Math.cos(a) * 2.5, py0 + Math.sin(a) * 2.5);
      ctx.lineTo(px0 + Math.cos(a + 1.2) * 1.2, py0 + Math.sin(a + 1.2) * 1.2);
      ctx.closePath();
      ctx.fill();
    }
  }
  // dorsal fin — flapping gently
  const flap = Math.sin(t * 6 + f.phase) * 0.15;
  ctx.fillStyle = rgba(darkC, 0.95);
  ctx.beginPath();
  ctx.moveTo(-L * 0.08, -H * 0.42);
  ctx.quadraticCurveTo(L * 0.05, -H * (0.85 + flap), L * 0.18, -H * 0.4);
  ctx.quadraticCurveTo(L * 0.05, -H * 0.3, -L * 0.08, -H * 0.42);
  ctx.fill();
  // pectoral fin — rowing
  const prow = Math.sin(t * wagF + f.phase + 1) * 0.4;
  ctx.save();
  ctx.translate(L * 0.12, H * 0.18);
  ctx.rotate(0.5 + prow * 0.5);
  ctx.fillStyle = rgba(mix(bodyC, [255, 255, 255], 0.15), 0.9);
  ctx.beginPath();
  ctx.ellipse(0, 0, L * 0.09, H * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // gill curve
  ctx.strokeStyle = "rgba(10,25,35,0.35)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(L * 0.28, 0, H * 0.32, -0.9, 0.9);
  ctx.stroke();
  // eye — blinks every few seconds (per-fish timing)
  const blinkPeriod = 3.5 + hash2(Math.floor(f.phase * 100), 7) * 3;
  const blinkT = (t + f.phase * 5) % blinkPeriod;
  const eyeX = L * 0.35;
  const eyeY = -H * 0.14;
  const eyeR = Math.max(1, s * 0.11);
  if (blinkT < 0.14) {
    // closed: a thin dark line
    ctx.strokeStyle = "rgba(10,25,35,0.8)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(eyeX - eyeR, eyeY);
    ctx.lineTo(eyeX + eyeR, eyeY);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#06202F";
    ctx.beginPath();
    ctx.arc(eyeX + eyeR * 0.25, eyeY, eyeR * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(eyeX + eyeR * 0.45, eyeY - eyeR * 0.4, eyeR * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
  // mouth — opens now and then
  const mouthOpen = Math.sin(t * 0.8 + f.phase * 3) > 0.72;
  if (mouthOpen) {
    ctx.fillStyle = "rgba(10,25,35,0.7)";
    ctx.beginPath();
    ctx.ellipse(L * 0.48, H * 0.08, 1.4, 1, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = "rgba(10,25,35,0.5)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(L * 0.44, H * 0.08);
    ctx.lineTo(L * 0.52, H * 0.05);
    ctx.stroke();
  }
  ctx.restore();
}

/** v23: a smooth deep anglerfish — round dark body, wagging tail,
    a lure stalk swaying gently with a pulsing glow. */
function drawLure(
  ctx: CanvasRenderingContext2D,
  l: Lure,
  lx: number,
  ly: number,
  t: number
) {
  const dM = l.y / PPM;
  const a = ramp(dM, 500, 800);
  if (a <= 0.02) return;
  const pulse = 0.85 + Math.sin(t * 2 + l.phase) * 0.15;
  const wag = Math.sin(t * 3 + l.phase) * 0.4;
  ctx.globalAlpha = a;
  ctx.save();
  ctx.translate(lx, ly);
  // tail, wagging
  ctx.save();
  ctx.translate(-5, 0);
  ctx.rotate(wag * 0.4);
  ctx.fillStyle = "#0A1B28";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-4, -2.5);
  ctx.lineTo(-4, 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // round body
  ctx.fillStyle = "#0A1B28";
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // big mouth
  ctx.strokeStyle = "rgba(0,0,0,0.7)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(3, 1, 2.5, 0.2, Math.PI - 0.4);
  ctx.stroke();
  // eye glint
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(3, -1.5, 0.8, 0, Math.PI * 2);
  ctx.fill();
  // lure stalk, swaying + glowing dot
  const sway = Math.sin(t * 1.4 + l.phase) * 2;
  ctx.strokeStyle = "#0A1B28";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(1, -4);
  ctx.quadraticCurveTo(2 + sway * 0.5, -7, 3 + sway, -9);
  ctx.stroke();
  const halo = ctx.createRadialGradient(3 + sway, -9, 0, 3 + sway, -9, 11);
  halo.addColorStop(0, `rgba(255,214,90,${0.5 * pulse})`);
  halo.addColorStop(0.5, `rgba(255,214,90,${0.18 * pulse})`);
  halo.addColorStop(1, "rgba(255,214,90,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(3 + sway, -9, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFD65A";
  ctx.beginPath();
  ctx.arc(3 + sway, -9, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
}

/** v23: a smooth jellyfish — the bell BREATHES (it swells and
    contracts as it pulses through the water) and the tentacles
    trail behind in soft waves. The glow halo stays: jellies are
    lights in the dark. */
function drawJelly(
  ctx: CanvasRenderingContext2D,
  j: Jelly,
  jx: number,
  jy: number,
  t: number
) {
  const pulse = 1 + Math.sin(t * 2 + j.phase) * 0.14;
  const s = j.size * pulse;
  // glow halo: radial gradient fading to transparent
  const R = s + 6;
  const halo = ctx.createRadialGradient(jx, jy + 3, 0, jx, jy + 3, R);
  halo.addColorStop(0, rgba(j.hue, 0.3));
  halo.addColorStop(0.45, rgba(j.hue, 0.15));
  halo.addColorStop(1, rgba(j.hue, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(jx, jy + 3, R, 0, Math.PI * 2);
  ctx.fill();
  // bell: a smooth dome that swells wide and narrows as it pulses
  const squash = 1 - Math.sin(t * 2 + j.phase) * 0.12;
  const bw = s * (0.62 + (1 - squash) * 0.5);
  const bh = s * 0.55 * squash;
  const bellG = ctx.createLinearGradient(0, jy - bh, 0, jy + 2);
  bellG.addColorStop(0, rgba(mix(j.hue, [255, 255, 255], 0.45), 0.95));
  bellG.addColorStop(0.6, rgba(j.hue, 0.9));
  bellG.addColorStop(1, rgba(j.hue, 0.7));
  ctx.fillStyle = bellG;
  ctx.beginPath();
  ctx.moveTo(jx - bw, jy + 2);
  ctx.bezierCurveTo(jx - bw, jy - bh, jx + bw, jy - bh, jx + bw, jy + 2);
  // scalloped bottom edge
  const scallops = 5;
  for (let i = scallops; i >= 0; i--) {
    const sx = jx + bw - (i / scallops) * 2 * bw;
    const sy = jy + 2 + (i % 2 === 0 ? 0 : 1.5);
    ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();
  // oral arms + tentacles: soft wavy trails
  ctx.strokeStyle = rgba(j.hue, 0.6);
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const fx = (i - 1.5) / 1.5;
    const tx = jx + fx * bw * 0.6;
    const len = s * (0.9 + (i % 2) * 0.5);
    ctx.beginPath();
    ctx.moveTo(tx, jy + 2);
    const midX = tx + Math.sin(t * 1.6 + j.phase + i * 1.3) * 2.5;
    const endX = tx + Math.sin(t * 1.6 + j.phase + i * 1.3 + 1) * 3.5;
    ctx.quadraticCurveTo(midX, jy + 2 + len * 0.5, endX, jy + 2 + len);
    ctx.stroke();
  }
  // frilly oral arms (thicker, shorter, in the middle)
  ctx.strokeStyle = rgba(mix(j.hue, [255, 255, 255], 0.3), 0.75);
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 2; i++) {
    const fx = (i - 0.5) * 0.5;
    const tx = jx + fx * bw * 0.5;
    const len = s * 0.7;
    ctx.beginPath();
    ctx.moveTo(tx, jy + 2);
    ctx.quadraticCurveTo(
      tx + Math.sin(t * 2.2 + j.phase + i) * 2,
      jy + 2 + len * 0.6,
      tx + Math.sin(t * 2.2 + j.phase + i + 0.8) * 2.5,
      jy + 2 + len
    );
    ctx.stroke();
  }
}

/* ---------- v23: the bigger sea animals (smooth + alive) ----------
   Turtle, seahorse, octopus, crab, starfish — each drawn with
   smooth curves and animated like the real animal. They face +x
   (right); callers flip them for the other direction. */

/** A turtle gliding: front flippers ROW (big slow strokes), the
    head turns slowly to look around, and the eye blinks. */
function drawTurtle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  t: number,
  phase: number,
  dir: 1 | -1
) {
  const row = Math.sin(t * 1.6 + phase);
  const row2 = Math.sin(t * 1.6 + phase + 0.9);
  ctx.save();
  ctx.translate(x, y);
  if (dir === -1) ctx.scale(-1, 1);
  const shell: RGB = [94, 124, 74];
  const shellDark: RGB = [58, 84, 48];
  const skin: RGB = [150, 178, 120];
  // rear flippers (behind the shell)
  ctx.fillStyle = rgba(skin, 1);
  ctx.save();
  ctx.translate(-s * 0.42, s * 0.08);
  ctx.rotate(row2 * 0.35);
  ctx.beginPath();
  ctx.ellipse(-s * 0.12, 0, s * 0.2, s * 0.07, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // front flippers — the big rowing stroke
  ctx.save();
  ctx.translate(s * 0.18, s * 0.02);
  ctx.rotate(-0.25 + row * 0.45);
  ctx.beginPath();
  ctx.ellipse(s * 0.22, 0, s * 0.34, s * 0.09, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // tail
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, 0);
  ctx.lineTo(-s * 0.62, -s * 0.04);
  ctx.lineTo(-s * 0.5, s * 0.05);
  ctx.closePath();
  ctx.fill();
  // shell — smooth dome with a pattern of soft plates
  const g = ctx.createLinearGradient(0, -s * 0.3, 0, s * 0.3);
  g.addColorStop(0, rgba(mix(shell, [255, 255, 255], 0.2), 1));
  g.addColorStop(1, rgba(shellDark, 1));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.52, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(shellDark, 0.8);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.36, s * 0.2, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.36, 0);
  ctx.lineTo(s * 0.36, 0);
  ctx.stroke();
  // head — turns slowly to look around
  const look = Math.sin(t * 0.4 + phase * 2) * 0.25;
  ctx.save();
  ctx.translate(s * 0.52, -s * 0.02);
  ctx.rotate(look * 0.5);
  ctx.fillStyle = rgba(skin, 1);
  ctx.beginPath();
  ctx.ellipse(s * 0.1, 0, s * 0.14, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // eye — blinks
  const blinkT = (t + phase * 4) % 4.2;
  if (blinkT < 0.14) {
    ctx.strokeStyle = "rgba(20,30,20,0.8)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(s * 0.08, -s * 0.04);
    ctx.lineTo(s * 0.16, -s * 0.04);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#14241A";
    ctx.beginPath();
    ctx.arc(s * 0.12, -s * 0.04, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(s * 0.12 + 0.5, -s * 0.04 - 0.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

/** A seahorse hovering: its tail curls and uncurls, the dorsal
    fin flutters fast, the head turns, and it bobs gently. */
function drawSeahorse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  t: number,
  phase: number
) {
  const bob = Math.sin(t * 1.1 + phase) * 1.5;
  const curl = 0.6 + Math.sin(t * 0.7 + phase) * 0.25; // tail curl
  const flutter = Math.sin(t * 14 + phase) * 0.3;
  ctx.save();
  ctx.translate(x, y + bob);
  const body: RGB = [212, 150, 90];
  const dark: RGB = [160, 105, 60];
  // curled tail — a spiral of segments
  ctx.strokeStyle = rgba(body, 1);
  ctx.lineWidth = s * 0.09;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, s * 0.15);
  const tailPts: [number, number][] = [];
  for (let i = 0; i <= 6; i++) {
    const u = i / 6;
    const a = u * Math.PI * (1.2 + curl);
    const r = s * 0.22 * (1 - u * 0.55);
    tailPts.push([Math.sin(a) * r - s * 0.05, s * 0.15 + u * s * 0.28 - Math.cos(a) * r * 0.4]);
  }
  for (let i = 0; i < tailPts.length; i++) {
    const [px0, py0] = tailPts[i];
    if (i === 0) ctx.moveTo(px0, py0);
    else ctx.lineTo(px0, py0);
  }
  ctx.stroke();
  // body — curved, with belly plates
  ctx.fillStyle = rgba(body, 1);
  ctx.beginPath();
  ctx.moveTo(-s * 0.08, s * 0.2);
  ctx.bezierCurveTo(-s * 0.22, s * 0.05, -s * 0.2, -s * 0.15, -s * 0.08, -s * 0.28);
  ctx.bezierCurveTo(-s * 0.02, -s * 0.36, s * 0.1, -s * 0.32, s * 0.12, -s * 0.2);
  ctx.bezierCurveTo(s * 0.16, -s * 0.05, s * 0.1, s * 0.12, s * 0.02, s * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgba(dark, 0.7);
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 3; i++) {
    const py = -s * 0.16 + i * s * 0.12;
    ctx.beginPath();
    ctx.moveTo(-s * 0.16, py);
    ctx.quadraticCurveTo(0, py + 1.5, s * 0.1, py);
    ctx.stroke();
  }
  // head — turns slowly
  const look = Math.sin(t * 0.5 + phase * 2) * 0.2;
  ctx.save();
  ctx.translate(-s * 0.06, -s * 0.3);
  ctx.rotate(look);
  ctx.fillStyle = rgba(body, 1);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-s * 0.16, -s * 0.05, -s * 0.2, -s * 0.02);
  ctx.quadraticCurveTo(-s * 0.14, s * 0.06, 0, s * 0.08);
  ctx.closePath();
  ctx.fill();
  // snout
  ctx.beginPath();
  ctx.moveTo(-s * 0.14, -s * 0.02);
  ctx.lineTo(-s * 0.26, s * 0.02);
  ctx.lineTo(-s * 0.14, s * 0.05);
  ctx.closePath();
  ctx.fill();
  // crown
  ctx.fillStyle = rgba(dark, 1);
  ctx.beginPath();
  ctx.moveTo(-s * 0.06, -s * 0.06);
  ctx.lineTo(-s * 0.02, -s * 0.13);
  ctx.lineTo(s * 0.02, -s * 0.06);
  ctx.closePath();
  ctx.fill();
  // eye
  ctx.fillStyle = "#241407";
  ctx.beginPath();
  ctx.arc(-s * 0.05, -s * 0.01, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // dorsal fin — flutters fast (this is how a seahorse swims)
  ctx.fillStyle = rgba(mix(body, [255, 255, 255], 0.25), 0.95);
  ctx.save();
  ctx.translate(s * 0.1, -s * 0.05);
  ctx.rotate(flutter);
  ctx.beginPath();
  ctx.ellipse(s * 0.06, 0, s * 0.09, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/** An octopus on the rock: 8 arms wave and curl, two of them
    grip the rock, and the body breathes (swells and relaxes). */
function drawOctopus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  t: number,
  phase: number,
  dir: 1 | -1
) {
  const breathe = 1 + Math.sin(t * 1.2 + phase) * 0.06;
  ctx.save();
  ctx.translate(x, y);
  if (dir === -1) ctx.scale(-1, 1);
  const body: RGB = [196, 110, 88];
  const dark: RGB = [150, 75, 60];
  // arms — 8 wavy tentacles fanning down/out
  ctx.lineCap = "round";
  for (let i = 0; i < 8; i++) {
    const u = i / 7; // 0..1 across the fan
    const baseA = 0.5 + u * 2.1; // spread downward
    const wob = Math.sin(t * 1.5 + phase + i * 1.4) * 0.35;
    const a = baseA + wob * 0.4;
    const len = s * (0.7 + (i % 3) * 0.12);
    const x1 = Math.cos(a) * len * 0.5;
    const y1 = Math.sin(a) * len * 0.5 + s * 0.1;
    const x2 = Math.cos(a + wob * 0.3) * len;
    const y2 = Math.sin(a + wob * 0.3) * len + s * 0.15;
    ctx.strokeStyle = rgba(i % 2 ? dark : body, 1);
    ctx.lineWidth = s * 0.09;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.1);
    ctx.quadraticCurveTo(x1, y1, x2, y2);
    ctx.stroke();
    // sucker dots along the arm
    ctx.fillStyle = rgba(mix(body, [255, 255, 255], 0.35), 0.8);
    for (let d = 1; d <= 3; d++) {
      const du = d / 4;
      const dx = x2 * du;
      const dy = s * 0.1 + (y2 - s * 0.1) * du;
      ctx.beginPath();
      ctx.arc(dx, dy, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // head — breathing dome
  const g = ctx.createRadialGradient(-s * 0.1, -s * 0.2, 1, 0, 0, s * 0.5);
  g.addColorStop(0, rgba(mix(body, [255, 255, 255], 0.25), 1));
  g.addColorStop(1, rgba(body, 1));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.08, s * 0.34 * breathe, s * 0.32 * breathe, 0, 0, Math.PI * 2);
  ctx.fill();
  // eyes — look around
  const lookX = Math.sin(t * 0.6 + phase) * 1.2;
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#2A1210";
    ctx.beginPath();
    ctx.arc(side * s * 0.16 + lookX * 0.3, -s * 0.14, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(side * s * 0.16 + lookX * 0.3 + 0.5, -s * 0.14 - 0.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* v30: the side rocks are DOM overlays now (KrillionGame.tsx) —
   the user wants them placed on the sides ON TOP of the water,
   exactly as he gave them. The canvas no longer draws walls.
   wallSolid stays: the creatures keep to the open channel between
   the rock walls so they never swim hidden behind them. */
const wallSolid = (W: number) => Math.round(W * 0.17);

/* v34: ping-pong — a creature swims to the channel edge and TURNS
   AROUND instead of teleporting to the other side (the teleport
   is the "suddenly disappears / suddenly appears" the user sees).
   `raw` must grow with time; returns the position + facing. */
function pingPong(raw: number, eL: number, span: number): { x: number; dir: 1 | -1 } {
  const period = span * 2;
  const p = (((raw - eL) % period) + period) % period;
  if (p < span) return { x: eL + p, dir: 1 };
  return { x: eL + period - p, dir: -1 };
}

/* v34: edge fade — 0 at the screen edge, 1 once `margin` px
   inside, so creatures glide in/out instead of popping into
   frame as the camera scrolls. */
function edgeFade(x: number, y: number, W: number, H: number, margin: number): number {
  const fx = Math.min(1, x / margin, (W - x) / margin);
  const fy = Math.min(1, y / margin, (H - y) / margin);
  return clamp(Math.min(fx, fy), 0, 1);
}

/* ---------------- the frame ---------------- */

function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  camY: number,
  t: number,
  world: World,
  spr: Sprites | null
) {
  // palette follows the view: bright at the top of the frame, deepening
  // toward the bottom — at 0m the shallows are bright turquoise, not
  // the mid-water tone a centre-depth sample gave.
  const topDepth = clamp(camY / PPM, 0, MAX_DEPTH);
  // v14: botDepth is the ACTUAL depth at the bottom of the screen
  // ((camY + H) / PPM), not topDepth + H/PPM — with the surface
  // visible in-play the old formula overshot by the sky's share and
  // the shallow water came out too dark.
  const botDepth = clamp((camY + H) / PPM, 0, MAX_DEPTH);
  const midDepth = (topDepth + botDepth) / 2;
  const pal = paletteFor(midDepth);
  const wlY = -camY; // screen y of the waterline (negative when submerged)

  // water body: sunlit at the top of the frame, darker below.
  // v14: the gradient spans the WATER region (waterline → frame
  // bottom), not the full frame — with the sky visible in-play the
  // old full-frame gradient darkened the shallow water too fast.
  const gTop = Math.max(0, wlY);
  const g = ctx.createLinearGradient(0, gTop, 0, H);
  g.addColorStop(0, rgba(sample(WATER_TOP, topDepth), 1));
  g.addColorStop(1, rgba(sample(WATER_BOT, botDepth), 1));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // ---- surface world (ready screen, and the first metres of the dive)
  if (wlY > 2) {
    drawSky(ctx, W, wlY, t);
    drawIsland(ctx, W, wlY, t, spr);
    drawBoats(ctx, W, wlY, t, spr);
    // v24: the waterline from the user's own ocean spec — TWO
    // soft wavy layers drifting past each other (back #eaf6fa at
    // 0.35, front white at 0.65), drawn as smooth filled sine
    // waves. The old shimmer line + foam caps + stripe are gone
    // (the user asked for the lines to go).
    const waveLayer = (baseY: number, amp: number, col: string, drift: number, phase: number) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, baseY + 14);
      for (let x = 0; x <= W; x += 4) {
        const y = baseY + Math.sin(x * 0.055 + t * drift + phase) * amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, baseY + 14);
      ctx.closePath();
      ctx.fill();
    };
    waveLayer(wlY - 4, 2.2, "rgba(234,246,250,0.35)", 0.7, 0);
    waveLayer(wlY + 2, 1.8, "rgba(255,255,255,0.65)", 1.1, 2.1);
    // soft sun glow just under the surface
    const glow = ctx.createRadialGradient(W * 0.5, wlY, 0, W * 0.5, wlY, W * 0.45);
    glow.addColorStop(0, "rgba(200,245,255,0.2)"); // v19: brighter shallows (was 0.16)
    glow.addColorStop(1, "rgba(200,245,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, wlY, W, Math.min(H - wlY, H * 0.4));
  }

  // ---- light rays, fading out with depth — v24: the user's own
  // ocean spec: FIVE soft white shafts (opacities 0.08–0.13),
  // each swaying gently ±2.2° on its own slow beat (12–20s).
  // Wide and soft, never hard lines.
  if (topDepth < 800) {
    const fade = 1 - topDepth / 800;
    const topY = Math.max(-10, wlY);
    const rays: [number, number, number, number][] = [
      // [x fraction, width fraction, opacity, sway seconds]
      [0.26, 0.039, 0.1, 14],
      [0.41, 0.055, 0.13, 18],
      [0.55, 0.031, 0.09, 12],
      [0.69, 0.047, 0.11, 20],
      [0.82, 0.027, 0.08, 16],
    ];
    for (const [fx, fw, op, dur] of rays) {
      const cx = W * fx;
      const wdt = W * fw;
      const sway = Math.sin((t * Math.PI * 2) / dur) * 0.038; // ±2.2°
      ctx.save();
      ctx.translate(cx, topY);
      ctx.rotate(sway);
      ctx.fillStyle = `rgba(255,255,255,${op * fade})`;
      ctx.beginPath();
      ctx.moveTo(-wdt / 2, 0);
      ctx.lineTo(wdt / 2, 0);
      ctx.lineTo(wdt / 2 + H * 0.1, H + 10 - topY);
      ctx.lineTo(-wdt / 2 + H * 0.1, H + 10 - topY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // ---- v24: soft caustic light — the user's own ocean spec
  // has NO web of lines: its caustics are soft blurred light
  // dapples (white ellipses, shimmering 0.05–0.12). The old
  // polygonal web is DELETED — those were the "lines" the user
  // asked to remove. Six soft dapples drift slowly and shimmer,
  // fading out by ~500m. (v26: the walls are gone — the light
  // just shimmers in the open water now.)
  if (topDepth < 500) {
    const fade = 1 - topDepth / 500;
    const dapples: [number, number, number, number, number][] = [
      // [x fraction, y fraction, width fraction, height fraction, phase]
      [0.18, 0.34, 0.094, 0.057, 0],
      [0.44, 0.52, 0.125, 0.073, 4],
      [0.66, 0.3, 0.078, 0.05, 8],
      [0.3, 0.7, 0.117, 0.067, 2],
      [0.76, 0.62, 0.102, 0.06, 6],
      [0.56, 0.82, 0.133, 0.073, 10],
    ];
    const waterTop = Math.max(0, wlY);
    for (const [fx, fy, fw, fh, ph] of dapples) {
      const dx = W * fx + Math.sin(t * 0.07 + ph) * 8;
      const dy = waterTop + (H - waterTop) * fy + Math.cos(t * 0.05 + ph) * 5;
      const rw = (W * fw) / 2;
      const rh = (H * fh) / 2;
      const op = (0.05 + 0.07 * (0.5 + 0.5 * Math.sin(t * 0.5 + ph))) * fade;
      const dg = ctx.createRadialGradient(dx, dy, 0, dx, dy, rw);
      dg.addColorStop(0, `rgba(255,255,255,${op})`);
      dg.addColorStop(0.7, `rgba(255,255,255,${op * 0.4})`);
      dg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.ellipse(dx, dy, rw, rh, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---- fish, swimming across the open water
  const WALL_S = wallSolid(W); // v28: solid rock width per side
  for (const f of world.fish) {
    const fy = f.y - camY;
    if (fy < -18 || fy > H + 18) continue;
    const eL = WALL_S + 6; // v28: stay in the open channel between the rocks
    const eR = W - WALL_S - 6 - f.size;
    const span = Math.max(10, eR - eL);
    // v34: ping-pong (turns around at the edge, never teleports)
    // + edge fade (glides in/out instead of popping)
    const { x: fx, dir } = pingPong(f.fx * W + t * f.speed, eL, span);
    const fade = edgeFade(fx, fy, W, H, 25);
    if (fade <= 0) continue;
    ctx.save();
    ctx.globalAlpha = fade;
    drawFish(ctx, { ...f, dir }, fx, fy, t);
    ctx.restore();
  }

  // ---- small schools of tiny fish darting through the shallows
  for (const sc of world.schools) {
    const sy = sc.y - camY;
    if (sy < -18 || sy > H + 18) continue;
    const eL = WALL_S + 6;
    const eR = W - WALL_S - 30;
    const span = Math.max(10, eR - eL);
    // v34: ping-pong + edge fade (see the fish loop)
    const { x: sx, dir: scDir } = pingPong(sc.fx * W + t * sc.speed, eL, span);
    const scFade = edgeFade(sx, sy, W, H, 25);
    if (scFade <= 0) continue;
    ctx.save();
    ctx.globalAlpha = scFade;
    for (let k = 0; k < sc.n; k++) {
      const dx = (hash2(sc.seed, k) - 0.5) * 26;
      const dy = (hash2(sc.seed, k + 40) - 0.5) * 12;
      const bob = Math.sin(t * 3 + k * 1.3) * 1;
      const mx = sx + dx;
      const my = sy + dy + bob;
      // v23: tiny smooth fish — a curved body with a wagging tail,
      // each member on its own beat so the shoal doesn't flap in
      // unison
      const wag = Math.sin(t * 8 + k * 1.7) * 0.5;
      ctx.save();
      ctx.translate(mx, my);
      if (scDir === -1) ctx.scale(-1, 1);
      ctx.fillStyle = rgba(sc.body, 1);
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.quadraticCurveTo(-1, -2.2, 4, 0);
      ctx.quadraticCurveTo(-1, 2.2, -4, 0);
      ctx.fill();
      ctx.save();
      ctx.translate(-4, 0);
      ctx.rotate(wag * 0.5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-3, -1.8);
      ctx.lineTo(-3, 1.8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = "#06202F";
      ctx.beginPath();
      ctx.arc(2.5, -0.4, 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore(); // v34: school edge fade
  }

  // ---- v23/v26: the bigger sea animals — drawn + animated in
  // code, turtle + seahorse + octopus swimming the open water,
  // kelp fronds drifting. All hash-placed (no rng), all in
  // 0–850m. Nothing here is a picture: every animal moves like
  // the real one. (v26: the walls are gone, so the crab,
  // starfish and wall seaweed went with them.)
  {
    // turtles: 3, gliding across the open water like fish
    for (let i = 0; i < 3; i++) {
      const dM = 120 + i * 180;
      const ty = dM * PPM - camY;
      if (ty < -30 || ty > H + 30) continue;
      const eL = WALL_S + 10;
      const eR = W - WALL_S - 10 - 48;
      const span = Math.max(10, eR - eL);
      // v34: ping-pong + edge fade (see the fish loop)
      const { x: tx, dir } = pingPong(hash2(i, 921) * W + t * (3 + i), eL, span);
      const bob = Math.sin(t * 0.8 + i * 2) * 2;
      const tFade = edgeFade(tx + 24, ty + bob, W, H, 25);
      if (tFade > 0) {
        ctx.save();
        ctx.globalAlpha = tFade;
        drawTurtle(ctx, tx + 24, ty + bob, 24, t, i * 2.1, dir);
        ctx.restore();
      }
    }
    // seahorses: 3, hovering upright with a gentle bob + sway
    for (let i = 0; i < 3; i++) {
      const dM = 200 + i * 180;
      const sy = dM * PPM - camY;
      if (sy < -40 || sy > H + 40) continue;
      const eL = WALL_S + 16;
      const eR = W - WALL_S - 16 - 16;
      const span = Math.max(10, eR - eL);
      const sx = eL + hash2(i, 931) * span + Math.sin(t * 0.5 + i * 1.7) * 4;
      // v34: edge fade (glides in/out instead of popping)
      const sFade = edgeFade(sx, sy, W, H, 25);
      if (sFade > 0) {
        ctx.save();
        ctx.globalAlpha = sFade;
        drawSeahorse(ctx, sx, sy, 18, t, i * 2.2);
        ctx.restore();
      }
    }
    // v26: octopuses swimming free in the open water (the crab
    // and starfish were bottom-dwellers — without rock to sit on
    // they would float in mid-water, so they are gone; the
    // octopus swims, so it stays). Two of them, drifting slowly
    // with a gentle bob.
    for (let i = 0; i < 2; i++) {
      const dM = i === 0 ? 350 : 620;
      const cy = dM * PPM - camY + Math.sin(t * 0.5 + i * 2) * 3;
      if (cy < -30 || cy > H + 30) continue;
      const cx = W * (i === 0 ? 0.3 : 0.7) + Math.sin(t * 0.25 + i * 1.8) * 12;
      const dir: 1 | -1 = i === 0 ? 1 : -1;
      // v34: edge fade (glides in/out instead of popping)
      const oFade = edgeFade(cx, cy, W, H, 25);
      if (oFade > 0) {
        ctx.save();
        ctx.globalAlpha = oFade;
        drawOctopus(ctx, cx, cy, 17, t, i * 1.7, dir);
        ctx.restore();
      }
    }
    // v26: the hero seaweed grew on the wall faces, so it goes
    // with the walls. weedCol stays: the drifting kelp fronds
    // below use it.
    const weedCol = mix(hx("#35795A"), DEEP_BLUE, pal.dark01 * 0.6);
    const weedCol2 = mix(hx("#3F8A63"), DEEP_BLUE, pal.dark01 * 0.6);
    // drifting kelp fronds in the open shallows, slowly turning
    for (let i = 0; i < 4; i++) {
      const dM = 100 + i * 110 + hash2(i, 951) * 50;
      const ky = dM * PPM - camY;
      if (ky < -20 || ky > H + 20) continue;
      const eL = WALL_S + 8;
      const eR = W - WALL_S - 8 - 70;
      const span = Math.max(10, eR - eL);
      // v34: ping-pong (turns around, never teleports)
      const { x: kx } = pingPong(hash2(i, 953) * W + t * (2 + i * 0.7), eL, span);
      const kFade = edgeFade(kx + 35, ky, W, H, 25);
      if (kFade <= 0) continue;
      // v25: every frond is DIFFERENT — its own angle, size and
      // tint (they all looked like copies of each other before)
      const kw = 45 + hash2(i, 955) * 50; // 45–95, was 60–80
      const tilt = (hash2(i, 957) - 0.5) * 0.9; // each frond's own angle
      const rot = tilt + Math.sin(t * 0.4 + i * 1.3) * 0.12;
      const kCol = mix(weedCol, hash2(i, 959) < 0.5 ? hx("#2E7A6B") : hx("#5A8A3F"), 0.35);
      // a drifting frond: a long smooth leaf, rippling as it turns
      ctx.save();
      ctx.globalAlpha = kFade; // v34: edge fade
      ctx.translate(kx + kw / 2, ky);
      ctx.rotate(rot);
      const ripple = Math.sin(t * 1.2 + i) * 2;
      ctx.fillStyle = rgba(kCol, 0.9);
      ctx.beginPath();
      ctx.moveTo(-kw / 2, 0);
      ctx.quadraticCurveTo(-kw * 0.15, -4 + ripple, kw * 0.15, -3 - ripple);
      ctx.quadraticCurveTo(kw * 0.35, -2, kw / 2, 0);
      ctx.quadraticCurveTo(kw * 0.15, 3 + ripple, -kw * 0.15, 4 - ripple);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = rgba(weedCol2, 0.8);
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(-kw / 2 + 2, 0);
      ctx.quadraticCurveTo(0, ripple * 0.5, kw / 2 - 2, 0);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---- jellyfish, deep water — pulsing, drifting, glowing
  for (const j of world.jellies) {
    const jy = j.y - camY + Math.sin(t * 0.5 + j.phase) * 3;
    if (jy < -20 || jy > H + 20) continue;
    const jx = j.fx * W + Math.sin(t * 0.3 + j.phase) * 6;
    // v34: edge fade x the depth ramp (glides in/out instead of popping)
    ctx.globalAlpha = ramp(j.y / PPM, 600, 950) * edgeFade(jx, jy, W, H, 25);
    drawJelly(ctx, j, jx, jy, t);
    ctx.globalAlpha = 1;
  }

  // ---- glowing motes twinkling in the deep (smooth dots)
  for (const m of world.motes) {
    const my = m.y - camY + Math.sin(t * 0.3 + m.phase) * 2;
    if (my < -6 || my > H + 6) continue;
    const mx = m.fx * W + Math.sin(t * 0.2 + m.phase) * 4;
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.5 + m.phase * 3));
    ctx.fillStyle = rgba(m.hue, 0.75 * tw * ramp(m.y / PPM, 1000, 1600));
    ctx.beginPath();
    ctx.arc(mx, my, m.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- anglerfish lure lights (700m, 1900m, 3200m)
  for (const l of world.lures) {
    const ly = l.y - camY + Math.sin(t * 0.4 + l.phase) * 2;
    if (ly < -16 || ly > H + 16) continue;
    const lx = l.fx * W + Math.sin(t * 0.25 + l.phase) * 5;
    drawLure(ctx, l, lx, ly, t);
  }

  // ---- bubbles rising (below the waterline only). v11: halved on
  // the surface view (ready screen) — calmer first impression.
  // v23: smooth round bubbles with a bright glint, no pictures.
  for (const b of world.bubbles) {
    const span = H + 24;
    const by = H + 12 - ((t * b.speed + b.phase * span) % span);
    if (by < wlY + 3 || by > H + 4) continue;
    if (camY < 0 && hash2(Math.floor(b.phase * 1000), 11) < 0.5) continue;
    const bx = b.fx * W + Math.sin(t * 1.5 + b.phase * 6) * 3;
    const br = b.size / 2 + 0.6;
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(bx - br * 0.3, by - br * 0.3, Math.max(0.4, br * 0.25), 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- marine snow drifting down (white + cyan-tinted motes),
  // cyan ones twinkle gently like glowing particles.
  // v11: halved on the surface view (ready screen) — calmer water.
  for (const s of world.snow) {
    const span = H + 12;
    const sy = ((t * s.speed + s.phase * span) % span) - 6;
    if (sy < wlY + 2) continue;
    if (camY < 0 && hash2(Math.floor(s.phase * 1000), 7) < 0.5) continue;
    const sx = s.fx * W + Math.sin(t * 0.4 + s.phase * 6) * 5;
    const tw = s.cyan ? 0.7 + 0.3 * Math.sin(t * 2 + s.phase * 9) : 1;
    const a = s.alpha * (0.5 + pal.dark01 * 0.5) * tw;
    ctx.fillStyle = s.cyan ? `rgba(140,225,255,${a})` : `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.arc(sx, sy, s.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // v11: the near-surface caustic sparkles are deleted with the
  // caustic layer — calm water near the surface, no extra glints.

  // ---- v28: soft edge veil — things used to POP suddenly into
  // the frame (fish wrapping side to side, creatures scrolling in
  // from the top/bottom as you dive). Now every edge fades gently
  // into the water colour over ~30px, so everything glides in and
  // out instead of appearing out of nowhere. The veil matches the
  // water at each edge's depth, so it reads as water, not a frame.
  // Top veil only when fully submerged (no sky to fade); side
  // veils only below the waterline (never over the sky/island).
  const veilTop = rgba(sample(WATER_TOP, topDepth), 1);
  const veilBot = rgba(sample(WATER_BOT, botDepth), 1);
  if (wlY <= 0) {
    const tg = ctx.createLinearGradient(0, 0, 0, 36);
    tg.addColorStop(0, veilTop);
    tg.addColorStop(1, rgba(sample(WATER_TOP, topDepth), 0));
    ctx.fillStyle = tg;
    ctx.fillRect(0, 0, W, 36);
  }
  {
    const bg = ctx.createLinearGradient(0, H - 36, 0, H);
    bg.addColorStop(0, rgba(sample(WATER_BOT, botDepth), 0));
    bg.addColorStop(1, veilBot);
    ctx.fillStyle = bg;
    ctx.fillRect(0, H - 36, W, 36);
  }
  {
    // side veils in 8 horizontal bands so each band matches the
    // water colour at its own depth (the water darkens downward)
    const y0 = Math.max(0, wlY);
    const bands = 8;
    for (let b = 0; b < bands; b++) {
      const by0 = y0 + ((H - y0) * b) / bands;
      const by1 = y0 + ((H - y0) * (b + 1)) / bands;
      const bd = clamp((camY + (by0 + by1) / 2) / PPM, 0, MAX_DEPTH);
      const bc = mix(sample(WATER_TOP, bd), sample(WATER_BOT, bd), 0.5);
      const lg = ctx.createLinearGradient(0, 0, 30, 0);
      lg.addColorStop(0, rgba(bc, 1));
      lg.addColorStop(1, rgba(bc, 0));
      ctx.fillStyle = lg;
      ctx.fillRect(0, by0, 30, by1 - by0);
      const rg = ctx.createLinearGradient(W - 30, 0, W, 0);
      rg.addColorStop(0, rgba(bc, 0));
      rg.addColorStop(1, rgba(bc, 1));
      ctx.fillStyle = rg;
      ctx.fillRect(W - 30, by0, 30, by1 - by0);
    }
  }

  // ---- deep-water veil, unifies the abyss (lighter than v9 so the
  // deep walls and jellies stay visible instead of going pure black)
  const veil = ramp(botDepth, 1500, 3500) * 0.22;
  if (veil > 0.01) {
    px(ctx, 0, 0, W, H, `rgba(1,4,9,${veil})`);
  }
  // v23: scanlines are GONE — they were part of the pixel look.
}

/* ---------------- the component ---------------- */

/** Camera state the canvas publishes every frame (v20): the DOM
    depth ruler reads this through a shared ref so its marker and
    ticks sit exactly where the world is — the 0m mark lands on
    the waterline instead of a fixed 45%. */
export type OceanCameraState = {
  /** world y (canvas px) of the top of the frame; negative above the waterline */
  camY: number;
  /** logical canvas height in px */
  h: number;
  /** canvas px per metre of depth */
  ppm: number;
};

export function LiveOceanCanvas({
  depth = 0,
  playing = false,
  cameraRef,
}: {
  /** current depth in metres — drives the camera descent */
  depth?: number;
  /** in-play: camera is underwater at the current depth */
  playing?: boolean;
  /** optional shared ref the canvas publishes its camera into every frame */
  cameraRef?: { current: OceanCameraState };
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const depthRef = useRef(depth);
  const playingRef = useRef(playing);
  depthRef.current = depth;
  playingRef.current = playing;
  const world = useMemo(() => genWorld(1337), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // v15: real sprite assets, loaded once per mount (browser-only).
    // They arrive async; every sprite draw falls back to the
    // code-drawn shape until its image is ready.
    const sprites = loadSprites();

    let raf = 0;
    let last = performance.now();
    let camY: number | null = null;
    let W = 480;
    let H = 270;

    // low internal resolution, matched to the container's aspect so
    // pixels stay square on desktop and portrait alike
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
      const aspect = r.width / r.height;
      if (aspect >= 1) {
        W = MAX_DIM;
        H = Math.round(MAX_DIM / aspect);
      } else {
        H = MAX_DIM;
        W = Math.round(MAX_DIM * aspect);
      }
      W = clamp(W, 180, MAX_DIM);
      H = clamp(H, 180, MAX_DIM);
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const d = clamp(depthRef.current, 0, MAX_DEPTH);
      // v14 FRAMING — the competitor's in-play frame starts AT the
      // surface: at 0m the waterline sits ~30% from the top with the
      // sky, island, boat and sailboat visible above it, and the
      // surface scrolls up and out as you dive (gone by ~200m, well
      // before the 700m frames). Ours used to start below the
      // waterline (target 0). Now: playing → d*PPM − 0.30H, so 0m
      // puts the waterline at 30%. Results (not playing, d > 0) keep
      // the deep view; ready keeps the surface view (52%).
      const target = playingRef.current
        ? d * PPM - H * 0.3
        : d > 0
          ? d * PPM
          : -H * 0.52;
      if (camY === null) camY = target;
      camY += (target - camY) * (1 - Math.exp(-dt * 2.6));
      if (Math.abs(target - camY) < 0.05) camY = target;
      // v20: publish the camera for the DOM ruler (shared ref —
      // no React re-render; the ruler polls it in its own rAF).
      if (cameraRef) {
        cameraRef.current.camY = camY;
        cameraRef.current.h = H;
        cameraRef.current.ppm = PPM;
      }
      // v23: SMOOTH scaling — the new style is smooth curves, not
      // pixel art, so the canvas upscales smoothly. (v15 forced
      // nearest-neighbour for the pixel sprites, which are gone.)
      // Resized canvas resets context state, so this is set every
      // frame (cheap).
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      drawScene(ctx, W, H, camY, t, world, sprites);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [world]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="block h-full w-full"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
