import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { KeanPageHeader } from "@/components/KeanPageHeader";
import { KeanTicTacModelViewer } from "@/components/KeanTicTacModelViewer";
import { SiteFooter } from "@/components/SiteFooter";
import { getKeanTagLabel } from "@/data/kean/labels";
import { keanEvidencePrinciples, keanReadingFlow } from "@/data/kean/guide";
import { peopleById } from "@/data/kean/people";
import { timelineEvents } from "@/data/kean/timeline";
import { keanUapById, keanUapRecords } from "@/data/kean/uap";
import { getKeanPersonIllustration } from "@/lib/keanPortrait";
import { siteConfig } from "@/lib/site";

const keanTitle = "Kean";
const keanSubtitle = "UFO・UAPディスクロージャー入門";
const keanDescription =
  "2017年以降の米国UAP報道、議会証言、公的報告、人物の発言を日本語で確認。";
const keanOgImage = "/kean/opengraph-image";
const keanKeywords = [
  "UFOディスクロージャーとは",
  "UAPとは",
  "UAP開示",
  "UFO開示",
  "ディスクロージャー",
  "Disclosure Day 実話",
  "グルーシュとは",
  "エリゾンドとは",
  "レスリー・キーンとは",
  "Tic Tac",
  "Gimbal",
  "GoFast",
];
const keanEvidenceLegend = ["公的資料", "報道", "証言", "未検証・注意"];

export const metadata: Metadata = {
  title: `${keanTitle} | ${keanSubtitle}`,
  description: keanDescription,
  keywords: keanKeywords,
  alternates: {
    canonical: "/kean",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: `${keanTitle} | ${keanSubtitle}`,
    description: keanDescription,
    url: "/kean",
    siteName: siteConfig.shortName,
    locale: "ja_JP",
    images: [
      {
        url: keanOgImage,
        width: 1200,
        height: 630,
        alt: `${keanTitle} | ${keanSubtitle}`,
        type: "image/png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${keanTitle} | ${keanSubtitle}`,
    description: keanDescription,
    images: [keanOgImage],
  },
  other: {
    "twitter:image:alt": `${keanTitle} | ${keanSubtitle}`,
  },
};

export default function KeanPage() {
  const featuredPeople = ["david-grusch", "luis-elizondo", "leslie-kean", "marco-rubio"]
    .map((id) => peopleById.get(id))
    .filter(Boolean);
  const featuredEvents = timelineEvents.filter((event) =>
    ["2017-nyt-aatip", "2023-grusch-house-hearing", "2023-2024-uap-disclosure-act-aaro-report"].includes(event.id),
  );
  const featuredTags = ["journalism", "hearing", "AATIP", "skeptic"];
  const ticTac = keanUapById.get("tic-tac");
  const featuredUap = keanUapRecords;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${keanTitle} - ${keanSubtitle}`,
    url: "https://ufolab.tokyo/kean",
    inLanguage: "ja-JP",
    description: keanDescription,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.shortName,
      url: siteConfig.url,
    },
    about: ["UFOディスクロージャー", "UAP", "UFO", "情報公開", "Disclosure Day"],
    hasPart: [
      {
        "@type": "WebPage",
        name: "UFO・UAPディスクロージャーとは？",
        url: "https://ufolab.tokyo/kean/about",
      },
      {
        "@type": "WebPage",
        name: "UFO・UAPディスクロージャーの歴史",
        url: "https://ufolab.tokyo/kean/history",
      },
      {
        "@type": "CollectionPage",
        name: "知っておきたいUAP",
        url: "https://ufolab.tokyo/kean/uap",
      },
      {
        "@type": "CollectionPage",
        name: "人物図鑑",
        url: "https://ufolab.tokyo/kean/people",
      },
    ],
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Keanで最初に読む入口",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ディスクロージャーとは",
        url: "https://ufolab.tokyo/kean/about",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "歴史で読む",
        url: "https://ufolab.tokyo/kean/history",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "知っておきたいUAP",
        url: "https://ufolab.tokyo/kean/uap",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "人物図鑑",
        url: "https://ufolab.tokyo/kean/people",
      },
    ],
  };

  return (
    <section className="checker-page kean-page kean-portal-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <section className="kean-home-hero" aria-label="Keanトップ">
        <KeanPageHeader
          activeHref="/kean"
          title={keanTitle}
          subtitle={keanSubtitle}
          variant="portal"
        />
      </section>

      <section className="kean-home-intro" aria-label="Kean入口">
        <div className="kean-home-intro-copy">
          <span>現代UAPディスクロージャー入門</span>
          <h2>事実・主張・未検証点を分けて読む。</h2>
          <p>2017年以降の米国UAP報道、議会証言、公的報告、人物の発言を日本語で確認</p>
          <div className="kean-evidence-legend" aria-label="根拠の読み分け">
            {keanEvidenceLegend.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="kean-home-actions" aria-label="主要導線">
            <Link href="/kean/about">基本を読む</Link>
            <Link href="/kean/history">歴史を追う</Link>
            <Link href="/kean/people">人物図鑑を見る</Link>
          </div>
        </div>

        <nav className="kean-home-read-order" aria-label="順番に読む">
          <h2>順番に読む</h2>
          {keanReadingFlow.map((item) => (
            <Link
              href={item.label === "01" ? "/kean/about" : item.label === "02" ? "/kean/history" : "/kean/people"}
              key={item.label}
            >
              <span>{item.label}</span>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </Link>
          ))}
        </nav>
      </section>

      {ticTac?.model ? (
        <section className="kean-home-uap-spotlight" aria-label="代表的なUAP映像">
          <div className="kean-home-uap-copy">
            <span>代表的な米海軍UAP映像から見る</span>
            <p>Tic Tacは、現代UAPディスクロージャーで繰り返し参照される代表例のひとつです。</p>
          </div>
          <KeanTicTacModelViewer modelSrc={ticTac.model.src} variant="compact" />
        </section>
      ) : null}

      <section className="kean-home-grid" aria-label="資料索引">
        <div className="kean-home-panel kean-home-panel--uap">
          <div className="kean-home-panel-head">
            <span>代表例で読む</span>
            <h2>知っておきたいUAP</h2>
          </div>
          <div className="kean-home-uap-cases">
            {featuredUap.map((record) => (
              <Link href={`/kean/uap/${record.id}`} key={record.id}>
                <span>{record.yearLabel}</span>
                <strong>{record.jaName}</strong>
                <p>{record.shortSummary}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="kean-home-panel kean-home-panel--history">
          <div className="kean-home-panel-head">
            <span>歴史で読む</span>
            <h2>近年の流れをつかむ</h2>
          </div>
          <ol className="kean-home-history-list">
            {featuredEvents.map((event) => (
              <li key={event.id}>
                <Link href={`/kean/history#kean-event-${event.id}`}>
                  <span>{event.yearLabel}</span>
                  <strong>{event.title}</strong>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <div className="kean-home-panel kean-home-panel--people">
          <div className="kean-home-panel-head">
            <span>人物図鑑で読む</span>
            <h2>注目人物</h2>
          </div>
          <div className="kean-home-people">
            {featuredPeople.map((person) => {
              if (!person) {
                return null;
              }
              const image = getKeanPersonIllustration(person);
              return (
                <Link href={`/kean/people/${person.id}`} key={person.id}>
                  <span className="kean-home-person-image">
                    {image ? (
                      <Image src={image.src} alt={image.alt} width={image.width ?? 1024} height={image.height ?? 1024} />
                    ) : null}
                  </span>
                  <span className="kean-home-person-copy">
                    <strong>{person.jaName}</strong>
                    <small>{person.name}</small>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="kean-home-panel kean-home-panel--tags">
          <div className="kean-home-panel-head">
            <span>関心から探す</span>
            <h2>人物タグで探す</h2>
          </div>
          <div className="kean-home-tags">
            {featuredTags.map((tag) => (
              <Link href={`/kean/people?tag=${encodeURIComponent(tag)}`} key={tag}>
                {getKeanTagLabel(tag)}
              </Link>
            ))}
          </div>
        </div>

        <div className="kean-home-panel kean-home-panel--documents">
          <div className="kean-home-panel-head">
            <span>公開資料を読む</span>
            <h2>公開資料・翻訳資料</h2>
          </div>
          <div className="kean-home-tags">
            <Link href="/ruppelt">米国UFO機密開示情報を日本語で読む</Link>
          </div>
        </div>

        <aside className="kean-home-panel kean-home-panel--principle">
          <div className="kean-home-panel-head">
            <span>読む姿勢</span>
            <h2>断定せずに分ける</h2>
          </div>
          <ul className="kean-home-principles">
            {keanEvidencePrinciples.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <SiteFooter className="ohtsuki-footer" />
    </section>
  );
}
