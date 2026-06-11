"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Person, RelatedPersonRef, TimelineEvent } from "@/data/kean/types";
import {
  DetailBlock,
  PersonDetailDialog,
  PersonPortrait,
  SourceList,
  keanPersonCategoryLabels,
  usePersonDialogLock,
} from "@/components/KeanPersonDetail";

type ResolvedRelatedPerson = RelatedPersonRef & {
  person: Person;
};

type ResolvedTimelineEvent = Omit<TimelineEvent, "relatedPeople"> & {
  relatedPeople: ResolvedRelatedPerson[];
};

type KeanHistoryProps = {
  events: ResolvedTimelineEvent[];
};

const visualThemeLabels: Record<string, string> = {
  archive: "公開資料",
  capitol: "法案",
  document: "報道",
  footage: "映像公開",
  hearing: "議会証言",
  japan: "日本議連",
  radar: "目撃",
  report: "制度化",
  signal: "ネット発信",
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
        <span className="kean-person-category">{keanPersonCategoryLabels[person.category]}</span>
        <strong>{person.jaName}</strong>
        <span className="kean-person-ja">{person.name}</span>
        <span className="kean-person-line">{person.oneLine}</span>
        <span className="kean-person-relation">{relationToEvent}</span>
      </span>
    </button>
  );
}

function EventVisual({ event }: { event: ResolvedTimelineEvent }) {
  return (
    <span className="kean-event-visual" data-theme={event.visualTheme}>
      {event.image ? (
        <>
          <Image src={event.image.src} alt={event.image.alt} width={event.image.width ?? 1024} height={event.image.height ?? 1024} />
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

export function KeanHistory({ events }: KeanHistoryProps) {
  const [openEventId, setOpenEventId] = useState("");
  const [inViewEventId, setInViewEventId] = useState(events[0]?.id || "");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const closeDialog = useCallback(() => setSelectedPerson(null), []);
  const activeIndex = useMemo(
    () => Math.max(0, events.findIndex((event) => event.id === inViewEventId)),
    [events, inViewEventId],
  );
  const activeEvent = events[activeIndex];
  const progress = events.length > 1 ? (activeIndex / (events.length - 1)) * 100 : 0;

  usePersonDialogLock(selectedPerson, closeDialog);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>(".kean-chapter-card"));

    if (cards.length === 0 || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id.startsWith("kean-event-")) {
          setInViewEventId(visibleEntry.target.id.replace("kean-event-", ""));
        }
      },
      {
        rootMargin: "-34% 0px -42% 0px",
        threshold: [0.12, 0.24, 0.36],
      },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [events]);

  function toggleEvent(eventId: string) {
    setOpenEventId((current) => (current === eventId ? "" : eventId));
  }

  function closeEvent() {
    setOpenEventId("");
  }

  return (
    <section className="kean-history" aria-label="Kean 歴史パート">
      <div className="kean-progress" aria-hidden="true">
        <span style={{ height: `${progress}%` }} />
      </div>

      {activeEvent ? (
        <aside className="kean-active-dossier" aria-label="現在の章">
          <span className="kean-active-status">現在地</span>
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
          const isInView = inViewEventId === event.id;
          const panelId = `kean-event-panel-${event.id}`;
          const themeLabel = visualThemeLabels[event.visualTheme] || "記録";

          return (
            <article
              className={`kean-chapter-card${isOpen ? " kean-chapter-card--open" : ""}${
                isInView ? " kean-chapter-card--in-view" : ""
              }`}
              id={`kean-event-${event.id}`}
              key={event.id}
              data-theme={event.visualTheme}
            >
              <span className="kean-chapter-node" aria-hidden="true">
                <span>{String(event.chapterNumber).padStart(2, "0")}</span>
              </span>
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
                  <span className="kean-theme-label">{themeLabel}</span>
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
              {event.relatedUaps?.length ? (
                <div className="kean-related-uaps" aria-label="関連UAP">
                  {event.relatedUaps.map((uap) => (
                    <Link href={`/kean/uap/${uap.uapId}`} key={uap.uapId}>
                      {uap.label}
                    </Link>
                  ))}
                </div>
              ) : null}

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
                  <button className="kean-chapter-close" type="button" onClick={closeEvent}>
                    この章を閉じる
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <aside className="kean-coming-soon" aria-label="人物ページへの導線">
        <p className="eyebrow">Next</p>
        <h2>人物図鑑でも読む</h2>
        <p>
          出来事の背景をつかんだら、次は関係人物をカテゴリ別に確認できます。
          人物図鑑では個別ページで確認済み事実、主張、注意点を分けて読めます。
        </p>
      </aside>

      <PersonDetailDialog person={selectedPerson} onClose={closeDialog} />
    </section>
  );
}

export type { ResolvedTimelineEvent };
