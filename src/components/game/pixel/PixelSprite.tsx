"use client";

import { CSSProperties, useMemo } from "react";
import { cn } from "@/lib/utils";

/* ============================================================
   Tiny pixel-art sprite engine.
   Sprites are grids of characters; each character maps to a
   palette colour. Rendered as a single 1×1 element with one
   box-shadow per pixel — crisp, scalable, zero image assets.
   ============================================================ */

export interface SpriteDef {
  /** Grid rows, equal length. "." = transparent. */
  rows: string[];
  /** Character → colour. */
  palette: Record<string, string>;
}

const K = "#F4587E"; // krill pink
const W = "#FFFFFF";

export const SPRITES: Record<string, SpriteDef> = {
  /* ---- ocean ---- */
  /* Krillion mascot — a proper pixel-art shrimp: long antennae,
     big eye, segmented curved body with light/dark shading,
     swimmerets underneath and a tail fan. Frame 1: antennae up,
     tail fan swept down. */
  krill: {
    rows: [
      "a..a..............",
      ".a..a.............",
      "..a..a............",
      "...a.a............",
      "....aaLLkk........",
      "....kWekkkk.......",
      "...kkkkkkkDk......",
      "...kLkkkkDkkkDk...",
      "....kkkkDkkkDkkk..",
      ".....kkkkkkkkkDkk.",
      ".....L.L.L..k.k.k.",
      "..................",
    ],
    palette: {
      k: K,
      L: "#FF8FAB",
      D: "#C22E57",
      W,
      e: "#14202E",
      a: "#FFB3C6",
    },
  },
  /* Frame 2 of the swim cycle: antennae drooped, tail fan flicked
     up — alternated with `krill` by KrillSwimmer below. */
  krillBob: {
    rows: [
      "..................",
      "..................",
      "a.................",
      ".aaa..............",
      "....aaLLkk........",
      "....kWekkkk.......",
      "...kkkkkkkDk..k...",
      "...kLkkkkDkkkDk.k.",
      "....kkkkDkkkDkkk..",
      ".....kkkkkkkkkDk..",
      ".....L.L.L........",
      "..................",
    ],
    palette: {
      k: K,
      L: "#FF8FAB",
      D: "#C22E57",
      W,
      e: "#14202E",
      a: "#FFB3C6",
    },
  },
  fishTeal: {
    rows: [
      "......tttt...",
      "....ttttttt..",
      "TT.ttttttttt.",
      "TTTttttWttttt",
      "TT.ttttttttt.",
      "....ttttttt..",
      "......tttt...",
    ],
    palette: { t: "#39C6D6", T: "#1E93A6", W },
  },
  fishGold: {
    rows: [
      "......gggg...",
      "....gggggggg.",
      "TT.ggggggggg.",
      "TTTggggWggggg",
      "TT.ggggggggg.",
      "....gggggggg.",
      "......gggg...",
    ],
    palette: { g: "#F5C242", T: "#C98F1B", W },
  },
  fishCoral: {
    rows: [
      ".....cccc....",
      "...cccccccc..",
      "TT.ccccccccc.",
      "TTTcccccWcccc",
      "TT.ccccccccc.",
      "...cccccccc..",
      ".....cccc....",
    ],
    palette: { c: "#FF8A5C", T: "#D25E33", W },
  },
  fishNavy: {
    rows: [
      ".....nnnn....",
      "...nnnnnnnn..",
      "TT.nnnnnnnnn.",
      "TTTnnnnnWnnnn",
      "TT.nnnnnnnnn.",
      "...nnnnnnnn..",
      ".....nnnn....",
    ],
    palette: { n: "#5C7FD6", T: "#3A55A8", W },
  },
  bird: {
    rows: ["w......w", "ww....ww", ".wwwwww.", "...ww..."],
    palette: { w: "#FFFFFF" },
  },
  birdUp: {
    rows: ["w.....w.", "ww...ww.", ".wwwww..", "..www..."],
    palette: { w: "#FFFFFF" },
  },
  boat: {
    rows: [
      "..........ff....",
      "..........ff....",
      "..........ff....",
      "......ccccff....",
      "......cccccc....",
      "..wwwwwwwwwww...",
      ".wwwwwwwwwwwww..",
      ".wwwwwwwwwwwww..",
      "..rrrrrrrrrrr...",
      "...rrrrrrrrr....",
    ],
    palette: {
      f: "#E2483C",
      c: "#3E86C4",
      w: "#F7F9FA",
      r: "#B23A30",
    },
  },
  seaweed: {
    rows: ["..s..s..", ".ss.ss..", ".sssss..", "ss.ssss.", "ss.ss.ss", ".s.ss.s.", "...ss...", "...ss..."],
    palette: { s: "#1E7A4E" },
  },
  /* red-and-white lighthouse on its rocky island (menu skyline) */
  lighthouse: {
    rows: [
      "......kk......",
      ".....wllw.....",
      ".....wwww.....",
      "....rrrrrr....",
      "....rrrrrr....",
      "....wwwwww....",
      "....wwwwww....",
      "....rrrrrr....",
      "....rrrrrr....",
      "...wwwwwwww...",
      "...wwwwwwww...",
      "..rrrrrrrrrr..",
      "..rrrrrrrrrr..",
      ".gggggggggggg.",
      "gggggggggggggg",
    ],
    palette: {
      k: "#1F2937",
      w: "#F7F9FA",
      l: "#FFE066",
      r: "#E2483C",
      g: "#5B6B7A",
    },
  },
  /* sea turtle, side view — drifts through the shallows */
  turtle: {
    rows: [
      "....ssss......",
      "..ssssssss....",
      ".ssssssssss.h.",
      "sssssssssshhh.",
      ".ssssssssss.h.",
      "..ssssssss....",
      ".f..ssss..f...",
      "...f....f.....",
    ],
    palette: { s: "#3E9B4F", h: "#7BC96F", f: "#2E7A3E" },
  },
  /* ---- forest ---- */
  butterfly: {
    rows: ["b..b", "bbbb", "bbbb", ".bb."],
    palette: { b: "#E86AA6" },
  },
  butterflyUp: {
    rows: [".bb.", "bbbb", "bbbb", "b..b"],
    palette: { b: "#E86AA6" },
  },
  butterflyBlue: {
    rows: ["b..b", "bbbb", "bbbb", ".bb."],
    palette: { b: "#6FA8E8" },
  },
  mushroom: {
    rows: [".rrrr.", "rrrrrr", "rWrrWr", "rrrrrr", "..ww..", "..ww.."],
    palette: { r: "#E05548", W: "#FFE9E2", w: "#F3E7D6" },
  },
  flower: {
    rows: ["p.p.p", ".ppp.", "p.g.p", ".ggg.", "..g..", ".ggg."],
    palette: { p: "#F49AC1", g: "#4E9B3F" },
  },
  flowerGold: {
    rows: ["p.p.p", ".ppp.", "p.g.p", ".ggg.", "..g..", ".ggg."],
    palette: { p: "#F5C242", g: "#4E9B3F" },
  },
  lily: {
    rows: ["..ll..", ".llll.", "llllll", ".llll."],
    palette: { l: "#3F8F4E" },
  },
  frog: {
    rows: ["..ffff..", ".fWffWf.", "ffffffff", ".ffffff.", "f.f..f.f"],
    palette: { f: "#58B04C", W: "#0B2A12" },
  },
  /* ---- reveal icons (answer results) ---- */
  bubbles: {
    rows: [
      "..bb..b...",
      ".b..b.b...",
      ".b..b.b..b",
      "..bb..b.b.",
      "....b..b..",
      ".b.....b..",
      "....bb....",
    ],
    palette: { b: "#A9C4FF" },
  },
  school: {
    rows: [
      "..........tt...",
      ".tt......ttt...",
      "tttt....tttt...",
      "tttt.tt..tt....",
      ".tt..ttt.......",
      ".....tt........",
    ],
    palette: { t: "#5FD4E8" },
  },
  jelly: {
    rows: [
      "..jjjj..",
      ".jjjjjj.",
      "jjWjjWjj",
      "jjjjjjjj",
      ".j.jj.j.",
      "j.j..j.j",
      ".j....j.",
    ],
    palette: { j: "#8FB8FF", W: "#E4F0FF" },
  },
  crown: {
    rows: [
      "y..y..y..",
      "y.yy.yy.y",
      "yyyyyyyyy",
      "yyyyyyyyy",
      ".yyyyyyy.",
      ".yyyyyyy.",
    ],
    palette: { y: "#FFD465" },
  },
  shark: {
    rows: [
      ".......ss..",
      "......sSss.",
      "sssssssssss",
      "sSssssssss.",
      "sssssssss..",
      "...ss.s....",
    ],
    palette: { s: "#5A7A99", S: "#41608A" },
  },
  plane: {
    rows: [
      ".....pp.....",
      ".....pp.....",
      "..pppppppp..",
      "pppppppppppp",
      "....p..p....",
    ],
    palette: { p: "#F4407A" },
  },
  birdFlock: {
    rows: [
      "g.....g.....g",
      "gg.gggg..gg.g",
      ".gggggg.ggg..",
      "....gg...g...",
    ],
    palette: { g: "#F0A24C" },
  },
  featherSprig: {
    rows: [
      "....fFf....",
      "...fFFFf...",
      "...fFFFf...",
      "....fFf.s..",
      "....fFf.s..",
      ".....ffss..",
      "......s....",
    ],
    palette: { f: "#C7B9FF", F: "#E4DCFF", s: "#8A6A4A" },
  },
  /* ---- noillirk climber: axolotl on balloons (reference look) ---- */
  balloonKrill: {
    rows: [
      ".CCC.RRR.GGG",
      ".CCC.RRR.GGG",
      ".CCC.RRR.GGG",
      "..C..R..G...",
      "..s..s..s...",
      "..s..s..s...",
      "...s.s.s....",
      "....sss.....",
      "............",
      "..kkkkkkkk..",
      ".kWkkkkkkkk.",
      ".kkkkkkkkkk.",
      "..k.kkkk.k..",
      "...k....k...",
    ],
    palette: {
      C: "#6FC7E8",
      R: "#E2483C",
      G: "#F5C242",
      s: "#B9976B",
      k: "#F4587E",
      W: "#FFFFFF",
    },
  },
  fox: {
    rows: [
      "f.....",
      "ff.ff.",
      "ffffff",
      "fWWff.",
      ".f..f.",
    ],
    palette: { f: "#C97B3C", W: "#FFF3E0" },
  },
  /* ---- krillion trench world (reference props) ---- */
  jellyGold: {
    rows: [
      "..oooo..",
      ".oooooo.",
      "ooWooWoo",
      "oooooooo",
      ".o.oo.o.",
      "o.o..o.o",
      ".o....o.",
    ],
    palette: { o: "#F5A623", W: "#FFE2AE" },
  },
  jellyDeep: {
    rows: [
      "..cccc..",
      ".cccccc.",
      "ccWccWcc",
      "cccccccc",
      ".c.cc.c.",
      "c.c..c.c",
      ".c....c.",
    ],
    palette: { c: "#6FC3E0", W: "#E8FBFF" },
  },
  whaleShadow: {
    rows: [
      "..................ww.....",
      ".wwwwwwwwwwwwwww.wwww....",
      "wwwwwwwwwwwwwwwwwwwwwww..",
      "wWwwwwwwwwwwwwwwwwwwwww..",
      ".wwwwwwwwwwwwwwwwwwwww...",
      "..wwwwwwwwwwwwwwwwww.....",
      "....wwww....wwww.........",
    ],
    palette: { w: "#1E4A6E", W: "#2A5F8A" },
  },
  shipwreck: {
    rows: [
      "...............mm.......",
      "...............mm.......",
      "........mm.....mm.......",
      "......mmmm....mmm.......",
      "....mmmmmm....mm........",
      "......mmmm....mm........",
      "........mm...mmm........",
      "sssssssssssssssssssssss.",
      ".sssssssssssssssssssss..",
      "..sssssssssssssssssss...",
      "...sssssssssssssssss....",
      ".....sssssssssssss......",
    ],
    palette: { m: "#2A3E52", s: "#17304A", S: "#0F2438" },
  },
  kelpStalk: {
    rows: [
      "..k...",
      ".kkk..",
      "..k...",
      "..k.k.",
      ".kkk..",
      "..k...",
      ".kkkk.",
      "..k...",
      "..k.k.",
      ".kkk.k",
      "..k.k.",
      ".kkkk.",
      "..k...",
    ],
    palette: { k: "#1E5A46" },
  },
  lureFish: {
    rows: [
      "..........l..",
      "..........l..",
      "..fff.....l..",
      ".fffff...ll..",
      "fWffffffff.l.",
      ".fffff...ll..",
      "..fff.....l..",
      "......ff.....",
    ],
    palette: { f: "#16324E", W: "#7DE9F7", l: "#BFF4A9" },
  },
  foodFish: {
    rows: [
      "..ff..",
      ".ffff.",
      "fWffff",
      ".ffff.",
      "..ff..",
    ],
    palette: { f: "#7DE9F7", W: "#04121F" },
  },
  plankton: {
    rows: [
      "..pp.p....",
      ".p..p.p...",
      ".p..p.p..p",
      "..pp..p.p.",
      "....p..p..",
      ".p.....p..",
      "....pp....",
    ],
    palette: { p: "#8FD0FF" },
  },
  noCatch: {
    rows: [
      "..nnnn..",
      ".n....n.",
      "n......n",
      "n......n",
      "n......n",
      ".n....n.",
      "..nnnn..",
    ],
    palette: { n: "#5F7A96" },
  },
  cattail: {
    rows: [
      "..b..",
      "..b..",
      "..b..",
      "..g..",
      "..g..",
      "g.g.g",
      "ggggg",
    ],
    palette: { b: "#7A4E2C", g: "#3E7A3C" },
  },
  /* ---- reef props (bright shallow-water walls) ---- */
  coralOrange: {
    rows: [
      "..o...o..",
      ".oo.o.oo.",
      ".ooooooo.",
      "..ooooo..",
      ".o.ooo.o.",
      ".oo.oo.oo",
      "..o...o..",
    ],
    palette: { o: "#FF8A5C" },
  },
  coralPink: {
    rows: [
      ".p...p...",
      ".pp.p.pp.",
      "ppppppppp",
      ".ppppppp.",
      "..p.p.p..",
      ".pp.p.pp.",
      "..........",
    ],
    palette: { p: "#E86AA6" },
  },
  coralGreen: {
    rows: [
      "...g.g...",
      "..ggggg..",
      ".g.ggg.g.",
      ".ggggggg.",
      "..g.g.g..",
      ".g..g..g.",
      "..........",
    ],
    palette: { g: "#59D9A4" },
  },
  /* branching staghorn coral — orange, grows on the reef walls */
  coralBranch: {
    rows: [
      "O...O...O..",
      "oO..O..Oo..",
      "ooo.O.ooo..",
      ".oooooooo..",
      "..oooooo...",
      "...oooo....",
      "....oo.....",
      "...oooo....",
      "....oo.....",
    ],
    palette: { o: "#FF8A5C", O: "#FFB08A" },
  },
  /* purple tube-coral cluster */
  coralTube: {
    rows: [
      "..t...t..",
      "..t...t..",
      ".tt...tt.",
      ".ttt.ttt.",
      ".ttttttt.",
      "..TTTTT..",
      "..T.T.T..",
      "..T.T.T..",
    ],
    palette: { t: "#B678E8", T: "#7A3FA8" },
  },
  /* pink sea fan */
  seaFan: {
    rows: [
      ".ff.fff.ff.",
      "fffffffffff",
      ".fffffffff.",
      "..fffffff..",
      "...fffff...",
      "....fff....",
      ".....f.....",
      "....fff....",
    ],
    palette: { f: "#F26D9D" },
  },
  /* green anemone with darker tentacle cores */
  anemone: {
    rows: [
      ".a.a.a.a.",
      "aaaaaaaaa",
      "aAaAaAaAa",
      ".aaaaaaa.",
      "..aaaaa..",
      "...aaa...",
      "....a....",
    ],
    palette: { a: "#59D9A4", A: "#2FA87A" },
  },
  /* orange starfish clinging to the rock */
  starfish: {
    rows: [
      "....s....",
      "...sss...",
      ".sssssss.",
      "sssssssss",
      ".sssssss.",
      "..s.s.s..",
      "..s...s..",
    ],
    palette: { s: "#F5A623" },
  },
  /* tall swaying seaweed strands for the wall base */
  seaweedTall: {
    rows: [
      "..s..s.",
      ".s.s.s.",
      "..s.s..",
      ".s.s.s.",
      "..s..s.",
      ".s.s.s.",
      "..s.s..",
      ".s.s.s.",
      "..s..s.",
      ".s.s.s.",
      "..s.s..",
      ".sssss.",
    ],
    palette: { s: "#2E9B5F" },
  },
  /* small pink clam shell */
  shell: {
    rows: [
      ".wwwww.",
      "wpppppw",
      "wppPppw",
      "wpppppw",
      ".wwwww.",
    ],
    palette: { w: "#F3E7D6", p: "#F49AC1", P: "#D14A7E" },
  },
  /* red diver flag with white diagonal stripe — flies from the boat mast */
  diverFlag: {
    rows: [
      "rrrrW.",
      "rrrWrr",
      "rrWrrr",
      "rWrrrr",
      "Wrrrrr",
    ],
    palette: { r: "#E2483C", W: "#FFFFFF" },
  },
  /* palm tree for the ready-screen island — drooping fronds, slim trunk */
  palm: {
    rows: [
      "...g....g...",
      "..ggg..ggg..",
      "..gggggggg..",
      ".gggggggggg.",
      "gg.gggggg.gg",
      ".g..g..g..g.",
      ".....tt.....",
      "....tttt....",
      "....ttt.....",
      "....ttt.....",
      "....ttt.....",
      "...tttt.....",
      "..ggggggg...",
    ],
    palette: { g: "#3E9B4F", t: "#8A6A4A" },
  },
  /* distant sailboat silhouette on the horizon */
  sailboat: {
    rows: [
      ".....m......",
      "....mm......",
      "....mss.....",
      "...mmsss....",
      "...msssss...",
      "..ssssssss..",
      ".hhhhhhhhhh.",
      "..hhhhhhhh..",
    ],
    palette: { m: "#3E5A76", s: "#F7F9FA", h: "#2E4A66" },
  },
  /* broken stone pillar — mid-water ruins */
  ruinPillar: {
    rows: [
      ".rrrrrrr..",
      ".rrrrrrr..",
      "..rrrrr...",
      "..rrrrr...",
      ".rrrrrrr..",
      "..rrrrr...",
      "..rrrrr...",
      ".rrrrrrr..",
      "rrrrrrrrr.",
    ],
    palette: { r: "#33546E" },
  },
};

/** v24: the Krillion mascot is DRAWN + ANIMATED (inline SVG with
    SMIL) — no picture, no pixel frames. A smooth pink krill facing
    LEFT, bigger than v23 (120px) and CURVED like a real krill
    (head low, tail curling up): its tail fan flicks, its five
    little leg pairs paddle, its antennae sway, and its big eye
    blinks. It is the game's mascot, so it must look ALIVE. The
    v23 krill was too small and too straight — the user said it
    wasn't right. Pair with the `pd-anim-swim` (side-to-side) +
    `pd-anim-bob` (up-down) wrappers. Krillion only. */
export function KrillSwimmer({ pixel = 4 }: { pixel?: number }) {
  const w = 30 * pixel;
  return (
    <svg
      viewBox="0 0 110 48"
      width={w}
      height={(w * 48) / 110}
      aria-hidden="true"
      className="pointer-events-none block select-none"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="krill-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F791A8" />
          <stop offset="55%" stopColor="#F4587E" />
          <stop offset="100%" stopColor="#D94F70" />
        </linearGradient>
        <linearGradient id="krill-belly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FBC4D2" />
          <stop offset="100%" stopColor="#F791A8" />
        </linearGradient>
      </defs>
      {/* whole-body breathing: a slow gentle swell */}
      <g>
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1 1; 1.02 1.03; 1 1"
          keyTimes="0; 0.5; 1"
          dur="2.4s"
          repeatCount="indefinite"
          additive="sum"
        />
        {/* antennae — two long feelers swaying slowly */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="-6 14 25; 8 14 25; -6 14 25"
            keyTimes="0; 0.5; 1"
            dur="2.8s"
            repeatCount="indefinite"
          />
          <path
            d="M14 23 C 7 19, 3 15, 1 10"
            fill="none"
            stroke="#F791A8"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <path
            d="M14 27 C 6 29, 2 32, 1 36"
            fill="none"
            stroke="#F791A8"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </g>
        {/* legs — five little pairs paddling underneath, staggered,
            each rotating around its own base so it paddles in place */}
        {[
          [28, 32],
          [39, 30],
          [50, 27],
          [60, 24],
          [69, 21],
        ].map(([lx, ly], i) => (
          <g key={i}>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`-14 ${lx} ${ly}; 16 ${lx} ${ly}; -14 ${lx} ${ly}`}
              keyTimes="0; 0.5; 1"
              dur="0.7s"
              begin={`${i * 0.12}s`}
              repeatCount="indefinite"
              additive="sum"
            />
            <path
              d={`M${lx} ${ly} l -2.5 5.5 M${lx} ${ly} l 2.5 5.5`}
              fill="none"
              stroke="#E85A7E"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* feathery tip on each leg */}
            <path
              d={`M${lx - 2.5} ${ly + 5.5} l -1.5 1.5 M${lx + 2.5} ${ly + 5.5} l 1.5 1.5`}
              fill="none"
              stroke="#F791A8"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </g>
        ))}
        {/* tail fan — flicks with the swim beat, angled up with the curl */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 86 12; -16 86 12; 6 86 12; 0 86 12"
            keyTimes="0; 0.3; 0.6; 1"
            dur="0.9s"
            repeatCount="indefinite"
          />
          <path
            d="M86 12 L 106 1 L 104 7 L 110 8 L 105 11 L 108 15 L 86 12 Z"
            fill="url(#krill-body)"
            opacity="0.95"
          />
          <path
            d="M86 12 L 104 8"
            stroke="#D94F70"
            strokeWidth="0.8"
            opacity="0.6"
          />
        </g>
        {/* body segments — overlapping smooth shells along a gentle
            upward curve, head low on the left, tail curling up */}
        <ellipse cx="83" cy="12" rx="5" ry="4.5" fill="url(#krill-body)" />
        <ellipse cx="75" cy="14" rx="6" ry="5" fill="url(#krill-body)" />
        <ellipse cx="66" cy="17" rx="7" ry="6" fill="url(#krill-body)" />
        <ellipse cx="56" cy="20" rx="8" ry="7" fill="url(#krill-body)" />
        <ellipse cx="45" cy="23" rx="8.5" ry="7.5" fill="url(#krill-body)" />
        <ellipse cx="33" cy="26" rx="9" ry="8" fill="url(#krill-body)" />
        {/* belly highlight — a soft band along the underside curve */}
        <path
          d="M14 33 Q 40 35, 60 29 Q 75 23, 84 16"
          fill="none"
          stroke="url(#krill-belly)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* dorsal ridge — a thin darker line along the back */}
        <path
          d="M14 21 Q 40 15, 60 11 Q 75 7, 84 6"
          fill="none"
          stroke="#D94F70"
          strokeWidth="1"
          opacity="0.5"
        />
        {/* segment seams */}
        {[
          [28, 19, 33],
          [40, 16, 31],
          [51, 13, 28],
          [61, 11, 25],
          [70, 9, 22],
        ].map(([x, y0, y1]) => (
          <path
            key={x}
            d={`M${x} ${y0} Q ${x + 1} ${(y0 + y1) / 2}, ${x} ${y1}`}
            fill="none"
            stroke="#D94F70"
            strokeWidth="0.8"
            opacity="0.55"
          />
        ))}
        {/* head */}
        <ellipse cx="20" cy="28" rx="9.5" ry="8.5" fill="url(#krill-body)" />
        {/* rostrum — the pointed nose, angled up */}
        <path d="M13 22 L 4 15 L 12 25 Z" fill="#F4587E" />
        {/* eye — bigger, blinks every ~4s */}
        <ellipse cx="16" cy="25" rx="3.2" ry="3.2" fill="#2A0A14">
          <animate
            attributeName="ry"
            values="3.2; 3.2; 0.4; 3.2; 3.2"
            keyTimes="0; 0.9; 0.93; 0.96; 1"
            dur="4.2s"
            repeatCount="indefinite"
          />
        </ellipse>
        <circle cx="17.2" cy="23.8" r="1" fill="#FFFFFF" opacity="0.9" />
      </g>
    </svg>
  );
}

export function PixelSprite({
  name,
  pixel = 3,
  flip = false,
  className,
  style,
}: {
  name: keyof typeof SPRITES | string;
  pixel?: number;
  flip?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const def = SPRITES[name as string];
  const shadows = useMemo(() => {
    if (!def) return "";
    const out: string[] = [];
    def.rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === "." || ch === " ") continue;
        const color = def.palette[ch];
        if (!color) continue;
        out.push(`${x * pixel}px ${y * pixel}px 0 0 ${color}`);
      }
    });
    return out.join(", ");
  }, [def, pixel]);

  if (!def) return null;
  const width = def.rows[0].length * pixel;
  const height = def.rows.length * pixel;

  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none relative block select-none", className)}
      style={{
        width,
        height,
        ...style,
      }}
    >
      <span
        className="absolute left-0 top-0 block"
        style={{
          width: pixel,
          height: pixel,
          boxShadow: shadows,
          transform: flip ? "scaleX(-1)" : undefined,
          transformOrigin: `${width / 2}px center`,
        }}
      />
    </span>
  );
}
