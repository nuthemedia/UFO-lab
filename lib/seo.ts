import type { Metadata } from "next";
import { brandHomeContent, brandOgpImage, brandSiteUrl, type BrandLocale } from "@/lib/brandHomeContent";

export const siteUrl = brandSiteUrl;
export const siteName = "UFO Lab Tokyo";

export const localizedHomeSeo = {
  ja: {
    url: `${siteUrl}/`,
    path: "/",
    htmlLang: "ja-JP",
    ogLocale: "ja_JP",
    alternateLocale: "en_US",
    title: brandHomeContent.ja.meta.title,
    description: brandHomeContent.ja.meta.description,
  },
  en: {
    url: `${siteUrl}/en`,
    path: "/en",
    htmlLang: "en-US",
    ogLocale: "en_US",
    alternateLocale: "ja_JP",
    title: brandHomeContent.en.meta.title,
    description: brandHomeContent.en.meta.description,
  },
} as const;

export const languageAlternates = {
  ja: "/",
  en: "/en",
  "x-default": "/",
} as const;

export const absoluteLanguageAlternates = {
  ja: localizedHomeSeo.ja.url,
  en: localizedHomeSeo.en.url,
  "x-default": localizedHomeSeo.ja.url,
} as const;

export function createHomeMetadata(locale: BrandLocale): Metadata {
  const seo = localizedHomeSeo[locale];

  return {
    title: {
      absolute: seo.title,
    },
    description: seo.description,
    alternates: {
      canonical: seo.path,
      languages: languageAlternates,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.url,
      siteName,
      locale: seo.ogLocale,
      alternateLocale: seo.alternateLocale,
      images: [
        {
          url: brandOgpImage,
          width: 1200,
          height: 630,
          alt: seo.title,
          type: "image/jpeg",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [brandOgpImage],
    },
    other: {
      "twitter:image:alt": seo.title,
    },
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  alternateName: ["東京UFO研究室", "UFO Research Lab Tokyo"],
  url: localizedHomeSeo.ja.url,
  sameAs: ["https://x.com/UFOLabTokyo"],
};
