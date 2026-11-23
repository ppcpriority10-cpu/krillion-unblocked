import type { Metadata } from "next";
import Link from "next/link";
import { KrillionGame } from "@/components/games/KrillionGame";
import { AdSlot } from "@/components/site/AdSlot";
import { CopyTable, Faq, MoreGames, P, SectionTitle, Tips } from "@/components/site/Copy";
import { JsonLd } from "@/components/site/JsonLd";
import { faqJsonLd, videoGameJsonLd } from "@/lib/schema";
import { SITE } from "@/lib/site";

const TITLE = "Krillion Unblocked — Play the Daily Answer Game";
const DESCRIPTION =
  "Play Krillion Unblocked free: 7 daily prompts, 25 seconds each, and the rarest answer wins. Tiers, depth meter, streaks and an Unlimited practice mode.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/krillion-unblocked" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/krillion-unblocked`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "Is Krillion Unblocked free to play?",
    a: "Yes — completely free, with no account, no download and no hidden paywall. The game runs entirely in your browser and your scores are stored on your own device.",
  },
  {
    q: "When does the daily game reset?",
    a: "At midnight in your own local time zone. After you finish, the result screen shows a countdown to the next dive. Streaks count consecutive calendar days on your device's clock.",
  },
  {
    q: "What does 'One in a Krillion' mean?",
    a: "It is the top tier: 100 points for an answer so rare that almost nobody in our survey crowd gave it. Answers are scored on a popularity scale from 1 (nearly unique) to 100 (the first word everyone blurts out).",
  },
  {
    q: "Why did my answer score zero?",
    a: "A 'No Catch' means your answer was not on the answer board for that prompt at all. The board is broad — hundreds of answers across the bank — but it cannot contain everything. Light plural and spelling variations are matched automatically.",
  },
  {
    q: "Can I play Krillion Unblocked on my phone?",
    a: "Yes. The game is built mobile-first: big touch targets, a comfortable keyboard layout and a timer that is easy to read at a glance. It works in any modern browser on phones, tablets, laptops and school computers.",
  },
  {
    q: "What is the difference between Daily and Unlimited?",
    a: "Daily is the shared puzzle: the same seven prompts for everyone, one attempt, streaks and a spoiler-free share text. Unlimited feeds you endless prompts from the same answer bank with no daily lock — perfect for practice.",
  },
  {
    q: "Can I play yesterday's Krillion?",
    a: "No. Each day's puzzle exists only on that day, which keeps the shared challenge fair. Your history is summarised by your streak, and Unlimited mode is always there when you want more prompts.",
  },
];

export default function KrillionPage() {
  return (
    <>
      <JsonLd
        data={videoGameJsonLd({
          name: "Krillion Unblocked",
          slug: "krillion-unblocked",
          description:
            "A daily answer game where uncommon answers score highest. Seven prompts, 25 seconds each, six scoring tiers and a 7,000-metre depth meter.",
          genre: "Word / Trivia",
        })}
      />
      <JsonLd data={faqJsonLd(FAQS)} />

      {/* game first — full-bleed, playdaily style */}
      <KrillionGame mode="daily" />

      <div className="mx-auto max-w-5xl px-4 pb-10">
<header className="mx-auto max-w-3xl pt-8 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-steel">
            Daily answer game · Free
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Krillion Unblocked
          </h1>
          <P>
            The most obvious answer scores the least, and the rarest answer scores the
            most. Seven prompts, 25 seconds each, one answer per prompt — and one attempt
            a day. Everyone playing today gets the same seven prompts.
          </P>
        </header>
        <div className="mt-10">
          <AdSlot format="leaderboard" />
        </div>

        {/* about the game — moved under the board */}
        <SectionTitle id="about">What makes the dive addictive</SectionTitle>
        <P>
          Krillion Unblocked is a daily answer game with a simple twist that changes
          everything: <strong>the most obvious answer scores the least, and the rarest
          answer scores the most.</strong> One attempt a day, so every choice matters —
          and comparing depth meters with friends is irresistibly unfair.
        </P>
        <P>
          Every point you earn is ten metres of depth. A perfect game reaches 7,000 metres
          — the floor of the trench and the home of the krillion. Most good dives land
          between 1,500 and 4,500 metres; great ones keep going. Below the game you will
          find the full rules, the tier table, honest tips and answers to every question
          new divers ask.
        </P>

        {/* how to play */}
        <SectionTitle id="how-to-play">How to play Krillion Unblocked</SectionTitle>
        <P>A full dive takes about three minutes. Here is the whole flow, step by step:</P>
        <ol className="mt-4 max-w-3xl space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          <li>
            <strong className="text-ink">1. Start today&apos;s dive.</strong> Press the
            button on the game card. You get seven prompts drawn from the answer bank — the
            same seven for every player on the same calendar day.
          </li>
          <li>
            <strong className="text-ink">2. Read the prompt.</strong> Something like
            &ldquo;Name a fruit&rdquo; or &ldquo;Name something people are afraid of&rdquo;.
            The timer ring starts draining immediately — you have 25 seconds.
          </li>
          <li>
            <strong className="text-ink">3. Type one single answer.</strong> Not a list, not
            a sentence. If the timer dies first, the prompt scores zero and the dive moves
            on. Press Enter or tap Submit when you are happy.
          </li>
          <li>
            <strong className="text-ink">4. See your tier.</strong> The reveal shows which
            of the six tiers your answer landed in, how many points it earned and a hint
            about how the crowd behaves. Then you choose when to continue.
          </li>
          <li>
            <strong className="text-ink">5. Repeat until prompt seven.</strong> Your depth
            climbs with every point. There is no way to go back and change an answer —
            choose like it matters.
          </li>
          <li>
            <strong className="text-ink">6. Collect your result.</strong> The result screen
            shows your score out of 700, your depth, a tier square for each prompt and your
            streak. The share box copies a spoiler-free result — no answers, ever.
          </li>
        </ol>

        {/* scoring */}
        <SectionTitle id="scoring">Scoring and the six tiers</SectionTitle>
        <P>
          Every accepted answer in our bank carries a popularity score from 1 to 100 based
          on how commonly a survey crowd gives it. Your answer&apos;s popularity decides its
          tier and points. Plurals and small spelling variations are matched automatically,
          so &ldquo;tomatoes&rdquo; scores the same as &ldquo;tomato&rdquo;.
        </P>
        <CopyTable
          headers={["Tier", "How common the answer is", "Points"]}
          rows={[
            ["One in a Krillion", "Popularity 1–5 — almost nobody says it", "100"],
            ["Deep Cut", "Popularity 6–15 — genuinely rare", "85"],
            ["Rare", "Popularity 16–30 — nicely uncommon", "60"],
            ["Schooler", "Popularity 31–50 — solid mid-crowd", "30"],
            ["Too Clever", "Popularity 51–70 — more common than you thought", "15"],
            ["Plankton", "Popularity 71–100 — everyone says it", "10"],
            ["No Catch", "Not on the answer board", "0"],
          ]}
        />
        <P>
          Points convert to depth at ten metres per point, so 700 points reaches the full
          7,000 metres. The animated depth meter fills as your total grows, passing the
          sunlight zone, the twilight zone, midnight zone, abyss and finally the trench. A
          &ldquo;Too Clever&rdquo; is the tier that teaches the most: it means your answer
          was on the board but far more popular than your instinct claimed.
        </P>

        {/* tips */}
        <SectionTitle id="tips">Six tips to dive deeper today</SectionTitle>
        <Tips
          items={[
            {
              title: "Let the obvious answer pass",
              body: "Whatever arrives first — banana, lion, Christmas — is what a million people type. Name it silently, then reach one branch lower: a variety, a cousin, a region.",
            },
            {
              title: "Go from category to member",
              body: "The crowd answers in categories; the depth lives in specific members. Fruit → not apple but loquat. Instrument → not guitar but ocarina. Specificity is the single most reliable points-gainer.",
            },
            {
              title: "Borrow from other cuisines and languages",
              body: "Bread prompts love lavash and injera. Drink prompts love lassi and horchata. Food culture outside your own is a deep-cut farm that never runs out.",
            },
            {
              title: "Use the full 25 seconds on hard prompts",
              body: "An answer at second 23 scores exactly like one at second 3 — but is usually two tiers rarer, because you had to dig for it. Fast is only good when the fast answer is already rare.",
            },
            {
              title: "Respect Plankton on a risky hunch",
              body: "Ten sure points beat a hoped-for No Catch-turned-zero. If your exotic answer is really an invented word, take the safe on-board answer and keep the depth.",
            },
            {
              title: "Train in Unlimited before you dive",
              body: "Unlimited mode uses the same bank with no daily lock. Twenty practice prompts teaching your rarity instinct will do more for tomorrow's score than any lucky guess today.",
            },
          ]}
        />

        {/* faq */}
        <SectionTitle id="faq">Krillion Unblocked FAQ</SectionTitle>
        <div className="mt-5 max-w-3xl space-y-6">
          {FAQS.map((f) => (
            <Faq key={f.q} q={f.q}>
              <p>{f.a}</p>
            </Faq>
          ))}
        </div>

        {/* related reading */}
        <div className="mt-12 rounded-3xl border border-border bg-card p-6">
          <h2 className="text-xl font-extrabold tracking-tight text-ink">Keep reading</h2>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-sea-700">
            <li>
              <Link className="hover:underline" href="/stories/how-to-play-krillion-unblocked">
                How to Play Krillion Unblocked: Rules, Scoring and Tiers →
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/stories/when-does-krillion-unblocked-reset">
                When Does Krillion Unblocked Reset? Daily Reset Times Explained →
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/stories/ten-tips-rarer-answers">
                10 Tips to Find Rarer Answers and Score Higher →
              </Link>
            </li>
          </ul>
        </div>

        <MoreGames exclude={["krillion-unblocked"]} />
      </div>
    </>
  );
}
