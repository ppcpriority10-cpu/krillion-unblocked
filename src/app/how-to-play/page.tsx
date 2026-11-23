import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/site/AdSlot";
import { CopyTable, Faq, P, SectionTitle } from "@/components/site/Copy";
import { JsonLd } from "@/components/site/JsonLd";
import { faqJsonLd } from "@/lib/schema";
import { SITE } from "@/lib/site";

const TITLE = "How to Play — Rules for Every Krillion Unblocked Game";
const DESCRIPTION =
  "The combined rulebook for all seven Krillion Unblocked games: Krillion, Noillirk, Krillion City, Word Hunt, What's Your Guess?, Colour Memory and Sequence.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/how-to-play" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/how-to-play`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "Do I need an account to play any of the games?",
    a: "No. Every game on Krillion Unblocked runs in your browser with no sign-up. Scores, streaks and bests are stored in your device's local storage, so your history follows the browser you play in.",
  },
  {
    q: "Do all games reset at midnight?",
    a: "The six dailies (Krillion, Noillirk, Krillion City, Word Hunt, What's Your Guess?, Colour Memory) reset at midnight in your own time zone. Sequence is unlimited and never resets.",
  },
  {
    q: "Can I play the dailies more than once a day?",
    a: "One attempt per daily game per day. Unlimited mode of the flagship answer game exists precisely for when you want more — it has no daily lock.",
  },
  {
    q: "Are the daily puzzles the same for everyone?",
    a: "Yes. Prompts, grids, questions and colours are drawn with a date seed, so every player on the same calendar day gets identical content. Comparing results is the whole fun.",
  },
  {
    q: "Which game should I start with?",
    a: "Krillion Unblocked — it is the flagship and the shortest to learn. Then try Noillirk the same day to play the identical prompts with flipped rules.",
  },
  {
    q: "Do the games work on phones and school computers?",
    a: "Yes — every game is built mobile-first and runs in any modern browser. No downloads, no plugins. Always follow your school or workplace network policies.",
  },
];

export default function HowToPlayPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQS)} />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="max-w-3xl">
          <p className="inline-block rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Rules &amp; guides
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            How to play every game
          </h1>
          <P>
            One page, every rule. Each game below has its own page with the playable game at
            the top and a deeper guide below it — this page is the honest summary, the kind
            you can read in two minutes and play all seven.
          </P>
        </header>

        {/* Krillion */}
        <SectionTitle id="krillion">1. Krillion Unblocked — the daily dive</SectionTitle>
        <P>
          Seven prompts, 25 seconds each, one typed answer per prompt, one attempt per day.
          Answers are scored against a survey-style bank by popularity:{" "}
          <strong>the rarer your answer, the more it scores.</strong> Each point is ten
          metres of depth; 700 points reaches the 7,000 m trench floor.
        </P>
        <CopyTable
          headers={["Tier", "Answer popularity", "Points"]}
          rows={[
            ["One in a Krillion", "1–5 (almost unique)", "100"],
            ["Deep Cut", "6–15", "85"],
            ["Rare", "16–30", "60"],
            ["Schooler", "31–50", "30"],
            ["Too Clever", "51–70", "15"],
            ["Plankton", "71–100 (everyone says it)", "10"],
            ["No Catch", "Not on the board", "0"],
          ]}
        />
        <P>
          Full guide, tips and FAQ live on the{" "}
          <Link className="font-semibold text-steel hover:underline" href="/krillion-unblocked">
            Krillion Unblocked page
          </Link>
          . Unlimited practice runs at{" "}
          <Link className="font-semibold text-steel hover:underline" href="/unlimited">
            /unlimited
          </Link>{" "}
          with no daily lock.
        </P>

        {/* Noillirk */}
        <SectionTitle id="noillirk">2. Noillirk — the reversed climb</SectionTitle>
        <P>
          The same seven daily prompts with the scoring flipped:{" "}
          <strong>the most popular answer wins.</strong> Crowd Favourite (popularity 90–100)
          scores 100, then Headline Act 85, Open Skies 60, Gentle Breeze 30, Drifting Cloud
          15, Faint Whisper 10, No Catch 0. Points become altitude — 7,000 m at a perfect
          game. Play it at{" "}
          <Link className="font-semibold text-steel hover:underline" href="/noillirk">
            /noillirk
          </Link>
          .
        </P>

        {/* Word Hunt */}
        <SectionTitle id="word-hunt">3. Word Hunt — the 4×4 grid</SectionTitle>
        <P>
          You get a 4×4 letter grid and 90 seconds. Chain horizontally, vertically or
          diagonally adjacent letters into words of three or more letters; each tile can be
          used once per word. Tap tiles or simply type on a keyboard — the game finds the
          path for you. Score by length:
        </P>
        <CopyTable
          headers={["Length", "3", "4", "5", "6", "7", "8+"]}
          rows={[["Points", "1", "2", "4", "7", "11", "15"]]}
        />
        <P>
          The dictionary holds over 12,000 common English words (Qu counts as its two
          letters). The daily grid is identical for everyone, and the post-game report tells
          you how many words were hiding. Play at{" "}
          <Link className="font-semibold text-steel hover:underline" href="/word-hunt">
            /word-hunt
          </Link>
          .
        </P>

        {/* Guess */}
        <SectionTitle id="whats-your-guess">4. What&apos;s Your Guess? — estimation</SectionTitle>
        <P>
          Five estimation questions a day. Type one number per question; your accuracy —
          min(guess, truth) ÷ max(guess, truth) — becomes your points out of 100 each, 500
          total. The real answer, your accuracy bar and a one-line explanation appear after
          every question. Play at{" "}
          <Link className="font-semibold text-steel hover:underline" href="/whats-your-guess">
            /whats-your-guess
          </Link>
          .
        </P>

        {/* Colour Memory */}
        <SectionTitle id="colour-memory">5. Colour Memory — match the shade</SectionTitle>
        <P>
          A colour is shown for three seconds, then hidden. Recreate it with red, green and
          blue sliders (0–255 each) and lock in. Your round score is the match percentage
          across the RGB cube — 100% is a perfect recreation. Five rounds a day, 500 points
          maximum. Play at{" "}
          <Link className="font-semibold text-steel hover:underline" href="/colour-memory">
            /colour-memory
          </Link>
          .
        </P>

        {/* Sequence */}
        <SectionTitle id="sequence">6. Sequence — the memory ladder</SectionTitle>
        <P>
          Four pads flash a pattern; echo it back in order and it grows by one step, with
          playback speeding up as you climb. One wrong press ends the run, and your score is
          the longest sequence you fully repeated. Unlimited play, personal best stored
          locally, numbered pads so you can memorise patterns as digit strings. Play at{" "}
          <Link className="font-semibold text-steel hover:underline" href="/sequence">
            /sequence
          </Link>
          .
        </P>

        {/* Krillion City */}
        <SectionTitle id="krillion-city">7. Krillion City — the climb up</SectionTitle>
        <P>
          The same seven daily prompts as Krillion, with the same daily deck and the same
          rule: <strong>the rarer your answer, the more it scores.</strong> The six scoring
          tiers are identical — only the direction changes. Each point is ten metres of
          height instead of depth, so 700 points lifts you to the 7,000 m top of the
          skyline. Play it at{" "}
          <Link className="font-semibold text-steel hover:underline" href="/krillion-city">
            /krillion-city
          </Link>
          .
        </P>

        {/* Shared rules */}
        <SectionTitle id="shared">Rules every game shares</SectionTitle>
        <ul className="mt-4 max-w-3xl list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground marker:text-steel">
          <li>Daily puzzles are generated from your local date — same content, same day, for everyone.</li>
          <li>One attempt per daily; your result is saved in your browser&apos;s local storage.</li>
          <li>Streaks count consecutive calendar days of the Krillion daily on your device.</li>
          <li>Share texts are always spoiler-free: tier squares and totals, never answers.</li>
          <li>No accounts, no tracking, no third-party calls — the site works entirely from its own files.</li>
        </ul>

        <SectionTitle id="faq">Quick FAQ</SectionTitle>
        <div className="mt-5 max-w-3xl space-y-6">
          {FAQS.map((f) => (
            <Faq key={f.q} q={f.q}>
              <p>{f.a}</p>
            </Faq>
          ))}
        </div>

        <div className="mt-12">
          <AdSlot format="leaderboard" />
        </div>
      </div>
    </>
  );
}
