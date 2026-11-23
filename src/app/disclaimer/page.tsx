import type { Metadata } from "next";
import { P } from "@/components/site/Copy";
import { SITE } from "@/lib/site";

const TITLE = "Disclaimer — Krillion Unblocked";
const DESCRIPTION =
  "Disclaimer for Krillion Unblocked: entertainment-only content, accuracy of game data, external links, advertising placeholders and responsible play.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">Disclaimer</h1>
      <p className="mt-2 font-mono text-xs text-muted-foreground">Last updated: November 1, 2026</p>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">1. Entertainment only</h2>
      <P>
        {SITE.name} is a free games website provided for entertainment. Nothing on the Site —
        including estimation questions, explanations and Stories articles — constitutes
        professional advice of any kind (medical, financial, legal, educational or otherwise).
        Do not rely on the Site for real-world decisions.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">2. Accuracy of content</h2>
      <P>
        We work hard to keep the answer bank, estimation answers and explanations accurate,
        but content is provided &ldquo;as is&rdquo; without guarantee of completeness,
        accuracy or timeliness. Survey-style popularity values are editorial judgements, not
        scientific measurements. If you spot an error, tell us — we fix them continuously.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">3. External links</h2>
      <P>
        The Site may link to third-party websites. We do not control and are not responsible
        for their content, availability or privacy practices. Following external links is at
        your own discretion.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">4. Advertising placeholders</h2>
      <P>
        The Site contains clearly-labelled advertising placeholder areas that currently render
        nothing. When advertising is introduced, it will be labelled and governed by an
        updated Privacy Policy. We do not endorse products that may later appear in ad slots.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">5. Fair play and networks</h2>
      <P>
        The Site requires no download and no account. Whether you are permitted to play on a
        school, university or workplace network depends entirely on that network&apos;s own
        policies — always follow them. Playing games when you should be paying attention in
        class or at work is between you and your teacher or manager.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">6. Play in moderation</h2>
      <P>
        Our games are designed to be quick daily rituals, not all-night binges. If gaming
        stops being fun or starts interfering with sleep, study or relationships, take a
        break — the puzzle will still be there tomorrow.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">7. Trademarks</h2>
      <P>
        All product names, games and brands mentioned on the Site, if any, are property of
        their respective owners and are used for identification or commentary only. No
        affiliation or endorsement is implied unless stated.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">8. Contact</h2>
      <P>
        Anything to flag about this disclaimer:{" "}
        <a className="font-semibold text-steel hover:underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        .
      </P>
    </div>
  );
}
