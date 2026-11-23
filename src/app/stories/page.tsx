import type { Metadata } from "next";
import Link from "next/link";
import { STORIES } from "@/data/stories";
import { StoryCard } from "@/components/site/StoryCard";
import { AdSlot } from "@/components/site/AdSlot";
import { P } from "@/components/site/Copy";
import { SITE } from "@/lib/site";

const TITLE = "Stories — Krillion Unblocked Blog";
const DESCRIPTION =
  "Guides and strategy from Krillion Unblocked: how to play, when the dailies reset, and how to find rarer answers and score higher.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/stories" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/stories`,
    type: "website",
  },
};

export default function StoriesIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="inline-block rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Blog
        </p>
        <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Stories
        </h1>
        <P>
          Everything we know about playing well: rulebooks that actually match the code,
          honest strategy, and the small print of daily games explained properly. New
          stories land as the games evolve.
        </P>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STORIES.map((s) => (
          <StoryCard key={s.slug} story={s} />
        ))}
      </div>

      <div className="mt-12">
        <AdSlot format="leaderboard" />
      </div>

      <div className="mt-12 rounded-xl border border-border bg-card p-6">
        <h2 className="font-serif text-xl font-bold tracking-tight text-foreground">
          Where should a new player start?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Read the rulebook first, then take your first dive:{" "}
          <Link className="font-semibold text-steel hover:underline" href="/stories/how-to-play-krillion-unblocked">
            How to Play Krillion Unblocked
          </Link>
          . When the tiers feel familiar, the tips piece will move your score:{" "}
          <Link className="font-semibold text-steel hover:underline" href="/stories/ten-tips-rarer-answers">
            10 Tips to Find Rarer Answers
          </Link>
          . And if the midnight reset ever confuses you,{" "}
          <Link className="font-semibold text-steel hover:underline" href="/stories/when-does-krillion-unblocked-reset">
            When Does Krillion Unblocked Reset?
          </Link>{" "}
          has the whole picture. The games themselves are linked from{" "}
          <Link className="font-semibold text-steel hover:underline" href="/#games">
            the games section
          </Link>{" "}
          or the {SITE.name} header.
        </p>
      </div>
    </div>
  );
}
