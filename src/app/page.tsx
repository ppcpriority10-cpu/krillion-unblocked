import Link from "next/link";
import type { Metadata } from "next";
import { GAMES, GAME_CATEGORIES } from "@/data/games";
import { STORIES } from "@/data/stories";
import { GameCard } from "@/components/site/GameCard";
import { StoryCard } from "@/components/site/StoryCard";
import { AdSlot } from "@/components/site/AdSlot";
import { JsonLd } from "@/components/site/JsonLd";
import { Greeting } from "@/components/site/Greeting";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  publisher: {
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
  },
};

/** Playdaily-style "Have a game suggestion?" tile that closes a grid. */
function SuggestionCard() {
  return (
    <Link
      href="/contact"
      className="group flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-border bg-muted/50 p-6 text-center transition-colors hover:bg-muted"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-110">
        +
      </span>
      <p className="mt-4 font-sans text-[16px] font-bold text-foreground">
        Have a game suggestion?
      </p>
      <p className="mt-1 text-[13.5px] text-muted-foreground">Tell us what to make next</p>
    </Link>
  );
}

export default function HomePage() {
  const latestStories = STORIES.slice(0, 3);

  return (
    <>
      <JsonLd data={websiteJsonLd} />

      {/* ---------------- editorial hero ---------------- */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <Greeting />

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Daily Games
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                Seven free games you can play in your browser — a daily dive where{" "}
                <em>the obvious answer sinks</em>, a reversed climb where it wins, a word
                grid, an estimation quiz, a colour test and a memory classic. One new
                puzzle each, every day, reset at midnight in your own time zone.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/krillion-unblocked"
                className="rounded-full bg-primary px-7 py-3 text-center text-sm font-bold text-primary-foreground transition-all hover:opacity-90 hover:shadow-md"
              >
                Play today&apos;s dive
              </Link>
              <Link
                href="/how-to-play"
                className="rounded-full border border-border bg-card px-7 py-3 text-center text-sm font-bold text-foreground transition-colors hover:border-steel/40 hover:text-steel"
              >
                How to play
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- games by category ---------------- */}
      <section id="games" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-14">
        {GAME_CATEGORIES.map((cat, ci) => (
          <div key={cat.name} className="mt-12 first:mt-0">
            <div className="pb-3">
              <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
                {cat.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{cat.blurb}</p>
            </div>
            <div className="mt-5 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {GAMES.filter((g) => g.category === cat.name).map((g) => (
                <GameCard key={g.slug} game={g} />
              ))}
              {(ci === 0 || ci === GAME_CATEGORIES.length - 1) && <SuggestionCard />}
            </div>
          </div>
        ))}
      </section>

      {/* ---------------- stories ---------------- */}
      <section className="border-y border-border bg-muted/30 py-14">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Stories
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Strategy, rules and behind-the-games writing from the Krillion crew.
              </p>
            </div>
            <Link
              href="/stories"
              className="rounded-full border border-border bg-card px-5 py-2 text-sm font-bold text-foreground transition-colors hover:border-steel/40 hover:text-steel"
            >
              All stories →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestStories.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- what is ---------------- */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What is Krillion Unblocked?
            </h2>
            <p className="mt-4 border-l-2 border-steel pl-4 font-serif text-lg italic leading-relaxed text-foreground/85">
              One in a krillion — our word for an answer so rare that almost nobody else
              finds it before the timer runs out.
            </p>
          </div>
          <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Krillion Unblocked is a collection of seven original free browser games built
              around one daily ritual: a shared puzzle that everyone plays on the same day
              and that resets at midnight in your own time zone. There is nothing to
              install, nothing to sign up for, and nothing to pay — the games load in
              seconds and run entirely on your device.
            </p>
            <p>
              The flagship game flips trivia on its head. Instead of rewarding the answer
              everyone knows, it rewards the answer almost nobody gives: type
              &ldquo;banana&rdquo; and you scrape the seabed, type &ldquo;quince&rdquo; and
              you are suddenly 850 metres closer to the trench. Its mirror game, Noillirk,
              flips the rule back — the most popular answer wins — so you can train both
              ends of your crowd-reading instincts.
            </p>
            <p>
              Around the dailies you will find a word-grid chase, an estimation quiz, a
              colour-perception test and a pattern-memory classic, plus a Stories section
              full of honest strategy writing. Your scores, streaks and personal bests live
              in your browser via local storage — no account, no tracking, no nonsense.
            </p>
          </div>
        </div>

        {/* quick links strip */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              q: "Is it really free?",
              a: "Completely. Every game, every mode, every story — free, forever, with no account needed.",
              href: "/about",
              label: "About the site",
            },
            {
              q: "When does the daily reset?",
              a: "At midnight in your own time zone. Your streak, your clock, your rules.",
              href: "/faq",
              label: "Read the FAQ",
            },
            {
              q: "Does it work on a phone?",
              a: "Yes — every game is built mobile-first with big touch targets.",
              href: "/how-to-play",
              label: "How to play",
            },
          ].map((c) => (
            <Link
              key={c.q}
              href={c.href}
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-steel/40"
            >
              <p className="font-serif font-bold text-foreground">{c.q}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.a}</p>
              <span className="mt-3 inline-block text-sm font-bold text-steel group-hover:underline">
                {c.label} →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <AdSlot format="leaderboard" />
        </div>
      </section>
    </>
  );
}
