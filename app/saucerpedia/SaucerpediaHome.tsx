"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { MouseEvent, ReactNode } from "react";
import { eventCategories, saucerpediaEvents } from "@/data/saucerpedia/events";
import type { SaucerpediaEvent } from "@/data/saucerpedia/events";
import { fakeKinds, saucerpediaFakes } from "@/data/saucerpedia/fakes";
import type { SaucerpediaFake } from "@/data/saucerpedia/fakes";
import { saucerpediaHistoryCards } from "@/data/saucerpedia/history";
import type { SaucerpediaHistoryCard } from "@/data/saucerpedia/history";
import {
  getRelationsForEntity,
  resolveSaucerpediaRelation,
  saucerpediaEntities,
  type SaucerpediaEntityType,
  type SaucerpediaRelation,
} from "@/data/saucerpedia/knowledge";
import {
  misidentificationKinds,
  saucerpediaMisidentifications,
} from "@/data/saucerpedia/misidentifications";
import type { SaucerpediaMisidentification } from "@/data/saucerpedia/misidentifications";
import { motifCategories, saucerpediaMotifs } from "@/data/saucerpedia/motifs";
import type { SaucerpediaMotif } from "@/data/saucerpedia/motifs";
import { peopleFeatureCards, personCategories, saucerpediaPeople } from "@/data/saucerpedia/people";
import type { SaucerpediaPerson } from "@/data/saucerpedia/people";
import { resourceKinds, saucerpediaResources } from "@/data/saucerpedia/resources";
import type { SaucerpediaResource } from "@/data/saucerpedia/resources";
import { saucerpediaTerms, termCategories } from "@/data/saucerpedia/terms";
import type { SaucerpediaTerm } from "@/data/saucerpedia/terms";
import { SaucerpediaBookStackHero } from "./SaucerpediaBookStackHero";
import styles from "./saucerpedia.module.css";

const productLinks = [
  { name: "UFO形状辞典（KINICHI）", href: "/kinichi", label: "UFO形状・形体・3Dモデル" },
  { name: "現代UFO・UAPディスクロージャー入門（Kean）", href: "/kean", label: "現代UAP・関係人物・公開文脈" },
];

const shapeSearchItems = [
  {
    id: "disc",
    title: "円盤型",
    summary: "古典的な空飛ぶ円盤イメージを代表する形状。詳しい形状分類はKinichiで扱います。",
    tags: ["形状", "空飛ぶ円盤", "Kinichi"],
  },
  {
    id: "sphere",
    title: "球形",
    summary: "光球、球状物体、オーブ状の見え方を含む形状表現。誤認や観測条件とも関係します。",
    tags: ["形状", "光点", "誤認"],
  },
  {
    id: "triangle",
    title: "三角形",
    summary: "三角形UFOや編隊光として語られる形状。ベルギーUFOウェーブなどとも関連します。",
    tags: ["形状", "三角形UFO", "事件"],
  },
];

const searchTypeFilters = [
  "すべて",
  "用語",
  "事件",
  "人物",
  "資料",
  "形状",
  "誤認",
  "フェイク",
  "体験",
];

export type SaucerpediaView =
  | "home"
  | "terms"
  | "people"
  | "events"
  | "history"
  | "misidentifications"
  | "fakes"
  | "resources"
  | "motifs"
  | "search";

const directoryLinks = [
  { href: "/saucerpedia/terms", kicker: "Glossary", title: "UFO用語辞典", body: "基本語から現代UAPまで、意味と関連項目をカードで調べる。", count: `${saucerpediaTerms.length}` },
  { href: "/saucerpedia/people", kicker: "People", title: "UFO人物辞典", body: "研究者、目撃者、コンタクティ、現代UAP関係者を立場で読む。", count: `${saucerpediaPeople.length}` },
  { href: "/saucerpedia/events", kicker: "Cases", title: "UFO事件辞典", body: "古典UFOから現代UAP、日本UFO史まで代表事件をたどる。", count: `${saucerpediaEvents.length}` },
  { href: "/saucerpedia/history", kicker: "History", title: "UFOの歴史", body: "現代UFO以前から現代UAPまで、時代ごとの見取り図を読む。", count: `${saucerpediaHistoryCards.length}` },
  { href: "/saucerpedia/misidentifications", kicker: "IFO", title: "UFOと誤認", body: "天体、航空機、カメラ由来など、UFOに見えやすい対象を整理する。", count: `${saucerpediaMisidentifications.length}` },
  { href: "/saucerpedia/fakes", kicker: "Fake", title: "UFOとフェイク", body: "写真・動画を見るときの作為や確認観点を整理する。", count: `${saucerpediaFakes.length}` },
  { href: "/saucerpedia/resources", kicker: "Archives", title: "UFO資料・機関辞典", body: "政府調査、公開制度、民間団体、資料アーカイブを整理する。", count: `${saucerpediaResources.length}` },
  { href: "/saucerpedia/motifs", kicker: "Motifs", title: "UFO体験モチーフ辞典", body: "体験談に繰り返し出てくる要素を文化史の入口として読む。", count: `${saucerpediaMotifs.length}` },
];

const returnStateKey = "saucerpedia:return-target";

const entityTypeToView: Partial<Record<SaucerpediaEntityType, SaucerpediaView>> = {
  event: "events",
  fake: "fakes",
  history: "history",
  misidentification: "misidentifications",
  motif: "motifs",
  person: "people",
  resource: "resources",
  term: "terms",
};

const searchFilterByType: Record<SaucerpediaEntityType | "shape", string> = {
  event: "事件",
  fake: "フェイク",
  history: "すべて",
  misidentification: "誤認",
  motif: "体験",
  person: "人物",
  product: "すべて",
  resource: "資料",
  shape: "形状",
  term: "用語",
};

type SpecimenKind =
  | "term"
  | "person"
  | "event"
  | "history"
  | "misidentification"
  | "fake"
  | "resource"
  | "motif";

function SpecimenIllustration({ kind, size = "mini" }: { kind: SpecimenKind; size?: "mini" | "detail" | "hero" }) {
  const className = `${styles.specimen} ${styles[`specimen-${kind}`]} ${styles[`specimen-${size}`]}`;

  return (
    <span aria-hidden="true" className={className}>
      <svg viewBox="0 0 96 96" role="img">
        <rect className={styles.specimenPlate} x="14" y="18" width="60" height="54" rx="11" />
        {kind === "term" ? (
          <>
            <path className={styles.specimenFilm} d="M25 28h30v24H25z" />
            <path className={styles.specimenLine} d="M31 35h18M31 42h14" />
            <circle className={styles.specimenMark} cx="58" cy="58" r="9" />
            <path className={styles.specimenStroke} d="m65 65 10 10" />
          </>
        ) : null}
        {kind === "person" ? (
          <>
            <path className={styles.specimenFilm} d="M24 30h46v34H24z" />
            <circle className={styles.specimenMark} cx="39" cy="43" r="7" />
            <path className={styles.specimenStroke} d="M28 61c3-9 19-9 22 0" />
            <path className={styles.specimenLine} d="M54 39h11M54 47h9M54 55h12" />
            <path className={styles.specimenLine} d="M29 71h34" />
          </>
        ) : null}
        {kind === "event" ? (
          <>
            <path className={styles.specimenFilm} d="M28 56h34v16H28z" />
            <path className={styles.specimenStroke} d="M48 24c-8 0-14 6-14 14 0 11 14 25 14 25s14-14 14-25c0-8-6-14-14-14Z" />
            <circle className={styles.specimenDot} cx="48" cy="38" r="4" />
            <path className={styles.specimenLine} d="M35 64h20" />
          </>
        ) : null}
        {kind === "history" ? (
          <>
            <path className={styles.specimenFilm} d="M25 42h44v26H25z" />
            <path className={styles.specimenPlate} d="M30 32h18l5 10H30z" />
            <path className={styles.specimenStroke} d="M26 55h43" />
            <circle className={styles.specimenMark} cx="32" cy="55" r="4" />
            <circle className={styles.specimenDot} cx="47" cy="55" r="3.4" />
            <circle className={styles.specimenDot} cx="62" cy="55" r="3.4" />
            <path className={styles.specimenLine} d="M32 27h22M33 65h25" />
          </>
        ) : null}
        {kind === "misidentification" ? (
          <>
            <circle className={styles.specimenMark} cx="30" cy="38" r="5" />
            <path className={styles.specimenFilm} d="M43 30c8 0 14 5 16 13H27c2-8 8-13 16-13Z" />
            <path className={styles.specimenStroke} d="M58 60h20l-10-9Z" />
            <path className={styles.specimenLine} d="M22 70h58" />
          </>
        ) : null}
        {kind === "fake" ? (
          <>
            <path className={styles.specimenFilm} d="M27 29h38v35H27z" />
            <path className={styles.specimenStroke} d="m35 45 8 8 17-18" />
            <path className={styles.specimenLine} d="M24 25h11M59 25h11M24 68h11M59 68h11" />
            <path className={styles.specimenLine} d="M36 61h21" />
          </>
        ) : null}
        {kind === "resource" ? (
          <>
            <path className={styles.specimenFilm} d="M23 35h48v30H23z" />
            <path className={styles.specimenPlate} d="M28 28h18l5 7H28z" />
            <path className={styles.specimenLine} d="M33 45h25M33 53h18" />
            <path className={styles.specimenStroke} d="M66 42v28" />
          </>
        ) : null}
        {kind === "motif" ? (
          <>
            <path className={styles.specimenFilm} d="M26 28h42v32H26z" />
            <path className={styles.specimenStroke} d="M47 28v32M26 44h42" />
            <circle className={styles.specimenMark} cx="58" cy="38" r="4" />
            <path className={styles.specimenLine} d="M31 70h31" />
          </>
        ) : null}
      </svg>
    </span>
  );
}

function isPrimarySearchType(type: SaucerpediaEntityType) {
  return ["term", "event", "person", "resource", "misidentification", "fake", "motif"].includes(type);
}

function getCardElementId(type: SaucerpediaEntityType, id: string) {
  return `saucerpedia-card-${type}-${id}`;
}

function getEntityKey(type: SaucerpediaEntityType, id: string) {
  return `${type}-${id}`;
}

function scrollToDetail(behavior: ScrollBehavior = "smooth") {
  document.getElementById("selected-detail")?.scrollIntoView({ behavior, block: "start" });
}

function storeReturnTarget(type: SaucerpediaEntityType, id: string) {
  sessionStorage.setItem(
    returnStateKey,
    JSON.stringify({
      elementId: getCardElementId(type, id),
      href: `${window.location.pathname}${window.location.search}`,
      y: window.scrollY,
    }),
  );
}

function getTermText(term: SaucerpediaTerm) {
  return [
    term.name,
    term.englishName,
    term.translation,
    term.category,
    term.summary,
    term.quickRead,
    term.detail,
    ...(term.aliases ?? []),
    ...term.tags,
    ...(term.relatedTerms ?? []),
    ...(term.relatedPeople ?? []),
    ...(term.relatedEvents ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function byLearningOrder(a: SaucerpediaTerm, b: SaucerpediaTerm) {
  return a.order - b.order;
}

function getPersonText(person: SaucerpediaPerson) {
  return [
    person.name,
    person.englishName,
    person.period,
    person.role,
    person.category,
    person.summary,
    person.quickRead,
    ...person.tags,
    ...(person.relatedTerms ?? []),
    ...(person.relatedEvents ?? []),
    ...(person.relatedPeople ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getEventText(event: SaucerpediaEvent) {
  return [
    event.name,
    event.englishName,
    event.date,
    event.year,
    event.location,
    event.category,
    event.summary,
    event.quickRead,
    event.whatHappened,
    ...event.tags,
    ...(event.relatedPeople ?? []),
    ...(event.relatedTerms ?? []),
    ...(event.relatedShapes ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getMisidentificationText(item: SaucerpediaMisidentification) {
  return [
    item.name,
    item.englishName,
    item.category,
    item.kind,
    item.summary,
    item.quickRead,
    item.whyItLooksLikeUfo,
    ...(item.aliases ?? []),
    ...item.howToTell,
    ...item.commonAppearance,
    ...item.relatedTerms,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getFakeText(item: SaucerpediaFake) {
  return [
    item.name,
    item.englishName,
    item.category,
    item.kind,
    item.summary,
    item.quickRead,
    item.whyBelievable,
    ...(item.aliases ?? []),
    ...item.howToCheck,
    ...item.relatedTerms,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getResourceText(item: SaucerpediaResource) {
  return [
    item.name,
    item.englishName,
    item.kind,
    item.era,
    item.summary,
    item.quickRead,
    item.whatItDid,
    ...(item.aliases ?? []),
    ...(item.relatedPeople ?? []),
    ...item.relatedTerms,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getMotifText(item: SaucerpediaMotif) {
  return [
    item.name,
    item.englishName,
    item.category,
    item.summary,
    item.experienceContext,
    ...(item.relatedEvents ?? []),
    ...(item.relatedPeople ?? []),
    ...item.relatedTerms,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function TermListCard({
  isDetailSource,
  isSelected,
  onOpenDetail,
  onSelect,
  term,
}: {
  isDetailSource: boolean;
  isSelected: boolean;
  onOpenDetail: () => void;
  onSelect: () => void;
  term: SaucerpediaTerm;
}) {
  return (
    <article
      className={`${styles.termCard} ${isSelected ? styles.termCardActive : ""} ${isDetailSource ? styles.detailSourceCard : ""}`}
      data-detail-source={isDetailSource || undefined}
      data-selected-card={isSelected || undefined}
      id={getCardElementId("term", term.id)}
    >
      <button aria-pressed={isSelected} className={styles.termCardBody} onClick={onSelect} type="button">
        <span className={styles.cardTopRow}>
          <span className={styles.termCategory}>{term.category}</span>
          <SpecimenIllustration kind="term" />
        </span>
        <strong>{term.name}</strong>
        <span className={styles.termSubline}>
          {[term.englishName, term.translation].filter(Boolean).join(" / ")}
        </span>
        <p>{term.summary}</p>
        <span className={styles.tagRow}>
          {term.tags.slice(0, 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </span>
      </button>
      <button className={styles.cardDetailButton} onClick={onOpenDetail} type="button">
        詳細を読む
      </button>
    </article>
  );
}

function PersonListCard({
  isDetailSource,
  isSelected,
  onOpenDetail,
  onSelect,
  person,
}: {
  isDetailSource: boolean;
  isSelected: boolean;
  onOpenDetail: () => void;
  onSelect: () => void;
  person: SaucerpediaPerson;
}) {
  return (
    <article
      className={`${styles.termCard} ${isSelected ? styles.termCardActive : ""} ${isDetailSource ? styles.detailSourceCard : ""}`}
      data-detail-source={isDetailSource || undefined}
      data-selected-card={isSelected || undefined}
      id={getCardElementId("person", person.id)}
    >
      <button aria-pressed={isSelected} className={styles.termCardBody} onClick={onSelect} type="button">
        <span className={styles.cardTopRow}>
          <span className={styles.termCategory}>{person.category}</span>
          <SpecimenIllustration kind="person" />
        </span>
        <strong>{person.name}</strong>
        <span className={styles.termSubline}>
          {[person.englishName, person.role].filter(Boolean).join(" / ")}
        </span>
        <p>{person.summary}</p>
        <span className={styles.tagRow}>
          {person.tags.slice(0, 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </span>
      </button>
      <button className={styles.cardDetailButton} onClick={onOpenDetail} type="button">
        詳細を読む
      </button>
    </article>
  );
}

function EventListCard({
  event,
  isDetailSource,
  isSelected,
  onOpenDetail,
  onSelect,
}: {
  event: SaucerpediaEvent;
  isDetailSource: boolean;
  isSelected: boolean;
  onOpenDetail: () => void;
  onSelect: () => void;
}) {
  return (
    <article
      className={`${styles.termCard} ${isSelected ? styles.termCardActive : ""} ${isDetailSource ? styles.detailSourceCard : ""}`}
      data-detail-source={isDetailSource || undefined}
      data-selected-card={isSelected || undefined}
      id={getCardElementId("event", event.id)}
    >
      <button aria-pressed={isSelected} className={styles.termCardBody} onClick={onSelect} type="button">
        <span className={styles.cardTopRow}>
          <span className={styles.termCategory}>{event.category}</span>
          <SpecimenIllustration kind="event" />
        </span>
        <strong>{event.name}</strong>
        <span className={styles.termSubline}>
          {[event.englishName, event.year, event.location].filter(Boolean).join(" / ")}
        </span>
        <p>{event.summary}</p>
        <span className={styles.tagRow}>
          {event.tags.slice(0, 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </span>
      </button>
      <button className={styles.cardDetailButton} onClick={onOpenDetail} type="button">
        詳細を読む
      </button>
    </article>
  );
}

function HistoryCard({ card }: { card: SaucerpediaHistoryCard }) {
  const relations = getRelationsForEntity("history", card.id);

  return (
    <article className={styles.historyCard}>
      <div className={styles.historyHeader}>
        <div className={styles.cardTopRow}>
          <span className={styles.historyEra}>{card.eraLabel}</span>
          <SpecimenIllustration kind="history" />
        </div>
        <strong>{card.title}</strong>
        <small>{card.yearRange}</small>
      </div>
      <p>{card.summary}</p>
      <section className={styles.historyRead}>
        <h3>解説</h3>
        <p>{card.quickRead}</p>
      </section>
      <div className={styles.milestoneList}>
        {card.milestones.map((milestone) => (
          <span key={milestone}>{milestone}</span>
        ))}
      </div>
      <div className={styles.relatedGrid}>
        <RelatedList items={relations.filter((relation) => relation.type !== "event")} title="関連項目" />
        <RelatedList items={relations.filter((relation) => relation.type === "event")} title="関連事件" />
      </div>
    </article>
  );
}

function MisidentificationListCard({
  isDetailSource,
  isSelected,
  item,
  onOpenDetail,
  onSelect,
}: {
  isDetailSource: boolean;
  isSelected: boolean;
  item: SaucerpediaMisidentification;
  onOpenDetail: () => void;
  onSelect: () => void;
}) {
  return (
    <article
      className={`${styles.termCard} ${isSelected ? styles.termCardActive : ""} ${isDetailSource ? styles.detailSourceCard : ""}`}
      data-detail-source={isDetailSource || undefined}
      data-selected-card={isSelected || undefined}
      id={getCardElementId("misidentification", item.id)}
    >
      <button aria-pressed={isSelected} className={styles.termCardBody} onClick={onSelect} type="button">
        <span className={styles.cardTopRow}>
          <span className={styles.termCategory}>{item.kind}</span>
          <SpecimenIllustration kind="misidentification" />
        </span>
        <strong>{item.name}</strong>
        <span className={styles.termSubline}>
          {[item.englishName, item.aliases?.join(" / ")].filter(Boolean).join(" / ")}
        </span>
        <p>{item.summary}</p>
        <span className={styles.tagRow}>
          {[item.category, item.kind, ...item.relatedTerms].slice(0, 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </span>
      </button>
      <button className={styles.cardDetailButton} onClick={onOpenDetail} type="button">
        詳細を読む
      </button>
    </article>
  );
}

function FakeListCard({
  isDetailSource,
  isSelected,
  item,
  onOpenDetail,
  onSelect,
}: {
  isDetailSource: boolean;
  isSelected: boolean;
  item: SaucerpediaFake;
  onOpenDetail: () => void;
  onSelect: () => void;
}) {
  return (
    <article
      className={`${styles.termCard} ${isSelected ? styles.termCardActive : ""} ${isDetailSource ? styles.detailSourceCard : ""}`}
      data-detail-source={isDetailSource || undefined}
      data-selected-card={isSelected || undefined}
      id={getCardElementId("fake", item.id)}
    >
      <button aria-pressed={isSelected} className={styles.termCardBody} onClick={onSelect} type="button">
        <span className={styles.cardTopRow}>
          <span className={styles.termCategory}>{item.kind}</span>
          <SpecimenIllustration kind="fake" />
        </span>
        <strong>{item.name}</strong>
        <span className={styles.termSubline}>
          {[item.englishName, item.aliases?.join(" / ")].filter(Boolean).join(" / ")}
        </span>
        <p>{item.summary}</p>
        <span className={styles.tagRow}>
          {[item.category, item.kind, ...item.relatedTerms].slice(0, 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </span>
      </button>
      <button className={styles.cardDetailButton} onClick={onOpenDetail} type="button">
        詳細を読む
      </button>
    </article>
  );
}

function ResourceListCard({
  isDetailSource,
  isSelected,
  item,
  onOpenDetail,
  onSelect,
}: {
  isDetailSource: boolean;
  isSelected: boolean;
  item: SaucerpediaResource;
  onOpenDetail: () => void;
  onSelect: () => void;
}) {
  return (
    <article
      className={`${styles.termCard} ${isSelected ? styles.termCardActive : ""} ${isDetailSource ? styles.detailSourceCard : ""}`}
      data-detail-source={isDetailSource || undefined}
      data-selected-card={isSelected || undefined}
      id={getCardElementId("resource", item.id)}
    >
      <button aria-pressed={isSelected} className={styles.termCardBody} onClick={onSelect} type="button">
        <span className={styles.cardTopRow}>
          <span className={styles.termCategory}>{item.kind}</span>
          <SpecimenIllustration kind="resource" />
        </span>
        <strong>{item.name}</strong>
        <span className={styles.termSubline}>
          {[item.englishName, item.era].filter(Boolean).join(" / ")}
        </span>
        <p>{item.summary}</p>
        <span className={styles.tagRow}>
          {[item.kind, ...item.relatedTerms].slice(0, 4).map((tag, index) => (
            <span key={`${tag}-${index}`}>{tag}</span>
          ))}
        </span>
      </button>
      <button className={styles.cardDetailButton} onClick={onOpenDetail} type="button">
        詳細を読む
      </button>
    </article>
  );
}

function MotifListCard({
  isDetailSource,
  isSelected,
  item,
  onOpenDetail,
  onSelect,
}: {
  isDetailSource: boolean;
  isSelected: boolean;
  item: SaucerpediaMotif;
  onOpenDetail: () => void;
  onSelect: () => void;
}) {
  return (
    <article
      className={`${styles.termCard} ${isSelected ? styles.termCardActive : ""} ${isDetailSource ? styles.detailSourceCard : ""}`}
      data-detail-source={isDetailSource || undefined}
      data-selected-card={isSelected || undefined}
      id={getCardElementId("motif", item.id)}
    >
      <button aria-pressed={isSelected} className={styles.termCardBody} onClick={onSelect} type="button">
        <span className={styles.cardTopRow}>
          <span className={styles.termCategory}>{item.category}</span>
          <SpecimenIllustration kind="motif" />
        </span>
        <strong>{item.name}</strong>
        <span className={styles.termSubline}>{item.englishName}</span>
        <p>{item.summary}</p>
        <span className={styles.tagRow}>
          {[item.category, ...item.relatedTerms].slice(0, 4).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </span>
      </button>
      <button className={styles.cardDetailButton} onClick={onOpenDetail} type="button">
        詳細を読む
      </button>
    </article>
  );
}

function relatedOf(type: SaucerpediaEntityType, id: string, allowedTypes?: SaucerpediaEntityType[]) {
  const relations = getRelationsForEntity(type, id);
  return allowedTypes ? relations.filter((relation) => allowedTypes.includes(relation.type)) : relations;
}

function isResolvedRelation(
  item: ReturnType<typeof resolveSaucerpediaRelation>,
): item is NonNullable<ReturnType<typeof resolveSaucerpediaRelation>> {
  return Boolean(item);
}

function handleRelatedLinkClick(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  item: NonNullable<ReturnType<typeof resolveSaucerpediaRelation>>,
  onOpenRelation?: (relation: SaucerpediaRelation) => void,
) {
  if (!href.startsWith("/saucerpedia/")) {
    return;
  }

  if (!onOpenRelation) {
    return;
  }

  event.preventDefault();
  onOpenRelation({ type: item.type, id: item.id });
}

function RelatedList({
  items,
  onOpenRelation,
  title,
}: {
  items?: SaucerpediaRelation[];
  onOpenRelation?: (relation: SaucerpediaRelation) => void;
  title: string;
}) {
  if (!items?.length) {
    return null;
  }

  const resolvedItems = items.map(resolveSaucerpediaRelation).filter(isResolvedRelation);
  if (!resolvedItems.length) {
    return null;
  }

  return (
    <div className={styles.relatedBlock}>
      <h4>{title}</h4>
      <div className={styles.relatedChips}>
        {resolvedItems.map((item) => (
          <a
            href={item.href}
            key={`${item.type}-${item.id}`}
            onClick={(event) => handleRelatedLinkClick(event, item.href, item, onOpenRelation)}
          >
            {item.title}
          </a>
        ))}
      </div>
    </div>
  );
}

function PlainList({ items, title }: { items?: string[]; title: string }) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className={styles.relatedBlock}>
      <h4>{title}</h4>
      <div className={styles.relatedChips}>
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function ReturnToListButton({ onReturn }: { onReturn: () => void }) {
  return (
    <button className={styles.returnButton} onClick={onReturn} type="button">
      元の場所に戻る
    </button>
  );
}

function SearchBar({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className={styles.searchBar}>
      <span>{label}</span>
      <input onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type="search" value={value} />
    </label>
  );
}

function FilterChips({
  items,
  onChange,
  value,
}: {
  items: string[];
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className={styles.categoryScroller} aria-label="フィルター">
      {items.map((item) => (
        <button
          aria-pressed={value === item}
          className={value === item ? styles.activeCategory : undefined}
          key={item}
          onClick={() => onChange(item)}
          type="button"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function DictionaryControls({
  categories,
  categoryAriaLabel,
  onCategoryChange,
  onQueryChange,
  placeholder,
  query,
  selectedCategory,
}: {
  categories: string[];
  categoryAriaLabel: string;
  onCategoryChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  placeholder: string;
  query: string;
  selectedCategory: string;
}) {
  return (
    <div className={styles.controls}>
      <label>
        <span>検索</span>
        <div className={styles.searchInputRow}>
          <input
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            type="search"
            value={query}
          />
          <button type="button">検索</button>
        </div>
      </label>
      <div className={styles.controlGroupLabel}>カテゴリー</div>
      <div className={styles.categoryScroller} aria-label={categoryAriaLabel}>
        {categories.map((category, index) => (
          <button
            aria-pressed={selectedCategory === category}
            className={selectedCategory === category ? styles.activeCategory : undefined}
            key={`${category}-${index}`}
            onClick={() => onCategoryChange(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

function OverlapCardStack({
  items,
  labels,
}: {
  items?: SaucerpediaRelation[];
  labels?: string[];
}) {
  const resolvedItems = (items ?? []).map(resolveSaucerpediaRelation).filter(isResolvedRelation).slice(0, 3);
  const labelItems = (labels ?? []).slice(0, 3).map((label, index) => ({
    eyebrow: "関連形状",
    id: `${label}-${index}`,
    title: label,
  }));
  const cards = [...resolvedItems, ...labelItems].slice(0, 3);

  if (!cards.length) {
    return null;
  }

  return (
    <div className={styles.overlapStack} aria-label="関連カードの重なり">
      {cards.map((item, index) => (
        <span className={styles.overlapCard} key={`${item.id}-${index}`}>
          <small>{item.eyebrow}</small>
          <strong>{item.title}</strong>
        </span>
      ))}
    </div>
  );
}

function SourcePanel({
  items,
  productItems,
}: {
  items?: SaucerpediaRelation[];
  productItems?: SaucerpediaRelation[];
}) {
  const resourceItems = (items ?? [])
    .filter((relation) => relation.type === "resource")
    .map(resolveSaucerpediaRelation)
    .filter(isResolvedRelation);
  const products = (productItems ?? [])
    .map(resolveSaucerpediaRelation)
    .filter(isResolvedRelation);
  const panelItems = [...resourceItems, ...products].slice(0, 5);

  return (
    <section className={styles.sourcePanel}>
      <details>
        <summary>出典・参考資料</summary>
        {panelItems.length ? (
          <div className={styles.sourceList}>
            {panelItems.map((item) => (
              <Link href={item.href} key={`${item.type}-${item.id}`}>
                <span>{item.eyebrow}</span>
                <strong>{item.title}</strong>
                {item.summary ? <small>{item.summary}</small> : null}
              </Link>
            ))}
          </div>
        ) : (
          <p>この初期版では、関連資料カードまたは関連プロダクトを参考資料として表示します。正式な外部出典URLは今後のデータ拡張で追加します。</p>
        )}
      </details>
    </section>
  );
}

const bottomNavItems = [
  { href: "/saucerpedia/terms", label: "用語", view: "terms" },
  { href: "/saucerpedia/people", label: "人物", view: "people" },
  { href: "/saucerpedia/events", label: "事件", view: "events" },
];

const drawerLinks = [
  { href: "/saucerpedia/terms", label: "用語" },
  { href: "/saucerpedia/people", label: "人物" },
  { href: "/saucerpedia/events", label: "事件" },
  { href: "/saucerpedia/resources", label: "資料・機関" },
  { href: "/saucerpedia/misidentifications", label: "誤認" },
  { href: "/saucerpedia/fakes", label: "フェイク" },
  { href: "/saucerpedia/motifs", label: "体験モチーフ" },
  { href: "/saucerpedia/history", label: "UFOの歴史" },
  { href: "/kinichi", label: "UFO形状辞典 Kinichi", tone: "product" },
  { href: "/kean", label: "現代UAP Kean", tone: "product" },
  { href: "/", label: "UFO Lab Tokyo", tone: "home" },
];

function AppHeader({ onMenuOpen, view }: { onMenuOpen: () => void; view: SaucerpediaView }) {
  return (
    <header className={styles.appHeader}>
      <Link aria-label="Saucerpedia ホームへ戻る" className={styles.appHeaderBrand} href="/saucerpedia">
        <span className={styles.appHeaderBrandText}>UFO ENCYCLOPEDIA</span>
      </Link>
      <div className={styles.appHeaderActions}>
        <Link
          aria-current={view === "search" ? "page" : undefined}
          className={styles.headerSearchLink}
          href="/saucerpedia/search"
        >
          検索
        </Link>
        <button aria-label="メニューを開く" className={styles.menuButton} onClick={onMenuOpen} type="button">
          ☰
        </button>
      </div>
    </header>
  );
}

function BottomNav({ view }: { view: SaucerpediaView }) {
  return (
    <nav className={styles.bottomNav} aria-label="主要カテゴリ">
      {bottomNavItems.map((item) => (
        <Link
          aria-current={view === item.view ? "page" : undefined}
          className={view === item.view ? styles.activeBottomNavItem : undefined}
          href={item.href}
          key={item.href}
        >
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function SideDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div className={`${styles.drawerLayer} ${isOpen ? styles.drawerOpen : ""}`} aria-hidden={!isOpen}>
      <button aria-label="メニューを閉じる" className={styles.drawerBackdrop} onClick={onClose} type="button" />
      <aside className={styles.sideDrawer} aria-label="補助カテゴリメニュー">
        <div className={styles.drawerHeader}>
          <button onClick={onClose} tabIndex={isOpen ? undefined : -1} type="button">
            閉じる
          </button>
        </div>
        <nav className={styles.drawerNav}>
          {drawerLinks.map((item) => (
            <Link
              className={item.tone === "home" ? styles.drawerHomeLink : item.tone === "product" ? styles.drawerProductLink : undefined}
              href={item.href}
              key={item.href}
              onClick={onClose}
              tabIndex={isOpen ? undefined : -1}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <small className={styles.drawerCopyright}>© 2026 UFO Lab Tokyo</small>
      </aside>
    </div>
  );
}

type SearchResult = {
  id: string;
  type: SaucerpediaEntityType | "shape";
  title: string;
  eyebrow: string;
  href: string;
  summary?: string;
  tags: string[];
  haystack: string;
  relation?: SaucerpediaRelation;
};

function SearchResultCard({ item }: { item: SearchResult }) {
  return (
    <Link className={styles.searchResultCard} href={item.href}>
      <div>
        <span>{item.eyebrow}</span>
        <strong>{item.title}</strong>
        {item.summary ? <p>{item.summary}</p> : null}
      </div>
      <OverlapCardStack items={item.relation ? getRelationsForEntity(item.relation.type, item.relation.id) : undefined} labels={item.type === "shape" ? item.tags : undefined} />
      <small>{item.tags.slice(0, 4).join(" / ")}</small>
    </Link>
  );
}

function PersonDetailCard({
  onOpenRelation,
  onReturn,
  person,
}: {
  onOpenRelation: (relation: SaucerpediaRelation) => void;
  onReturn: () => void;
  person: SaucerpediaPerson;
}) {
  const showMibFeature =
    person.id === "albert-bender" || person.id === "gray-barker" || person.id === "john-keel";
  const mibFeature = peopleFeatureCards.find((feature) => feature.id === "mib-myth-flow");
  const relations = getRelationsForEntity("person", person.id);

  return (
    <article className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <div className={styles.detailHeaderCopy}>
          <span>{person.category}</span>
          <h2>{person.name}</h2>
          <p>{[person.englishName, person.role].filter(Boolean).join(" / ")}</p>
        </div>
        <SpecimenIllustration kind="person" size="detail" />
      </div>
      <ReturnToListButton onReturn={onReturn} />

      <dl className={styles.metaGrid}>
        {person.englishName ? (
          <div>
            <dt>英語名</dt>
            <dd>{person.englishName}</dd>
          </div>
        ) : null}
        {person.period ? (
          <div>
            <dt>生没年・活動時期</dt>
            <dd>{person.period}</dd>
          </div>
        ) : null}
        <div>
          <dt>肩書き・立場</dt>
          <dd>{person.role}</dd>
        </div>
      </dl>

      <section className={styles.readBlock}>
        <h3>解説</h3>
        <p>{person.quickRead}</p>
      </section>

      <div className={styles.relatedGrid}>
        <RelatedList items={relations.filter((relation) => relation.type === "term" || relation.type === "resource")} onOpenRelation={onOpenRelation} title="関連用語・資料" />
        <RelatedList items={relations.filter((relation) => relation.type === "event")} onOpenRelation={onOpenRelation} title="関連事件" />
        <RelatedList items={relations.filter((relation) => relation.type === "person")} onOpenRelation={onOpenRelation} title="関連人物" />
      </div>

      <SourcePanel items={relations} />

      {showMibFeature && mibFeature ? (
        <aside className={styles.featureCard}>
          <span>{mibFeature.category}</span>
          <h3>{mibFeature.title}</h3>
          <p>{mibFeature.summary}</p>
          <div className={styles.featurePeople}>
            {mibFeature.people.map((featurePerson) => (
              <div key={featurePerson.name}>
                <strong>{featurePerson.name}</strong>
                <small>{featurePerson.note}</small>
              </div>
            ))}
          </div>
        </aside>
      ) : null}
    </article>
  );
}

function EventDetailCard({
  event,
  onOpenRelation,
  onReturn,
}: {
  event: SaucerpediaEvent;
  onOpenRelation: (relation: SaucerpediaRelation) => void;
  onReturn: () => void;
}) {
  const relations = getRelationsForEntity("event", event.id);

  return (
    <article className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <div className={styles.detailHeaderCopy}>
          <span>{event.category}</span>
          <h2>{event.name}</h2>
          <p>{[event.englishName, event.location].filter(Boolean).join(" / ")}</p>
        </div>
        <SpecimenIllustration kind="event" size="detail" />
      </div>
      <ReturnToListButton onReturn={onReturn} />

      <dl className={styles.metaGrid}>
        {event.englishName ? (
          <div>
            <dt>英語名</dt>
            <dd>{event.englishName}</dd>
          </div>
        ) : null}
        <div>
          <dt>年・年月日</dt>
          <dd>{event.date ?? event.year}</dd>
        </div>
        {event.location ? (
          <div>
            <dt>場所</dt>
            <dd>{event.location}</dd>
          </div>
        ) : null}
      </dl>

      <section className={styles.readBlock}>
        <h3>解説</h3>
        <p>{event.quickRead}</p>
      </section>

      <section className={styles.readBlock}>
        <h3>何が起きたか</h3>
        <p>{event.whatHappened}</p>
      </section>

      <div className={styles.relatedGrid}>
        <RelatedList items={relations.filter((relation) => relation.type === "person")} onOpenRelation={onOpenRelation} title="関連人物" />
        <RelatedList items={relations.filter((relation) => relation.type !== "person")} onOpenRelation={onOpenRelation} title="関連項目" />
        <PlainList items={event.relatedShapes} title="関連形状" />
      </div>

      <SourcePanel items={relations} />
    </article>
  );
}

function MisidentificationDetailCard({
  item,
  onOpenRelation,
  onReturn,
}: {
  item: SaucerpediaMisidentification;
  onOpenRelation: (relation: SaucerpediaRelation) => void;
  onReturn: () => void;
}) {
  const relations = relatedOf("misidentification", item.id);

  return (
    <article className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <div className={styles.detailHeaderCopy}>
          <span>{item.category}</span>
          <h2>{item.name}</h2>
          <p>{[item.englishName, item.aliases?.join(" / ")].filter(Boolean).join(" / ")}</p>
        </div>
        <SpecimenIllustration kind="misidentification" size="detail" />
      </div>
      <ReturnToListButton onReturn={onReturn} />

      <dl className={styles.metaGrid}>
        <div>
          <dt>種類</dt>
          <dd>{item.kind}</dd>
        </div>
        {item.aliases?.length ? (
          <div>
            <dt>別名</dt>
            <dd>{item.aliases.join(" / ")}</dd>
          </div>
        ) : null}
      </dl>

      <section className={styles.readBlock}>
        <h3>解説</h3>
        <p>{item.quickRead}</p>
      </section>

      <section className={styles.readBlock}>
        <h3>なぜUFOに見えるのか</h3>
        <p>{item.whyItLooksLikeUfo}</p>
      </section>

      <section className={styles.readBlock}>
        <h3>見分けるポイント</h3>
        <ul className={styles.checkList}>
          {item.howToTell.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <div className={styles.relatedGrid}>
        <PlainList items={item.commonAppearance} title="よくある見え方" />
        <RelatedList items={relations} onOpenRelation={onOpenRelation} title="関連項目" />
      </div>

      <SourcePanel items={relations} />
    </article>
  );
}

function FakeDetailCard({
  item,
  onOpenRelation,
  onReturn,
}: {
  item: SaucerpediaFake;
  onOpenRelation: (relation: SaucerpediaRelation) => void;
  onReturn: () => void;
}) {
  const relations = relatedOf("fake", item.id);

  return (
    <article className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <div className={styles.detailHeaderCopy}>
          <span>{item.category}</span>
          <h2>{item.name}</h2>
          <p>{[item.englishName, item.aliases?.join(" / ")].filter(Boolean).join(" / ")}</p>
        </div>
        <SpecimenIllustration kind="fake" size="detail" />
      </div>
      <ReturnToListButton onReturn={onReturn} />

      <dl className={styles.metaGrid}>
        <div>
          <dt>種類</dt>
          <dd>{item.kind}</dd>
        </div>
        {item.aliases?.length ? (
          <div>
            <dt>別名</dt>
            <dd>{item.aliases.join(" / ")}</dd>
          </div>
        ) : null}
      </dl>

      <section className={styles.readBlock}>
        <h3>解説</h3>
        <p>{item.quickRead}</p>
      </section>

      {item.whyBelievable ? (
        <section className={styles.readBlock}>
          <h3>なぜ信じられやすいのか</h3>
          <p>{item.whyBelievable}</p>
        </section>
      ) : null}

      <section className={styles.readBlock}>
        <h3>見分けるポイント</h3>
        <ul className={styles.checkList}>
          {item.howToCheck.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <div className={styles.relatedGrid}>
        <RelatedList items={relations} onOpenRelation={onOpenRelation} title="関連項目" />
      </div>

      <SourcePanel items={relations} />
    </article>
  );
}

function ResourceDetailCard({
  item,
  onOpenRelation,
  onReturn,
}: {
  item: SaucerpediaResource;
  onOpenRelation: (relation: SaucerpediaRelation) => void;
  onReturn: () => void;
}) {
  const relations = getRelationsForEntity("resource", item.id);

  return (
    <article className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <div className={styles.detailHeaderCopy}>
          <span>UFO資料・機関</span>
          <h2>{item.name}</h2>
          <p>{[item.englishName, item.aliases?.join(" / ")].filter(Boolean).join(" / ")}</p>
        </div>
        <SpecimenIllustration kind="resource" size="detail" />
      </div>
      <ReturnToListButton onReturn={onReturn} />

      <dl className={styles.metaGrid}>
        <div>
          <dt>種別</dt>
          <dd>{item.kind}</dd>
        </div>
        {item.era ? (
          <div>
            <dt>主な時代</dt>
            <dd>{item.era}</dd>
          </div>
        ) : null}
      </dl>

      <section className={styles.readBlock}>
        <h3>解説</h3>
        <p>{item.quickRead}</p>
      </section>

      <section className={styles.readBlock}>
        <h3>何をしたか</h3>
        <p>{item.whatItDid}</p>
      </section>

      <div className={styles.relatedGrid}>
        <RelatedList items={relations.filter((relation) => relation.type === "person")} onOpenRelation={onOpenRelation} title="関連人物" />
        <RelatedList items={relations.filter((relation) => relation.type !== "person")} onOpenRelation={onOpenRelation} title="関連項目" />
      </div>

      <SourcePanel items={relations} />
    </article>
  );
}

function MotifDetailCard({
  item,
  onOpenRelation,
  onReturn,
}: {
  item: SaucerpediaMotif;
  onOpenRelation: (relation: SaucerpediaRelation) => void;
  onReturn: () => void;
}) {
  const relations = getRelationsForEntity("motif", item.id);

  return (
    <article className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <div className={styles.detailHeaderCopy}>
          <span>{item.category}</span>
          <h2>{item.name}</h2>
          <p>{item.englishName}</p>
        </div>
        <SpecimenIllustration kind="motif" size="detail" />
      </div>
      <ReturnToListButton onReturn={onReturn} />

      <section className={styles.readBlock}>
        <h3>1行説明</h3>
        <p>{item.summary}</p>
      </section>

      <section className={styles.readBlock}>
        <h3>どんな体験で出てくるか</h3>
        <p>{item.experienceContext}</p>
      </section>

      <div className={styles.relatedGrid}>
        <RelatedList items={relations.filter((relation) => relation.type === "event")} onOpenRelation={onOpenRelation} title="関連事件" />
        <RelatedList items={relations.filter((relation) => relation.type === "person")} onOpenRelation={onOpenRelation} title="関連人物" />
        <RelatedList items={relations.filter((relation) => relation.type !== "event" && relation.type !== "person")} onOpenRelation={onOpenRelation} title="関連項目" />
      </div>

      <SourcePanel items={relations} />
    </article>
  );
}

function TermDetailCard({
  onOpenRelation,
  onReturn,
  term,
}: {
  onOpenRelation: (relation: SaucerpediaRelation) => void;
  onReturn: () => void;
  term: SaucerpediaTerm;
}) {
  const relations = getRelationsForEntity("term", term.id);

  return (
    <article className={styles.detailCard}>
      <div className={styles.detailHeader}>
        <div className={styles.detailHeaderCopy}>
          <span>{term.category}</span>
          <h2>{term.name}</h2>
          <p>{[term.englishName, term.translation].filter(Boolean).join(" / ")}</p>
        </div>
        <SpecimenIllustration kind="term" size="detail" />
      </div>
      <ReturnToListButton onReturn={onReturn} />

      <dl className={styles.metaGrid}>
        {term.englishName ? (
          <div>
            <dt>英語名</dt>
            <dd>{term.englishName}</dd>
          </div>
        ) : null}
        {term.aliases?.length ? (
          <div>
            <dt>別名</dt>
            <dd>{term.aliases.join(" / ")}</dd>
          </div>
        ) : null}
        {term.era ? (
          <div>
            <dt>主な時代</dt>
            <dd>{term.era}</dd>
          </div>
        ) : null}
      </dl>

      <section className={styles.readBlock}>
        <h3>解説</h3>
        <p>{term.quickRead}</p>
      </section>

      <section className={styles.readBlock}>
        <h3>詳しく読む</h3>
        <p>{term.detail}</p>
      </section>

      <div className={styles.relatedGrid}>
        <RelatedList items={relations.filter((relation) => relation.type !== "person" && relation.type !== "event" && relation.type !== "product")} onOpenRelation={onOpenRelation} title="関連項目" />
        <RelatedList items={relations.filter((relation) => relation.type === "person")} onOpenRelation={onOpenRelation} title="関連人物" />
        <RelatedList items={relations.filter((relation) => relation.type === "event")} onOpenRelation={onOpenRelation} title="関連事件" />
      </div>

      <SourcePanel items={relations} />
    </article>
  );
}

export function SaucerpediaHome({ view = "home" }: { view?: SaucerpediaView }) {
  const [selectedEventCategory, setSelectedEventCategory] = useState("すべて");
  const [selectedEventId, setSelectedEventId] = useState("kenneth-arnold-sighting");
  const [selectedFakeId, setSelectedFakeId] = useState("model-ufo");
  const [selectedFakeKind, setSelectedFakeKind] = useState("すべて");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [selectedMisidentificationKind, setSelectedMisidentificationKind] = useState("すべて");
  const [selectedMisidentificationId, setSelectedMisidentificationId] = useState("venus");
  const [selectedMotifCategory, setSelectedMotifCategory] = useState("すべて");
  const [selectedMotifId, setSelectedMotifId] = useState("anomalous-light");
  const [selectedPersonCategory, setSelectedPersonCategory] = useState("すべて");
  const [selectedPersonId, setSelectedPersonId] = useState("kenneth-arnold");
  const [selectedResourceId, setSelectedResourceId] = useState("project-blue-book");
  const [selectedResourceKind, setSelectedResourceKind] = useState("すべて");
  const [selectedTermId, setSelectedTermId] = useState("ufo");
  const [eventQuery, setEventQuery] = useState("");
  const [fakeQuery, setFakeQuery] = useState("");
  const [misidentificationQuery, setMisidentificationQuery] = useState("");
  const [motifQuery, setMotifQuery] = useState("");
  const [personQuery, setPersonQuery] = useState("");
  const [query, setQuery] = useState("");
  const [resourceQuery, setResourceQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState("すべて");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDetailKey, setActiveDetailKey] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [, startTransition] = useTransition();
  const deferredEventQuery = useDeferredValue(eventQuery);
  const deferredFakeQuery = useDeferredValue(fakeQuery);
  const deferredMisidentificationQuery = useDeferredValue(misidentificationQuery);
  const deferredMotifQuery = useDeferredValue(motifQuery);
  const deferredQuery = useDeferredValue(query);
  const deferredPersonQuery = useDeferredValue(personQuery);
  const deferredResourceQuery = useDeferredValue(resourceQuery);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const itemId = new URLSearchParams(window.location.search).get("item");
    if (!itemId) {
      return;
    }

    startTransition(() => {
      if (view === "terms") {
        const item = saucerpediaTerms.find((term) => term.id === itemId);
        if (item) {
          setSelectedTermId(item.id);
          setSelectedCategory(item.category);
          setQuery("");
          setActiveDetailKey(getEntityKey("term", item.id));
        }
      }

      if (view === "people") {
        const item = saucerpediaPeople.find((person) => person.id === itemId);
        if (item) {
          setSelectedPersonId(item.id);
          setSelectedPersonCategory(item.category);
          setPersonQuery("");
          setActiveDetailKey(getEntityKey("person", item.id));
        }
      }

      if (view === "events") {
        const item = saucerpediaEvents.find((event) => event.id === itemId);
        if (item) {
          setSelectedEventId(item.id);
          setSelectedEventCategory(item.category);
          setEventQuery("");
          setActiveDetailKey(getEntityKey("event", item.id));
        }
      }

      if (view === "misidentifications") {
        const item = saucerpediaMisidentifications.find((entry) => entry.id === itemId);
        if (item) {
          setSelectedMisidentificationId(item.id);
          setSelectedMisidentificationKind(item.kind);
          setMisidentificationQuery("");
          setActiveDetailKey(getEntityKey("misidentification", item.id));
        }
      }

      if (view === "fakes") {
        const item = saucerpediaFakes.find((entry) => entry.id === itemId);
        if (item) {
          setSelectedFakeId(item.id);
          setSelectedFakeKind(item.kind);
          setFakeQuery("");
          setActiveDetailKey(getEntityKey("fake", item.id));
        }
      }

      if (view === "resources") {
        const item = saucerpediaResources.find((entry) => entry.id === itemId);
        if (item) {
          setSelectedResourceId(item.id);
          setSelectedResourceKind(item.kind);
          setResourceQuery("");
          setActiveDetailKey(getEntityKey("resource", item.id));
        }
      }

      if (view === "motifs") {
        const item = saucerpediaMotifs.find((entry) => entry.id === itemId);
        if (item) {
          setSelectedMotifId(item.id);
          setSelectedMotifCategory(item.category);
          setMotifQuery("");
          setActiveDetailKey(getEntityKey("motif", item.id));
        }
      }
    });
  }, [view, startTransition]);

  const selectedEvent = saucerpediaEvents.find((event) => event.id === selectedEventId) ?? saucerpediaEvents[0];
  const selectedFake = saucerpediaFakes.find((item) => item.id === selectedFakeId) ?? saucerpediaFakes[0];
  const selectedTerm = saucerpediaTerms.find((term) => term.id === selectedTermId) ?? saucerpediaTerms[0];
  const selectedMisidentification =
    saucerpediaMisidentifications.find((item) => item.id === selectedMisidentificationId) ??
    saucerpediaMisidentifications[0];
  const selectedMotif = saucerpediaMotifs.find((item) => item.id === selectedMotifId) ?? saucerpediaMotifs[0];
  const selectedPerson =
    saucerpediaPeople.find((person) => person.id === selectedPersonId) ?? saucerpediaPeople[0];
  const selectedResource =
    saucerpediaResources.find((item) => item.id === selectedResourceId) ?? saucerpediaResources[0];
  const searchResults = useMemo<SearchResult[]>(() => {
    const entityResults = saucerpediaEntities
      .filter((entity) => isPrimarySearchType(entity.type))
      .map((entity) => ({
        id: `${entity.type}-${entity.id}`,
        type: entity.type,
        title: entity.title,
        eyebrow: entity.eyebrow,
        href: `${entity.href}#selected-detail`,
        summary: entity.summary,
        tags: [entity.eyebrow, ...entity.aliases.slice(0, 3)],
        haystack: [entity.title, entity.eyebrow, entity.summary, ...entity.aliases].filter(Boolean).join(" ").toLowerCase(),
        relation: { type: entity.type, id: entity.id },
      }));
    const shapeResults = shapeSearchItems.map((item) => ({
      id: `shape-${item.id}`,
      type: "shape" as const,
      title: item.title,
      eyebrow: "UFO形状",
      href: "/kinichi",
      summary: item.summary,
      tags: item.tags,
      haystack: [item.title, item.summary, ...item.tags].join(" ").toLowerCase(),
    }));
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

    return [...entityResults, ...shapeResults]
      .filter((item) => searchFilter === "すべて" || searchFilterByType[item.type] === searchFilter)
      .filter((item) => !normalizedQuery || item.haystack.includes(normalizedQuery))
      .slice(0, 48);
  }, [deferredSearchQuery, searchFilter]);

  const filteredTerms = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return saucerpediaTerms.filter((term) => {
      const matchesCategory = selectedCategory === "すべて" || term.category === selectedCategory;
      const matchesQuery = !normalizedQuery || getTermText(term).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    }).sort(byLearningOrder);
  }, [deferredQuery, selectedCategory]);

  const filteredPeople = useMemo(() => {
    const normalizedQuery = deferredPersonQuery.trim().toLowerCase();
    return saucerpediaPeople.filter((person) => {
      const matchesCategory = selectedPersonCategory === "すべて" || person.category === selectedPersonCategory;
      const matchesQuery = !normalizedQuery || getPersonText(person).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [deferredPersonQuery, selectedPersonCategory]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = deferredEventQuery.trim().toLowerCase();
    return saucerpediaEvents.filter((event) => {
      const matchesCategory = selectedEventCategory === "すべて" || event.category === selectedEventCategory;
      const matchesQuery = !normalizedQuery || getEventText(event).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [deferredEventQuery, selectedEventCategory]);

  const filteredMisidentifications = useMemo(() => {
    const normalizedQuery = deferredMisidentificationQuery.trim().toLowerCase();
    return saucerpediaMisidentifications.filter((item) => {
      const matchesKind = selectedMisidentificationKind === "すべて" || item.kind === selectedMisidentificationKind;
      const matchesQuery = !normalizedQuery || getMisidentificationText(item).includes(normalizedQuery);
      return matchesKind && matchesQuery;
    });
  }, [deferredMisidentificationQuery, selectedMisidentificationKind]);

  const filteredFakes = useMemo(() => {
    const normalizedQuery = deferredFakeQuery.trim().toLowerCase();
    return saucerpediaFakes.filter((item) => {
      const matchesKind = selectedFakeKind === "すべて" || item.kind === selectedFakeKind;
      const matchesQuery = !normalizedQuery || getFakeText(item).includes(normalizedQuery);
      return matchesKind && matchesQuery;
    });
  }, [deferredFakeQuery, selectedFakeKind]);

  const filteredResources = useMemo(() => {
    const normalizedQuery = deferredResourceQuery.trim().toLowerCase();
    return saucerpediaResources.filter((item) => {
      const matchesKind = selectedResourceKind === "すべて" || item.kind === selectedResourceKind;
      const matchesQuery = !normalizedQuery || getResourceText(item).includes(normalizedQuery);
      return matchesKind && matchesQuery;
    });
  }, [deferredResourceQuery, selectedResourceKind]);

  const filteredMotifs = useMemo(() => {
    const normalizedQuery = deferredMotifQuery.trim().toLowerCase();
    return saucerpediaMotifs.filter((item) => {
      const matchesCategory = selectedMotifCategory === "すべて" || item.category === selectedMotifCategory;
      const matchesQuery = !normalizedQuery || getMotifText(item).includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [deferredMotifQuery, selectedMotifCategory]);

  const handleCategoryChange = (category: string) => {
    startTransition(() => {
      setSelectedCategory(category);
      const nextTerm = saucerpediaTerms
        .filter((term) => category === "すべて" || term.category === category)
        .sort(byLearningOrder)[0];
      if (nextTerm) {
        setSelectedTermId(nextTerm.id);
      }
    });
  };

  const handlePersonCategoryChange = (category: string) => {
    startTransition(() => {
      setSelectedPersonCategory(category);
      const nextPerson = saucerpediaPeople.find((person) => category === "すべて" || person.category === category);
      if (nextPerson) {
        setSelectedPersonId(nextPerson.id);
      }
    });
  };

  const handleEventCategoryChange = (category: string) => {
    startTransition(() => {
      setSelectedEventCategory(category);
      const nextEvent = saucerpediaEvents.find((event) => category === "すべて" || event.category === category);
      if (nextEvent) {
        setSelectedEventId(nextEvent.id);
      }
    });
  };

  const handleMisidentificationKindChange = (kind: string) => {
    startTransition(() => {
      setSelectedMisidentificationKind(kind);
      const nextItem = saucerpediaMisidentifications.find((item) => kind === "すべて" || item.kind === kind);
      if (nextItem) {
        setSelectedMisidentificationId(nextItem.id);
      }
    });
  };

  const handleFakeKindChange = (kind: string) => {
    startTransition(() => {
      setSelectedFakeKind(kind);
      const nextItem = saucerpediaFakes.find((item) => kind === "すべて" || item.kind === kind);
      if (nextItem) {
        setSelectedFakeId(nextItem.id);
      }
    });
  };

  const handleResourceKindChange = (kind: string) => {
    startTransition(() => {
      setSelectedResourceKind(kind);
      const nextItem = saucerpediaResources.find((item) => kind === "すべて" || item.kind === kind);
      if (nextItem) {
        setSelectedResourceId(nextItem.id);
      }
    });
  };

  const handleMotifCategoryChange = (category: string) => {
    startTransition(() => {
      setSelectedMotifCategory(category);
      const nextItem = saucerpediaMotifs.find((item) => category === "すべて" || item.category === category);
      if (nextItem) {
        setSelectedMotifId(nextItem.id);
      }
    });
  };

  const selectItemByRelation = (relation: SaucerpediaRelation) => {
    if (relation.type === "term") {
      const item = saucerpediaTerms.find((term) => term.id === relation.id);
      if (item) {
        setSelectedTermId(item.id);
        setSelectedCategory(item.category);
        setQuery("");
        return true;
      }
    }

    if (relation.type === "person") {
      const item = saucerpediaPeople.find((person) => person.id === relation.id);
      if (item) {
        setSelectedPersonId(item.id);
        setSelectedPersonCategory(item.category);
        setPersonQuery("");
        return true;
      }
    }

    if (relation.type === "event") {
      const item = saucerpediaEvents.find((event) => event.id === relation.id);
      if (item) {
        setSelectedEventId(item.id);
        setSelectedEventCategory(item.category);
        setEventQuery("");
        return true;
      }
    }

    if (relation.type === "misidentification") {
      const item = saucerpediaMisidentifications.find((entry) => entry.id === relation.id);
      if (item) {
        setSelectedMisidentificationId(item.id);
        setSelectedMisidentificationKind(item.kind);
        setMisidentificationQuery("");
        return true;
      }
    }

    if (relation.type === "fake") {
      const item = saucerpediaFakes.find((entry) => entry.id === relation.id);
      if (item) {
        setSelectedFakeId(item.id);
        setSelectedFakeKind(item.kind);
        setFakeQuery("");
        return true;
      }
    }

    if (relation.type === "resource") {
      const item = saucerpediaResources.find((entry) => entry.id === relation.id);
      if (item) {
        setSelectedResourceId(item.id);
        setSelectedResourceKind(item.kind);
        setResourceQuery("");
        return true;
      }
    }

    if (relation.type === "motif") {
      const item = saucerpediaMotifs.find((entry) => entry.id === relation.id);
      if (item) {
        setSelectedMotifId(item.id);
        setSelectedMotifCategory(item.category);
        setMotifQuery("");
        return true;
      }
    }

    return false;
  };

  const openDetailFromList = (relation: SaucerpediaRelation) => {
    storeReturnTarget(relation.type, relation.id);
    setActiveDetailKey(getEntityKey(relation.type, relation.id));
    startTransition(() => {
      selectItemByRelation(relation);
    });
    window.history.replaceState(null, "", `${window.location.pathname}?item=${relation.id}`);
    window.setTimeout(() => scrollToDetail(), 120);
  };

  const openRelationDetail = (relation: SaucerpediaRelation) => {
    const nextView = entityTypeToView[relation.type];
    if (!nextView || relation.type === "product") {
      return;
    }

    const resolved = resolveSaucerpediaRelation(relation);
    if (!resolved) {
      return;
    }

    const currentType = Object.entries(entityTypeToView).find(([, mappedView]) => mappedView === view)?.[0] as
      | SaucerpediaEntityType
      | undefined;
    const currentId =
      view === "terms" ? selectedTerm.id :
      view === "people" ? selectedPerson.id :
      view === "events" ? selectedEvent.id :
      view === "misidentifications" ? selectedMisidentification.id :
      view === "fakes" ? selectedFake.id :
      view === "resources" ? selectedResource.id :
      view === "motifs" ? selectedMotif.id :
      undefined;
    if (currentType && currentId) {
      storeReturnTarget(currentType, currentId);
    }

    if (nextView === view) {
      setActiveDetailKey(getEntityKey(relation.type, relation.id));
      startTransition(() => {
        selectItemByRelation(relation);
      });
      window.history.replaceState(null, "", `${window.location.pathname}?item=${relation.id}#selected-detail`);
      window.setTimeout(() => scrollToDetail(), 120);
      return;
    }

    window.location.assign(`${resolved.href}#selected-detail`);
  };

  const returnToList = () => {
    setActiveDetailKey(null);
    const fallback = document.querySelector<HTMLElement>("[data-selected-card='true']");
    const saved = sessionStorage.getItem(returnStateKey);
    if (!saved) {
      fallback?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      const target = JSON.parse(saved) as { elementId?: string; href?: string; y?: number };
      const targetPath = target.href ? new URL(target.href, window.location.origin).pathname : window.location.pathname;
      if (targetPath !== window.location.pathname) {
        const hash = target.elementId ? `#${target.elementId}` : "";
        window.location.assign(`${target.href}${hash}`);
        return;
      }

      const element = target.elementId ? document.getElementById(target.elementId) : null;
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      window.scrollTo({ behavior: "smooth", top: target.y ?? 0 });
    } catch {
      fallback?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    if (window.location.hash === "#selected-detail") {
      window.setTimeout(() => scrollToDetail("auto"), 0);
    }
  }, [
    selectedEvent.id,
    selectedFake.id,
    selectedMisidentification.id,
    selectedMotif.id,
    selectedPerson.id,
    selectedResource.id,
    selectedTerm.id,
  ]);

  const directoryNav = (
    <nav className={styles.directoryNav} aria-label="saucerpediaカテゴリ">
      <Link
        aria-current={view === "home" ? "page" : undefined}
        className={view === "home" ? styles.activeDirectoryLink : undefined}
        href="/saucerpedia"
      >
        トップ
      </Link>
      {directoryLinks.map((item) => (
        <Link
          aria-current={item.href.endsWith(`/${view}`) ? "page" : undefined}
          className={item.href.endsWith(`/${view}`) ? styles.activeDirectoryLink : undefined}
          href={item.href}
          key={item.href}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );

  const pageHeader = (eyebrow: string, title: string, body: string, kind: SpecimenKind) => (
    <section className={styles.categoryHero}>
      <div>
        <p className={styles.kicker}>{eyebrow}</p>
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
      <SpecimenIllustration kind={kind} size="hero" />
      {directoryNav}
    </section>
  );

  const specializedGuideSection = (
    <section className={styles.specializedGuideSection} aria-labelledby="saucerpedia-specialized-guides">
      <div className={styles.productGuideHeader}>
        <p className={styles.kicker}>Specialized Guides</p>
        <h3 id="saucerpedia-specialized-guides">専門ガイド</h3>
      </div>
      <div className={styles.productGuideGrid}>
        {productLinks.map((product) => (
          <Link className={styles.productDirectoryCard} href={product.href} key={product.name}>
            <span>UFO Lab Tokyo</span>
            <strong>{product.name}</strong>
            <p>{product.label}</p>
            <small>specialized guide</small>
          </Link>
        ))}
      </div>
    </section>
  );

  const categorySectionClassName = `${styles.glossarySection} ${view !== "home" ? styles.categoryViewSection : ""}`;
  const detailLayoutClassName = `${styles.glossaryLayout} ${activeDetailKey ? styles.detailOpenLayout : ""}`;
  const detailGridClassName = `${styles.termGrid} ${activeDetailKey ? styles.detailOpenGrid : ""}`;
  const detailRailClassName = `${styles.detailRail} ${activeDetailKey ? styles.expandedDetailRail : ""}`;

  const termsSection = (
    <section className={categorySectionClassName} id="glossary">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO Glossary</p>
        <h2>UFO用語辞典</h2>
        <p>基本語から現代UAPまで、意味をすぐつかみ、関連項目へ進めるカード辞典です。</p>
      </div>

      <DictionaryControls
        categories={["すべて", ...termCategories]}
        categoryAriaLabel="カテゴリ"
        onCategoryChange={handleCategoryChange}
        onQueryChange={setQuery}
        placeholder="UAP、MIB、FOIA、グレイ..."
        query={query}
        selectedCategory={selectedCategory}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="用語カード一覧">
          {filteredTerms.map((term) => (
            <TermListCard
              isDetailSource={activeDetailKey === getEntityKey("term", term.id)}
              isSelected={selectedTerm.id === term.id}
              key={term.id}
              onOpenDetail={() => openDetailFromList({ type: "term", id: term.id })}
              onSelect={() => setSelectedTermId(term.id)}
              term={term}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" key={activeDetailKey ?? selectedTerm.id} aria-live="polite">
          <TermDetailCard onOpenRelation={openRelationDetail} onReturn={returnToList} term={selectedTerm} />
        </div>
      </div>
    </section>
  );

  const peopleSection = (
    <section className={categorySectionClassName} id="people">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO People</p>
        <h2>UFO人物辞典</h2>
        <p>人物を英雄化・断罪せず、UFO / UAP 史の中での立場、時代、関連用語をカードで整理します。</p>
      </div>

      <div className={styles.featureStrip}>
        {peopleFeatureCards.map((feature) => (
          <article className={styles.featureCard} key={feature.id}>
            <span>{feature.category}</span>
            <h3>{feature.title}</h3>
            <p>{feature.summary}</p>
            <div className={styles.featurePeople}>
              {feature.people.map((featurePerson) => (
                <div key={featurePerson.name}>
                  <strong>{featurePerson.name}</strong>
                  <small>{featurePerson.note}</small>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <DictionaryControls
        categories={["すべて", ...personCategories]}
        categoryAriaLabel="人物カテゴリ"
        onCategoryChange={handlePersonCategoryChange}
        onQueryChange={setPersonQuery}
        placeholder="ハイネック、ベンダー、ヴァレ、グラッシュ..."
        query={personQuery}
        selectedCategory={selectedPersonCategory}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="人物カード一覧">
          {filteredPeople.map((person) => (
            <PersonListCard
              isDetailSource={activeDetailKey === getEntityKey("person", person.id)}
              isSelected={selectedPerson.id === person.id}
              key={person.id}
              onOpenDetail={() => openDetailFromList({ type: "person", id: person.id })}
              onSelect={() => setSelectedPersonId(person.id)}
              person={person}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" key={activeDetailKey ?? selectedPerson.id} aria-live="polite">
          <PersonDetailCard onOpenRelation={openRelationDetail} onReturn={returnToList} person={selectedPerson} />
        </div>
      </div>
    </section>
  );

  const eventsSection = (
    <section className={categorySectionClassName} id="events">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO Cases</p>
        <h2>UFO事件辞典</h2>
        <p>古典UFOから現代UAP、日本UFO史まで、代表事件を時代・場所・関連項目でたどります。</p>
      </div>

      <DictionaryControls
        categories={["すべて", ...eventCategories]}
        categoryAriaLabel="事件カテゴリ"
        onCategoryChange={handleEventCategoryChange}
        onQueryChange={setEventQuery}
        placeholder="ロズウェル、Tic Tac、甲府、フェニックス..."
        query={eventQuery}
        selectedCategory={selectedEventCategory}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="事件カード一覧">
          {filteredEvents.map((event) => (
            <EventListCard
              event={event}
              isDetailSource={activeDetailKey === getEntityKey("event", event.id)}
              isSelected={selectedEvent.id === event.id}
              key={event.id}
              onOpenDetail={() => openDetailFromList({ type: "event", id: event.id })}
              onSelect={() => setSelectedEventId(event.id)}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" key={activeDetailKey ?? selectedEvent.id} aria-live="polite">
          <EventDetailCard event={selectedEvent} onOpenRelation={openRelationDetail} onReturn={returnToList} />
        </div>
      </div>
    </section>
  );

  const historySection = (
    <section className={styles.historySection} id="history">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO History Cards</p>
        <h2>UFOの歴史カード</h2>
        <p>現代UFO以前の空の怪異から現代UAPまで、時代ごとの見取り図をカードでざっくりたどります。</p>
      </div>
      <div className={styles.historyGrid}>
        {saucerpediaHistoryCards.map((card) => (
          <HistoryCard card={card} key={card.id} />
        ))}
      </div>
    </section>
  );

  const misidentificationsSection = (
    <section className={categorySectionClassName} id="misidentifications">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO & IFO</p>
        <h2>UFOと誤認</h2>
        <p>UFOに見えやすい天体・航空機・生物・カメラ由来・錯覚を、見分けるポイントと一緒に整理します。</p>
      </div>

      <DictionaryControls
        categories={["すべて", ...misidentificationKinds]}
        categoryAriaLabel="誤認の種類"
        onCategoryChange={handleMisidentificationKindChange}
        onQueryChange={setMisidentificationQuery}
        placeholder="金星、スターリンク、レンズフレア、鳥..."
        query={misidentificationQuery}
        selectedCategory={selectedMisidentificationKind}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="UFOと誤認カード一覧">
          {filteredMisidentifications.map((item) => (
            <MisidentificationListCard
              isDetailSource={activeDetailKey === getEntityKey("misidentification", item.id)}
              isSelected={selectedMisidentification.id === item.id}
              item={item}
              key={item.id}
              onOpenDetail={() => openDetailFromList({ type: "misidentification", id: item.id })}
              onSelect={() => setSelectedMisidentificationId(item.id)}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" key={activeDetailKey ?? selectedMisidentification.id} aria-live="polite">
          <MisidentificationDetailCard item={selectedMisidentification} onOpenRelation={openRelationDetail} onReturn={returnToList} />
        </div>
      </div>
    </section>
  );

  const fakesSection = (
    <section className={categorySectionClassName} id="fakes">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO & Fake</p>
        <h2>UFOとフェイク</h2>
        <p>模型、撮影トリック、CG、AI生成、初出確認など、UFO写真・動画を見るときの確認観点を整理します。</p>
      </div>

      <DictionaryControls
        categories={["すべて", ...fakeKinds]}
        categoryAriaLabel="フェイクの種類"
        onCategoryChange={handleFakeKindChange}
        onQueryChange={setFakeQuery}
        placeholder="模型UFO、CGI、AI生成、EXIF..."
        query={fakeQuery}
        selectedCategory={selectedFakeKind}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="UFOとフェイクカード一覧">
          {filteredFakes.map((item) => (
            <FakeListCard
              isDetailSource={activeDetailKey === getEntityKey("fake", item.id)}
              isSelected={selectedFake.id === item.id}
              item={item}
              key={item.id}
              onOpenDetail={() => openDetailFromList({ type: "fake", id: item.id })}
              onSelect={() => setSelectedFakeId(item.id)}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" key={activeDetailKey ?? selectedFake.id} aria-live="polite">
          <FakeDetailCard item={selectedFake} onOpenRelation={openRelationDetail} onReturn={returnToList} />
        </div>
      </div>
    </section>
  );

  const resourcesSection = (
    <section className={categorySectionClassName} id="resources">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO Archives & Organizations</p>
        <h2>UFO資料・機関辞典</h2>
        <p>政府調査、公開制度、民間団体、報告受付組織を、役割と関連人物・用語からたどります。</p>
      </div>

      <DictionaryControls
        categories={["すべて", ...resourceKinds]}
        categoryAriaLabel="資料・機関の種別"
        onCategoryChange={handleResourceKindChange}
        onQueryChange={setResourceQuery}
        placeholder="ブルーブック、AARO、FOIA、NICAP..."
        query={resourceQuery}
        selectedCategory={selectedResourceKind}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="UFO資料・機関カード一覧">
          {filteredResources.map((item) => (
            <ResourceListCard
              isDetailSource={activeDetailKey === getEntityKey("resource", item.id)}
              isSelected={selectedResource.id === item.id}
              item={item}
              key={item.id}
              onOpenDetail={() => openDetailFromList({ type: "resource", id: item.id })}
              onSelect={() => setSelectedResourceId(item.id)}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" key={activeDetailKey ?? selectedResource.id} aria-live="polite">
          <ResourceDetailCard item={selectedResource} onOpenRelation={openRelationDetail} onReturn={returnToList} />
        </div>
      </div>
    </section>
  );

  const motifsSection = (
    <section className={categorySectionClassName} id="motifs">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>UFO Experience Motifs</p>
        <h2>UFO体験モチーフ辞典</h2>
        <p>目撃、接近、コンタクト、アブダクション、ハイストレンジネスに繰り返し出てくる体験要素を整理します。</p>
      </div>

      <DictionaryControls
        categories={["すべて", ...motifCategories]}
        categoryAriaLabel="体験モチーフカテゴリ"
        onCategoryChange={handleMotifCategoryChange}
        onQueryChange={setMotifQuery}
        placeholder="異常な光、欠落時間、MIB、浮遊感..."
        query={motifQuery}
        selectedCategory={selectedMotifCategory}
      />

      <div className={detailLayoutClassName}>
        <div className={detailGridClassName} aria-label="UFO体験モチーフカード一覧">
          {filteredMotifs.map((item) => (
            <MotifListCard
              isDetailSource={activeDetailKey === getEntityKey("motif", item.id)}
              isSelected={selectedMotif.id === item.id}
              item={item}
              key={item.id}
              onOpenDetail={() => openDetailFromList({ type: "motif", id: item.id })}
              onSelect={() => setSelectedMotifId(item.id)}
            />
          ))}
        </div>

        <div className={detailRailClassName} id="selected-detail" key={activeDetailKey ?? selectedMotif.id} aria-live="polite">
          <MotifDetailCard item={selectedMotif} onOpenRelation={openRelationDetail} onReturn={returnToList} />
        </div>
      </div>
    </section>
  );

  const searchSection = (
    <section className={categorySectionClassName} id="search">
      <div className={styles.sectionHeader}>
        <p className={styles.kicker}>Saucerpedia Search</p>
        <h2>横断検索</h2>
        <p>用語、事件、人物、資料、誤認、フェイク、体験モチーフをまとめて探せます。</p>
      </div>

      <div className={styles.controls}>
        <SearchBar
          label="辞典全体を探す"
          onChange={setSearchQuery}
          placeholder="UAP、ロズウェル、ハイネック、AARO..."
          value={searchQuery}
        />
        <FilterChips items={searchTypeFilters} onChange={setSearchFilter} value={searchFilter} />
      </div>

      <div className={styles.searchResultsHeader}>
        <strong>{searchResults.length}件</strong>
        <span>{searchFilter === "すべて" ? "すべてのカテゴリ" : searchFilter}</span>
      </div>
      <div className={styles.searchResultGrid} aria-label="検索結果">
        {searchResults.map((item) => (
          <SearchResultCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );

  const viewToneClass =
    view === "people" ? styles.viewIndigo :
    view === "events" ? styles.viewAmber :
    view === "history" ? styles.viewCobalt :
    view === "misidentifications" ? styles.viewMoss :
    view === "fakes" ? styles.viewRose :
    view === "resources" ? styles.viewCyan :
    view === "motifs" ? styles.viewPlum :
    styles.viewTeal;

  const pageShell = (content: ReactNode) => (
    <main className={`${styles.page} ${styles.pageWithMobileNav} ${viewToneClass}`}>
      <AppHeader onMenuOpen={() => setIsDrawerOpen(true)} view={view} />
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      {content}
      <BottomNav view={view} />
    </main>
  );

  if (view === "home") {
    return pageShell(
      <>
        <SaucerpediaBookStackHero items={directoryLinks} />
        {specializedGuideSection}
      </>
    );
  }

  if (view === "terms") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia Glossary", "UFO用語辞典", "基本語から現代UAPまで、意味をすぐつかみ、関連項目へ進めるカード辞典です。", "term")}
        {termsSection}
      </>
    );
  }

  if (view === "people") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia People", "UFO人物辞典", "UFO / UAP 史に関わる人物を、立場、時代、関連用語から整理します。", "person")}
        {peopleSection}
      </>
    );
  }

  if (view === "events") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia Cases", "UFO事件辞典", "古典UFOから現代UAP、日本UFO史まで、代表事件をカードでたどります。", "event")}
        {eventsSection}
      </>
    );
  }

  if (view === "history") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia History", "UFOの歴史カード", "現代UFO以前の空の怪異から現代UAPまで、時代ごとの見取り図を読みます。", "history")}
        {historySection}
      </>
    );
  }

  if (view === "misidentifications") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia IFO", "UFOと誤認", "UFOに見えやすい対象と見分けるポイントを整理します。", "misidentification")}
        {misidentificationsSection}
      </>
    );
  }

  if (view === "fakes") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia Fake", "UFOとフェイク", "UFO写真・動画を見るときの作為や確認観点を整理します。", "fake")}
        {fakesSection}
      </>
    );
  }

  if (view === "resources") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia Archives", "UFO資料・機関辞典", "政府調査、公開制度、民間団体、資料アーカイブを役割から整理します。", "resource")}
        {resourcesSection}
      </>
    );
  }

  if (view === "motifs") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia Motifs", "UFO体験モチーフ辞典", "UFO体験談に繰り返し出てくる要素を、文化史と調査上の入口として整理します。", "motif")}
        {motifsSection}
      </>
    );
  }

  if (view === "search") {
    return pageShell(
      <>
        {pageHeader("Saucerpedia Search", "検索", "UFO / UAP の用語、人物、事件、資料を横断して探します。", "term")}
        {searchSection}
      </>
    );
  }

  return null;
}
