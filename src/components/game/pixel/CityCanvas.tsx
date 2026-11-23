"use client";

import { useEffect, useRef } from "react";

/**
 * Krillion City — the climb scene. A city skyline you fly up through:
 * streets at the bottom, rooftops, the skyline, then above the clouds
 * into a starry sky. Buildings are drawn in code (rectangles with lit
 * windows, hash-placed so every visit shows the same city), scrolling
 * down 1:1 as you climb. Clouds drift, birds fly, a helicopter hovers
 * and a hot air balloon floats — all alive in code, no pictures.
 */

const PPM = 0.42; // logical px per metre (same scale as the ocean dive)
const MAX_ALT = 7000;
const WORLD_H = MAX_ALT * PPM; // 2940 logical px of sky

function hash2(a: number, b: number): number {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function rgba(c: [number, number, number], a: number) {
  return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
}
function hx(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* ---- the city, generated once (deterministic) ---- */
interface Building { x: number; w: number; yTop: number; yBot: number; col: [number, number, number]; lit: number }
interface Cloud { fx: number; y: number; s: number; speed: number }
interface Bird { y: number; fx: number; speed: number; dir: 1 | -1; size: number }

const BUILDING_COLS: [number, number, number][] = [
  hx("#5B6B7A"), hx("#4A5A68"), hx("#6B7B8A"), hx("#3E4E5C"), hx("#7A8A99"), hx("#54657A"),
];
const WINDOW_LIT = "#FFD98A";
const WINDOW_DARK = "#2A3A4A";

function genCity(W: number): { left: Building[]; right: Building[]; clouds: Cloud[]; birds: Bird[] } {
  // buildings stack up both sides from the street (y = WORLD_H) to
  // the top of the sky (y = 0). Each side is a column of buildings
  // with gaps (streets/alleys) between them.
  const mkSide = (side: 0 | 1): Building[] => {
    const out: Building[] = [];
    let y = WORLD_H;
    let i = 0;
    while (y > -100) {
      const h = 120 + hash2(side, i * 7 + 1) * 260; // 120–380 logical px tall
      const w = W * (0.14 + hash2(side, i * 7 + 2) * 0.1); // 14–24% of width
      const x = side === 0 ? 0 : W - w;
      out.push({
        x, w,
        yTop: y - h,
        yBot: y,
        col: BUILDING_COLS[Math.floor(hash2(side, i * 7 + 3) * BUILDING_COLS.length)],
        lit: 0.35 + hash2(side, i * 7 + 4) * 0.4, // fraction of windows lit
      });
      y -= h + 18 + hash2(side, i * 7 + 5) * 40; // gap (a street)
      i++;
    }
    return out;
  };
  const clouds: Cloud[] = [];
  for (let i = 0; i < 22; i++) {
    clouds.push({
      fx: hash2(9, i),
      y: (100 + hash2(10, i) * 4800) * PPM,
      s: 26 + hash2(11, i) * 46,
      speed: 2 + hash2(12, i) * 5,
    });
  }
  const birds: Bird[] = [];
  for (let i = 0; i < 8; i++) {
    birds.push({
      y: (80 + hash2(13, i) * 1900) * PPM,
      fx: hash2(14, i),
      speed: 8 + hash2(15, i) * 12,
      dir: hash2(16, i) < 0.5 ? 1 : -1,
      size: 5 + hash2(17, i) * 4,
    });
  }
  return { left: mkSide(0), right: mkSide(1), clouds, birds };
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  b: Building,
  camY: number,
  H: number,
  t: number,
  dark: number
) {
  const yTop = b.yTop - camY;
  const yBot = b.yBot - camY;
  if (yBot < -10 || yTop > H + 10) return;
  // the building darkens as you climb into the night sky
  const col = mix(b.col, hx("#1A2433"), dark * 0.55);
  ctx.fillStyle = rgba(col, 1);
  ctx.fillRect(b.x, Math.max(0, yTop), b.w, Math.min(H, yBot) - Math.max(0, yTop));
  // roof edge (a lighter cap so each building reads separately)
  if (yTop >= -4 && yTop <= H) {
    ctx.fillStyle = rgba(mix(col, [255, 255, 255], 0.18), 1);
    ctx.fillRect(b.x, yTop, b.w, 3);
  }
  // windows: a grid of small lit/dark panes (hash-lit, steady)
  const cols = Math.max(2, Math.floor(b.w / 12));
  const rows = Math.max(2, Math.floor((b.yBot - b.yTop) / 16));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wy = yTop + 8 + r * 16;
      if (wy < -6 || wy > H + 6) continue;
      const wx = b.x + 5 + c * 12;
      const lit = hash2(Math.round(b.yTop) + r * 31, c * 17 + 5) < b.lit;
      // a few windows flicker gently (someone home, moving around)
      const flick = hash2(r, c) < 0.06 ? 0.5 + 0.5 * Math.sin(t * 2 + r + c) : 1;
      ctx.fillStyle = lit ? rgba(hx(WINDOW_LIT), 0.55 + 0.45 * flick) : rgba(hx(WINDOW_DARK), 0.8);
      ctx.fillRect(wx, wy, 6, 8);
    }
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, alpha: number) {
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, s, s * 0.42, 0, 0, Math.PI * 2);
  ctx.ellipse(x - s * 0.55, y + s * 0.1, s * 0.55, s * 0.32, 0, 0, Math.PI * 2);
  ctx.ellipse(x + s * 0.55, y + s * 0.08, s * 0.6, s * 0.34, 0, 0, Math.PI * 2);
  ctx.ellipse(x + s * 0.1, y - s * 0.28, s * 0.5, s * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  // soft grey-blue underside so clouds read against the bright sky
  ctx.fillStyle = `rgba(180,200,220,${alpha * 0.5})`;
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.22, s * 0.9, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, t: number, dir: 1 | -1, phase: number) {
  const flap = Math.sin(t * 9 + phase) * 0.9;
  ctx.strokeStyle = "rgba(40,55,75,0.85)";
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  // two wings beating, body in the middle
  ctx.moveTo(x - s * dir, y - flap * s * 0.4);
  ctx.quadraticCurveTo(x - s * 0.4 * dir, y - s * 0.3, x, y);
  ctx.quadraticCurveTo(x + s * 0.4 * dir, y - s * 0.3, x + s * dir, y - flap * s * 0.4);
  ctx.stroke();
}

export function CityCanvas({
  altitude,
  playing,
}: {
  altitude: number;
  playing: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const altRef = useRef(altitude);
  altRef.current = altitude;
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let camY: number | null = null;
    let W = 480;
    let H = 270;
    const city = genCity(480);

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
      const aspect = r.width / r.height;
      if (aspect >= 1) {
        W = 480;
        H = Math.round(480 / aspect);
      } else {
        H = 480;
        W = Math.round(480 * aspect);
      }
      W = clamp(W, 180, 480);
      H = clamp(H, 180, 480);
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // stars (fixed in the high sky, fade in above 3000m)
    const stars: { x: number; y: number; r: number; tw: number }[] = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: hash2(21, i),
        y: hash2(22, i) * 1400, // the top 1400 logical px of the world
        r: 0.5 + hash2(23, i) * 1.1,
        tw: hash2(24, i) * Math.PI * 2,
      });
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const alt = clamp(altRef.current, 0, MAX_ALT);
      // camera: at street level the ground sits ~72% down the frame
      // (streets + rooftops visible); as you climb the city sinks
      // away below and the sky takes over.
      const target = playingRef.current
        ? alt * PPM - H * 0.28
        : alt > 0
          ? alt * PPM
          : WORLD_H - H * 0.72;
      if (camY === null) camY = target;
      camY += (target - camY) * (1 - Math.exp(-dt * 2.6));
      if (Math.abs(target - camY) < 0.05) camY = target;

      const dark = clamp(alt / 5000, 0, 1); // 0 = day, 1 = night sky
      const groundY = WORLD_H - camY; // screen y of street level

      // ---- sky: day blue low, deep navy + stars high
      const dayTop = hx("#4A8FC2");
      const dayBot = hx("#CFE4EC");
      const nightTop = hx("#060A18");
      const nightBot = hx("#16233D");
      const top = mix(dayTop, nightTop, dark);
      const bot = mix(dayBot, nightBot, dark);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, rgba(top, 1));
      g.addColorStop(1, rgba(bot, 1));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // stars, fading in above 3000m
      if (dark > 0.25) {
        for (const st of stars) {
          const sy = st.y - camY;
          if (sy < -4 || sy > H + 4) continue;
          const tw = 0.5 + 0.5 * Math.sin(t * 2 + st.tw);
          ctx.fillStyle = `rgba(255,255,255,${(dark - 0.25) * 0.9 * (0.4 + 0.6 * tw)})`;
          ctx.beginPath();
          ctx.arc(st.x * W, sy, st.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // sun (low, day) / moon (high, night)
      if (dark < 0.7) {
        const sunY = WORLD_H - 260 - camY;
        if (sunY > -40 && sunY < H + 40) {
          const sx = W * 0.72;
          const glow = ctx.createRadialGradient(sx, sunY, 0, sx, sunY, 60);
          glow.addColorStop(0, `rgba(255,240,180,${0.5 * (1 - dark)})`);
          glow.addColorStop(1, "rgba(255,240,180,0)");
          ctx.fillStyle = glow;
          ctx.fillRect(sx - 60, sunY - 60, 120, 120);
          ctx.fillStyle = `rgba(255,246,200,${1 - dark * 0.8})`;
          ctx.beginPath();
          ctx.arc(sx, sunY, 16, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (dark > 0.4) {
        const moonY = 500 - camY;
        if (moonY > -30 && moonY < H + 30) {
          ctx.fillStyle = `rgba(230,238,250,${(dark - 0.4) * 1.4})`;
          ctx.beginPath();
          ctx.arc(W * 0.78, moonY, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(200,212,232,${(dark - 0.4) * 1.2})`;
          ctx.beginPath();
          ctx.arc(W * 0.78 - 4, moonY - 3, 3, 0, Math.PI * 2);
          ctx.arc(W * 0.78 + 4, moonY + 4, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---- clouds (drift sideways, fade with the night)
      for (const c of city.clouds) {
        const cy = c.y - camY;
        if (cy < -c.s || cy > H + c.s) continue;
        const span = W + c.s * 4;
        const cx = (((c.fx * W + t * c.speed) % span) + span) % span - c.s * 2;
        drawCloud(ctx, cx, cy, c.s, 0.9 - dark * 0.45);
      }

      // ---- the street (ground) — only while it's in frame
      if (groundY < H + 4 && groundY > -40) {
        ctx.fillStyle = rgba(mix(hx("#3A4552"), hx("#141C28"), dark * 0.6), 1);
        ctx.fillRect(0, Math.max(0, groundY), W, H - Math.max(0, groundY));
        // road markings + a tiny park strip
        if (groundY > 0) {
          ctx.fillStyle = rgba(hx("#2E8B47"), 0.9);
          ctx.fillRect(0, groundY, W, 4);
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          for (let x = 8; x < W; x += 26) ctx.fillRect(x, groundY + 12, 12, 2);
        }
      }

      // ---- buildings (both sides, scrolling with the climb)
      for (const b of city.left) drawBuilding(ctx, b, camY, H, t, dark);
      for (const b of city.right) drawBuilding(ctx, b, camY, H, t, dark);

      // ---- helicopter hovering at ~500m (rotor spinning, blinking light)
      const heliY = 500 * PPM - camY + Math.sin(t * 0.8) * 2;
      if (heliY > -20 && heliY < H + 20) {
        const hx0 = W * 0.68 + Math.sin(t * 0.22) * 10;
        ctx.fillStyle = rgba(mix(hx("#C0392B"), hx("#7A1F16"), dark * 0.5), 1);
        ctx.beginPath();
        ctx.ellipse(hx0, heliY, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(hx("#1A2A3A"), 1);
        ctx.beginPath();
        ctx.ellipse(hx0 + 7, heliY - 1, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        // tail + rotor
        ctx.strokeStyle = rgba(mix(hx("#C0392B"), hx("#7A1F16"), dark * 0.5), 1);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hx0 - 11, heliY);
        ctx.lineTo(hx0 - 20, heliY - 2);
        ctx.stroke();
        const rot = Math.sin(t * 40) * 14;
        ctx.strokeStyle = "rgba(200,210,220,0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hx0 - 14, heliY - 8);
        ctx.lineTo(hx0 + 14, heliY - 8);
        ctx.moveTo(hx0 + rot * 0.3, heliY - 9);
        ctx.lineTo(hx0 - rot * 0.3, heliY - 7);
        ctx.stroke();
        // blinking beacon
        if (Math.sin(t * 4) > 0) {
          ctx.fillStyle = "rgba(255,80,80,0.95)";
          ctx.beginPath();
          ctx.arc(hx0, heliY - 7, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---- hot air balloon drifting at ~1500m
      const balY = 1500 * PPM - camY + Math.sin(t * 0.3) * 4;
      if (balY > -40 && balY < H + 40) {
        const bx = W * 0.3 + Math.sin(t * 0.12) * 16;
        ctx.fillStyle = rgba(mix(hx("#E74C3C"), hx("#8E2A20"), dark * 0.5), 1);
        ctx.beginPath();
        ctx.ellipse(bx, balY, 13, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(mix(hx("#F5C518"), hx("#8A6D0A"), dark * 0.5), 1);
        ctx.beginPath();
        ctx.ellipse(bx, balY, 5, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(90,74,58,0.9)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx - 6, balY + 13);
        ctx.lineTo(bx - 3, balY + 20);
        ctx.moveTo(bx + 6, balY + 13);
        ctx.lineTo(bx + 3, balY + 20);
        ctx.stroke();
        ctx.fillStyle = rgba(hx("#8A6D3B"), 1);
        ctx.fillRect(bx - 4, balY + 20, 8, 6);
      }

      // ---- birds flying across (low sky only)
      for (const b of city.birds) {
        const by = b.y - camY + Math.sin(t * 1.5 + b.fx * 9) * 3;
        if (by < -12 || by > H + 12) continue;
        const span = W + 40;
        const raw = b.fx * W + b.dir * t * b.speed;
        const bx = (((raw % span) + span) % span) - 20;
        // fade near the edges so birds glide in/out (no popping)
        const fade = clamp(Math.min(bx / 20, (W - bx) / 20, by / 20, (H - by) / 20), 0, 1);
        if (fade <= 0) continue;
        ctx.save();
        ctx.globalAlpha = fade * (1 - dark * 0.6);
        drawBird(ctx, bx, by, b.size, t, b.dir, b.fx * 9);
        ctx.restore();
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

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
