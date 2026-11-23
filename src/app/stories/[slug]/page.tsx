import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORIES, type StoryBlock } from "@/data/stories";
import { AdSlot } from "@/components/site/AdSlot";
import { JsonLd } from "@/components/site/JsonLd";
import { SITE } from "@/lib/site";
import { getGame } from "@/data/games";
import { formatLongDate } from "@/lib/daily";

export function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = STORIES.find((s) => s.slug === slug);
  if (!story) return { title: "Story not found" };
  return {
    title: story.title.length > 60 ? story.title.slice(0, 57) + "..." : story.title,
    description: story.description,
    alternates: { canonical: `/stories/${story.slug}` },
    openGraph: {
      title: story.title,
      description: story.description,
      url: `${SITE.url}/stories/${story.slug}`,
      type: "article",
      publishedTime: story.date,
    },
  };
}

function Block({ block }: { block: StoryBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-foreground/85 sm:text-[17px]">
          {block.text}
        </p>
      );
    case "h2":
      return (
        <h2 className="mt-10 border-b border-border pb-2 font-serif text-2xl font-bold tracking-tight text-foreground">
          {block.text}
        </h2>
      );
    case "ul":
      return (
        <ul className="mt-5 max-w-3xl list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-foreground/85 marker:text-steel">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-5 max-w-3xl list-decimal space-y-4 pl-5 text-[15px] leading-relaxed text-foreground/85 marker:font-bold marker:text-steel">
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              {item}
            </li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="mt-6 max-w-3xl border-l-2 border-steel pl-4 font-serif text-lg italic leading-relaxed text-foreground/85">
          {block.text}
        </blockquote>
      );
    case "table":
      return (
        <div className="mt-5 max-w-3xl overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-muted">
                {block.headers.map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-t border-border bg-card">
                  {row.map((cell, j) => (
                    <td key={j} className={`px-4 py-3 ${j === 0 ? "font-semibold text-foreground" : "text-foreground/80"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = STORIES.find((s) => s.slug === slug);
  if (!story) notFound();

  const related = getGame(story.relatedGame);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.description,
    datePublished: story.date,
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    mainEntityOfPage: `${SITE.url}/stories/${story.slug}`,
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <nav aria-label="Breadcrumb" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Link href="/stories" className="hover:text-steel">Stories</Link>
          <span aria-hidden="true"> / </span>
          <span className="text-steel">{story.tag}</span>
        </nav>

        <article className="mt-4">
          <header className="max-w-3xl">
            <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {story.title}
            </h1>
            <p className="mt-3 font-mono text-xs tabular-nums text-muted-foreground">
              {formatLongDate(story.date)} · {story.readMinutes} min read
            </p>
          </header>

          {story.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}

          {related && (
            <div className="mt-10 max-w-3xl rounded-xl border border-border bg-muted/40 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Play the game this story is about
              </p>
              <Link
                href={`/${related.slug}`}
                className="mt-2 inline-flex items-center gap-2 font-serif text-xl font-bold text-steel hover:underline"
              >
                {related.name} →
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{related.tagline}</p>
            </div>
          )}
        </article>

        <div className="mt-12 max-w-3xl">
          <AdSlot format="leaderboard" />
        </div>

        <div className="mt-10 max-w-3xl">
          <h2 className="font-serif text-xl font-bold tracking-tight text-foreground">More stories</h2>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-steel">
            {STORIES.filter((s) => s.slug !== story.slug).map((s) => (
              <li key={s.slug}>
                <Link className="hover:underline" href={`/stories/${s.slug}`}>
                  {s.title} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
