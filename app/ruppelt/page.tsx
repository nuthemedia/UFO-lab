import type { Metadata } from "next";
import pursueIndex from "@/data/pursue/pursue-records.json";
import descriptionSearchIndex from "@/data/shared/search/description-index.json";
import { RuppeltBrowser } from "@/components/RuppeltBrowser";
import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/lib/site";
import {
  priorDisclosureLabels,
  type PriorDisclosureStatus,
  type PursueDescriptionSearchEntry,
  type PursueIndex,
} from "@/lib/pursue";

const ruppeltName = "Ruppelt v1.5";
const ruppeltDisplayName = "Ruppelt v1.5 - PURSUE日本語インデックス";
const ruppeltDescription =
  "米政府PURSUEで公開されたUAP/UFO資料222件を、日本語検索、公開状況、OCR全文、要約でスマホから確認できる資料ブラウザです。";
const ruppeltKeywords = [
  "Ruppelt",
  "PURSUE",
  "UAP",
  "UFO",
  "米政府UAP公開資料",
  "UFO資料",
  "war.gov UFO",
  "日本語インデックス",
  "OCR全文検索",
  "UFO Lab Tokyo",
];
const statusDashboardOrder: PriorDisclosureStatus[] = [
  "first_time_public",
  "partial",
  "previously_public",
  "unknown",
];

export const metadata: Metadata = {
  title: `${ruppeltName} | PURSUE日本語インデックス`,
  description: ruppeltDescription,
  keywords: ruppeltKeywords,
  alternates: {
    canonical: "/ruppelt",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: ruppeltDisplayName,
    description: ruppeltDescription,
    url: "/ruppelt",
    siteName: "UFO Lab Tokyo",
    locale: "ja_JP",
    images: [
      {
        url: "/ogp-ruppelt.jpg",
        width: 1200,
        height: 630,
        alt: ruppeltDisplayName,
        type: "image/jpeg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ruppeltDisplayName,
    description: ruppeltDescription,
    images: ["/ogp-ruppelt.jpg"],
  },
  other: {
    "twitter:image:alt": ruppeltDisplayName,
  },
};

export default function RuppeltPage() {
  const index = pursueIndex as PursueIndex;
  const descriptionIndex = descriptionSearchIndex as PursueDescriptionSearchEntry[];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: ruppeltName,
    alternateName: ruppeltDisplayName,
    applicationCategory: "ReferenceApplication",
    operatingSystem: "Web",
    url: "https://ufolab.tokyo/ruppelt",
    inLanguage: "ja-JP",
    description: ruppeltDescription,
    creator: {
      "@type": "Organization",
      name: "UFO Lab Tokyo",
      url: "https://ufolab.tokyo",
    },
    isBasedOn: {
      "@type": "Dataset",
      name: "PURSUE UAP records",
      url: index.metadata.sourcePageUrl,
      distribution: {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: index.metadata.csvUrl,
      },
    },
    about: [
      "PURSUE",
      "UAP",
      "UFO",
      "米政府公開資料",
      "OCR全文検索",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
  };
  const statusCounts = index.records.reduce<Record<PriorDisclosureStatus, number>>(
    (counts, record) => {
      const status = record.searchFacets?.priorDisclosureStatus;

      if (status && statusDashboardOrder.includes(status)) {
        counts[status] += 1;
      }

      return counts;
    },
    {
      first_time_public: 0,
      previously_public: 0,
      partial: 0,
      known_case_new_file: 0,
      unknown: 0,
    },
  );

  return (
    <section className="checker-page ruppelt-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="checker-hero">
        <div className="ohtsuki-brand-mark" aria-label={siteConfig.shortName}>
          <div className="orbital-mark orbital-mark-compact" aria-hidden="true">
            <span className="orbit-ring orbit-ring-one" />
            <span className="orbit-ring orbit-ring-two" />
            <span className="orbit-ring orbit-ring-three" />
            <span className="orbit-dot orbit-dot-one" />
            <span className="orbit-dot orbit-dot-two" />
            <span className="orbit-dot orbit-dot-three" />
            <span className="ohtsuki-brand-text">{siteConfig.shortName}</span>
          </div>
          <span className="sr-only">{siteConfig.shortName}</span>
        </div>
        <h1>{ruppeltName}</h1>
        <p className="tagline">{ruppeltDisplayName}</p>
        <p className="lead">米政府UAP公開資料をスマホでさくっと確認。</p>
        <p className="ruppelt-update-note">
          <span>UPDATE</span>
          資料の日本語全文翻訳と検索に対応しました
        </p>
        <div className="ruppelt-status-dashboard" aria-label="公開状況の件数">
          {statusDashboardOrder.map((status) => (
            <div key={status} className={`ruppelt-status-stat ruppelt-status-stat--${status}`}>
              <span>{priorDisclosureLabels[status]}</span>
              <strong>{statusCounts[status]}</strong>
            </div>
          ))}
        </div>
      </div>

      <RuppeltBrowser
        index={index}
        descriptionSearchIndex={descriptionIndex}
      />

      <SiteFooter className="ohtsuki-footer" />
    </section>
  );
}
