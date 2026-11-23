import Link from "next/link";
import type { GameMeta } from "@/data/games";
import { GameIcon } from "./GameIcon";
import { GameArt } from "./GameArt";

/**
 * PlayDaily-style game card: an illustrated key-art thumbnail on top
 * (layered SVG scene), icon chip + name + one-line tagline underneath.
 * Hover gently zooms the artwork and lifts the card.
 */
export function GameCard({ game }: { game: GameMeta }) {
  return (
    <Link
      href={`/${game.slug}`}
      className="group block"
      aria-label={`Play ${game.name}`}
    >
      {/* illustrated key art */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl ring-1 ring-black/10 shadow-[0_2px_10px_-4px_rgba(4,18,32,0.25)] transition-all duration-300 group-hover:shadow-[0_20px_40px_-16px_rgba(4,18,32,0.5)] group-hover:-translate-y-0.5">
        {/* the scene */}
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.06]">
          <GameArt kind={game.artKind} />
        </div>

        {/* top light + bottom depth shading for text legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 26%), linear-gradient(0deg, rgba(4,18,32,0.28) 0%, transparent 30%)",
          }}
        />

        {/* badge */}
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm ring-1 ring-white/20">
          {game.badge}
        </span>

        {/* play hint on hover */}
        <span className="absolute bottom-3 right-3 flex h-9 items-center gap-1.5 rounded-full bg-white/92 px-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#0B3A5C] opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100">
          Play
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M2 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* caption row — icon chip + name + one-line hook */}
      <div className="mt-3 flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${game.chip}`}
        >
          <GameIcon name={game.icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-sans text-[16px] font-bold leading-tight tracking-tight text-foreground group-hover:underline">
            {game.name}
          </h3>
          <p className="mt-0.5 truncate text-[13.5px] text-muted-foreground">{game.tagline}</p>
        </div>
      </div>
    </Link>
  );
}
