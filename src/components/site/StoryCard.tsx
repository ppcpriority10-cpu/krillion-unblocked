import Link from "next/link";
import type { Story } from "@/data/stories";

/** Editorial story card — flat and typographic. */
export function StoryCard({ story }: { story: Story }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-steel/40"
    >
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        <span className="text-steel">{story.tag}</span>
        <span aria-hidden="true">·</span>
        <span>{story.readMinutes} min read</span>
      </div>
      <h3 className="mt-3 font-serif text-xl font-bold leading-snug tracking-tight text-foreground group-hover:text-steel">
        {story.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {story.excerpt}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 border-t border-border pt-3 text-sm font-bold text-steel">
        Read the story
        <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
