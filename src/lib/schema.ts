import { SITE } from "@/lib/site";

/** VideoGame structured data for a game page. */
export function videoGameJsonLd(opts: {
  name: string;
  slug: string;
  description: string;
  genre: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: opts.name,
    url: `${SITE.url}/${opts.slug}`,
    description: opts.description,
    genre: opts.genre,
    gamePlatform: "Web Browser",
    applicationCategory: "Game",
    operatingSystem: "Any (browser)",
    playMode: "SinglePlayer",
    inLanguage: "en",
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}

/** FAQPage structured data from a Q/A list. */
export function faqJsonLd(
  qas: { q: string; a: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qas.map((qa) => ({
      "@type": "Question",
      name: qa.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: qa.a,
      },
    })),
  };
}
