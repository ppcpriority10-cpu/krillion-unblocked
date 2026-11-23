import type { Metadata } from "next";
import Link from "next/link";
import { SequenceGame } from "@/components/games/SequenceGame";
import { AdSlot } from "@/components/site/AdSlot";
import { CopyTable, Faq, MoreGames, P, SectionTitle, Tips } from "@/components/site/Copy";
import { JsonLd } from "@/components/site/JsonLd";
import { faqJsonLd, videoGameJsonLd } from "@/lib/schema";
import { SITE } from "@/lib/site";

const TITLE = "Sequence — Memory Pattern Game";
const DESCRIPTION =
  "Play Sequence free: watch flashing colour pads, repeat the pattern, and grow it one step at a time. Unlimited play with personal bests saved locally.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/sequence" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/sequence`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "How does Sequence work?",
    a: "Four pads flash a pattern, one step at a time. Repeat it back in the exact order and the pattern grows by one random step. Every successful round makes the sequence longer and the playback slightly faster. One wrong press ends the run.",
  },
  {
    q: "What is a good score?",
    a: "Your score is the longest sequence you fully repeated. Most first runs end around 6–8; double digits means you chunk the pattern rather than watching individual flashes. The all-time personal best is stored in your browser.",
  },
  {
    q: "Does the pattern get faster?",
    a: "Yes. Playback speed steps up as the sequence grows, which is where most runs actually die — not on memory, but on the panic of a pattern that will not slow down.",
  },
  {
    q: "Is there a daily limit?",
    a: "No. Sequence is the site's unlimited game: play as many runs as you like, whenever you like. Your best is remembered on your device.",
  },
  {
    q: "Can I play with sound off?",
    a: "Yes — sound can be toggled from the start screen. Each pad plays its own tone, and many players find the melody helps memory more than the colours do. Try both.",
  },
  {
    q: "Why do the pads show numbers?",
    a: "The pads are numbered 1–4 so you can also memorise patterns as digit strings ('3-1-1-4') instead of colours. Use whichever encoding your brain prefers — or alternate to keep it honest.",
  },
];

export default function SequencePage() {
  return (
    <>
      <JsonLd
        data={videoGameJsonLd({
          name: "Sequence",
          slug: "sequence",
          description:
            "An unlimited memory game: watch a growing pattern of flashing pads, echo it back, and climb as it speeds up.",
          genre: "Brain / Memory",
        })}
      />
      <JsonLd data={faqJsonLd(FAQS)} />

      {/* game first — full-bleed, playdaily style */}
      <SequenceGame />

      <div className="mx-auto max-w-5xl px-4 pb-10">
<header className="mx-auto max-w-3xl pt-8 text-center">
          <p className="inline-block rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Memory game · Unlimited play
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sequence
          </h1>
          <P>
            The oldest memory trick in the arcade, rebuilt cleanly: four pads, a pattern
            that grows by one step every round, and a playback that{" "}
            <strong>gets faster the deeper you go</strong>. One wrong press ends the run.
          </P>
        </header>
        <div className="mt-10">
          <AdSlot format="leaderboard" />
        </div>

        {/* about the game — moved under the board */}
        <SectionTitle id="about">No midnight reset — just practice</SectionTitle>
        <P>
          Unlike the site&apos;s dailies there is no midnight reset here: Sequence is
          unlimited practice, the perfect two-minute cool-down after the Krillion dive.
          Watch the flashes, echo them back in order, and survive as long as your working
          memory holds. Your longest run is remembered in your browser, and the share box
          keeps the bragging rights spoiler-free.
        </P>

        <SectionTitle id="how-to-play">How to play</SectionTitle>
        <ol className="mt-4 max-w-3xl list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-muted-foreground marker:text-steel">
          <li>
            <strong className="text-foreground">Press start.</strong> One pad flashes — that
            is level one. Tap it back.
          </li>
          <li>
            <strong className="text-foreground">Watch each new step.</strong> The full
            pattern replays from the beginning every round, now one step longer.
          </li>
          <li>
            <strong className="text-foreground">Repeat in exact order.</strong> Partially
            correct does not exist: the run continues only on a perfect echo.
          </li>
          <li>
            <strong className="text-foreground">Feel the speed.</strong> Every few levels the
            flashes get quicker. Breathe; the rhythm helps more than haste.
          </li>
          <li>
            <strong className="text-foreground">Bank your best.</strong> When the pattern
            breaks, your longest completed sequence is scored and compared to your personal
            best.
          </li>
        </ol>

        <SectionTitle id="scoring">Score ladder</SectionTitle>
        <CopyTable
          headers={["Longest sequence", "What it says about you"]}
          rows={[
            ["1–4", "Warming up — everyone starts here."],
            ["5–7", "Average working memory. Respectable."],
            ["8–11", "You are chunking, not counting. Well done."],
            ["12–15", "Serious focus. Consider touring."],
            ["16+", "We suspect you have a system. Tell us in the Stories comments."],
          ]}
        />
        <P>
          The classic technique is chunking: convert colours into a story (&ldquo;teal walked
          the dog, rose rang the bell&rdquo;) or a number string, and remember the story
          instead of the flashes. The numbered pads exist exactly for this.
        </P>

        <SectionTitle id="tips">Three ways to stretch your memory</SectionTitle>
        <Tips
          items={[
            {
              title: "Encode as digits, not colours",
              body: "Verbal memory beats visual memory for sequences. Whisper the pattern as numbers ('2-4-1…') while watching; your voice becomes the backup track.",
            },
            {
              title: "Group in threes",
              body: "Chunk the pattern into triples and give each triple a rhythm. Memory research has favoured groups of three since phone numbers were invented.",
            },
            {
              title: "Keep your hands loose",
              body: "Tense players tap early and mis-order. Wait for the flash to finish, breathe out, then press. Calm hands make long runs.",
            },
          ]}
        />

        <SectionTitle id="faq">Sequence FAQ</SectionTitle>
        <div className="mt-5 max-w-3xl space-y-6">
          {FAQS.map((f) => (
            <Faq key={f.q} q={f.q}>
              <p>{f.a}</p>
            </Faq>
          ))}
        </div>

        <MoreGames exclude={["sequence"]} />
      </div>
    </>
  );
}
