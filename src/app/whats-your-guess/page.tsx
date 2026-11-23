import type { Metadata } from "next";
import Link from "next/link";
import { GuessGame } from "@/components/games/GuessGame";
import { AdSlot } from "@/components/site/AdSlot";
import { CopyTable, Faq, MoreGames, P, SectionTitle, Tips } from "@/components/site/Copy";
import { JsonLd } from "@/components/site/JsonLd";
import { faqJsonLd, videoGameJsonLd } from "@/lib/schema";
import { SITE } from "@/lib/site";

const TITLE = "What's Your Guess? — Daily Estimation Game";
const DESCRIPTION =
  "Play What's Your Guess? free: five daily estimation questions, type a number, and score your accuracy percentage. Real answers and explanations revealed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/whats-your-guess" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/whats-your-guess`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "How does scoring work in What's Your Guess?",
    a: "Your accuracy is min(your guess, real answer) divided by max(your guess, real answer), expressed as a percentage — so being close in either direction scores the same. A guess that lands at 87% of the truth earns 87 points. Perfect guesses earn 100.",
  },
  {
    q: "Why do I see the real answer after every question?",
    a: "Because the learning is the game. Each reveal shows the true figure, your accuracy and a one-line explanation, so by question five you genuinely know four new things about the world.",
  },
  {
    q: "Should I guess precisely or round?",
    a: "Round boldly. The scoring only cares about your ratio to the truth, so 'about 8,000' and '7,999' are effectively identical. Spend your energy on the order of magnitude, not the last digit.",
  },
  {
    q: "Are the same questions asked every day?",
    a: "No — five questions are drawn from a bank of estimation puzzles by the date, so every player on the same calendar day gets the same five, and tomorrow brings a new set.",
  },
  {
    q: "What if I have no idea at all?",
    a: "Guess anyway. The scoring is proportional, not pass/fail: even a rough order-of-magnitude guess usually scores 20–50 points, and a pure coin-flip still scores more than an empty answer.",
  },
  {
    q: "Does the daily affect my streak?",
    a: "Streaks live on the flagship Krillion daily. This game saves your own daily result and shows a countdown to the next set — play it in any order you like.",
  },
];

export default function GuessPage() {
  return (
    <>
      <JsonLd
        data={videoGameJsonLd({
          name: "What's Your Guess?",
          slug: "whats-your-guess",
          description:
            "A daily estimation game: five questions, typed guesses scored by percentage accuracy, with the real answer revealed after every question.",
          genre: "Trivia / Estimation",
        })}
      />
      <JsonLd data={faqJsonLd(FAQS)} />

      {/* game first — full-bleed, playdaily style */}
      <GuessGame />

      <div className="mx-auto max-w-5xl px-4 pb-10">
<header className="mx-auto max-w-3xl pt-8 text-center">
          <p className="inline-block rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Daily estimation game · Free
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            What&apos;s Your Guess?
          </h1>
          <P>
            How many keys does a standard piano have? How far is it to the Moon? You will
            never know exactly — and that is the point.{" "}
            <strong>Five estimation questions a day</strong>: type a number, your accuracy
            percentage becomes your score. Being 90% close earns 90 points.
          </P>
        </header>
        <div className="mt-10">
          <AdSlot format="leaderboard" />
        </div>

        {/* about the game — moved under the board */}
        <SectionTitle id="about">Dinner-table superpower included</SectionTitle>
        <P>
          After every answer you see the real figure, how close you landed and a one-line
          explanation — so a five-question round quietly makes you the most interesting
          person at dinner. Nailing a question earns the full 100 points, and the same
          five questions for everyone each day reset at midnight.
        </P>

        <SectionTitle id="how-to-play">How to play</SectionTitle>
        <ol className="mt-4 max-w-3xl list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-muted-foreground marker:text-steel">
          <li>
            <strong className="text-foreground">Read the question.</strong> Five are drawn
            daily from the estimation bank — counts, distances, temperatures, speeds.
          </li>
          <li>
            <strong className="text-foreground">Type one number.</strong> Commas are fine
            (384,400). No units needed — the unit is shown with the answer.
          </li>
          <li>
            <strong className="text-foreground">Lock it in.</strong> There is no timer on
            individual questions; the pressure is entirely self-inflicted.
          </li>
          <li>
            <strong className="text-foreground">See the truth.</strong> The reveal shows the
            real answer, your accuracy percentage as a bar, and a one-line explanation.
          </li>
          <li>
            <strong className="text-foreground">Finish five, get your report.</strong> Your
            total out of 500, your average accuracy and a spoiler-free share box.
          </li>
        </ol>

        <SectionTitle id="scoring">Scoring examples</SectionTitle>
        <CopyTable
          headers={["Truth", "Your guess", "Accuracy", "Points"]}
          rows={[
            ["88 piano keys", "80", "91%", "91"],
            ["88 piano keys", "100", "88%", "88"],
            ["88 piano keys", "44", "50%", "50"],
            ["88 piano keys", "8", "9%", "9"],
            ["88 piano keys", "88", "100%", "100"],
          ]}
        />
        <P>
          Notice that over- and under-guessing score identically: the game measures your
          calibration, not your optimism. That also means the second guess is never
          &ldquo;safer&rdquo; than the first thought — commit and move on.
        </P>

        <SectionTitle id="tips">Three habits of well-calibrated guessers</SectionTitle>
        <Tips
          items={[
            {
              title: "Anchor to something you know",
              body: "A standard keyboard has about 100 keys; a school bus seat fits about 60 kids at a squeeze. Building every estimate from a known object keeps you within striking distance of the truth.",
            },
            {
              title: "Get the zeros right first",
              body: "Almost all accuracy lives in the order of magnitude. Decide whether the answer is tens, hundreds or thousands before you allow yourself a second digit.",
            },
            {
              title: "Split the difference on ranges",
              body: "If your gut says 'between 40 and 80', guessing 60 beats defending either end. Your accuracy curve rewards the middle of your honest range.",
            },
          ]}
        />

        <SectionTitle id="faq">What&apos;s Your Guess? FAQ</SectionTitle>
        <div className="mt-5 max-w-3xl space-y-6">
          {FAQS.map((f) => (
            <Faq key={f.q} q={f.q}>
              <p>{f.a}</p>
            </Faq>
          ))}
        </div>

        <MoreGames exclude={["whats-your-guess"]} />
      </div>
    </>
  );
}
