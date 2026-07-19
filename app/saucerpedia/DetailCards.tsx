"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import type { SaucerpediaEvent } from "@/data/saucerpedia/events";
import type { SaucerpediaFake } from "@/data/saucerpedia/fakes";
import {
  getRelationsForEntity,
  resolveSaucerpediaRelation,
  type SaucerpediaEntityType,
  type SaucerpediaRelation,
} from "@/data/saucerpedia/knowledge";
import type { SaucerpediaMisidentification } from "@/data/saucerpedia/misidentifications";
import type { SaucerpediaMotif } from "@/data/saucerpedia/motifs";
import { peopleFeatureCards } from "@/data/saucerpedia/people";
import type { SaucerpediaPerson } from "@/data/saucerpedia/people";
import type { SaucerpediaResource } from "@/data/saucerpedia/resources";
import type { SaucerpediaTerm } from "@/data/saucerpedia/terms";
import type { SaucerpediaSource } from "@/data/saucerpedia/types";
import styles from "./saucerpedia.module.css";

export type SpecimenKind =
  | "term"
  | "person"
  | "event"
  | "history"
  | "misidentification"
  | "fake"
  | "resource"
  | "motif";

export function SpecimenIllustration({ kind, size = "mini" }: { kind: SpecimenKind; size?: "mini" | "detail" | "hero" }) {
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

export function relatedOf(type: SaucerpediaEntityType, id: string, allowedTypes?: SaucerpediaEntityType[]) {
  const relations = getRelationsForEntity(type, id);
  return allowedTypes ? relations.filter((relation) => allowedTypes.includes(relation.type)) : relations;
}

export function isResolvedRelation(
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

export function RelatedList({
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

export function PlainList({ items, title }: { items?: string[]; title: string }) {
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

export function ReturnToListButton({ backHref, onReturn }: { backHref?: string; onReturn?: () => void }) {
  if (onReturn) {
    return (
      <button className={styles.returnButton} onClick={onReturn} type="button">
        元の場所に戻る
      </button>
    );
  }

  if (backHref) {
    return (
      <Link className={styles.returnButton} href={backHref}>
        一覧で見る
      </Link>
    );
  }

  return null;
}

export function OverlapCardStack({
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

export function SourcePanel({
  items,
  productItems,
  sources,
}: {
  items?: SaucerpediaRelation[];
  productItems?: SaucerpediaRelation[];
  sources?: SaucerpediaSource[];
}) {
  const resourceItems = (items ?? [])
    .filter((relation) => relation.type === "resource")
    .map(resolveSaucerpediaRelation)
    .filter(isResolvedRelation);
  const products = [
    ...(items ?? []).filter((relation) => relation.type === "product"),
    ...(productItems ?? []),
  ]
    .map(resolveSaucerpediaRelation)
    .filter(isResolvedRelation);
  const panelItems = [...resourceItems, ...products].slice(0, 5);
  const externalSources = sources ?? [];

  return (
    <section className={styles.sourcePanel}>
      <details>
        <summary>出典・参考資料</summary>
        {externalSources.length ? (
          <div className={styles.sourceList}>
            {externalSources.map((source) => (
              <a href={source.url} key={source.url} rel="noreferrer noopener" target="_blank">
                <span>{source.publisher ?? "外部資料"}</span>
                <strong>{source.label}</strong>
                {source.note ? <small>{source.note}</small> : null}
              </a>
            ))}
          </div>
        ) : null}
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
        ) : null}
        {!externalSources.length && !panelItems.length ? (
          <p>この初期版では、関連資料カードまたは関連プロダクトを参考資料として表示します。正式な外部出典URLは今後のデータ拡張で追加します。</p>
        ) : null}
      </details>
    </section>
  );
}

type DetailCardHandlers = {
  backHref?: string;
  onOpenRelation?: (relation: SaucerpediaRelation) => void;
  onReturn?: () => void;
};

export function PersonDetailCard({
  backHref,
  onOpenRelation,
  onReturn,
  person,
}: DetailCardHandlers & {
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
      <ReturnToListButton backHref={backHref} onReturn={onReturn} />

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

      <SourcePanel items={relations} sources={person.sources} />

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

export function EventDetailCard({
  backHref,
  event,
  onOpenRelation,
  onReturn,
}: DetailCardHandlers & {
  event: SaucerpediaEvent;
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
      <ReturnToListButton backHref={backHref} onReturn={onReturn} />

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

      <SourcePanel items={relations} sources={event.sources} />
    </article>
  );
}

export function MisidentificationDetailCard({
  backHref,
  item,
  onOpenRelation,
  onReturn,
}: DetailCardHandlers & {
  item: SaucerpediaMisidentification;
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
      <ReturnToListButton backHref={backHref} onReturn={onReturn} />

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

      <SourcePanel items={relations} sources={item.sources} />
    </article>
  );
}

export function FakeDetailCard({
  backHref,
  item,
  onOpenRelation,
  onReturn,
}: DetailCardHandlers & {
  item: SaucerpediaFake;
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
      <ReturnToListButton backHref={backHref} onReturn={onReturn} />

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

      <SourcePanel items={relations} sources={item.sources} />
    </article>
  );
}

export function ResourceDetailCard({
  backHref,
  item,
  onOpenRelation,
  onReturn,
}: DetailCardHandlers & {
  item: SaucerpediaResource;
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
      <ReturnToListButton backHref={backHref} onReturn={onReturn} />

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

      <SourcePanel items={relations} sources={item.sources} />
    </article>
  );
}

export function MotifDetailCard({
  backHref,
  item,
  onOpenRelation,
  onReturn,
}: DetailCardHandlers & {
  item: SaucerpediaMotif;
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
      <ReturnToListButton backHref={backHref} onReturn={onReturn} />

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

      <SourcePanel items={relations} sources={item.sources} />
    </article>
  );
}

export function TermDetailCard({
  backHref,
  onOpenRelation,
  onReturn,
  term,
}: DetailCardHandlers & {
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
      <ReturnToListButton backHref={backHref} onReturn={onReturn} />

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

      <SourcePanel items={relations} sources={term.sources} />
    </article>
  );
}
