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
      url: `${siteUrl}/ohtsuki`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
