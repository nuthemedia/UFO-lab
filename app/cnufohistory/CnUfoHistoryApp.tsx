"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  cnufoEraSections,
  getCnufoTimelineItemMap,
  type CnUfoEraSection,
  type CnUfoTimelineCategory,
  type CnUfoTimelineItem,
} from "@/data/cnufohistory/timeline";
import styles from "./cnufohistory.module.css";

type Category = "背景" | "研究会" | "事件" | "雑誌" | "カルチャー";
type Filter = "すべて" | Category;

type DisplayEraSection = CnUfoEraSection & {
  items: CnUfoTimelineItem[];
};

const filters: Filter[] = ["すべて", "背景", "研究会", "事件", "雑誌", "カルチャー"];
const itemMap = getCnufoTimelineItemMap();

const categoryLabels: Record<CnUfoTimelineCategory, string> = {
  "world-context": "背景",
  media: "メディア",
  organization: "研究会",
  magazine: "雑誌",
  sighting: "目撃",
  case: "事件",
  conference: "会議",
  "qigong-context": "思想史",
  internet: "ネット",
  film: "映画",
};

const categoryFilters: Record<CnUfoTimelineCategory, Category> = {
  "world-context": "背景",
  media: "雑誌",
  organization: "研究会",
  magazine: "雑誌",
  sighting: "事件",
  case: "事件",
  conference: "研究会",
  "qigong-context": "カルチャー",
  internet: "カルチャー",
  film: "カルチャー",
};

function compareTimelineItems(a: CnUfoTimelineItem, b: CnUfoTimelineItem) {
  return a.date.start.localeCompare(b.date.start) || a.id.localeCompare(b.id);
}

const decadeEras = cnufoEraSections.filter((era) => era.id !== "prehistory");

export function CnUfoHistoryApp() {
  const [view, setView] = useState<"cover" | "timeline">("cover");
  const [activeFilter, setActiveFilter] = useState<Filter>("すべて");
  const [selectedItem, setSelectedItem] = useState<CnUfoTimelineItem | null>(null);
  const [activeEraId, setActiveEraId] = useState(cnufoEraSections[0].id);
  const touchStartY = useRef<number | null>(null);

  const filteredEras = useMemo<DisplayEraSection[]>(
    () =>
      cnufoEraSections
        .map((era) => ({
          ...era,
          items: era.itemIds
            .map((id) => itemMap.get(id))
            .filter((item): item is CnUfoTimelineItem => Boolean(item))
            .filter((item) => activeFilter === "すべて" || categoryFilters[item.category] === activeFilter)
            .sort(compareTimelineItems),
        }))
        .filter((era) => era.items.length > 0),
    [activeFilter],
  );

  useEffect(() => {
    if (view !== "timeline") {
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-era-id]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          const target = visibleEntry.target as HTMLElement;
          setActiveEraId(target.dataset.eraId || cnufoEraSections[0].id);
        }
      },
      {
        rootMargin: "-28% 0px -55% 0px",
        threshold: [0.1, 0.32, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [activeFilter, view]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem]);

  function enterTimeline() {
    setView("timeline");
    setActiveEraId(cnufoEraSections[0].id);
    window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }

  function returnToCover() {
    setSelectedItem(null);
    setView("cover");
    setActiveEraId(cnufoEraSections[0].id);
    window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }

  function handleCoverTouchStart(event: React.TouchEvent<HTMLElement>) {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function handleCoverTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (touchStartY.current === null) {
      return;
    }

    const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY.current;
    const distance = touchStartY.current - touchEndY;
    touchStartY.current = null;

    if (distance > 48) {
      enterTimeline();
    }
  }

  return (
    <div className={styles.page}>
      {view === "cover" ? (
        <section
          className={styles.cover}
          aria-labelledby="cnufohistory-title"
          onTouchEnd={handleCoverTouchEnd}
          onTouchStart={handleCoverTouchStart}
        >
          <div className={styles.coverInner}>
            <p className={styles.period}>1978-2023</p>
            <h1 id="cnufohistory-title">中国UFO史年表</h1>
            <p className={styles.lead}>研究会、重大事件、カルチャー。</p>
          </div>
          <button className={styles.coverArrow} onClick={enterTimeline} type="button" aria-label="年表へ進む">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 19V5m0 0 6 6m-6-6-6 6" />
            </svg>
          </button>
          <a className={styles.coverBrand} href="https://ufolab.tokyo">
            UFO Lab Tokyo
          </a>
        </section>
      ) : null}

      {view === "timeline" ? (
        <section className={styles.timelineShell} id="timeline" aria-label="中国UFO史年表">
          <div className={styles.stickyBar}>
            <div className={styles.timelineTop}>
              <p>中国UFO史</p>
              <button onClick={returnToCover} type="button">
                トップへ
              </button>
            </div>
            <nav aria-label="年代ジャンプ" className={styles.decadeNav}>
              {decadeEras.map((era) => (
                <a className={activeEraId === era.id ? styles.activeDecade : undefined} key={era.id} href={`#${era.id}`}>
                  {era.years.split("-")[0]}
                </a>
              ))}
            </nav>
          </div>

          <div className={styles.filterRow} aria-label="分類フィルター">
            {filters.map((filter) => (
              <button
                className={filter === activeFilter ? styles.activeFilter : styles.filterButton}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>

          <div className={styles.paper} aria-live="polite">
            {filteredEras.length === 0 ? (
              <p className={styles.empty}>該当する年表項目はまだありません。</p>
            ) : (
              filteredEras.map((era) => (
                <section
                  className={styles.era}
                  data-era-id={era.id}
                  id={era.id}
                  key={era.id}
                  onMouseEnter={() => setActiveEraId(era.id)}
                  onFocus={() => setActiveEraId(era.id)}
                >
                  <div className={styles.eraHeader}>
                    <span>{era.years}</span>
                    <h2>{era.label}</h2>
                    <p>{era.note}</p>
                  </div>
                  <div className={styles.items}>
                    {era.items.map((item) => (
                      <article className={styles.item} key={item.id}>
                        <button
                          className={`${styles.itemButton}${item.visual ? ` ${styles.itemButtonWithVisual}` : ""}`}
                          onClick={() => setSelectedItem(item)}
                          type="button"
                        >
                          <span className={styles.itemDate}>{item.date.display}</span>
                          <span className={styles.itemMain}>
                            <span className={styles.category}>{categoryLabels[item.category]}</span>
                            <strong>{item.title}</strong>
                          </span>
                          {item.visual ? (
                            <span className={styles.itemVisual} aria-hidden="true">
                              <img src={item.visual.src} alt="" />
                            </span>
                          ) : null}
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </section>
      ) : null}

      {selectedItem ? (
        <div className={styles.sheetOverlay} onClick={() => setSelectedItem(null)}>
          <section
            aria-modal="true"
            className={styles.detailSheet}
            role="dialog"
            aria-labelledby="cnufohistory-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className={styles.sheetClose} onClick={() => setSelectedItem(null)} type="button">
              閉じる
            </button>
            <p className={styles.sheetMeta}>
              <span>{selectedItem.date.display}</span>
              <span>{categoryLabels[selectedItem.category]}</span>
            </p>
            <h2 id="cnufohistory-detail-title">{selectedItem.title}</h2>
            {selectedItem.visual ? (
              <figure className={styles.sheetVisual}>
                <img src={selectedItem.visual.src} alt={selectedItem.visual.alt} />
              </figure>
            ) : null}
            <p>{selectedItem.body}</p>
            {selectedItem.sources.some((source) => source.url) ? (
              <div className={styles.sheetSources}>
                <h3>出典</h3>
                <ul>
                  {selectedItem.sources
                    .filter((source) => source.url)
                    .map((source) => (
                    <li key={`${selectedItem.id}-${source.label}`}>
                      <a href={source.url} rel="noreferrer" target="_blank">
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
