import type { Metadata } from "next";
import Link from "next/link";
import { WordHuntGame } from "@/components/games/WordHuntGame";
import { AdSlot } from "@/components/site/AdSlot";
import { CopyTable, Faq, MoreGames, P, SectionTitle, Tips } from "@/components/site/Copy";
import { JsonLd } from "@/components/site/JsonLd";
import { faqJsonLd, videoGameJsonLd } from "@/lib/schema";
import { SITE } from "@/lib/site";

const TITLE = "Word Hunt — Daily 4×4 Word Puzzle Game";
const DESCRIPTION =
  "Play Word Hunt free: link letters on a daily 4×4 grid into words in 90 seconds. Tap or type, score by length, and chase the hidden word count.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/word-hunt" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/word-hunt`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "How does Word Hunt work?",
    a: "You get a 4×4 grid of letters and 90 seconds. Chain horizontally, vertically or diagonally neighbouring letters into words of three letters or more. Every letter of a word must sit next to the previous one, and each tile can be used only once per word.",
  },
  {
    q: "How are words scored?",
    a: "By length: 3-letter words score 1 point, 4 letters score 2, 5 letters score 4, 6 letters score 7, 7 letters score 11, and anything with 8 or more letters scores 15. Long words are worth the risk.",
  },
  {
    q: "Which dictionary does the game use?",
    a: "A built-in list of over 12,000 common English words between three and eight letters — everyday vocabulary rather than obscure Scrabble traps. If a common word is rejected, it is usually because the letters are not connected on the grid.",
  },
  {
    q: "Can I type instead of tapping?",
    a: "Yes. On a keyboard, just type: the game automatically finds a matching chain of connected letters as you type, Backspace undoes a letter, and Enter submits. On a phone, tap the letters one by one and press Submit word.",
  },
  {
    q: "Is the same grid given to everyone?",
    a: "Yes — the daily grid is generated from the date, so every player on Earth meets the same sixteen letters and the same hidden word count. That is what makes the result screen so competitive.",
  },
  {
    q: "What does the 'X were hiding on this grid' line mean?",
    a: "When your run ends, the game counts every dictionary word hidden in today's grid and tells you how many you found. Finding half of them is an excellent day.",
  },
];

export default function WordHuntPage() {
  return (
    <>
      <JsonLd
        data={videoGameJsonLd({
          name: "Word Hunt",
          slug: "word-hunt",
          description:
            "A daily 4×4 letter grid: connect neighbouring letters into words for 90 seconds and score by length.",
          genre: "Word Puzzle",
        })}
      />
      <JsonLd data={faqJsonLd(FAQS)} />

      {/* game first — full-bleed, playdaily style */}
      <WordHuntGame />

      <div className="mx-auto max-w-5xl px-4 pb-10">
<header className="mx-auto max-w-3xl pt-8 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">
            Daily word puzzle · Free
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Word Hunt
          </h1>
          <P>
            One 4×4 grid of letters a day and <strong>90 seconds to shake every word out
            of it.</strong> Link neighbouring letters into words of three or more — longer
            words score steeply, and every player on Earth gets the same grid today.
          </P>
        </header>
        <div className="mt-10">
          <AdSlot format="leaderboard" />
        </div>

        {/* about the hunt — moved under the board */}
        <SectionTitle id="about">Fingers or keyboard, the dictionary decides</SectionTitle>
        <P>
          You can play with your fingers or your keyboard: tap tiles to build a chain, or
          simply type and watch the game find a matching path through the grid for you.
          Either way, the dictionary of 12,000+ common English words is checking every
          submission in real time.
        </P>

        <SectionTitle id="how-to-play">How to play Word Hunt</SectionTitle>
        <ol className="mt-4 max-w-3xl space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          <li>
            <strong className="text-ink">1. Start the hunt.</strong> The grid is generated
            from today&apos;s date — sixteen letters from sixteen custom dice, the same for
            everyone.
          </li>
          <li>
            <strong className="text-ink">2. Build a word.</strong> Tap adjacent tiles one by
            one, or type on a keyboard. A tile can be used once per word, and each next tile
            must touch the previous one in any direction.
          </li>
          <li>
            <strong className="text-ink">3. Submit.</strong> Press Enter or tap Submit word.
            Valid words jump into your found list with their points; invalid ones get a
            gentle on-screen explanation instead.
          </li>
          <li>
            <strong className="text-ink">4. Keep hunting for 90 seconds.</strong> There is no
            penalty for wrong guesses, so keep trying — the clock is the only judge that
            matters.
          </li>
          <li>
            <strong className="text-ink">5. Read the post-game report.</strong> Your score,
            your longest word and — the part players argue about — how many words were
            hiding in the grid in total.
          </li>
        </ol>

        <SectionTitle id="scoring">Scoring table</SectionTitle>
        <P>Points grow faster than word length — the grid rewards ambition:</P>
        <CopyTable
          headers={["Word length", "Points", "Roughly equivalent to"]}
          rows={[
            ["3 letters", "1", "Four 3-letter words"],
            ["4 letters", "2", "—"],
            ["5 letters", "4", "Two 4-letter words"],
            ["6 letters", "7", "Almost four 4-letter words"],
            ["7 letters", "11", "—"],
            ["8+ letters", "15", "Fifteen 3-letter words"],
          ]}
        />
        <P>
          The &ldquo;Qu&rdquo; tile counts as its two letters, so QUARTZ is a six-letter word
          from five tiles. Words are checked against the site&apos;s built-in dictionary of
          common English words; proper nouns, abbreviations and hyphenated forms are not
          included.
        </P>

        <SectionTitle id="tips">Four tips for a bigger haul</SectionTitle>
        <Tips
          items={[
            {
              title: "Hunt prefixes and suffixes first",
              body: "Before the clock starts in your head, scan for -ING, -ED, -S, RE- and UN-. One good stem plus a flexible ending often turns a 4-point word into an 11-point one.",
            },
            {
              title: "Exploit the S",
              body: "Any S on the grid is a multiplier: almost every noun you find can often be pluralised without moving far. Check both directions around every S you spot.",
            },
            {
              title: "Type, don't tap (on a keyboard)",
              body: "Typing is faster than tapping because the game solves the pathfinding for you. If your typed word has any connected chain, it is accepted instantly.",
            },
            {
              title: "Save diagonal monster-hunting for the middle",
              body: "Long words hide where rows meet diagonally. Spend the first minute banking short reliable points, then spend the last thirty seconds chasing the 8-letter spine you noticed.",
            },
          ]}
        />

        <SectionTitle id="faq">Word Hunt FAQ</SectionTitle>
        <div className="mt-5 max-w-3xl space-y-6">
          {FAQS.map((f) => (
            <Faq key={f.q} q={f.q}>
              <p>{f.a}</p>
            </Faq>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-card p-6">
          <h2 className="text-xl font-extrabold tracking-tight text-ink">Keep reading</h2>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-sea-700">
            <li>
              <Link className="hover:underline" href="/krillion-unblocked">
                Play the flagship: Krillion Unblocked →
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/how-to-play#word-hunt">
                Word Hunt rules in the combined guide →
              </Link>
            </li>
          </ul>
        </div>

        <MoreGames exclude={["word-hunt"]} />
      </div>
    </>
  );
}
