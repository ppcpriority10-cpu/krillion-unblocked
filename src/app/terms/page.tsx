import type { Metadata } from "next";
import { P } from "@/components/site/Copy";
import { SITE } from "@/lib/site";

const TITLE = "Terms of Service — Krillion Unblocked";
const DESCRIPTION =
  "Terms of Service for Krillion Unblocked: free-to-play browser games, acceptable use, intellectual property, disclaimers and liability limits.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
      <p className="mt-2 font-mono text-xs text-muted-foreground">Last updated: November 1, 2026</p>

      <P>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of {SITE.name} and the
        games available at {SITE.url} (the &ldquo;Site&rdquo;). By using the Site you agree to
        these Terms. If you do not agree, please do not use the Site.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">1. The service</h2>
      <P>
        The Site provides free browser games, editorial content and related features.
        Everything runs in your browser; no download or account is required. The Site is
        provided for personal, non-commercial entertainment.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">2. Acceptable use</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground">
        <li>Do not attempt to disrupt, overload or reverse-engineer the Site or its infrastructure.</li>
        <li>Do not scrape, republish or resell the Site&apos;s content, game data or answer banks without permission.</li>
        <li>Do not use automated tools to farm scores or manipulate daily results.</li>
        <li>Do not use the Site in any way that violates applicable laws or the rules of any network you are using it on.</li>
      </ul>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">3. Intellectual property</h2>
      <P>
        The Site&apos;s name, logo, games, rules, written content, code, design and data are
        owned by the Site&apos;s operator or licensed to it, and are protected by copyright and
        other laws. You may share your own results freely — that is the point of the share
        boxes — but you may not redistribute the games themselves without written permission.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">4. Local storage and your data</h2>
      <P>
        Your progress is stored in your browser&apos;s local storage on your device. You are
        responsible for the device and browser you play on. Clearing site data erases your
        history; we cannot restore it because we never receive it.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">5. Availability and changes</h2>
      <P>
        We aim to keep the daily puzzles running at midnight, every day, but the Site is
        provided as-is. We may add, change, suspend or remove games or features at any time
        without notice.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">6. Disclaimers</h2>
      <P>
        The Site and its games are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
        without warranties of any kind, express or implied, including merchantability, fitness
        for a particular purpose and non-infringement. We do not warrant that the Site will be
        uninterrupted, error-free or that results will always be calculated correctly in every
        browser environment.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">7. Limitation of liability</h2>
      <P>
        To the maximum extent permitted by law, the Site&apos;s operator shall not be liable
        for any indirect, incidental, special, consequential or punitive damages, or any loss
        of data, profits or enjoyment, arising from your use of the Site — even if advised of
        the possibility of such damages.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">8. Governing law</h2>
      <P>
        These Terms are governed by the laws of the jurisdiction in which the Site&apos;s
        operator is established, without regard to conflict-of-law rules. Nothing in these
        Terms affects mandatory consumer rights you have under the law of your residence.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">9. Changes to these Terms</h2>
      <P>
        We may update these Terms from time to time. The date at the top shows the current
        version. Material changes will be highlighted on the Site. Your continued use of the
        Site after changes take effect constitutes acceptance.
      </P>

      <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold">10. Contact</h2>
      <P>
        Questions about these Terms:{" "}
        <a className="font-semibold text-steel hover:underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        .
      </P>
    </div>
  );
}
