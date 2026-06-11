import type { Metadata } from "next";
import Link from "next/link";
import { KeanPageHeader } from "@/app/kean/KeanPageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { keanGuideSections } from "@/data/kean/guide";
import { siteConfig } from "@/lib/site";

const title = "UFO・UAPディスクロージャーとは？";
const description =
  "UFO・UAPディスクロージャーの意味、UAPという言葉、近年話題になっている理由、映画と現実の情報公開の違いを初心者向けに整理します。";

export const metadata: Metadata = {
  title: `${title} | Kean`,
  description,
  alternates: {
    canonical: "/kean/about",
  },
  openGraph: {
    title: `${title} | Kean`,
    description,
    url: "/kean/about",
    siteName: siteConfig.shortName,
    locale: "ja_JP",
    type: "article",
  },
};

export default function KeanAboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    url: "https://ufolab.tokyo/kean/about",
    inLanguage: "ja-JP",
    description,
    publisher: {
      "@type": "Organization",
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
        activeHref="/kean/about"
        eyebrow="Kean Guide"
        title={title}
        subtitle="まず基本を知る"
        description={description}
      />

      <article className="kean-guide-article">
        {keanGuideSections.map((section, index) => (
          <section className="kean-guide-block" id={section.id} key={section.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </article>

      <section className="kean-next-links" aria-label="次に読む">
        <Link href="/kean/history">次に読む: 2017年以降の流れを見る</Link>
        <Link href="/kean/people">人物図鑑で関係者を見る</Link>
      </section>

      <SiteFooter className="ohtsuki-footer" />
    </section>
  );
}
