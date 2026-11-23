import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/site/AdSlot";
import { Faq, P, SectionTitle } from "@/components/site/Copy";
import { JsonLd } from "@/components/site/JsonLd";
import { faqJsonLd } from "@/lib/schema";
import { SITE } from "@/lib/site";

const TITLE = "FAQ — Krillion Unblocked";
const DESCRIPTION =
  "Answers to common questions about Krillion Unblocked: accounts, daily resets, scoring, streaks, devices, privacy and how the answer bank works.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/faq" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/faq`,
    type: "website",
  },
};

const FAQS = [
  {
    q: "What is Krillion Unblocked?",
    a: "A collection of seven original free browser games built around daily puzzles: Krillion (rare answers win), Noillirk (common answers win), Krillion City (rare answers win, climb the skyline), Word Hunt, What's Your Guess?, Colour Memory and Sequence. Everything runs in your browser — no install, no account, no cost.",
  },
  {
    q: "Is it really free? What's the catch?",
    a: "It is really free. The site is designed to be supported later by the clearly-labelled advertising slots you can see at the bottom of pages — right now they are empty placeholders. There is no paywall, no premium tier and no account system.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. There is no login anywhere on the site. Your scores, streaks and settings are stored in your browser's local storage, which also means clearing your browser data clears your history.",
  },
  {
    q: "When exactly do the daily games reset?",
    a: "At midnight in your own local time zone, according to your device's clock. A finished daily shows a live countdown to the next one. See our story on daily reset times for examples around the world.",
  },
  {
    q: "Can I play yesterday's daily puzzle?",
    a: "No — each day's puzzle exists only on that day. Streaks reward showing up on consecutive days, and Unlimited mode is always available for extra practice.",
  },
  {
    q: "How is my score calculated in Krillion?",
    a: "Every accepted answer in the bank has a popularity score from 1 (nearly unique) to 100 (the first word everyone says). Your answer's popularity maps to a tier: One in a Krillion 100, Deep Cut 85, Rare 60, Schooler 30, Too Clever 15, Plankton 10, No Catch 0. Total points convert to depth at 10 metres per point.",
  },
  {
    q: "My obviously-correct answer scored zero. Why?",
    a: "A 'No Catch' means the answer is not on our board for that prompt. The bank is built from survey-style answers — hundreds of them — but no board can hold everything. Plurals and light spelling variations are matched automatically.",
  },
  {
    q: "Where is my data stored? Do you track me?",
    a: "Everything lives in your browser's local storage on your own device. The site has no accounts, no analytics scripts, no third-party requests and no tracking of any kind. The full detail is in the Privacy Policy.",
  },
  {
    q: "Does the site work on phones and tablets?",
    a: "Yes — every game is designed mobile-first with large touch targets, and everything works on any modern browser including school and library computers.",
  },
  {
    q: "Is it really 'unblocked'? Can I play at school?",
    a: "The name means the games are free to play instantly in a browser — nothing is downloaded and nothing is installed. Whether you may play on a given network depends on its rules, so always follow your school's or workplace's policies.",
  },
  {
    q: "Can I suggest prompts, questions or features?",
    a: "Please do — the games grow through suggestions. Write to us via the contact page with your prompt ideas (with a few example answers and how common you think they are) or any bug reports.",
  },
  {
    q: "How do streaks work exactly?",
    a: "Finish the Krillion daily on consecutive calendar days — by your local clock — and the counter climbs. Miss a day and it resets to zero the next time you play. Playing at 11 PM one day and 8 AM the next counts as two consecutive days.",
  },
];

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQS)} />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="max-w-3xl">
          <p className="inline-block rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Help centre
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Frequently asked questions
          </h1>
          <P>
            The questions players actually ask, answered plainly. If yours is missing, the{" "}
            <Link className="font-semibold text-steel hover:underline" href="/contact">
              contact page
            </Link>{" "}
            is one click away.
          </P>
        </header>

        <SectionTitle id="questions">All questions</SectionTitle>
        <div className="mt-5 max-w-3xl space-y-6">
          {FAQS.map((f) => (
            <Faq key={f.q} q={f.q}>
              <p>{f.a}</p>
            </Faq>
          ))}
        </div>

        <div className="mt-10 max-w-3xl rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-bold tracking-tight text-foreground">
            Ready to play?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with the flagship:{" "}
            <Link className="font-semibold text-steel hover:underline" href="/krillion-unblocked">
              today&apos;s Krillion dive
            </Link>{" "}
            — or read the{" "}
            <Link className="font-semibold text-steel hover:underline" href="/how-to-play">
              combined rulebook
            </Link>{" "}
            first.
          </p>
        </div>

        <div className="mt-12 max-w-3xl">
          <AdSlot format="leaderboard" />
        </div>
      </div>
    </>
  );
}
