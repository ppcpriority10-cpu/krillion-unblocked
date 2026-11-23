type AdFormat = "leaderboard" | "rectangle" | "banner";

const SIZES: Record<AdFormat, string> = {
  leaderboard: "h-[90px] md:h-[110px] max-w-3xl",
  rectangle: "h-[250px] max-w-sm",
  banner: "h-[100px] max-w-xl",
};

/**
 * Reserved advertising placeholder.
 * Renders a static, clearly-labelled empty box only — no scripts,
 * no network requests, no third-party tags. Ad code can be added later.
 */
export function AdSlot({
  format = "leaderboard",
  label = "Advertisement",
}: {
  format?: AdFormat;
  label?: string;
}) {
  return (
    <aside
      role="complementary"
      aria-label="Advertisement placeholder"
      className={`mx-auto flex w-full ${SIZES[format]} items-center justify-center rounded-xl border border-dashed border-border bg-muted/40`}
    >
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          Ad space reserved — nothing loads here yet
        </p>
      </div>
    </aside>
  );
}
