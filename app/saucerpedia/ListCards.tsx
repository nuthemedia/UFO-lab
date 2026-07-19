"use client";

import type { SaucerpediaEvent } from "@/data/saucerpedia/events";
import type { SaucerpediaFake } from "@/data/saucerpedia/fakes";
import type { SaucerpediaHistoryCard } from "@/data/saucerpedia/history";
import {
  getRelationsForEntity,
  getSaucerpediaRelationLabel,
  type SaucerpediaEntityType,
} from "@/data/saucerpedia/knowledge";
import type { SaucerpediaMisidentification } from "@/data/saucerpedia/misidentifications";
import type { SaucerpediaMotif } from "@/data/saucerpedia/motifs";
import type { SaucerpediaPerson } from "@/data/saucerpedia/people";
import type { SaucerpediaResource } from "@/data/saucerpedia/resources";
import type { SaucerpediaTerm } from "@/data/saucerpedia/terms";
import { RelatedList, SpecimenIllustration, type SpecimenKind } from "./DetailCards";
import styles from "./saucerpedia.module.css";

export function getCardElementId(type: SaucerpediaEntityType, id: string) {
  return `saucerpedia-card-${type}-${id}`;
}

type ListCardHandlers = {
  isDetailSource: boolean;
  isSelected: boolean;
  onOpenDetail: () => void;
  onSelect: () => void;
};

function EntryListCard({
  categoryLabel,
  entityType,
  id,
  isDetailSource,
  isSelected,
  name,
  onOpenDetail,
  onSelect,
  specimenKind,
  subline,
  summary,
  tags,
}: ListCardHandlers & {
  categoryLabel: string;
  entityType: SaucerpediaEntityType;
  id: string;
  name: string;
  specimenKind: SpecimenKind;
  subline?: string;
  summary: string;
  tags: string[];
}) {
  return (
    <article
      className={`${styles.termCard} ${isSelected ? styles.termCardActive : ""} ${isDetailSource ? styles.detailSourceCard : ""}`}
      data-detail-source={isDetailSource || undefined}
      data-selected-card={isSelected || undefined}
      id={getCardElementId(entityType, id)}
    >
      <button aria-pressed={isSelected} className={styles.termCardBody} onClick={onSelect} type="button">
        <span className={styles.cardTopRow}>
          <span className={styles.termCategory}>{categoryLabel}</span>
          <SpecimenIllustration kind={specimenKind} />
        </span>
        <strong>{name}</strong>
        <span className={styles.termSubline}>{subline}</span>
        <p>{summary}</p>
        <span className={styles.tagRow}>
          {tags.slice(0, 4).map((tag, index) => (
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

export function TermListCard({ term, ...handlers }: ListCardHandlers & { term: SaucerpediaTerm }) {
  return (
    <EntryListCard
      {...handlers}
      categoryLabel={term.category}
      entityType="term"
      id={term.id}
      name={term.name}
      specimenKind="term"
      subline={[term.englishName, term.translation].filter(Boolean).join(" / ")}
      summary={term.summary}
      tags={term.tags}
    />
  );
}

export function PersonListCard({ person, ...handlers }: ListCardHandlers & { person: SaucerpediaPerson }) {
  return (
    <EntryListCard
      {...handlers}
      categoryLabel={person.category}
      entityType="person"
      id={person.id}
      name={person.name}
      specimenKind="person"
      subline={[person.englishName, person.role].filter(Boolean).join(" / ")}
      summary={person.summary}
      tags={person.tags}
    />
  );
}

export function EventListCard({ event, ...handlers }: ListCardHandlers & { event: SaucerpediaEvent }) {
  return (
    <EntryListCard
      {...handlers}
      categoryLabel={event.category}
      entityType="event"
      id={event.id}
      name={event.name}
      specimenKind="event"
      subline={[event.englishName, event.year, event.location].filter(Boolean).join(" / ")}
      summary={event.summary}
      tags={event.tags}
    />
  );
}

export function MisidentificationListCard({
  item,
  ...handlers
}: ListCardHandlers & { item: SaucerpediaMisidentification }) {
  return (
    <EntryListCard
      {...handlers}
      categoryLabel={item.kind}
      entityType="misidentification"
      id={item.id}
      name={item.name}
      specimenKind="misidentification"
      subline={[item.englishName, item.aliases?.join(" / ")].filter(Boolean).join(" / ")}
      summary={item.summary}
      tags={[item.category, item.kind, ...item.relatedTerms.map(getSaucerpediaRelationLabel)]}
    />
  );
}

export function FakeListCard({ item, ...handlers }: ListCardHandlers & { item: SaucerpediaFake }) {
  return (
    <EntryListCard
      {...handlers}
      categoryLabel={item.kind}
      entityType="fake"
      id={item.id}
      name={item.name}
      specimenKind="fake"
      subline={[item.englishName, item.aliases?.join(" / ")].filter(Boolean).join(" / ")}
      summary={item.summary}
      tags={[item.category, item.kind, ...item.relatedTerms.map(getSaucerpediaRelationLabel)]}
    />
  );
}

export function ResourceListCard({ item, ...handlers }: ListCardHandlers & { item: SaucerpediaResource }) {
  return (
    <EntryListCard
      {...handlers}
      categoryLabel={item.kind}
      entityType="resource"
      id={item.id}
      name={item.name}
      specimenKind="resource"
      subline={[item.englishName, item.era].filter(Boolean).join(" / ")}
      summary={item.summary}
      tags={[item.kind, ...item.relatedTerms]}
    />
  );
}

export function MotifListCard({ item, ...handlers }: ListCardHandlers & { item: SaucerpediaMotif }) {
  return (
    <EntryListCard
      {...handlers}
      categoryLabel={item.category}
      entityType="motif"
      id={item.id}
      name={item.name}
      specimenKind="motif"
      subline={item.englishName}
      summary={item.summary}
      tags={[item.category, ...item.relatedTerms]}
    />
  );
}

export function HistoryCard({ card }: { card: SaucerpediaHistoryCard }) {
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
