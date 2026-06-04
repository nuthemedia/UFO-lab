import type { Metadata } from "next";
import Link from "next/link";
import { KeanPageHeader } from "@/components/KeanPageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { keanUapRecords } from "@/data/kean/uap";
import { siteConfig } from "@/lib/site";

const title = "知っておきたいUAP";
const description =
  "Tic Tac、Gimbal、GoFastなど、現代UAPディスクロージャーを理解するうえで知っておきたい代表的な米海軍UAP映像を整理します。";

export const metadata: Metadata = {
  title: `${title} | Kean`,
  description,
  alternates: {
    canonical: "/kean/uap",
  },
  openGraph: {
    title: `${title} | Kean`,
    description,
    url: "/kean/uap",
    siteName: siteConfig.shortName,
    locale: "ja_JP",
    type: "website",
  },
};

export default function KeanUapPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: "https://ufolab.tokyo/kean/uap",
    inLanguage: "ja-JP",
    description,
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
        title={title}
        subtitle="Tic Tac / Gimbal / GoFast"
        description={description}
      />

      <section className="kean-uap-index" aria-label="UAPインデックス">
        {keanUapRecords.map((record) => (
          <Link className="kean-uap-card" href={`/kean/uap/${record.id}`} key={record.id}>
            <span>{record.yearLabel}</span>
            <h2>{record.jaName}</h2>
            <p>{record.shortSummary}</p>
            <strong>詳しく見る</strong>
          </Link>
        ))}
      </section>

      <section className="kean-next-links" aria-label="次に読む">
        <Link href="/kean/history">歴史で読む</Link>
        <Link href="/kean/people">人物図鑑を見る</Link>
      </section>

      <SiteFooter className="ohtsuki-footer" />
    </section>
  );
}
