import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { P } from "@/components/site/Copy";
import { SITE } from "@/lib/site";

const TITLE = "Contact — Krillion Unblocked";
const DESCRIPTION =
  "Contact the Krillion Unblocked team: feedback, prompt ideas, estimation questions, bug reports and advertising enquiries.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}/contact`,
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="inline-block rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Contact
        </p>
        <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Get in touch
        </h1>
        <P>
          Prompt ideas, estimation questions, bug reports, kind words — all welcome. The
          fastest route is email at{" "}
          <a className="font-semibold text-steel hover:underline" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
          , or use the form below.
        </P>
      </header>

      <div className="mt-8 max-w-2xl">
        <ContactForm email={SITE.email} />
      </div>

      <div className="mt-10 max-w-2xl rounded-xl border border-border bg-muted/40 p-6">
        <h2 className="font-serif text-lg font-bold text-foreground">Before you write</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            Prompt ideas: include the prompt and 5–10 example answers, roughly ordered from
            most to least popular.
          </li>
          <li>
            Bug reports: which game, which device and browser, and what you expected to
            happen.
          </li>
          <li>
            Score disputes: the tier table on each game page explains the call — and yes,
            &ldquo;Too Clever&rdquo; hurts us too.
          </li>
        </ul>
      </div>
    </div>
  );
}
