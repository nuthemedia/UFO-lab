import type { MetadataRoute } from "next";
import { people } from "@/data/kean/people";
import { keanUapRecords } from "@/data/kean/uap";
import { absoluteLanguageAlternates, localizedHomeSeo, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: localizedHomeSeo.ja.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: absoluteLanguageAlternates,
      },
    },
    {
      url: localizedHomeSeo.en.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: absoluteLanguageAlternates,
      },
    },
    {
      url: `${siteUrl}/ruppelt`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/ruppelt/lp`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.88,
    },
    {
      url: `${siteUrl}/kean`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.86,
    },
    {
      url: `${siteUrl}/kean/about`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.84,
    },
    {
      url: `${siteUrl}/kean/history`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.84,
    },
    {
      url: `${siteUrl}/kean/uap`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.84,
    },
    {
      url: `${siteUrl}/kean/people`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.84,
    },
    {
      url: `${siteUrl}/keyhoe`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.82,
    },
    {
      url: `${siteUrl}/keyhoe/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.78,
    },
    {
      url: `${siteUrl}/kinichi`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: `${siteUrl}/ohtsuki`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/hynek`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: `${siteUrl}/hynek/dashboard`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.78,
    },
  ];

  return [
    ...staticRoutes,
    ...people.map((person) => ({
      url: `${siteUrl}/kean/people/${person.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.72,
    })),
    ...keanUapRecords.map((record) => ({
      url: `${siteUrl}/kean/uap/${record.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.74,
    })),
  ];
}
