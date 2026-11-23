import type { Metadata } from "next";
import { KrillionGame } from "@/components/games/KrillionGame";
import { AdSlot } from "@/components/site/AdSlot";
import { Faq, MoreGames, P, SectionTitle, Tips } from "@/components/site/Copy";
import { JsonLd } from "@/components/site/JsonLd";
import { faqJsonLd, videoGameJsonLd } from "@/lib/schema";
import { SITE } from "@/lib/site";

const TITLE = "Krillion Unlimited — Endless Answer Game Practice";
const DESCRIPTION =
  "Krillion Unlimited is the endless practice mode of Krillion Unblocked: unlimited prompts, no daily lock, same rare-answer scoring. Free, no login.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/unlimited" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/unlimited`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "What is Krillion Unlimited?",
    a: "It is the endless practice mode of Krillion Unblocked. You get the same prompts and the same rarity scoring as the daily game, but there is no limit of seven, no one-attempt rule and no shared puzzle — just prompt after prompt for as long as you want.",
  },
  {
    q: "Does Unlimited use the same answer bank as the daily?",
    a: "Yes. Every prompt, every accepted answer and every popularity score is identical to the daily game, so whatever you learn here pays off directly in tomorrow's dive.",
  },
  {
    q: "Is there a time limit per prompt?",
    a: "Yes — 25 seconds per prompt, exactly like the daily dive. The timer keeps Unlimited honest and stops you from searching the web for the perfect answer.",
  },
  {
    q: "Do Unlimited scores affect my streak?",
    a: "No. Streaks belong to the daily game only. Unlimited tracks a session score and an all-time personal best inside your browser, and the two never mix.",
  },
  {
    q: "How do I get a high score in Unlimited?",
    a: "Survive as many prompts as you can without No Catch answers. Session score accumulates across every prompt, so long runs of Rare-and-deeper answers beat short lucky streaks.",
  },
];

export default function UnlimitedPage() {
  return (
    <>
      <JsonLd
        data={videoGameJsonLd({
          name: "Krillion Unlimited",
          slug: "unlimited",
          description:
            "The endless practice mode of Krillion Unblocked: unlimited prompts, identical rarity scoring, no daily lock, free in your browser.",
          genre: "Word / Trivia",
        })}
      />
      <JsonLd data={faqJsonLd(FAQS)} />

      {/* game first — full-bleed, playdaily style */}
      <KrillionGame mode="unlimited" />

      <div className="mx-auto max-w-5xl px-4 pb-10">
<header className="mx-auto max-w-3xl pt-8 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-orange-800">
            Unlimited mode · Always open
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Krillion Unlimited
          </h1>
          <P>
            The daily dive is precious: one attempt, seven prompts, midnight closure.
            Unlimited is the opposite — an <strong>endless conveyor of prompts</strong> from
            exactly the same answer bank, scored by exactly the same tiers. No lock, no
            wait, no pressure.
          </P>
        </header>
        <div className="mt-10">
          <AdSlot format="leaderboard" />
        </div>

        {/* about the mode — moved under the board */}
        <SectionTitle id="about">Train the instinct before the dive</SectionTitle>
        <P>
          Unlimited exists so that when tomorrow&apos;s dive arrives, your rarity instinct
          has already been to the gym. Session score accumulates for as long as you keep
          going, your personal best is remembered in this browser, and the reveal after
          every answer quietly teaches you where the crowd&apos;s mind stops and the deep
          water starts.
        </P>

        <SectionTitle id="how-it-works">How Unlimited works</SectionTitle>
        <P>
          Press start and the game shuffles the whole prompt bank. Each prompt gives you 25
          seconds and one answer; the reveal shows your tier, your points and a running
          session total. There is no finish line — you end the run by simply leaving, and
          the next visit starts a fresh session with a brand new shuffle. When the deck
          runs dry it reshuffles automatically, so you will meet prompts again in a new
          order rather than in a predictable loop.
        </P>
        <P>
          Because the scoring engine is shared with the daily game, Unlimited is the most
          honest practice partner possible: a &ldquo;Deep Cut&rdquo; here means exactly what
          it means there, and the tier hints you read after each answer are the same hints
          you will ride tomorrow. If you want a structured warm-up, try sets of ten: check
          how many landed Rare or better, then beat that number in the next set.
        </P>

        <SectionTitle id="tips">Getting the most out of practice</SectionTitle>
        <Tips
          items={[
            {
              title: "Drill your weakest category",
              body: "If food prompts keep fishing Plankton out of you, stay in the kitchen: Unlimited will feed you every food prompt in the bank until the rare shelves feel familiar.",
            },
            {
              title: "Chase consistency, not single lucky hits",
              body: "One Deep Cut is luck; ten consecutive Schoolers are a skill. Long sessions smooth out the luck and show you your real average.",
            },
            {
              title: "Read every hint like a coach",
              body: "The hint under each tier badge describes how common your answer really was. Over a session, those hints sketch a map of the crowd's mind that the daily game never shows.",
            },
            {
              title: "Stop before you get sloppy",
              body: "Rarity judgement fades with fatigue. Two focused sets of ten beat one distracted fifty — end the session while your guesses are still deliberate.",
            },
          ]}
        />

        <SectionTitle id="faq">Unlimited mode FAQ</SectionTitle>
        <div className="mt-5 max-w-3xl space-y-6">
          {FAQS.map((f) => (
            <Faq key={f.q} q={f.q}>
              <p>{f.a}</p>
            </Faq>
          ))}
        </div>

        <MoreGames exclude={["krillion-unblocked"]} />
      </div>
    </>
  );
}
