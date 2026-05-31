import type { MetadataRoute } from "next";
import { absoluteLanguageAlternates, localizedHomeSeo, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
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
}
