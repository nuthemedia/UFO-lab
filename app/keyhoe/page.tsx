import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/lib/site";
import { siteUrl } from "@/lib/seo";
import { KeyhoeFeed, type KeyhoeFeedProps } from "./KeyhoeFeed";
import keyhoeToday from "@/public/data/keyhoe-today.json";

type KeyhoeCategory = "all" | "official" | "news" | "buzz";

const title = "Keyhoe v0.5 - 海外UFO・UAPニュース日本語チェッカー | UFO Lab Tokyo";
const description =
  "海外UFO・UAPニュースを日本語で確認できるAIニュースチェッカーです。主要情報源から重複を省き、AI要約と重要度判定で今日の動向を短時間で把握できます。";
const keyhoeOgpImage = "/keyhoe/opengraph-image";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/keyhoe",
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/keyhoe`,
    siteName: "UFO Lab Tokyo",
    type: "website",
    images: [
      {
        url: keyhoeOgpImage,
        width: 1200,
        height: 630,
        alt: title,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [keyhoeOgpImage],
  },
  other: {
    "twitter:image:alt": title,
  },
};

const categories: Array<{ id: KeyhoeCategory; label: string }> = [
  { id: "all", label: "すべて" },
  { id: "official", label: "🇺🇸政府公式" },
  { id: "news", label: "ニュース" },
  { id: "buzz", label: "ネットの話題" },
];

export default function KeyhoePage() {
  const items = [...(keyhoeToday.items as KeyhoeFeedProps["items"])].sort(
    (left, right) => right.importanceScore - left.importanceScore,
  );

  return (
    <section className="keyhoe-page">
      <header className="keyhoe-hero">
        <div className="keyhoe-brand-mark" aria-label={siteConfig.shortName}>
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
        <h1>Keyhoe v0.5</h1>
        <p className="keyhoe-lead">Keyhoe v0.5 - 海外UFO・UAPニュース日本語チェッカー</p>
        <div className="keyhoe-hero-meta">
          <span>
            最終更新{" "}
            {new Intl.DateTimeFormat("ja-JP", {
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(keyhoeToday.generatedAt))}
          </span>
          <Link className="keyhoe-about-link" href="/keyhoe/about">
            Keyhoeについて
          </Link>
        </div>
        <a
          className="keyhoe-primary-share"
          href={`https://twitter.com/intent/tweet?${new URLSearchParams({
            text: `Keyhoe: 今日の海外UFO・UAPニュース\n${keyhoeToday.overallSummary.join("\n")}`,
            url: `${siteUrl}/keyhoe`,
          })}`}
          target="_blank"
          rel="noreferrer noopener"
        >
          今日のまとめをXでシェア
        </a>
      </header>

      <KeyhoeFeed
        categories={categories}
        generatedAt={keyhoeToday.generatedAt}
        items={items}
        summary={keyhoeToday.overallSummary}
      />

      <section className="brand-feedback-card keyhoe-update-card" aria-labelledby="keyhoe-update-heading">
        <p className="brand-feedback-label" id="keyhoe-update-heading">
          更新情報・フィードバック
        </p>
        <div className="brand-feedback-copy">
          <p>Keyhoe の更新や見直しは、少しずつ続けていきます。</p>
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

      <SiteFooter className="keyhoe-footer" />
    </section>
  );
}
