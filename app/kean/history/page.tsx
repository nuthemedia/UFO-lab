import type { Metadata } from "next";
import Link from "next/link";
import { KeanHistory, type ResolvedTimelineEvent } from "@/components/KeanHistory";
import { KeanPageHeader } from "@/components/KeanPageHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { peopleById } from "@/data/kean/people";
import { timelineEvents } from "@/data/kean/timeline";
import { siteConfig } from "@/lib/site";

const title = "UFO・UAPディスクロージャーの歴史";
const description =
  "2017年以降のNYT報道、AATIP、Navy映像公開、ODNI報告、AARO、Grusch証言、米議会公聴会、公開資料の流れを時系列で整理します。";

export const metadata: Metadata = {
  title: `${title} | Kean`,
  description,
  alternates: {
    canonical: "/kean/history",
  },
  openGraph: {
    title: `${title} | Kean`,
    description,
    url: "/kean/history",
    siteName: siteConfig.shortName,
    locale: "ja_JP",
    type: "article",
  },
};

function resolveEvents(): ResolvedTimelineEvent[] {
  return timelineEvents.map((event) => ({
    ...event,
    chapterTitle:
      event.id === "2004-nimitz-tic-tac" ? `前史: ${event.chapterTitle}` : event.chapterTitle,
    relatedPeople: event.relatedPeople.map((relatedPerson) => {
      const person = peopleById.get(relatedPerson.personId);

      if (!person) {
        throw new Error(`Kean person not found: ${relatedPerson.personId}`);
      }

      return {
        ...relatedPerson,
        person,
      };
    }),
  }));
}

export default function KeanHistoryPage() {
  const events = resolveEvents();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    url: "https://ufolab.tokyo/kean/history",
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
        eyebrow="Kean History"
        title={title}
        subtitle="2017年から現在までの流れを追う"
        description={description}
      />

      <section className="kean-history-note" aria-label="歴史ページの読み方">
        <p>
          古典ユーフォロジー史ではなく、現代の情報公開・議会証言・公式報告を中心に読みます。
          2004年Nimitz/Tic Tac事件は、2017年以降の流れを理解するための前史として扱います。
        </p>
      </section>

      <KeanHistory events={events} />

      <section className="kean-next-links" aria-label="次に読む">
        <Link href="/kean/about">基本解説へ戻る</Link>
        <Link href="/kean/people">関係人物を見る</Link>
      </section>

      <SiteFooter className="ohtsuki-footer" />
    </section>
  );
}
