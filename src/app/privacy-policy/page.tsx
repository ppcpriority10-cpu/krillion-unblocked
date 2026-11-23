import type { Metadata } from "next";
import { P } from "@/components/site/Copy";
import { SITE } from "@/lib/site";

const TITLE = "Privacy Policy — Krillion Unblocked";
const DESCRIPTION =
  "Privacy Policy for Krillion Unblocked: no accounts, no tracking, no third-party calls. Everything you play is stored locally in your own browser.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-2 font-mono text-xs text-muted-foreground">Last updated: November 1, 2026</p>

      <P>
        This Privacy Policy explains what information {SITE.name} (&ldquo;we&rdquo;, &ldquo;the
        site&rdquo;, &ldquo;{SITE.url}&rdquo;) collects when you visit and play our games. The
        short version: <strong>we do not collect personal information, we do not run
        accounts, and we do not track you.</strong>
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">1. Information stored on your device</h2>
      <P>
        The site saves your game progress — daily results, streaks, personal bests and
        preferences such as sound settings — using your browser&apos;s{" "}
        <strong>local storage</strong>. This data is stored on your device, never transmitted
        to us, and never leaves your browser. Clearing your browser data removes it
        permanently.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">2. Information we do not collect</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground">
        <li>No names, email addresses or account credentials — there are no accounts.</li>
        <li>No analytics, telemetry or tracking scripts of any kind.</li>
        <li>No cookies used for advertising or profiling.</li>
        <li>No third-party API calls, embedded trackers or social widgets.</li>
        <li>No precise location data; the daily puzzle uses your device&apos;s own clock.</li>
      </ul>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">3. Information you send us voluntarily</h2>
      <P>
        If you email us (or use the contact form, which opens your own email client), we
        receive whatever you choose to include — typically your email address and message. We
        use it only to reply to you, and we do not add you to any mailing list or share it
        with third parties.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">4. Advertising</h2>
      <P>
        Pages contain clearly-labelled advertising placeholder areas. As of the date above,
        these render nothing and load nothing. If advertising is introduced later, this
        policy will be updated before that happens, and any ad technology would be subject to
        its own providers&apos; policies. We will never load third-party ad scripts silently.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">5. Children</h2>
      <P>
        The site is a general-audience games site and does not knowingly collect any personal
        information from anyone, including children under 13. Since no data is collected at
        all, there is nothing to sell, leak or hand over.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">6. Your choices</h2>
      <P>
        You can delete all locally stored game data at any time by clearing your browser&apos;s
        site data for {SITE.url}. Because nothing is stored on our side, that completely
        erases your history with us.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">7. Changes to this policy</h2>
      <P>
        If we change this policy materially, we will update the date at the top of this page
        and, where practical, note the change on the homepage. Continued use of the site
        after a change means you accept the updated policy.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">8. Contact</h2>
      <P>
        Questions about privacy? Email{" "}
        <a className="font-semibold text-steel hover:underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        .
      </P>
    </div>
  );
}
