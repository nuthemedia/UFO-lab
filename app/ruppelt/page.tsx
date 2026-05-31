import type { Metadata } from "next";
import pursueIndex from "@/data/pursue/pursue-records.json";
import { RuppeltBrowser } from "@/components/RuppeltBrowser";
import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/lib/site";
import { priorDisclosureLabels, type PriorDisclosureStatus, type PursueIndex } from "@/lib/pursue";

const statusDashboardOrder: PriorDisclosureStatus[] = [
  "first_time_public",
  "partial",
  "previously_public",
  "unknown",
];

export const metadata: Metadata = {
  title: "Ruppelt v1.1 | Ruppelt v1.1 - PURSUE日本語インデックス",
  description: "米政府UAP公開資料を、日本語でさくっと確認できる資料ブラウザです。",
  alternates: {
    canonical: "/ruppelt",
  },
  openGraph: {
    title: "Ruppelt v1.1 - PURSUE日本語インデックス",
    description: "米政府UAP公開資料をスマホでさくっと確認。",
    url: "/ruppelt",
    siteName: "UFO Lab Tokyo",
    images: [
      {
        url: "/ogp-ruppelt.jpg",
        width: 1200,
        height: 630,
        alt: "Ruppelt v1.1 - PURSUE日本語インデックス",
        type: "image/jpeg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ruppelt v1.1 - PURSUE日本語インデックス",
    description: "米政府UAP公開資料をスマホでさくっと確認。",
    images: ["/ogp-ruppelt.jpg"],
  },
  other: {
    "twitter:image:alt": "Ruppelt v1.1 - PURSUE日本語インデックス",
  },
};

export default function RuppeltPage() {
  const index = pursueIndex as PursueIndex;
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
        <h1>Ruppelt v1.1</h1>
        <p className="tagline">Ruppelt v1.1 - PURSUE日本語インデックス</p>
        <p className="lead">米政府UAP公開資料をスマホでさくっと確認。</p>
        <div className="ruppelt-status-dashboard" aria-label="公開状況の件数">
          {statusDashboardOrder.map((status) => (
            <div key={status} className={`ruppelt-status-stat ruppelt-status-stat--${status}`}>
              <span>{priorDisclosureLabels[status]}</span>
              <strong>{statusCounts[status]}</strong>
            </div>
          ))}
        </div>
      </div>

      <RuppeltBrowser index={index} />

      <section className="brand-feedback-card" aria-labelledby="ruppelt-update-heading">
        <p className="brand-feedback-label" id="ruppelt-update-heading">
          更新情報・フィードバック
        </p>
        <div className="brand-feedback-copy">
          <p>Ruppelt の更新や改善点は、今後も少しずつ足していきます。</p>
          <p>気づいた点やフィードバックは X で受け取っています。</p>
        </div>
        <a
          className="brand-feedback-action"
          href="https://x.com/UFOLabTokyo"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Xでフィードバックを送る"
          title="Xでフィードバックを送る"
        >
          <span className="brand-feedback-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
            </svg>
          </span>
        </a>
      </section>

      <SiteFooter className="ohtsuki-footer" />
    </section>
  );
}
