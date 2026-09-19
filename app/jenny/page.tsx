import type { Metadata } from "next";
import { siteName, siteUrl } from "@/lib/seo";
import JennyApp from "./JennyApp";

const title = "Jenny｜UFO目撃報告をJevで分析 | UFO Lab Tokyo";
const description =
  "UFO目撃報告・調査報告をJevで20項目評価し、SP分類、近接遭遇分類、TRUE UFO度、証拠強度、フェイク兆候を日本語で整理します。";
const pageUrl = `${siteUrl}/jenny`;
const socialImageUrl = `${pageUrl}/opengraph-image`;
const socialImageAlt = "Jenny｜UFO報告文書をJevで分析";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "Jenny",
  keywords: [
    "UFO目撃報告",
    "UFO報告分析",
    "Jev",
    "SP分類",
    "ストレンジネス",
    "ハイネック",
    "近接遭遇分類",
    "TRUE UFO",
  ],
  alternates: {
    canonical: pageUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title,
    description,
    url: pageUrl,
    siteName,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: socialImageAlt,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImageUrl],
  },
  other: {
    "twitter:image:alt": socialImageAlt,
  },
};

const jennyJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Jenny",
  alternateName: "Jenny - UFO REPORT ANALYZER",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  url: pageUrl,
  image: socialImageUrl,
  inLanguage: "ja-JP",
  description,
  isAccessibleForFree: true,
  provider: {
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
  },
  featureList: [
    "SP分類（ストレンジネス・報告の確からしさ）",
    "近接遭遇分類",
    "TRUE UFO度",
    "証拠強度",
    "フェイク兆候",
  ],
};

export default function JennyPage() {
  return (
    <>
      <JennyApp />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jennyJsonLd) }}
      />
    </>
  );
}
