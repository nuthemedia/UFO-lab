import type { Metadata } from "next";
import Link from "next/link";
import { KeanPageHeader } from "@/app/kean/KeanPageHeader";
import { KeanPeopleIndex } from "@/app/kean/KeanPeopleIndex";
import { SiteFooter } from "@/components/SiteFooter";
import { people } from "@/data/kean/people";
import { siteConfig } from "@/lib/site";

const title = "UFO・UAPディスクロージャー人物図鑑";
const description =
  "デイヴィッド・グルーシュ、ルイス・エリゾンド、レスリー・キーン、議員、記者、検証系など、現代UFO・UAPディスクロージャーに関わる人物をカテゴリ別に整理します。";

export const metadata: Metadata = {
  title: `${title} | Kean`,
  description,
  alternates: {
    canonical: "/kean/people",
  },
  openGraph: {
    title: `${title} | Kean`,
    description,
    url: "/kean/people",
    siteName: siteConfig.shortName,
    locale: "ja_JP",
    type: "website",
  },
};

type KeanPeoplePageProps = {
  searchParams?: Promise<{ tag?: string | string[] }> | { tag?: string | string[] };
};

export default async function KeanPeoplePage({ searchParams }: KeanPeoplePageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const activeTag = Array.isArray(resolvedSearchParams?.tag)
    ? resolvedSearchParams?.tag[0]
    : resolvedSearchParams?.tag;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: "https://ufolab.tokyo/kean/people",
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
        activeHref="/kean/people"
        eyebrow="Kean People"
        title={title}
        subtitle="主要人物を知る"
        description={description}
      />

      <KeanPeopleIndex people={people} activeTag={activeTag} />

      <section className="kean-next-links" aria-label="次に読む">
        <Link href="/kean">トップへ戻る</Link>
        <Link href="/kean/about">基本から読み直す</Link>
      </section>

      <SiteFooter className="ohtsuki-footer" />
    </section>
  );
}
