/* ============================================================
   SceneAmbience — immersive illustrated backdrops for the
   "classics" games. A rich scene band sits behind/above the
   content and dissolves into the page, giving every game a
   real sense of place while keeping the board readable.
   ============================================================ */

export type AmbienceKind = "meadow" | "cosmos" | "studio" | "arcade";

/** Soft light from a point. */
function Glow({ cx, cy, r, c, o = 0.55 }: { cx: number; cy: number; r: number; c: string; o?: number }) {
  const id = `am-g-${cx}-${cy}-${Math.round(r)}`;
  return (
    <>
      <radialGradient id={id} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={c} stopOpacity={o} />
        <stop offset="1" stopColor={c} stopOpacity="0" />
      </radialGradient>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  );
}

/* ---------- meadow (Word Hunt) ---------- */
function MeadowAmbience() {
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMin slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="am-mw" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0F5A38" />
          <stop offset="0.55" stopColor="#1E8A52" />
          <stop offset="1" stopColor="#9ED9A8" />
        </linearGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#am-mw)" />
      <Glow cx={950} cy={60} r={260} c="#FFF3AE" />
      <Glow cx={180} cy={30} r={200} c="#BFF2A6" o={0.3} />
      {/* drifting leaf blobs */}
      <g fill="#35B36B" opacity="0.5">
        <path d="M140 120 q18 -14 38 -3 q-15 17 -38 3Z" />
        <path d="M1040 150 q16 -13 34 -2 q-13 15 -34 2Z" />
        <path d="M540 60 q14 -11 30 -2 q-12 13 -30 2Z" />
      </g>
      {/* grass silhouettes along the bottom */}
      <path d="M0 420 L0 330 Q80 300 160 328 Q260 356 360 326 Q470 296 570 330 Q680 360 780 328 Q890 298 990 330 Q1100 358 1200 326 L1200 420 Z" fill="#0B3D26" opacity="0.85" />
      <g stroke="#2FA45E" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8">
        <path d="M120 340 C114 300 130 286 122 254" />
        <path d="M142 344 C148 310 132 298 140 272" />
        <path d="M1050 344 C1044 302 1062 290 1054 258" />
        <path d="M1072 348 C1078 316 1062 304 1070 280" />
      </g>
      {/* light motes */}
      <g fill="#EAFCD9" opacity="0.7">
        <circle cx="240" cy="90" r="3.4" /><circle cx="460" cy="60" r="2.6" />
        <circle cx="700" cy="110" r="3.4" /><circle cx="880" cy="70" r="2.6" />
        <circle cx="1120" cy="120" r="3" />
      </g>
      {/* floating tiles hint */}
      {[
        { x: 330, y: 210, r: -8, ch: "W" },
        { x: 860, y: 190, r: 9, ch: "D" },
      ].map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${t.y}) rotate(${t.r})`} opacity="0.92">
          <rect x="-30" y="-28" width="60" height="60" rx="13" fill="#C9A93A" opacity="0.5" transform="translate(3 7)" />
          <rect x="-30" y="-30" width="60" height="60" rx="13" fill="#FFF7E0" />
          <text x="0" y="5" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-serif), Georgia, serif" fontWeight="700" fontSize="34" fill="#5C3D0A">
            {t.ch}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- cosmos (What's Your Guess?) ---------- */
function CosmosAmbience() {
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMin slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="am-cs" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1B0E4A" />
          <stop offset="0.6" stopColor="#3A1E7E" />
          <stop offset="1" stopColor="#8E6FD0" />
        </linearGradient>
      </defs>
      <rect width="1200" height="420" fill="url(#am-cs)" />
      <Glow cx={260} cy={90} r={280} c="#B07CE8" o={0.4} />
      <Glow cx={960} cy={60} r={240} c="#F49AC1" o={0.3} />
      {/* stars */}
      <g fill="#fff">
        {[
          [80, 60, 2.6], [170, 130, 1.8], [300, 50, 2.2], [420, 110, 1.6], [560, 40, 2.4],
          [660, 120, 1.8], [780, 60, 2.2], [900, 130, 1.6], [1020, 50, 2.4], [1130, 110, 1.8],
          [130, 220, 1.8], [370, 200, 2.2], [620, 230, 1.6], [860, 210, 2], [1080, 240, 2.2],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
      {/* sparkles */}
      <g stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.9">
        <path d="M500 160 v-16 M492 152 h16" />
        <path d="M940 180 v-14 M933 173 h14" />
        <path d="M240 170 v-14 M233 163 h14" />
      </g>
      {/* planet arc on the right */}
      <g transform="translate(1030 320)">
        <circle r="130" fill="#8A5BD6" opacity="0.9" />
        <circle r="130" fill="none" stroke="#E5D3FA" strokeWidth="7" opacity="0.7" transform="rotate(-14) scale(1 0.35)" />
        <circle r="150" fill="none" stroke="#E5D3FA" strokeWidth="3.4" opacity="0.4" transform="rotate(-14) scale(1 0.35)" />
        <ellipse cx="-30" cy="-40" rx="36" ry="18" fill="#B892E8" opacity="0.5" />
      </g>
      {/* comet */}
      <g transform="translate(420 260) rotate(-16)">
        <path d="M-140 0 L0 -5 L0 5 Z" fill="#fff" opacity="0.75" />
        <circle cx="4" cy="0" r="6" fill="#fff" />
      </g>
      {/* floating numbers */}
      <g fontFamily="var(--font-game-mono), monospace" fontWeight="700" fill="#E7DBFF">
        <text x="120" y="320" fontSize="30" opacity="0.85">42</text>
        <text x="600" y="300" fontSize="24" opacity="0.65">7,000,000,000?</text>
        <text x="700" y="150" fontSize="28" opacity="0.8">?</text>
      </g>
    </svg>
  );
}

/* ---------- studio (Colour Memory) ---------- */
function StudioAmbience() {
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMin slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="am-st" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#191423" />
          <stop offset="0.6" stopColor="#2B2440" />
          <stop offset="1" stopColor="#6E5FA0" />
        </linearGradient>
        <filter id="am-stb" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <rect width="1200" height="420" fill="url(#am-st)" />
      <g opacity="0.1">
        {Array.from({ length: 15 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 80} y1="0" x2={(i + 1) * 80} y2="420" stroke="#8B5CF6" />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={(i + 1) * 80} x2="1200" y2={(i + 1) * 80} stroke="#8B5CF6" />
        ))}
      </g>
      {/* glowing orbs */}
      {[
        { cx: 190, cy: 130, r: 60, c: "#F4407A" },
        { cx: 430, cy: 80, r: 44, c: "#22D3EE" },
        { cx: 700, cy: 140, r: 54, c: "#FFC250" },
        { cx: 950, cy: 90, r: 48, c: "#4ADE80" },
        { cx: 1120, cy: 170, r: 56, c: "#8B5CF6" },
      ].map((d, i) => (
        <g key={i}>
          <circle cx={d.cx} cy={d.cy} r={d.r} fill={d.c} opacity="0.45" filter="url(#am-stb)" />
          <circle cx={d.cx} cy={d.cy} r={d.r * 0.55} fill={d.c} />
          <circle cx={d.cx - d.r * 0.16} cy={d.cy - d.r * 0.18} r={d.r * 0.16} fill="#fff" opacity="0.8" />
        </g>
      ))}
      {/* sparkles */}
      <g fill="#fff" opacity="0.9">
        <path d="M320 200 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 Z" />
        <path d="M820 230 l2.4 6.4 6.4 2.4 -6.4 2.4 -2.4 6.4 -2.4 -6.4 -6.4 -2.4 6.4 -2.4 Z" />
        <path d="M60 260 l2 5.4 5.4 2 -5.4 2 -2 5.4 -2 -5.4 -5.4 -2 5.4 -2 Z" />
      </g>
    </svg>
  );
}

/* ---------- arcade (Sequence) ---------- */
function ArcadeAmbience() {
  return (
    <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMin slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="am-ar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A1120" />
          <stop offset="0.6" stopColor="#16234A" />
          <stop offset="1" stopColor="#3350A8" />
        </linearGradient>
        <filter id="am-arb" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <rect width="1200" height="420" fill="url(#am-ar)" />
      {/* horizon + perspective grid */}
      <line x1="0" y1="330" x2="1200" y2="330" stroke="#7CC0FF" strokeWidth="2" opacity="0.4" />
      <g stroke="#3B82F6" opacity="0.3">
        {Array.from({ length: 13 }, (_, i) => {
          const off = (i - 6) * 110;
          return <line key={`v${i}`} x1={600 + off * 0.2} y1="330" x2={600 + off * 1.6} y2="420" strokeWidth="1.6" />;
        })}
        {[336, 350, 370, 396].map((y, i) => (
          <line key={`h${i}`} x1="0" y1={y} x2="1200" y2={y} strokeWidth="1.6" opacity={0.4 + i * 0.15} />
        ))}
      </g>
      {/* neon glow orbs */}
      {[
        { cx: 170, cy: 150, c: "#4E9BE8" },
        { cx: 480, cy: 90, c: "#58B04C" },
        { cx: 760, cy: 140, c: "#F4407A" },
        { cx: 1060, cy: 80, c: "#FFC250" },
      ].map((d, i) => (
        <g key={i}>
          <circle cx={d.cx} cy={d.cy} r="52" fill={d.c} opacity="0.4" filter="url(#am-arb)" />
          <rect x={d.cx - 34} y={d.cy - 34} width="68" height="68" rx="16" fill={d.c} opacity="0.95" />
          <rect x={d.cx - 34} y={d.cy - 34} width="68" height="68" rx="16" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
          <rect x={d.cx - 24} y={d.cy - 26} width="28" height="10" rx="5" fill="#fff" opacity="0.45" />
        </g>
      ))}
      {/* starfield */}
      <g fill="#fff" opacity="0.75">
        {[[90, 40, 2.2], [300, 70, 1.8], [560, 40, 2.2], [860, 50, 1.8], [1140, 40, 2.2]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
      {/* scanlines */}
      <g opacity="0.05">
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x="0" y={i * 52} width="1200" height="14" fill="#fff" />
        ))}
      </g>
    </svg>
  );
}

const SCENES: Record<AmbienceKind, () => React.JSX.Element> = {
  meadow: MeadowAmbience,
  cosmos: CosmosAmbience,
  studio: StudioAmbience,
  arcade: ArcadeAmbience,
};

/**
 * Full-bleed ambience: the scene fills the top of the section and
 * dissolves into the page colour before the game board begins.
 */
export function SceneAmbience({
  kind,
  className,
}: {
  kind: AmbienceKind;
  className?: string;
}) {
  const Scene = SCENES[kind];
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-0 h-[430px] overflow-hidden ${className ?? ""}`}
      style={{
        maskImage: "linear-gradient(180deg, black 0%, black 34%, transparent 96%)",
        WebkitMaskImage: "linear-gradient(180deg, black 0%, black 34%, transparent 96%)",
      }}
    >
      <Scene />
    </div>
  );
}
