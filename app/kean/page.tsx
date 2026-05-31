import type { Metadata } from "next";
import Link from "next/link";
import { KeanPageHeader } from "@/components/KeanPageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { keanEvidencePrinciples, keanPortalCards, keanReadingFlow } from "@/data/kean/guide";
import { siteConfig } from "@/lib/site";

const keanTitle = "Kean";
const keanSubtitle = "UFO・UAPディスクロージャー入門";
const keanDescription =
  "近年のUFO・UAP情報公開、議会証言、報道、映画をきっかけに、ディスクロージャーの流れを日本語で整理する入門ポータル。";

export const metadata: Metadata = {
  title: `${keanTitle} | ${keanSubtitle}`,
  description: keanDescription,
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
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${keanTitle} | ${keanSubtitle}`,
    description: keanDescription,
  },
};

export default function KeanPage() {
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
  };

  return (
    <section className="checker-page kean-page kean-portal-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <KeanPageHeader
        title={keanTitle}
        subtitle={keanSubtitle}
        description={keanDescription}
        variant="portal"
      />

      <nav className="kean-portal-card-grid" aria-label="Kean sections">
        {keanPortalCards.map((card) => (
          <Link className="kean-portal-card" href={card.href} key={card.href}>
            <span>{card.label}</span>
            <strong>{card.title}</strong>
            <p>{card.description}</p>
          </Link>
        ))}
      </nav>

      <section className="kean-portal-layout" aria-label="Keanの読み方">
        <div className="kean-portal-panel">
          <p className="eyebrow">Read First</p>
          <h2>初めての人はこの順番で読む</h2>
          <div className="kean-reading-flow">
            {keanReadingFlow.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="kean-portal-panel kean-portal-panel--compact">
          <p className="eyebrow">Principle</p>
          <h2>分けて読む</h2>
          <p>
            Keanは、UFO・UAPディスクロージャーを断定ではなく情報整理として扱います。
            読むときは次の3つを分けます。
          </p>
          <ul>
            {keanEvidencePrinciples.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="kean-portal-note" aria-label="今後追加予定">
        <h2>今後追加予定</h2>
        <p>
          人物個別ページと歴史イベント個別ページを追加し、解説・歴史・人物を相互リンクさせていきます。
          まずは入門ポータルとして、全体像をつかむための導線を優先しています。
        </p>
      </section>

      <SiteFooter className="ohtsuki-footer" />
    </section>
  );
}
