import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KeanPageHeader } from "@/components/KeanPageHeader";
import { KeanTicTacModelViewer } from "@/components/KeanTicTacModelViewer";
import { SiteFooter } from "@/components/SiteFooter";
import { keanUapById, keanUapRecords } from "@/data/kean/uap";
import { siteConfig } from "@/lib/site";

type KeanUapDetailPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export const dynamicParams = false;

function getUapSeoDescription(record: (typeof keanUapRecords)[number]) {
  return `${record.jaName}とは。${record.shortSummary} 公開映像、確認済み事実、議論点、注意点を日本語で整理します。`;
}

function getUapSeoKeywords(record: (typeof keanUapRecords)[number]) {
  return Array.from(
    new Set([
      `${record.jaName}とは`,
      record.jaName,
      record.name,
      `${record.name} UAP`,
      "UAP動画",
      "米海軍UAP映像",
      "NAVAIR",
      "DoD",
      "UFOディスクロージャー",
      "UAP開示",
      "未確認異常現象",
    ]),
  );
}

function getOfficialSourceLink(record: (typeof keanUapRecords)[number]) {
  return (
    record.sourceLinks.find((source) => source.url.includes("navair.navy.mil/foia/documents")) ??
    record.sourceLinks[0]
  );
}

export function generateStaticParams() {
  return keanUapRecords.map((record) => ({ id: record.id }));
}

export async function generateMetadata({ params }: KeanUapDetailPageProps): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const record = keanUapById.get(id);

  if (!record) {
    return {};
  }

  const title = `${record.jaName}とは`;
  const description = getUapSeoDescription(record);
  const imageUrl = `/kean/uap/${record.id}/opengraph-image`;

  return {
    title: `${title} | Kean 知っておきたいUAP`,
    description,
    keywords: getUapSeoKeywords(record),
    alternates: {
      canonical: `/kean/uap/${record.id}`,
    },
    openGraph: {
      title: `${title} | Kean 知っておきたいUAP`,
      description,
      url: `/kean/uap/${record.id}`,
      siteName: siteConfig.shortName,
      locale: "ja_JP",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${record.jaName}とは | Kean`,
          type: "image/png",
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Kean 知っておきたいUAP`,
      description,
      images: [imageUrl],
    },
    other: {
      "twitter:image:alt": `${record.jaName}とは | Kean`,
    },
  };
}

function TextList({ items }: { items: string[] }) {
  return (
    <ul className="kean-text-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function KeanUapDetailPage({ params }: KeanUapDetailPageProps) {
  const { id } = await Promise.resolve(params);
  const record = keanUapById.get(id);

  if (!record) {
    notFound();
  }

  const officialSourceLink = getOfficialSourceLink(record);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${record.jaName}とは`,
    url: `https://ufolab.tokyo/kean/uap/${record.id}`,
    inLanguage: "ja-JP",
    description: getUapSeoDescription(record),
    mainEntityOfPage: `https://ufolab.tokyo/kean/uap/${record.id}`,
    about: getUapSeoKeywords(record),
    citation: record.sourceLinks.map((source) => source.url),
    video: {
      "@type": "VideoObject",
      name: record.videoLabel,
      description: `${record.jaName}に関する公式公開動画`,
      contentUrl: record.officialVideoUrl,
      uploadDate: "2020-04-27",
    },
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.shortName,
      url: siteConfig.url,
    },
  };

  return (
    <section className="checker-page kean-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KeanPageHeader
        activeHref="/kean/uap"
        eyebrow="Kean UAP"
        title={record.jaName}
        subtitle={`${record.yearLabel} / ${record.name}`}
        description={record.shortSummary}
      />

      <article className="kean-uap-detail">
        {record.model ? <KeanTicTacModelViewer modelSrc={record.model.src} /> : null}

        <section className="kean-detail-block">
          <h2>何が映っているとされる？</h2>
          <p>{record.whatIsShown}</p>
        </section>

        <section className="kean-detail-block">
          <h2>確認済み事実</h2>
          <TextList items={record.verifiedFacts} />
        </section>

        <section className="kean-detail-block">
          <h2>議論点</h2>
          <TextList items={record.discussionPoints} />
        </section>

        <section className="kean-detail-block">
          <h2>注意点</h2>
          <TextList items={record.cautions} />
        </section>

        <section className="kean-uap-video" aria-label={`${record.jaName}の公式動画`}>
          <div>
            <span>公式動画</span>
            <h2>{record.videoLabel}</h2>
            <p>
              NAVAIRの公式公開動画は外部サーバーの制限や形式により、環境によって埋め込み再生できない場合があります。
              その場合は公式リンクを別タブで開いて確認してください。
            </p>
          </div>
          {record.officialVideoUrl.endsWith(".mp4") ? (
            <>
              <video controls preload="metadata" playsInline src={record.officialVideoUrl}>
                <a href={record.officialVideoUrl}>公式動画を別タブで開く</a>
              </video>
              <a
                className="kean-uap-video-link"
                href={record.officialVideoUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                公式動画を別タブで開く
              </a>
            </>
          ) : (
            <div className="kean-uap-video-fallback">
              <p>
                この公式動画はWMV形式のため、直接開くと環境によってダウンロードになる場合があります。
              </p>
              <a href={officialSourceLink.url} target="_blank" rel="noreferrer noopener">
                {officialSourceLink.label}で確認する
              </a>
            </div>
          )}
        </section>

        <section className="kean-detail-block">
          <h2>出典リンク</h2>
          <ul className="kean-source-list">
            {record.sourceLinks.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer noopener">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>

      <section className="kean-next-links" aria-label="次に読む">
        <Link href="/kean/uap">知っておきたいUAPへ戻る</Link>
        <Link href="/kean/history">歴史で読む</Link>
      </section>

      <SiteFooter className="ohtsuki-footer" />
    </section>
  );
}
