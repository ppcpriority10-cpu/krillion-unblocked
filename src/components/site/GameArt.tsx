/* ============================================================
   GameArt — hand-crafted illustrated SVG thumbnails.
   Each scene is a layered painting: gradients, glows,
   silhouettes and the game's hero prop, drawn like the
   playdaily.org key art. Pure SVG — no image assets.
   ============================================================ */

export type GameArtKind = "ocean" | "sky" | "meadow" | "space" | "studio" | "arcade";

/** Soft round cloud built from overlapping circles. */
function Cloud({
  x,
  y,
  s = 1,
  opacity = 0.9,
}: {
  x: number;
  y: number;
  s?: number;
  opacity?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <ellipse cx="0" cy="0" rx="46" ry="16" fill="#fff" />
      <circle cx="-20" cy="-8" r="17" fill="#fff" />
      <circle cx="4" cy="-14" r="21" fill="#fff" />
      <circle cx="26" cy="-6" r="14" fill="#fff" />
    </g>
  );
}

/** Simple bird glyph. */
function Bird({ x, y, s = 1, opacity = 0.85 }: { x: number; y: number; s?: number; opacity?: number }) {
  return (
    <path
      d={`M${x - 9 * s} ${y} q ${4.5 * s} ${-6 * s} ${9 * s} 0 q ${4.5 * s} ${-6 * s} ${9 * s} 0`}
      fill="none"
      stroke="#fff"
      strokeWidth={2.4 * s}
      strokeLinecap="round"
      opacity={opacity}
    />
  );
}

/** Fish silhouette with tail + fin. */
function Fish({
  x,
  y,
  s = 1,
  color,
  opacity = 1,
  flip = false,
}: {
  x: number;
  y: number;
  s?: number;
  color: string;
  opacity?: number;
  flip?: boolean;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}
      opacity={opacity}
    >
      <ellipse cx="0" cy="0" rx="26" ry="12" fill={color} />
      <path d="M22 0 L38 -11 L34 0 L38 11 Z" fill={color} />
      <path d="M-4 -11 Q2 -20 10 -12 Z" fill={color} />
      <circle cx="-14" cy="-3" r="2.2" fill="#fff" opacity={0.9} />
    </g>
  );
}

/* ============================================================
   1 — OCEAN (Krillion): sunlit dive into the deep
   ============================================================ */
function OceanArt() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="oc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFF0FB" />
          <stop offset="1" stopColor="#8FE0F4" />
        </linearGradient>
        <linearGradient id="oc-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3FC0E8" />
          <stop offset="0.35" stopColor="#1E8CC4" />
          <stop offset="0.7" stopColor="#0E5E92" />
          <stop offset="1" stopColor="#093B66" />
        </linearGradient>
        <radialGradient id="oc-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF9D8" />
          <stop offset="0.55" stopColor="#FFF3AE" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFF3AE" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="oc-ray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="oc-krill" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#FF9BB6" />
          <stop offset="0.6" stopColor="#F4587E" />
          <stop offset="1" stopColor="#D63366" />
        </radialGradient>
        <linearGradient id="oc-rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B3454" />
          <stop offset="1" stopColor="#071F38" />
        </linearGradient>
      </defs>

      {/* sky */}
      <rect width="800" height="185" fill="url(#oc-sky)" />
      <circle cx="640" cy="52" r="120" fill="url(#oc-sun)" />
      <circle cx="640" cy="52" r="26" fill="#FFF6C4" />
      <Cloud x={150} y={78} s={1} opacity={0.95} />
      <Cloud x={430} y={46} s={0.66} opacity={0.8} />
      <Bird x={300} y={120} s={1.1} opacity={0.7} />

      {/* sea */}
      <rect y="185" width="800" height="315" fill="url(#oc-sea)" />
      {/* waterline foam */}
      <rect y="181" width="800" height="9" fill="#fff" opacity="0.92" />
      <g fill="#fff" opacity="0.75">
        <circle cx="30" cy="183" r="5" /><circle cx="130" cy="184" r="7" />
        <circle cx="240" cy="182" r="5" /><circle cx="370" cy="184" r="8" />
        <circle cx="505" cy="183" r="5" /><circle cx="640" cy="184" r="7" />
        <circle cx="760" cy="182" r="5" />
      </g>

      {/* caustic rays */}
      <g>
        <path d="M120 190 L210 190 L330 500 L150 500 Z" fill="url(#oc-ray)" opacity="0.5" />
        <path d="M320 190 L400 190 L520 500 L380 500 Z" fill="url(#oc-ray)" opacity="0.4" />
        <path d="M540 190 L620 190 L740 500 L600 500 Z" fill="url(#oc-ray)" opacity="0.45" />
      </g>

      {/* canyon silhouettes */}
      <path d="M0 320 L0 500 L130 500 Q85 430 95 380 Q70 355 0 320 Z" fill="url(#oc-rock)" opacity="0.9" />
      <path d="M800 300 L800 500 L660 500 Q710 430 700 372 Q730 345 800 300 Z" fill="url(#oc-rock)" opacity="0.9" />

      {/* fish school */}
      <Fish x={150} y={300} s={0.9} color="#2FA9C9" opacity={0.85} />
      <Fish x={225} y={330} s={0.62} color="#2FA9C9" opacity={0.7} flip />
      <Fish x={620} y={310} s={0.75} color="#F5C242" opacity={0.9} flip />
      <Fish x={690} y={345} s={0.55} color="#F5C242" opacity={0.7} />
      <Fish x={520} y={400} s={0.6} color="#0C3C60" opacity={0.8} />

      {/* seaweed */}
      <g stroke="#12653F" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.95">
        <path d="M120 500 C114 452 132 432 122 392" />
        <path d="M146 500 C150 460 134 446 142 410" />
        <path d="M676 500 C670 456 690 442 678 402" />
      </g>

      {/* rising bubbles */}
      <g fill="none" stroke="#fff" opacity="0.65">
        <circle cx="250" cy="430" r="6" strokeWidth="2" />
        <circle cx="268" cy="382" r="4" strokeWidth="2" />
        <circle cx="430" cy="452" r="7" strokeWidth="2" />
        <circle cx="447" cy="402" r="4" strokeWidth="2" />
        <circle cx="575" cy="440" r="5" strokeWidth="2" />
      </g>

      {/* hero krill */}
      <g transform="translate(352 296) rotate(-8)">
        <ellipse cx="0" cy="0" rx="34" ry="24" fill="url(#oc-krill)" />
        <path d="M-30 -14 Q-46 -2 -30 12 Q-20 2 -30 -14Z" fill="#E2446B" />
        <circle cx="12" cy="-6" r="5.4" fill="#fff" />
        <circle cx="13.4" cy="-5.2" r="2.6" fill="#132638" />
        <path d="M-6 22 Q0 32 8 24 M8 22 Q14 30 20 22" stroke="#D63366" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      </g>

      {/* marine snow */}
      <g fill="#fff" opacity="0.5">
        <circle cx="90" cy="270" r="2.4" /><circle cx="200" cy="250" r="2" />
        <circle cx="330" cy="238" r="2.4" /><circle cx="470" cy="258" r="2" />
        <circle cx="600" cy="242" r="2.4" /><circle cx="720" cy="262" r="2" />
        <circle cx="160" cy="410" r="2" /><circle cx="710" cy="420" r="2.2" />
      </g>

      {/* deep vignette */}
      <linearGradient id="oc-vig" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.6" stopColor="#06243F" stopOpacity="0" />
        <stop offset="1" stopColor="#06243F" stopOpacity="0.55" />
      </linearGradient>
      <rect y="185" width="800" height="315" fill="url(#oc-vig)" />
    </svg>
  );
}

/* ============================================================
   2 — SKY (Noillirk): dawn ascent over the hills
   ============================================================ */
function SkyArt() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sk-dawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1C5D9E" />
          <stop offset="0.4" stopColor="#4E97CE" />
          <stop offset="0.72" stopColor="#9FD0EC" />
          <stop offset="1" stopColor="#FBE3AE" />
        </linearGradient>
        <radialGradient id="sk-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF6C8" />
          <stop offset="0.5" stopColor="#FFD98A" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FFD98A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sk-hillA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FB0D8" />
          <stop offset="1" stopColor="#5E93BC" />
        </linearGradient>
        <linearGradient id="sk-hillB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4E86B0" />
          <stop offset="1" stopColor="#37688C" />
        </linearGradient>
        <radialGradient id="sk-balloon" cx="0.35" cy="0.3" r="0.95">
          <stop offset="0" stopColor="#FF8FB5" />
          <stop offset="0.55" stopColor="#F4407A" />
          <stop offset="1" stopColor="#C42B5F" />
        </radialGradient>
      </defs>

      <rect width="800" height="500" fill="url(#sk-dawn)" />
      {/* sun glow low */}
      <circle cx="392" cy="392" r="150" fill="url(#sk-sun)" />
      <circle cx="392" cy="392" r="34" fill="#FFF3B8" />

      {/* birds */}
      <Bird x={130} y={128} s={1.2} opacity={0.75} />
      <Bird x={185} y={150} s={0.9} opacity={0.6} />
      <Bird x={640} y={104} s={1} opacity={0.7} />

      {/* clouds */}
      <Cloud x={150} y={225} s={1.15} opacity={0.92} />
      <Cloud x={610} y={175} s={0.9} opacity={0.85} />
      <Cloud x={420} y={262} s={0.7} opacity={0.7} />
      <Cloud x={90} y={120} s={0.55} opacity={0.6} />
      <Cloud x={700} y={280} s={0.8} opacity={0.65} />

      {/* hero balloon */}
      <g transform="translate(560 170) rotate(6)">
        <path d="M0 -84 C52 -84 78 -46 62 6 C54 32 30 50 12 56 L-12 56 C-30 50 -54 32 -62 6 C-78 -46 -52 -84 0 -84 Z" fill="url(#sk-balloon)" />
        <path d="M0 -84 C-20 -60 -24 -10 -12 56 M0 -84 C20 -60 24 -10 12 56" stroke="#B02454" strokeWidth="3" fill="none" opacity="0.65" />
        <path d="M-38 -66 C-50 -34 -40 4 -22 40 M38 -66 C50 -34 40 4 22 40" stroke="#FFC1D6" strokeWidth="4" fill="none" opacity="0.8" />
        <path d="M-12 56 L-8 76 L8 76 L12 56 Z" fill="#8C4A2E" />
        <rect x="-11" y="76" width="22" height="16" rx="3" fill="#B96A42" />
        <path d="M-12 58 L-9 77 M12 58 L9 77" stroke="#7A3B22" strokeWidth="2.4" />
      </g>

      {/* far hills */}
      <path d="M0 372 Q120 320 260 366 Q400 410 520 360 Q660 312 800 368 L800 500 L0 500 Z" fill="url(#sk-hillA)" opacity="0.85" />
      {/* near hills */}
      <path d="M0 430 Q150 380 320 424 Q500 468 640 420 Q730 392 800 424 L800 500 L0 500 Z" fill="url(#sk-hillB)" />
      {/* tree silhouettes */}
      <g fill="#2C5B7C">
        <path d="M96 452 L96 430 M96 446 Q78 438 76 420 Q94 416 96 432 Q98 414 118 418 Q116 438 96 446" />
        <path d="M700 460 L700 438 M700 454 Q684 446 682 430 Q698 426 700 440 Q702 424 720 428 Q718 446 700 454" />
      </g>

      {/* altitude specks */}
      <g fill="#fff" opacity="0.6">
        <circle cx="240" cy="90" r="2.4" /><circle cx="330" cy="140" r="2" />
        <circle cx="480" cy="70" r="2.4" /><circle cx="700" cy="60" r="2" />
      </g>
    </svg>
  );
}

/* ============================================================
   3 — MEADOW (Word Hunt): letter tiles in a forest glade
   ============================================================ */
function MeadowArt() {
  const tiles: { x: number; y: number; r: number; ch: string }[] = [
    { x: 250, y: 200, r: -10, ch: "W" },
    { x: 385, y: 160, r: 7, ch: "O" },
    { x: 512, y: 214, r: -6, ch: "R" },
    { x: 640, y: 158, r: 12, ch: "D" },
    { x: 318, y: 300, r: 8, ch: "E" },
    { x: 452, y: 330, r: -9, ch: "K" },
    { x: 585, y: 300, r: 6, ch: "Q" },
  ];
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="mw-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0C4A2E" />
          <stop offset="0.45" stopColor="#187A4A" />
          <stop offset="1" stopColor="#0B3D26" />
        </linearGradient>
        <radialGradient id="mw-glow" cx="0.5" cy="0.2" r="0.75">
          <stop offset="0" stopColor="#BFF2A6" stopOpacity="0.5" />
          <stop offset="0.6" stopColor="#BFF2A6" stopOpacity="0.08" />
          <stop offset="1" stopColor="#BFF2A6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mw-tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF7E0" />
          <stop offset="1" stopColor="#F5DF9E" />
        </linearGradient>
        <linearGradient id="mw-fern" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E8A50" />
          <stop offset="1" stopColor="#0A3320" />
        </linearGradient>
      </defs>

      <rect width="800" height="500" fill="url(#mw-bg)" />
      <rect width="800" height="500" fill="url(#mw-glow)" />

      {/* canopy shadows top corners */}
      <path d="M0 0 L220 0 Q90 60 0 140 Z" fill="#06301C" opacity="0.55" />
      <path d="M800 0 L560 0 Q700 70 800 150 Z" fill="#06301C" opacity="0.55" />

      {/* ferns bottom */}
      <g stroke="url(#mw-fern)" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M80 500 C74 448 96 430 86 386" />
        <path d="M108 500 C114 458 96 442 104 404" />
        <path d="M700 500 C694 448 716 434 706 392" />
        <path d="M726 500 C732 462 714 448 722 412" />
      </g>
      <path d="M0 470 Q120 440 260 466 Q420 494 560 462 Q700 434 800 468 L800 500 L0 500 Z" fill="#072B1A" />

      {/* floating letter tiles */}
      {tiles.map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${t.y}) rotate(${t.r})`}>
          <rect x="-40" y="-38" width="80" height="80" rx="18" fill="#8A5A16" opacity="0.35" transform="translate(4 9)" />
          <rect x="-40" y="-40" width="80" height="80" rx="18" fill="url(#mw-tile)" />
          <rect x="-40" y="-40" width="80" height="80" rx="18" fill="none" stroke="#E2B85C" strokeWidth="2.5" />
          <text
            x="0"
            y="6"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-serif), Georgia, serif"
            fontWeight="700"
            fontSize="46"
            fill="#5C3D0A"
          >
            {t.ch}
          </text>
          <rect x="-28" y="-32" width="34" height="12" rx="6" fill="#fff" opacity="0.55" />
        </g>
      ))}

      {/* drifting leaves */}
      <g fill="#35B36B" opacity="0.85">
        <path d="M170 120 q14 -12 30 -2 q-12 14 -30 2Z" />
        <path d="M620 380 q14 -12 30 -2 q-12 14 -30 2Z" opacity="0.7" />
        <path d="M120 340 q12 -10 26 -2 q-10 12 -26 2Z" opacity="0.6" />
      </g>
      {/* light motes */}
      <g fill="#EAFCD9" opacity="0.7">
        <circle cx="200" cy="90" r="3" /><circle cx="420" cy="70" r="2.4" />
        <circle cx="700" cy="110" r="3" /><circle cx="90" cy="250" r="2.4" />
        <circle cx="740" cy="260" r="2.4" />
      </g>
    </svg>
  );
}

/* ============================================================
   4 — SPACE (What's Your Guess?): cosmic estimation
   ============================================================ */
function SpaceArt() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sp-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#160A3E" />
          <stop offset="0.55" stopColor="#3A1E7E" />
          <stop offset="1" stopColor="#6D3FB8" />
        </linearGradient>
        <radialGradient id="sp-neb" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#B07CE8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#B07CE8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sp-planet" cx="0.35" cy="0.3" r="0.95">
          <stop offset="0" stopColor="#C9A2F5" />
          <stop offset="0.55" stopColor="#8A5BD6" />
          <stop offset="1" stopColor="#4C2A8F" />
        </radialGradient>
        <radialGradient id="sp-moon" cx="0.35" cy="0.3" r="0.95">
          <stop offset="0" stopColor="#F2EAFB" />
          <stop offset="1" stopColor="#A48BC8" />
        </radialGradient>
        <linearGradient id="sp-comet" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect width="800" height="500" fill="url(#sp-bg)" />
      <ellipse cx="240" cy="160" rx="260" ry="180" fill="url(#sp-neb)" />
      <ellipse cx="620" cy="380" rx="240" ry="160" fill="url(#sp-neb)" opacity="0.7" />

      {/* stars */}
      <g fill="#fff">
        <circle cx="70" cy="70" r="2.6" /><circle cx="150" cy="130" r="1.8" />
        <circle cx="250" cy="60" r="2.2" /><circle cx="360" cy="110" r="1.6" />
        <circle cx="470" cy="55" r="2.4" /><circle cx="560" cy="120" r="1.8" />
        <circle cx="660" cy="70" r="2.2" /><circle cx="740" cy="140" r="1.6" />
        <circle cx="110" cy="330" r="2" /><circle cx="60" cy="430" r="2.4" />
        <circle cx="200" cy="430" r="1.8" /><circle cx="330" cy="380" r="2.2" />
        <circle cx="730" cy="300" r="2" /><circle cx="770" cy="430" r="2.2" />
      </g>
      {/* twinkles */}
      <g stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.9">
        <path d="M420 160 v-18 M411 151 h18 M413.6 143.6 l12.8 14.8 M426.4 143.6 l-12.8 14.8" transform="translate(0 9)" />
        <path d="M560 230 v-12 M554 224 h12" />
        <path d="M180 210 v-12 M174 204 h12" />
      </g>

      {/* comet */}
      <g transform="translate(250 260) rotate(-18)">
        <path d="M-120 0 L0 -5 L0 5 Z" fill="url(#sp-comet)" />
        <circle cx="4" cy="0" r="6" fill="#fff" />
      </g>

      {/* ringed planet hero */}
      <g transform="translate(590 300)">
        <circle r="92" fill="url(#sp-planet)" />
        <ellipse cx="-20" cy="-30" rx="26" ry="14" fill="#B892E8" opacity="0.55" />
        <ellipse cx="18" cy="22" rx="34" ry="16" fill="#6A44B0" opacity="0.6" />
        <g transform="rotate(-16)">
          <ellipse rx="150" ry="30" fill="none" stroke="#E5D3FA" strokeWidth="9" opacity="0.85" />
          <ellipse rx="150" ry="30" fill="none" stroke="#8A63C9" strokeWidth="9" opacity="0.35" transform="translate(0 5)" />
          <ellipse rx="118" ry="22" fill="none" stroke="#E5D3FA" strokeWidth="4" opacity="0.5" />
        </g>
      </g>

      {/* small moon */}
      <g transform="translate(180 400)">
        <circle r="34" fill="url(#sp-moon)" />
        <circle cx="-8" cy="-6" r="6" fill="#8E76B5" opacity="0.6" />
        <circle cx="10" cy="8" r="4.4" fill="#8E76B5" opacity="0.55" />
        <circle cx="-2" cy="16" r="3" fill="#8E76B5" opacity="0.5" />
      </g>

      {/* floating estimation marks */}
      <g fontFamily="var(--font-game-mono), monospace" fontWeight="700" fill="#E7DBFF">
        <text x="70" y="210" fontSize="34" opacity="0.9">42</text>
        <text x="330" y="330" fontSize="26" opacity="0.7">1,000?</text>
        <text x="420" y="70" fontSize="30" opacity="0.85">?</text>
      </g>
    </svg>
  );
}

/* ============================================================
   5 — STUDIO (Colour Memory): the colour lab
   ============================================================ */
function StudioArt() {
  const dabs: { cx: number; cy: number; r: number; c: string }[] = [
    { cx: 200, cy: 180, r: 64, c: "#F4407A" },
    { cx: 400, cy: 130, r: 46, c: "#22D3EE" },
    { cx: 580, cy: 200, r: 58, c: "#FFC250" },
    { cx: 300, cy: 330, r: 50, c: "#4ADE80" },
    { cx: 520, cy: 360, r: 62, c: "#8B5CF6" },
  ];
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="st-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#191423" />
          <stop offset="0.55" stopColor="#26203A" />
          <stop offset="1" stopColor="#151020" />
        </linearGradient>
        <radialGradient id="st-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#8B5CF6" stopOpacity="0.34" />
          <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <filter id="st-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <linearGradient id="st-swatch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A334F" />
          <stop offset="1" stopColor="#241F33" />
        </linearGradient>
      </defs>

      <rect width="800" height="500" fill="url(#st-bg)" />
      <ellipse cx="400" cy="180" rx="380" ry="240" fill="url(#st-lamp)" />

      {/* faint studio grid */}
      <g stroke="#8B5CF6" opacity="0.08">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={80 * (i + 1)} y1="0" x2={80 * (i + 1)} y2="500" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={80 * (i + 1)} x2="800" y2={80 * (i + 1)} />
        ))}
      </g>

      {/* glowing colour dabs */}
      {dabs.map((d, i) => (
        <g key={i}>
          <circle cx={d.cx} cy={d.cy} r={d.r} fill={d.c} opacity="0.4" filter="url(#st-blur)" />
          <circle cx={d.cx} cy={d.cy} r={d.r * 0.62} fill={d.c} />
          <circle cx={d.cx - d.r * 0.18} cy={d.cy - d.r * 0.2} r={d.r * 0.2} fill="#fff" opacity="0.75" />
        </g>
      ))}

      {/* fanned swatch cards */}
      <g transform="translate(398 286)">
        {[-24, -8, 8, 24].map((r, i) => (
          <g key={i} transform={`rotate(${r}) translate(0 ${Math.abs(r) * 0.6})`}>
            <rect x="-26" y="-64" width="52" height="128" rx="10" fill="url(#st-swatch)" stroke="#4A4166" strokeWidth="2" />
            <rect x="-18" y="-54" width="36" height="64" rx="6" fill={["#F4407A", "#22D3EE", "#FFC250", "#4ADE80"][i]} />
            <rect x="-18" y="18" width="36" height="8" rx="4" fill="#6A5E8E" opacity="0.8" />
            <rect x="-12" y="32" width="24" height="6" rx="3" fill="#6A5E8E" opacity="0.5" />
          </g>
        ))}
      </g>

      {/* sparkles */}
      <g fill="#fff" opacity="0.85">
        <path d="M120 90 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 Z" />
        <path d="M680 100 l2.4 6.4 6.4 2.4 -6.4 2.4 -2.4 6.4 -2.4 -6.4 -6.4 -2.4 6.4 -2.4 Z" />
        <path d="M640 430 l2 5.4 5.4 2 -5.4 2 -2 5.4 -2 -5.4 -5.4 -2 5.4 -2 Z" />
      </g>
    </svg>
  );
}

/* ============================================================
   6 — ARCADE (Sequence): neon pad arena
   ============================================================ */
function ArcadeArt() {
  const pads = [
    { x: 305, y: 210, c: "#4E9BE8", g: "#7CC0FF" },
    { x: 495, y: 210, c: "#58B04C", g: "#8FE384" },
    { x: 305, y: 385, c: "#F4407A", g: "#FF8FB5" },
    { x: 495, y: 385, c: "#FFC250", g: "#FFE09A" },
  ];
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="ar-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A1120" />
          <stop offset="0.6" stopColor="#131F3A" />
          <stop offset="1" stopColor="#080D19" />
        </linearGradient>
        <radialGradient id="ar-glow" cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#F43F5E" stopOpacity="0.16" />
          <stop offset="1" stopColor="#F43F5E" stopOpacity="0" />
        </radialGradient>
        <filter id="ar-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      <rect width="800" height="500" fill="url(#ar-bg)" />
      <rect width="800" height="500" fill="url(#ar-glow)" />

      {/* perspective floor grid — lines fan out from a vanishing point */}
      <g stroke="#3B82F6" opacity="0.22">
        {Array.from({ length: 11 }, (_, i) => {
          const off = (i - 5) * 90; // -450..450
          return (
            <line
              key={`v${i}`}
              x1={400 + off * 0.22}
              y1="410"
              x2={400 + off * 1.15}
              y2="500"
              strokeWidth="1.6"
            />
          );
        })}
        {[412, 430, 454, 486].map((y, i) => (
          <line key={`h${i}`} x1="0" y1={y} x2="800" y2={y} strokeWidth="1.6" opacity={0.5 + i * 0.16} />
        ))}
      </g>
      {/* horizon line */}
      <line x1="0" y1="410" x2="800" y2="410" stroke="#3B82F6" strokeWidth="2" opacity="0.35" />

      {/* scanline sheen */}
      <g opacity="0.05">
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x="0" y={i * 50} width="800" height="14" fill="#fff" />
        ))}
      </g>

      {/* neon pads */}
      {pads.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="74" fill={p.c} opacity="0.3" filter="url(#ar-blur)" />
          <rect x={p.x - 52} y={p.y - 52} width="104" height="104" rx="24" fill={p.c} />
          <rect x={p.x - 52} y={p.y - 52} width="104" height="104" rx="24" fill="none" stroke={p.g} strokeWidth="3" opacity="0.9" />
          <rect x={p.x - 40} y={p.y - 44} width="44" height="16" rx="8" fill="#fff" opacity="0.4" />
          <text
            x={p.x}
            y={p.y + 4}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-game-mono), monospace"
            fontWeight="700"
            fontSize="34"
            fill="#fff"
            opacity="0.92"
          >
            {i + 1}
          </text>
        </g>
      ))}

      {/* connecting current lines */}
      <g stroke="#7CC0FF" strokeWidth="2.4" opacity="0.5" strokeDasharray="10 8" fill="none">
        <path d="M357 210 L443 210" />
        <path d="M305 262 L305 333" />
        <path d="M495 262 L495 333" />
      </g>

      {/* starfield */}
      <g fill="#fff" opacity="0.7">
        <circle cx="90" cy="70" r="2.2" /><circle cx="220" cy="120" r="1.8" />
        <circle cx="620" cy="80" r="2.2" /><circle cx="720" cy="150" r="1.8" />
        <circle cx="90" cy="330" r="1.8" /><circle cx="730" cy="300" r="2.2" />
      </g>
    </svg>
  );
}

const ART: Record<GameArtKind, () => React.JSX.Element> = {
  ocean: OceanArt,
  sky: SkyArt,
  meadow: MeadowArt,
  space: SpaceArt,
  studio: StudioArt,
  arcade: ArcadeArt,
};

export function GameArt({ kind }: { kind: GameArtKind }) {
  const Scene = ART[kind];
  return <Scene />;
}
