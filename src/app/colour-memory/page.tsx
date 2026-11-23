import type { Metadata } from "next";
import Link from "next/link";
import { ColourMemoryGame } from "@/components/games/ColourMemoryGame";
import { AdSlot } from "@/components/site/AdSlot";
import { CopyTable, Faq, MoreGames, P, SectionTitle, Tips } from "@/components/site/Copy";
import { JsonLd } from "@/components/site/JsonLd";
import { faqJsonLd, videoGameJsonLd } from "@/lib/schema";
import { SITE } from "@/lib/site";

const TITLE = "Colour Memory — Daily Colour Matching Game";
const DESCRIPTION =
  "Play Colour Memory free: memorise a colour for 3 seconds, then recreate it with RGB sliders. Five daily rounds, scored by match accuracy.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/colour-memory" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/colour-memory`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "How does Colour Memory work?",
    a: "Each round shows you a single flat colour for exactly three seconds, then hides it. You recreate the colour using three sliders — red, green and blue — and score by how close your match is to the target. Five rounds a day.",
  },
  {
    q: "How is the match scored?",
    a: "The game measures the straight-line distance between your colour and the target across the full RGB cube and converts it to a percentage: an exact match is 100%, and the worst possible miss is 0%. Your round score is that percentage.",
  },
  {
    q: "Are the colours random?",
    a: "The daily targets are generated from the date, so every player matches the same five colours on the same day — and the palette leans towards everyday hues rather than near-black technicalities.",
  },
  {
    q: "Why sliders instead of a colour picker?",
    a: "Sliders force you to decompose a colour into its channels — the actual skill the game trains. A picker would let your eye do the work with feedback; the sliders make you hold the colour in memory instead.",
  },
  {
    q: "Can I keep adjusting after locking in?",
    a: "No. Locking in submits your match for the round, exactly like every daily game on the site. Decide like it counts, because it does.",
  },
  {
    q: "Does screen brightness affect my score?",
    a: "It can — screens vary. Everyone plays under the same handicap though, and consistent lighting between the memorise and match phases matters more than perfectly calibrated hardware.",
  },
];

export default function ColourMemoryPage() {
  return (
    <>
      <JsonLd
        data={videoGameJsonLd({
          name: "Colour Memory",
          slug: "colour-memory",
          description:
            "A daily colour-perception game: memorise a colour for three seconds, recreate it with RGB sliders, score by match accuracy.",
          genre: "Brain / Memory",
        })}
      />
      <JsonLd data={faqJsonLd(FAQS)} />

      {/* game first — full-bleed, playdaily style */}
      <ColourMemoryGame />

      <div className="mx-auto max-w-5xl px-4 pb-10">
<header className="mx-auto max-w-3xl pt-8 text-center">
          <p className="inline-block rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Daily brain game · Free
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Colour Memory
          </h1>
          <P>
            A colour appears. You have <strong>three seconds</strong> to burn it into
            memory. Then it vanishes, and three sliders are all you have: red, green,
            blue. Slide your way back to the exact shade — five rounds a day, reset at
            midnight.
          </P>
        </header>
        <div className="mt-10">
          <AdSlot format="leaderboard" />
        </div>

        {/* about the test — moved under the board */}
        <SectionTitle id="about">Honest about your eyes</SectionTitle>
        <P>
          The closer your recreation lands, the more points you keep — the same five
          colours for every player, and the daily result screen is honest about it in a
          way no filter ever is. It sounds gentle until your first 62% lands. Colour
          memory is one of those skills everyone believes they have and almost nobody has
          calibrated.
        </P>

        <SectionTitle id="how-to-play">How to play</SectionTitle>
        <ol className="mt-4 max-w-3xl list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-muted-foreground marker:text-steel">
          <li>
            <strong className="text-foreground">Watch the swatch.</strong> The target colour
            fills the board for three seconds with a draining timer bar.
          </li>
          <li>
            <strong className="text-foreground">It disappears.</strong> No preview, no
            ghost — just you and your memory of it.
          </li>
          <li>
            <strong className="text-foreground">Match with the sliders.</strong> Red, green
            and blue, 0–255 each. The preview box updates live as you slide.
          </li>
          <li>
            <strong className="text-foreground">Lock it in.</strong> Your match is submitted
            for the round and scored immediately.
          </li>
          <li>
            <strong className="text-foreground">Compare and continue.</strong> The result
            shows target and your colour side by side. Five rounds later: total score, best
            round, share box.
          </li>
        </ol>

        <SectionTitle id="scoring">How close is &ldquo;close&rdquo;?</SectionTitle>
        <CopyTable
          headers={["Round score", "What it means"]}
          rows={[
            ["95–100%", "Essentially indistinguishable. Serious colour vision."],
            ["85–94%", "Excellent — the kind of match people doubt is from memory."],
            ["70–84%", "Strong. The hue is right; a channel drifted."],
            ["50–69%", "The right family, wrong address."],
            ["Under 50%", "You remembered a feeling, not a colour."],
          ]}
        />
        <P>
          Technically: the game computes the Euclidean distance between the two RGB triples
          and scales it across the cube&apos;s maximum. In practice: trust your first
          impression of the hue, then fine-tune lightness — most lost points live in
          brightness, not colour family.
        </P>

        <SectionTitle id="tips">Three ways to sharpen your eye</SectionTitle>
        <Tips
          items={[
            {
              title: "Name the colour in words",
              body: "During the three seconds, describe it silently: 'muted teal, darker than sea glass'. Verbal anchors survive memory better than raw impressions.",
            },
            {
              title: "Set the obvious channel first",
              body: "If the colour is clearly dark, drop brightness immediately; if it is clearly warm, push red before touching blue. Two confident guesses beat six timid ones.",
            },
            {
              title: "Use the live preview as a mirror, not a judge",
              body: "Compare the preview against your memory, not against itself. If you catch yourself admiring the preview, you have stopped remembering and started designing.",
            },
          ]}
        />

        <SectionTitle id="faq">Colour Memory FAQ</SectionTitle>
        <div className="mt-5 max-w-3xl space-y-6">
          {FAQS.map((f) => (
            <Faq key={f.q} q={f.q}>
              <p>{f.a}</p>
            </Faq>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-bold tracking-tight text-foreground">Keep reading</h2>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-steel">
            <li>
              <Link className="hover:underline" href="/sequence">
                Next brain game: Sequence →
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/how-to-play#colour-memory">
                Colour Memory in the combined rules guide →
              </Link>
            </li>
          </ul>
        </div>

        <MoreGames exclude={["colour-memory"]} />
      </div>
    </>
  );
}
