import type { Metadata } from "next";
import { OhtsukiChecker } from "@/components/OhtsukiChecker";
import { SiteFooter } from "@/components/SiteFooter";
import { ohtsukiConfig, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `${ohtsukiConfig.name} | ${ohtsukiConfig.label}`,
  description: ohtsukiConfig.description,
  alternates: {
    canonical: "https://ufolab.tokyo/ohtsuki",
  },
  openGraph: {
    title: `${ohtsukiConfig.name} | ${ohtsukiConfig.label}`,
    description: ohtsukiConfig.description,
    url: "https://ufolab.tokyo/ohtsuki",
    siteName: "UFO Lab Tokyo",
    type: "website",
    images: [
      {
        url: "/ogp-ohtsuki.jpg",
        width: 1200,
        height: 630,
        alt: `${ohtsukiConfig.name} | ${ohtsukiConfig.label}`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${ohtsukiConfig.name} | ${ohtsukiConfig.label}`,
    description: ohtsukiConfig.description,
    images: ["/ogp-ohtsuki.jpg"],
  },
  other: {
    "twitter:image:alt": `${ohtsukiConfig.name} | ${ohtsukiConfig.label}`,
  },
};

export default function OhtsukiPage() {
  return (
    <section className="checker-page">
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
        <h1>{ohtsukiConfig.name}</h1>
        <p className="tagline">{ohtsukiConfig.label}</p>
        <p className="lead">{ohtsukiConfig.description}</p>
        <ul className="lead-list">
          <li>高度な判定は1日3回まで。以降はメタデータによる簡易判定になります。</li>
          <li>高度な判定のAPI制限に達すると、簡易判定のみを返します。</li>
        </ul>
      </div>

      <OhtsukiChecker />

      <section className="brand-feedback-card" aria-labelledby="ohtsuki-update-heading">
        <p className="brand-feedback-label" id="ohtsuki-update-heading">
          更新情報・フィードバック
        </p>
        <div className="brand-feedback-copy">
          <p>Ohtsuki の更新や改善点は、今後も少しずつ足していきます。</p>
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
