import type { Metadata } from "next";
import Link from "next/link";
import { NoillirkGame } from "@/components/games/NoillirkGame";
import { AdSlot } from "@/components/site/AdSlot";
import { CopyTable, Faq, MoreGames, P, SectionTitle, Tips } from "@/components/site/Copy";
import { JsonLd } from "@/components/site/JsonLd";
import { faqJsonLd, videoGameJsonLd } from "@/lib/schema";
import { SITE } from "@/lib/site";

const TITLE = "Noillirk — The Reverse Daily Answer Game";
const DESCRIPTION =
  "Noillirk is Krillion upside down: the MOST common answer scores highest. Same seven daily prompts, reversed tiers, free and no login needed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/noillirk" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/noillirk`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "What is Noillirk?",
    a: "Noillirk is the reversed twin of Krillion Unblocked — 'Krillion' spelled backwards, fittingly. You face the same seven daily prompts, but the scoring is flipped: the most popular answer in the bank scores 100 points, and rarity scores almost nothing.",
  },
  {
    q: "Is it easier than Krillion Unblocked?",
    a: "It feels easier at first, because the winning answers are the ones you already know. The difficulty is trust: after days of hunting rare answers, typing 'banana' on purpose feels like a trap. The real skill is predicting exactly how big the crowd is.",
  },
  {
    q: "Do Noillirk and Krillion share the same prompts?",
    a: "Yes — both games draw the same seven prompts from the same date seed, so you can play the identical set twice with opposite goals. It is the best crowd-reading workout on the site.",
  },
  {
    q: "What are the Noillirk tiers?",
    a: "Crowd Favourite (100 points) for the answers almost everyone gives, then Headline Act (85), Open Skies (60), Gentle Breeze (30), Drifting Cloud (15), Faint Whisper (10) and No Catch (0) for answers not on the board.",
  },
  {
    q: "When does Noillirk reset?",
    a: "At midnight in your own local time zone, exactly like the other daily games. The result screen counts down to the next launch.",
  },
  {
    q: "Does Noillirk have an Unlimited mode?",
    a: "No — Unlimited exists only for Krillion, where rarity practice needs volume. For Noillirk, one daily climb is plenty; your best warm-up is simply imagining what a hundred strangers would say.",
  },
];

export default function NoillirkPage() {
  return (
    <>
      <JsonLd
        data={videoGameJsonLd({
          name: "Noillirk",
          slug: "noillirk",
          description:
            "The reversed daily answer game: the most common answer wins. Same prompts as Krillion Unblocked, flipped scoring, sky-high altitude meter.",
          genre: "Word / Trivia",
        })}
      />
      <JsonLd data={faqJsonLd(FAQS)} />

      {/* game first — full-bleed, playdaily style */}
      <NoillirkGame />

      <div className="mx-auto max-w-5xl px-4 pb-10">
<header className="mx-auto max-w-3xl pt-8 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-sky-800">
            Daily answer game · Reversed rules
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">
            Noillirk
          </h1>
          <P>
            Krillion Unblocked turned upside down: same seven daily prompts, same
            25-second timer, same answer bank — but{" "}
            <strong>the most common answer now scores the most.</strong> If the dive
            rewards the loquat, the climb rewards the banana.
          </P>
        </header>
        <div className="mt-10">
          <AdSlot format="leaderboard" />
        </div>

        {/* about the climb — moved under the board */}
        <SectionTitle id="about">Riding the crowd upward</SectionTitle>
        <P>
          Every point is still ten metres — this time of <strong>altitude</strong> — and a
          perfect game floats you to 7,000 metres. Points come from guessing not what is
          rare, but what is universal: the answer a hundred strangers would give before
          you finish reading the question. Where Krillion is a deep-sea dive for rare
          pearls, Noillirk is a hot-air balloon ride straight into the middle of the
          crowd.
        </P>

        <SectionTitle id="how-to-play">How to play Noillirk</SectionTitle>
        <ol className="mt-4 max-w-3xl space-y-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          <li>
            <strong className="text-ink">1. Launch the balloon.</strong> The daily is ready
            from midnight, local time. Same prompts as today&apos;s Krillion dive — flipped
            goal.
          </li>
          <li>
            <strong className="text-ink">2. Read the prompt and think crowd.</strong> Ask
            yourself: &ldquo;What would most people say in the first two seconds?&rdquo;
          </li>
          <li>
            <strong className="text-ink">3. Type one answer in 25 seconds.</strong> The
            obvious pick is now the smart pick — but only if it is genuinely the most
            popular one on the board.
          </li>
          <li>
            <strong className="text-ink">4. Read the reveal.</strong> Tiers show how close
            to the crowd&apos;s centre your answer landed, from Crowd Favourite down to
            Faint Whisper.
          </li>
          <li>
            <strong className="text-ink">5. Climb through seven prompts.</strong> One
            attempt per day; your altitude accumulates with every point.
          </li>
          <li>
            <strong className="text-ink">6. Share without spoilers.</strong> The share text
            shows tier squares only — the actual answers never leave your browser.
          </li>
        </ol>

        <SectionTitle id="scoring">Scoring: the reversed tiers</SectionTitle>
        <P>
          The popularity scale is identical to Krillion&apos;s — 1 means almost nobody says
          it, 100 means nearly everyone does. Noillirk simply reads the scale from the top:
        </P>
        <CopyTable
          headers={["Tier", "How common the answer is", "Points"]}
          rows={[
            ["Crowd Favourite", "Popularity 90–100 — the answer everyone gives", "100"],
            ["Headline Act", "Popularity 75–89 — right at the front of the crowd's mind", "85"],
            ["Open Skies", "Popularity 55–74 — comfortably popular", "60"],
            ["Gentle Breeze", "Popularity 35–54 — somewhere mid-pack", "30"],
            ["Drifting Cloud", "Popularity 15–34 — only a few others said it", "15"],
            ["Faint Whisper", "Popularity 1–14 — a lonely answer today", "10"],
            ["No Catch", "Not on the answer board", "0"],
          ]}
        />
        <P>
          The trap in Noillirk is over-thinking. After a week of Krillion, players
          instinctively reach for the rare shelf and land a Faint Whisper worth ten points
          when Crowd Favourite was sitting right there. The second trap is over-correcting:
          &ldquo;dog&rdquo; feels like the most popular pet, but on a board built from a real
          survey crowd, &ldquo;fish&rdquo; often out-swims it. Trust the survey, not your
          stereotype of the survey.
        </P>

        <SectionTitle id="tips">Three tips for a higher climb</SectionTitle>
        <Tips
          items={[
            {
              title: "Play Krillion first, then Noillirk",
              body: "Taking the dive before the climb shows you both ends of the same seven prompts. The prompts you over-thought on the way down are exactly the ones to simplify on the way up.",
            },
            {
              title: "Say it out loud in one word",
              body: "The crowd's answer is usually the first single word a stranger would blurt. Two-word answers score — but only when they are the everyday phrase ('orange juice'), not a clever one.",
            },
            {
              title: "Watch your Faint Whispers",
              body: "A Faint Whisper in Noillirk is a Deep Cut in disguise. Log which of your instincts are rare-biased; those are the instincts to mute during the climb.",
            },
          ]}
        />

        <SectionTitle id="faq">Noillirk FAQ</SectionTitle>
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
                Play the original: Krillion Unblocked →
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/stories/how-to-play-krillion-unblocked">
                How the tier system works →
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/how-to-play">
                Rules for every game on the site →
              </Link>
            </li>
          </ul>
        </div>

        <MoreGames exclude={["noillirk"]} />
      </div>
    </>
  );
}
