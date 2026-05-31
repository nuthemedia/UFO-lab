"use client";

import { useEffect, useMemo, useState } from "react";
import type { Person, RelatedPersonRef, SourceLink, TimelineEvent } from "@/data/kean/types";

type ResolvedRelatedPerson = RelatedPersonRef & {
  person: Person;
};

type ResolvedTimelineEvent = Omit<TimelineEvent, "relatedPeople"> & {
  relatedPeople: ResolvedRelatedPerson[];
};

type KeanHistoryProps = {
  events: ResolvedTimelineEvent[];
};

const categoryLabels: Record<Person["category"], string> = {
  journalist: "記者・報道",
  whistleblower: "内部告発・証言",
  pilot: "パイロット",
  government: "政府・議会",
  senator: "上院",
  researcher: "研究・民間活動",
  skeptic: "検証・懐疑分析",
  filmmaker: "映像・メディア",
  "japan-politics": "日本政治",
  "public-figure": "公的発信",
  "controversial-claimant": "要注意の主張者",
};

function PersonMiniCard({
  person,
  relationToEvent,
  onSelect,
}: {
  person: Person;
  relationToEvent: string;
  onSelect: (person: Person) => void;
}) {
  return (
    <button
      className="kean-person-card"
      type="button"
      data-person-id={person.id}
      aria-label={`${person.jaName}の人物カード`}
      onClick={() => onSelect(person)}
    >
      <PersonPortrait person={person} size="small" />
      <span className="kean-person-card-body">
        <span className="kean-person-category">{categoryLabels[person.category]}</span>
        <strong>{person.name}</strong>
        <span className="kean-person-ja">{person.jaName}</span>
        <span className="kean-person-line">{person.oneLine}</span>
        <span className="kean-person-relation">{relationToEvent}</span>
      </span>
    </button>
  );
}

function getInitials(person: Person) {
  const parts = person.name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return person.jaName.slice(0, 2);
}

function PersonPortrait({ person, size }: { person: Person; size: "small" | "large" }) {
  const image = person.illustration ?? person.portrait;

  return (
    <span className={`kean-person-avatar kean-person-avatar--${size}`}>
      {image ? (
        <img src={image.src} alt={image.alt} loading="lazy" />
      ) : (
        <span aria-hidden="true">{getInitials(person)}</span>
      )}
    </span>
  );
}

function SourceList({ sources }: { sources: SourceLink[] }) {
  if (sources.length === 0) {
    return <p className="kean-empty-note">出典リンクは追加準備中です。</p>;
  }

  return (
    <ul className="kean-source-list">
      {sources.map((source) => (
        <li key={source.url}>
          <a href={source.url} target="_blank" rel="noreferrer noopener">
            {source.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function TextList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="kean-empty-note">追加準備中です。</p>;
  }

  return (
    <ul className="kean-text-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="kean-detail-block">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function EventVisual({ event }: { event: ResolvedTimelineEvent }) {
  return (
    <span className="kean-event-visual" data-theme={event.visualTheme}>
      {event.image ? (
        <>
          <img src={event.image.src} alt={event.image.alt} loading="lazy" />
          <span className="kean-visual-caption">{event.image.caption}</span>
        </>
      ) : (
        <>
          <span className="kean-visual-placeholder" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="kean-visual-caption">関連画像は権利確認後に追加予定</span>
        </>
      )}
    </span>
  );
}

function PersonDetailDialog({
  person,
  onClose,
}: {
  person: Person | null;
  onClose: () => void;
}) {
  if (!person) {
    return null;
  }

  const image = person.illustration ?? person.portrait;

  return (
    <div className="kean-person-dialog-layer" onClick={onClose}>
      <article
        className="kean-person-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kean-person-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="kean-person-dialog-close" type="button" onClick={onClose}>
          閉じる
        </button>
        <header className="kean-person-dialog-header">
          <div className="kean-person-dialog-media">
            <PersonPortrait person={person} size="large" />
            {image ? (
              <p>
                {image.credit} / {image.license} /{" "}
                <a href={image.sourceUrl} target="_blank" rel="noreferrer noopener">
                  {image.sourceName}
                </a>
              </p>
            ) : (
              <p>自由利用可能な顔写真を確認でき次第、追加します。</p>
            )}
          </div>
          <div>
            <span className="kean-person-category">{categoryLabels[person.category]}</span>
            <h2 id="kean-person-dialog-title">{person.name}</h2>
            <p className="kean-person-dialog-ja">{person.jaName}</p>
            <p className="kean-person-dialog-tier">beginnerTier: {person.beginnerTier}</p>
            <p className="kean-person-dialog-lead">{person.oneLine}</p>
          </div>
        </header>

        <div className="kean-person-dialog-sections">
          <DetailBlock title="何をした？">
            <TextList items={person.whatTheyDid} />
          </DetailBlock>
          <DetailBlock title="なぜ重要？">
            <p>{person.whyImportant}</p>
          </DetailBlock>
          <DetailBlock title="確認済み事実">
            <TextList items={person.verifiedFacts} />
          </DetailBlock>
          <DetailBlock title="主張・立場">
            <TextList items={person.claimsOrPositions} />
          </DetailBlock>
          <DetailBlock title="注意点">
            <TextList items={person.cautions} />
          </DetailBlock>
          <DetailBlock title="関連タグ">
            {person.tags.length > 0 ? (
              <div className="kean-tag-list">
                {person.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            ) : (
              <p className="kean-empty-note">タグは追加準備中です。</p>
            )}
          </DetailBlock>
          <DetailBlock title="出典リンク">
            <SourceList sources={person.sources} />
          </DetailBlock>
        </div>
      </article>
    </div>
  );
}

export function KeanHistory({ events }: KeanHistoryProps) {
  const [openEventId, setOpenEventId] = useState(events[0]?.id || "");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const activeIndex = useMemo(
    () => Math.max(0, events.findIndex((event) => event.id === openEventId)),
    [events, openEventId],
  );
  const activeEvent = events[activeIndex];
  const progress = events.length > 1 ? (activeIndex / (events.length - 1)) * 100 : 0;

  useEffect(() => {
    if (!selectedPerson) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedPerson(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPerson]);

  function toggleEvent(eventId: string) {
    setOpenEventId((current) => (current === eventId ? "" : eventId));
  }

  return (
    <section className="kean-history" aria-label="Kean 歴史パート">
      <div className="kean-progress" aria-hidden="true">
        <span style={{ height: `${progress}%` }} />
      </div>

      {activeEvent ? (
        <aside className="kean-active-dossier" aria-label="現在の章">
          <span>
            Chapter {String(activeIndex + 1).padStart(2, "0")} / {String(events.length).padStart(2, "0")}
          </span>
          <strong>{activeEvent.yearLabel}</strong>
          <p>{activeEvent.title}</p>
        </aside>
      ) : null}

      <div className="kean-chapter-list">
        {events.map((event) => {
          const isOpen = openEventId === event.id;
          const panelId = `kean-event-${event.id}`;

          return (
            <article
              className={`kean-chapter-card${isOpen ? " kean-chapter-card--open" : ""}`}
              key={event.id}
              data-theme={event.visualTheme}
            >
              <button
                className="kean-chapter-main"
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleEvent(event.id)}
              >
                <span className="kean-chapter-meta">
                  <span>{event.chapterLabel}</span>
                  <span>{event.yearLabel}</span>
                </span>
                <EventVisual event={event} />
                <span className="kean-chapter-title">{event.chapterTitle}</span>
                <strong>{event.title}</strong>
                <span className="kean-summary">{event.shortSummary}</span>
                <span className="kean-related-preview" aria-label="関連人物">
                  {event.relatedPeople.slice(0, 3).map(({ person }) => (
                    <span key={person.id}>{person.jaName}</span>
                  ))}
                </span>
                <span className="kean-more">{isOpen ? "閉じる" : "詳しく見る"}</span>
              </button>

              {isOpen ? (
                <div className="kean-chapter-detail" id={panelId}>
                  <DetailBlock title="何が起きた？">
                    <p>{event.whatHappened}</p>
                  </DetailBlock>
                  <DetailBlock title="なぜ重要？">
                    <p>{event.whyImportant}</p>
                  </DetailBlock>
                  <DetailBlock title="注意点">
                    <p>{event.caution}</p>
                  </DetailBlock>
                  <DetailBlock title="関連人物">
                    <div className="kean-person-grid">
                      {event.relatedPeople.map(({ person, relationToEvent }) => (
                        <PersonMiniCard
                          key={`${event.id}-${person.id}`}
                          person={person}
                          relationToEvent={relationToEvent}
                          onSelect={setSelectedPerson}
                        />
                      ))}
                    </div>
                  </DetailBlock>
                  <DetailBlock title="出典リンク">
                    <SourceList sources={event.sources} />
                  </DetailBlock>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <aside className="kean-coming-soon" aria-label="人物ページへの導線">
        <p className="eyebrow">Next</p>
        <h2>人物でも読む</h2>
        <p>
          出来事の背景をつかんだら、次は関係人物をカテゴリ別に確認できます。
          個別人物ページは今後追加予定です。
        </p>
      </aside>

      <PersonDetailDialog person={selectedPerson} onClose={() => setSelectedPerson(null)} />
    </section>
  );
}

export type { ResolvedTimelineEvent };
