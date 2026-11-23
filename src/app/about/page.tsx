import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/site/AdSlot";
import { P, SectionTitle } from "@/components/site/Copy";
import { SITE } from "@/lib/site";

const TITLE = "About — Krillion Unblocked";
const DESCRIPTION =
  "The story behind Krillion Unblocked: seven original free daily browser games, a local-first philosophy, and why the obvious answer is never the right one.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/about`,
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="inline-block rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          About
        </p>
        <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          About Krillion Unblocked
        </h1>
      </header>

      <div className="mt-6 max-w-3xl space-y-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
        <P>
          Krillion Unblocked started with a small annoyance: trivia games reward the people
          who memorise facts, not the people who think interestingly. Knowing that a banana
          is a fruit tells us nothing about you; knowing that your mind goes to quince when
          everyone else is reaching for apples — that is a personality trait. The flagship
          game was built to measure exactly that, and the rest of the site grew around it.
        </P>
        <P>
          The name is a quiet pun. A &ldquo;krillion&rdquo; is our invented unit for the
          rarity of an answer — one in a krillion means the thought that almost nobody else
          has. The squid in the logo is its mascot: a creature that lives deep, where the
          rare answers swim. Every point you earn is ten metres of depth, and a perfect
          game touches the trench floor at 7,000 metres.
        </P>
      </div>

      <SectionTitle id="philosophy">What we believe a games site owes you</SectionTitle>
      <div className="mt-4 max-w-3xl space-y-5">
        <P>
          <strong className="text-foreground">Instant play.</strong> No account, no download,
          no cookie wall, no newsletter interstitial. Click a game and you are playing within
          seconds, on a phone or a decade-old laptop.
        </P>
        <P>
          <strong className="text-foreground">Honest dailies.</strong> Everyone gets the same
          puzzle on the same calendar day, scored by the same rules, resetting at midnight in
          your own time zone. Results are spoiler-free so sharing never ruins a friend&apos;s
          puzzle.
        </P>
        <P>
          <strong className="text-foreground">Local-first privacy.</strong> Your scores,
          streaks and bests live in your browser&apos;s local storage. The site has no
          accounts, no analytics, no tracking scripts and no third-party requests. What you
          play stays on your device.
        </P>
        <P>
          <strong className="text-foreground">Original everything.</strong> The games, the
          words, the rules and the art are our own — no borrowed assets, no scraped content,
          no cloned puzzles. The concepts may be familiar genres; the execution is ours.
        </P>
      </div>

      <SectionTitle id="what-is-here">What is on the site</SectionTitle>
      <div className="mt-4 max-w-3xl space-y-5">
        <P>
          Seven games: the flagship{" "}
          <Link className="font-semibold text-steel hover:underline" href="/krillion-unblocked">
            Krillion Unblocked
          </Link>{" "}
          and its endless{" "}
          <Link className="font-semibold text-steel hover:underline" href="/unlimited">
            Unlimited
          </Link>{" "}
          mode, the reversed{" "}
          <Link className="font-semibold text-steel hover:underline" href="/noillirk">
            Noillirk
          </Link>
          , the skyline climb{" "}
          <Link className="font-semibold text-steel hover:underline" href="/krillion-city">
            Krillion City
          </Link>
          , the daily{" "}
          <Link className="font-semibold text-steel hover:underline" href="/word-hunt">
            Word Hunt
          </Link>{" "}
          grid, the estimation quiz{" "}
          <Link className="font-semibold text-steel hover:underline" href="/whats-your-guess">
            What&apos;s Your Guess?
          </Link>
          , the perception test{" "}
          <Link className="font-semibold text-steel hover:underline" href="/colour-memory">
            Colour Memory
          </Link>{" "}
          and the unlimited{" "}
          <Link className="font-semibold text-steel hover:underline" href="/sequence">
            Sequence
          </Link>
          . Around them: a{" "}
          <Link className="font-semibold text-steel hover:underline" href="/stories">
            Stories
          </Link>{" "}
          section with genuine strategy writing, a{" "}
          <Link className="font-semibold text-steel hover:underline" href="/how-to-play">
            combined rulebook
          </Link>{" "}
          and an{" "}
          <Link className="font-semibold text-steel hover:underline" href="/faq">
            FAQ
          </Link>{" "}
          that answers real questions.
        </P>
        <P>
          The games keep growing: new prompts, new questions and new stories are added
          regularly, and suggestions from players become content. If an answer you love is
          missing from the board, tell us — it might join the krillion.
        </P>
      </div>

      <div className="mt-12 max-w-3xl">
        <AdSlot format="leaderboard" />
      </div>
    </div>
  );
}
