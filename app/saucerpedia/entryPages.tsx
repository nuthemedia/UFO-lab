import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { saucerpediaEvents } from "@/data/saucerpedia/events";
import { saucerpediaFakes } from "@/data/saucerpedia/fakes";
import { saucerpediaMisidentifications } from "@/data/saucerpedia/misidentifications";
import { saucerpediaMotifs } from "@/data/saucerpedia/motifs";
import { saucerpediaPeople } from "@/data/saucerpedia/people";
import { saucerpediaResources } from "@/data/saucerpedia/resources";
import { saucerpediaTerms } from "@/data/saucerpedia/terms";
import { siteUrl } from "@/lib/seo";
import {
  EventDetailCard,
  FakeDetailCard,
  MisidentificationDetailCard,
  MotifDetailCard,
  PersonDetailCard,
  ResourceDetailCard,
  TermDetailCard,
} from "./DetailCards";
import { createSaucerpediaMetadata } from "./seo";
import styles from "./saucerpedia.module.css";

export type SaucerpediaEntryType =
  | "term"
  | "person"
  | "event"
  | "misidentification"
  | "fake"
  | "resource"
  | "motif";

type EntryBase = {
  id: string;
  name: string;
  englishName?: string;
  summary: string;
};

type EntryConfig = {
  categoryTitle: string;
  eyebrow: string;
  route: string;
  toneClass: string;
  getItems: () => EntryBase[];
  renderDetail: (id: string, backHref: string) => ReactNode;
  schemaType: "DefinedTerm" | "Person" | "Event" | "Article";
};

const entryConfigs: Record<SaucerpediaEntryType, EntryConfig> = {
  term: {
    categoryTitle: "UFO用語辞典",
    eyebrow: "Saucerpedia Glossary",
    route: "/saucerpedia/terms",
    toneClass: styles.viewTeal,
    getItems: () => saucerpediaTerms,
    renderDetail: (id, backHref) => {
      const item = saucerpediaTerms.find((entry) => entry.id === id);
      return item ? <TermDetailCard backHref={backHref} term={item} /> : null;
    },
    schemaType: "DefinedTerm",
  },
  person: {
    categoryTitle: "UFO人物辞典",
    eyebrow: "Saucerpedia People",
    route: "/saucerpedia/people",
    toneClass: styles.viewIndigo,
    getItems: () => saucerpediaPeople,
    renderDetail: (id, backHref) => {
      const item = saucerpediaPeople.find((entry) => entry.id === id);
      return item ? <PersonDetailCard backHref={backHref} person={item} /> : null;
    },
    schemaType: "Person",
  },
  event: {
    categoryTitle: "UFO事件辞典",
    eyebrow: "Saucerpedia Cases",
    route: "/saucerpedia/events",
    toneClass: styles.viewAmber,
    getItems: () => saucerpediaEvents,
    renderDetail: (id, backHref) => {
      const item = saucerpediaEvents.find((entry) => entry.id === id);
      return item ? <EventDetailCard backHref={backHref} event={item} /> : null;
    },
    schemaType: "Event",
  },
  misidentification: {
    categoryTitle: "UFOと誤認",
    eyebrow: "Saucerpedia IFO",
    route: "/saucerpedia/misidentifications",
    toneClass: styles.viewMoss,
    getItems: () => saucerpediaMisidentifications,
    renderDetail: (id, backHref) => {
      const item = saucerpediaMisidentifications.find((entry) => entry.id === id);
      return item ? <MisidentificationDetailCard backHref={backHref} item={item} /> : null;
    },
    schemaType: "DefinedTerm",
  },
  fake: {
    categoryTitle: "UFOとフェイク",
    eyebrow: "Saucerpedia Fake",
    route: "/saucerpedia/fakes",
    toneClass: styles.viewRose,
    getItems: () => saucerpediaFakes,
    renderDetail: (id, backHref) => {
      const item = saucerpediaFakes.find((entry) => entry.id === id);
      return item ? <FakeDetailCard backHref={backHref} item={item} /> : null;
    },
    schemaType: "DefinedTerm",
  },
  resource: {
    categoryTitle: "UFO資料・機関辞典",
    eyebrow: "Saucerpedia Archives",
    route: "/saucerpedia/resources",
    toneClass: styles.viewCyan,
    getItems: () => saucerpediaResources,
    renderDetail: (id, backHref) => {
      const item = saucerpediaResources.find((entry) => entry.id === id);
      return item ? <ResourceDetailCard backHref={backHref} item={item} /> : null;
    },
    schemaType: "Article",
  },
  motif: {
    categoryTitle: "UFO体験モチーフ辞典",
    eyebrow: "Saucerpedia Motifs",
    route: "/saucerpedia/motifs",
    toneClass: styles.viewPlum,
    getItems: () => saucerpediaMotifs,
    renderDetail: (id, backHref) => {
      const item = saucerpediaMotifs.find((entry) => entry.id === id);
      return item ? <MotifDetailCard backHref={backHref} item={item} /> : null;
    },
    schemaType: "DefinedTerm",
  },
};

function findEntry(type: SaucerpediaEntryType, id: string): EntryBase | undefined {
  return entryConfigs[type].getItems().find((item) => item.id === id);
}

export function getSaucerpediaEntryStaticParams(type: SaucerpediaEntryType) {
  return entryConfigs[type].getItems().map((item) => ({ id: item.id }));
}

export function getSaucerpediaEntryMetadata(type: SaucerpediaEntryType, id: string): Metadata {
  const config = entryConfigs[type];
  const entry = findEntry(type, id);
  if (!entry) {
    return {};
  }

  return createSaucerpediaMetadata({
    title: `${entry.name}とは | saucerpedia`,
    description: entry.summary,
    canonical: `${config.route}/${entry.id}`,
  });
}

export function SaucerpediaEntryPage({ id, type }: { id: string; type: SaucerpediaEntryType }) {
  const config = entryConfigs[type];
  const entry = findEntry(type, id);
  if (!entry) {
    notFound();
  }

  const entryUrl = `${siteUrl}${config.route}/${entry.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": config.schemaType,
    name: entry.name,
    alternateName: entry.englishName,
    description: entry.summary,
    url: entryUrl,
    inLanguage: "ja-JP",
    mainEntityOfPage: entryUrl,
    ...(config.schemaType === "DefinedTerm"
      ? {
          inDefinedTermSet: {
            "@type": "DefinedTermSet",
            name: `Saucerpedia ${config.categoryTitle}`,
            url: `${siteUrl}${config.route}`,
          },
        }
      : {}),
  };

  return (
    <main className={`${styles.page} ${styles.pageWithMobileNav} ${config.toneClass}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className={styles.appHeader}>
        <Link aria-label="Saucerpedia ホームへ戻る" className={styles.appHeaderBrand} href="/saucerpedia">
          <span className={styles.appHeaderBrandText}>UFO ENCYCLOPEDIA</span>
        </Link>
        <div className={styles.appHeaderActions}>
          <Link className={styles.headerSearchLink} href="/saucerpedia/search">
            検索
          </Link>
        </div>
      </header>

      <section className={styles.categoryHero}>
        <div>
          <p className={styles.kicker}>{config.eyebrow}</p>
          <h1>{entry.name}</h1>
          <p>{entry.summary}</p>
        </div>
        <nav className={styles.directoryNav} aria-label="saucerpediaカテゴリ">
          <Link href="/saucerpedia">トップ</Link>
          <Link className={styles.activeDirectoryLink} href={config.route}>
            {config.categoryTitle}
          </Link>
        </nav>
      </section>

      <section className={`${styles.glossarySection} ${styles.categoryViewSection}`}>
        <div className={styles.detailRail}>{config.renderDetail(entry.id, config.route)}</div>
      </section>

      <nav className={styles.bottomNav} aria-label="主要カテゴリ">
        {[
          { href: "/saucerpedia/terms", label: "用語" },
          { href: "/saucerpedia/people", label: "人物" },
          { href: "/saucerpedia/events", label: "事件" },
        ].map((item) => (
          <Link
            aria-current={item.href === config.route ? "page" : undefined}
            className={item.href === config.route ? styles.activeBottomNavItem : undefined}
            href={item.href}
            key={item.href}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
