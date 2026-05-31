import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { siteConfig } from "@/lib/site";
import { siteUrl } from "@/lib/seo";

const title = "Keyhoeについて";
const description =
  "アメリカの主要情報源のUFO・UAPニュースから重複を省き、AIで独自スコアをつけて日本語で確認できます。";
const keyhoeOgpImage = "/keyhoe/opengraph-image";

export const metadata: Metadata = {
  title: `${title} | Keyhoe v0.5`,
  description,
  alternates: {
    canonical: "/keyhoe/about",
  },
  openGraph: {
    title: `${title} | Keyhoe v0.5`,
    description,
    url: `${siteUrl}/keyhoe/about`,
    siteName: siteConfig.shortName,
    locale: "ja_JP",
    images: [
      {
        url: keyhoeOgpImage,
        width: 1200,
        height: 630,
        alt: `${title} | Keyhoe v0.5`,
        type: "image/png",
      },
    ],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | Keyhoe v0.5`,
    description,
    images: [keyhoeOgpImage],
  },
  other: {
    "twitter:image:alt": `${title} | Keyhoe v0.5`,
  },
};

export default function KeyhoeAboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${title} | Keyhoe v0.5`,
    url: "https://ufolab.tokyo/keyhoe/about",
    inLanguage: "ja-JP",
    description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.shortName,
      url: siteConfig.url,
    },
  };

  return (
    <section className="checker-page keyhoe-about-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="keyhoe-about-hero">
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
        <p className="keyhoe-about-kicker">Keyhoeについて</p>
        <p className="keyhoe-about-lead">{description}</p>
        <Link className="keyhoe-about-back" href="/keyhoe">
          Keyhoeへ戻る
        </Link>
      </header>

      <article className="keyhoe-about-article">
        <section className="keyhoe-about-card">
          <p className="eyebrow">What Keyhoe Does</p>
          <h2>何をしているか</h2>
          <ul>
            <li>アメリカの主要情報源のUFO・UAPニュースから重複を省きます。</li>
            <li>同じ話題の重複を省き、今日見るべき項目に絞ります。</li>
            <li>AIで独自スコアをつけ、日本語の要約と「なぜ重要か」を付けます。</li>
          </ul>
          <p>
            「今日、海外UFO・UAP界隈で何が起きているか」を短時間で確認するための
            軽量チェッカーです。
          </p>
        </section>

        <section className="keyhoe-about-card">
          <p className="eyebrow">Sources</p>
          <h2>カバーしているメディア</h2>
          <ul>
            <li>🇺🇸政府公式: AARO、NASA UAP、war.gov、Defense.gov、U.S. Congress、FOIA.gov、ODNI、National Archives UAP、House Oversight、Senate Armed Services</li>
            <li>ニュース: The Debrief、Liberation Times、The Black Vault、Ask a Pol UAP、Space.com、Live Science</li>
            <li>ネットの話題: Reddit r/UFOs、Reddit r/UAP、Reddit r/UFOB</li>
          </ul>
          <p>
            Xの収集は現在の対象外です。まずは公式情報、専門メディア、コミュニティの話題を
            日本語で短く確認できることに絞ります。
          </p>
        </section>

        <section className="keyhoe-about-card">
          <p className="eyebrow">Cadence</p>
          <h2>更新頻度</h2>
          <ul>
            <li>1日1回、GitHub Actionsで生成した当日スナップショットを表示します。</li>
            <li>表示データは毎日の更新で上書きします。</li>
          </ul>
          <p>
            表示は「今日いま何が起きているか」をすばやくつかむためのスナップショットです。
          </p>
        </section>

        <section className="keyhoe-about-card">
          <p className="eyebrow">How to Read</p>
          <h2>どう読むか</h2>
          <ul>
            <li>重要度はAIの下書きに、ソース種別のルールを足して決めます。</li>
            <li>「要注意」は未確認情報を含む話題です。</li>
            <li>カード内の「なぜ重要か」は、見出しの意味を短く補足します。</li>
          </ul>
          <p>
            断定せず、一次情報に戻れることを重視します。気になる項目は元記事リンクから確認してください。
          </p>
        </section>
      </article>

      <SiteFooter className="keyhoe-footer" />
    </section>
  );
}
