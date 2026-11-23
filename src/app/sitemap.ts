import type { MetadataRoute } from "next";
import { STORIES } from "@/data/stories";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/krillion-unblocked`, lastModified, changeFrequency: "daily", priority: 0.95 },
    { url: `${SITE.url}/unlimited`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/noillirk`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/krillion-city`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/word-hunt`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/whats-your-guess`, lastModified, changeFrequency: "daily", priority: 0.85 },
    { url: `${SITE.url}/colour-memory`, lastModified, changeFrequency: "daily", priority: 0.85 },
    { url: `${SITE.url}/sequence`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/stories`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/how-to-play`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/faq`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/about`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE.url}/contact`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE.url}/privacy-policy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/disclaimer`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  const storyRoutes: MetadataRoute.Sitemap = STORIES.map((s) => ({
    url: `${SITE.url}/stories/${s.slug}`,
    lastModified: new Date(s.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...storyRoutes];
}
