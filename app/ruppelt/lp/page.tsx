import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { RuppeltLpMotion } from "@/components/RuppeltLpMotion";
import { SiteFooter } from "@/components/SiteFooter";
import { siteName, siteUrl } from "@/lib/seo";

const appHref = "/ruppelt";
const brandHref = "/";
const appUrl = `${siteUrl}${appHref}`;
const lpUrl = `${siteUrl}/ruppelt/lp`;

const metaTitle = "Ruppelt｜アメリカ政府UAP・UFO機密解除資料を日本語で検索";
const metaDescription =
  "PURSUEで公開されたアメリカ政府のUAP・UFO機密解除資料を、日本語要約・資料検索・公開ステータスで確認できるビューアー。FBI、NASA、国防総省、国務省などの一次資料にスマホですばやくアクセスできます。";

const problemItems = [
  { label: "英語", body: "原文を読む負担が大きい" },
  { label: "量", body: "PDF、動画、画像がまとまって押し寄せる" },
  { label: "公開状況", body: "初公開か既公開か判断しにくい" },
  { label: "スマホ", body: "元サイトの一覧を追いにくい" },
  { label: "一次資料到達", body: "SNS情報から原文へ戻りにくい" },
];

const features = [
  {
    title: "日本語要約",
    body: "英文要約を日本語化して、内容を短く確認できます。",
  },
  {
    title: "資料検索",
    body: "英語と日本語で資料を検索できます。",
  },
  {
    title: "公開ステータス",
    body: "初公開、既公開、一部公開済みなど、資料の公開状況を確認できます。",
  },
  {
    title: "一次資料リンク",
    body: "元のPDFや公開ページにすばやくアクセスできます。",
  },
  {
    title: "後で読む",
    body: "気になる資料を保存し、あとからまとめて確認できます。",
  },
  {
    title: "スマホ向けUI",
    body: "資料カードをスマホでさくっと確認できます。",
  },
];

const useCases = [
  "SNSで見たUAP情報の一次資料を確認したい",
  "アメリカ政府UFO資料の要点だけ先に知りたい",
  "FBI UFO文書やNASA UAP資料を日本語で探したい",
  "PURSUE公開資料をスマホで確認したい",
  "UFO研究の入口として信頼できる資料に当たりたい",
];

const sourceTags = ["FBI", "NASA", "DoD", "State Department", "war.gov", "UAP Records"];
const heroDocumentTags = [
  "UAP Records",
  "Declassified UFO Files",
  "FBI UFO Document",
  "NASA UAP",
  "DoD Report",
  "State Department",
  "PDF 18 pages",
  "Public Status",
  "Media File",
  "Historical Archive",
];
const problemDocumentTags = [
  "REPORT 042",
  "DECLASSIFIED FILE",
  "PAGE 17 / 83",
  "UAP SIGHTING REF.",
  "NASA PHOTO",
  "DOD REPORT",
  "STATE DEPT MEMO",
  "VIDEO FILE",
  "RELEASE STATUS ?",
  "SOURCE PDF",
];

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  alternates: {
    canonical: "/ruppelt/lp",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    url: "/ruppelt/lp",
    siteName,
    locale: "ja_JP",
    images: [
      {
        url: "/ogp-ruppelt.jpg",
        width: 1200,
        height: 630,
        alt: "Ruppelt",
        type: "image/jpeg",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: metaTitle,
    description: metaDescription,
    images: ["/ogp-ruppelt.jpg"],
  },
  other: {
    "twitter:image:alt": "Ruppelt",
  },
};

const ruppeltLpJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Ruppelt",
  alternateName: "Ruppelt - アメリカ政府UAP・UFO機密解除資料ビューアー",
  applicationCategory: "ReferenceApplication",
  operatingSystem: "Web",
  url: appUrl,
  inLanguage: "ja-JP",
  description: metaDescription,
  image: `${siteUrl}/ogp-ruppelt.jpg`,
  creator: {
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
  },
  publisher: {
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": lpUrl,
    url: lpUrl,
    name: metaTitle,
    description: metaDescription,
  },
  about: [
    "UAP",
    "UFO",
    "PURSUE",
    "UAP Records",
    "FBI UFO文書",
    "NASA UAP資料",
    "アメリカ政府UAP資料",
    "機密解除資料",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
};

function Section({
  eyebrow,
  title,
  sectionIndex,
  variant,
  children,
}: {
  eyebrow?: string;
  title: string;
  sectionIndex?: number;
  variant?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`ruppelt-lp-section${variant ? ` ruppelt-lp-section-${variant}` : ""}`}
      data-reveal
      data-scroll-section={sectionIndex}
    >
      <div className="ruppelt-lp-stage">
        {eyebrow ? <p className="ruppelt-lp-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        <div className="ruppelt-lp-section-body">{children}</div>
      </div>
    </section>
  );
}

function PrimaryCta() {
  return (
    <Link className="ruppelt-lp-primary-cta" href={appHref}>
      Ruppeltで資料を検索する
    </Link>
  );
}

export default function RuppeltLandingPage() {
  return (
    <RuppeltLpMotion>
    <main className="ruppelt-lp">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ruppeltLpJsonLd) }}
      />
      <section className="ruppelt-lp-hero" data-reveal data-scroll-section={0}>
        <div className="ruppelt-lp-hero-shell">
        <div className="ruppelt-lp-hero-copy">
          <h1>アメリカ政府UAP資料を、日本語で探す。</h1>
          <p>
            Ruppeltは、PURSUE公開資料を日本語要約・資料検索・公開ステータスから確認できる資料ビューアーです。
          </p>
          <div className="ruppelt-lp-actions">
            <PrimaryCta />
          </div>
        </div>
        <div className="ruppelt-lp-hero-visual" aria-label="Ruppeltの検索UIイメージ">
          <div className="ruppelt-lp-document-cloud" aria-hidden="true">
            {heroDocumentTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="ruppelt-lp-search-demo">
            <div className="ruppelt-lp-search-bar">
              <span>検索</span>
              <strong>UAP 機密解除</strong>
            </div>
            <div className="ruppelt-lp-search-terms">
              <span>FBI UFO文書</span>
              <span>NASA UAP資料</span>
              <span>PURSUE 日本語</span>
            </div>
            <article className="ruppelt-lp-hero-record" aria-hidden="true">
              <span>公開ステータス: 初公開</span>
              <strong>FBI UFO Document</strong>
              <p>日本語要約で要点を確認し、原文PDFへ進む。</p>
            </article>
          </div>
        </div>
        </div>
      </section>

      <Section title="アメリカ政府UAP資料の公開は、大きな関心を集めました。" sectionIndex={1} variant="news">
        <div className="ruppelt-lp-news-strip" aria-label="資料公開の文脈">
          <span>PURSUE</span>
          <span>UAP Records</span>
          <span>2026</span>
          <span>May 8</span>
          <span>war.gov/UFO</span>
          <span>Public Documents</span>
        </div>
        <p>
          2026年5月、war.gov/UFO上でPURSUEとしてUAP・UFO関連資料の公開が始まりました。
        </p>
        <p>
          FBI、NASA、国防総省、国務省などに関わるPDF、動画、画像、歴史資料が含まれます。
        </p>
        <p>
          しかし公開されたことと、読みやすく検証できることは別の問題です。
        </p>
      </Section>

      <Section title="公開されている。でも、探しにくい。" sectionIndex={2} variant="problem">
        <div className="ruppelt-lp-problem-layout">
          <div className="ruppelt-lp-scattered-docs" aria-hidden="true">
            {problemDocumentTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="ruppelt-lp-problem-copy">
            <p>
              資料は英語で、量も多く、どこから読み始めればよいのかわかりにくい状態です。
            </p>
            <ul className="ruppelt-lp-list ruppelt-lp-problem-list">
              {problemItems.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  {item.body}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Ruppeltは、UAP資料への日本語ゲートウェイです。" sectionIndex={3} variant="solution">
        <div className="ruppelt-lp-solution-layout">
          <div>
            <p>
              Ruppeltは、散らばった公開資料を「探す」「要点を読む」「原文へ進む」ために整理します。
            </p>
            <p className="ruppelt-lp-note">
              翻訳アーカイブではなく、原文へたどり着くための検索・確認ツールです。
            </p>
          </div>
          <article className="ruppelt-lp-sample-card" aria-label="Ruppelt資料カードの例">
            <div className="ruppelt-lp-sample-topbar">
              <span>公開ステータス: 初公開</span>
              <span>FBI</span>
              <span className="ruppelt-lp-save-chip">
                ☆ 後で見るに追加
              </span>
            </div>
            <h3>FBI UFO Document</h3>
            <p>日本語要約: 要点を短く確認し、原文PDFへ進めます。</p>
            <a href={appHref}>一次資料リンク</a>
          </article>
        </div>
      </Section>

      <Section title="主な機能" sectionIndex={4} variant="features">
        <div className="ruppelt-lp-feature-grid">
          {features.map((feature, index) => (
            <article className="ruppelt-lp-feature-card" key={feature.title}>
              <div className={`ruppelt-lp-feature-mini ruppelt-lp-feature-mini-${index + 1}`} aria-hidden="true">
                {feature.title === "後で読む" ? (
                  <>
                    <span className="ruppelt-lp-feature-save">☆ 後で見るに追加</span>
                    <span />
                    <span />
                  </>
                ) : (
                  <>
                    <span />
                    <span />
                    <span />
                  </>
                )}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="資料の迷宮から、検索できるカードへ。" sectionIndex={5} variant="before-after">
        <div className="ruppelt-lp-before-after">
          <article className="ruppelt-lp-before">
            <p className="ruppelt-lp-label">Before</p>
            <div className="ruppelt-lp-before-stack" aria-hidden="true">
              <span>REPORT</span>
              <span>FILE 18</span>
              <span>UNSORTED</span>
              <span>PDF</span>
              <span>VIDEO</span>
              <span>UNKNOWN STATUS</span>
            </div>
            <p>英語の公開資料が並んでいるだけ。要点が見えず、スマホでは探しにくい。</p>
          </article>
          <article className="ruppelt-lp-after">
            <p className="ruppelt-lp-label">After</p>
            <div className="ruppelt-lp-after-card" aria-hidden="true">
              <strong>日本語要約</strong>
              <span>公開ステータス: 既公開</span>
              <span>後で読む</span>
              <span>原文PDFへ</span>
            </div>
            <p>日本語要約、公開ステータス、保存、原文リンク付きのカードで確認できる。</p>
          </article>
        </div>
      </Section>

      <Section title="こんな時に使えます" sectionIndex={6} variant="usecases">
        <ul className="ruppelt-lp-list ruppelt-lp-usecase-list">
          {useCases.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="PURSUE公開資料をもとに整理" sectionIndex={7} variant="source">
        <p>
          PURSUE公開資料をもとに、FBI、NASA、国防総省、国務省などの公開記録を整理しています。
        </p>
        <p className="ruppelt-lp-note ruppelt-lp-source-note">
          Ruppeltは原文資料を置き換えるものではありません。必ず元資料へ進める入口として設計しています。
        </p>
        <div className="ruppelt-lp-tags" aria-label="対象資料タグ">
          {sourceTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </Section>

      <section className="ruppelt-lp-final-cta" data-reveal data-scroll-section={8}>
        <div className="ruppelt-lp-final-ghost" aria-hidden="true">
          <span>UAP 機密解除</span>
          <span>FBI UFO文書</span>
          <span>公開ステータス</span>
        </div>
        <h2>アメリカ政府UAP資料を、日本語で探してみる。</h2>
        <p>
          散らばった公開資料を、Ruppeltでカードから確認できます。
        </p>
        <PrimaryCta />
      </section>

      <Section title="Ruppeltは、UFO Lab Tokyoのプロダクトです。" sectionIndex={9} variant="brand">
        <p className="ruppelt-lp-brand-mark">UFO Lab Tokyo</p>
        <p>
          UFO Lab Tokyoは、テクノロジーを通してUFOコミュニティに貢献するプロジェクトです。情報へのアクセス、英語の壁、断片化する記録の問題を、ソフトウェアで解決していきます。
        </p>
        <Link className="ruppelt-lp-secondary-cta" href={brandHref}>
          UFO Lab Tokyoを見る
        </Link>
      </Section>

      <SiteFooter />
    </main>
    </RuppeltLpMotion>
  );
}
