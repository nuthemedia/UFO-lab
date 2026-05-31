"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  formatHooverOptionalText,
  formatHooverOptionalYear,
  getHooverSearchText,
  getHooverScoreLabel,
  hooverOcrQualityLabels,
  type HooverPage,
} from "@/lib/hoover";

type HooverLabViewerProps = {
  pages: HooverPage[];
};

type ScoreKind = "strangeness" | "reliability";
type HooverScore = 0 | 1 | 2 | 3 | 4 | 5;

function joinOrFallback(items: string[]) {
  return items.length > 0 ? items.join("、") : "なし";
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="hoover-lab-muted">なし</span>;
  }

  return (
    <div className="hoover-lab-tags">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function ReasonList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return <p className="hoover-lab-muted">なし</p>;
  }

  return (
    <ul className="hoover-lab-reason-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function MetadataRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function comparePages(a: HooverPage, b: HooverPage) {
  const yearA = typeof a.year === "number" ? a.year : Number.POSITIVE_INFINITY;
  const yearB = typeof b.year === "number" ? b.year : Number.POSITIVE_INFINITY;

  return (
    yearA - yearB ||
    a.pageNumber - b.pageNumber ||
    a.sectionOrSerial.localeCompare(b.sectionOrSerial, "ja") ||
    a.id.localeCompare(b.id, "ja")
  );
}

function findPageAtOrAfterYear(pages: HooverPage[], year: number) {
  if (pages.length === 0) {
    return null;
  }

  return pages.find((page) => typeof page.year === "number" && page.year >= year) || pages[pages.length - 1];
}

function getYearRange(pages: HooverPage[]) {
  const years = pages.map((page) => page.year).filter((value): value is number => typeof value === "number");

  if (years.length === 0) {
    return null;
  }

  return {
    min: Math.min(...years),
    max: Math.max(...years),
  };
}

function ScoreChip({
  kind,
  score,
  label,
}: {
  kind: ScoreKind;
  score: HooverScore;
  label?: string;
}) {
  return (
    <span className={`hoover-lab-score hoover-lab-score--${kind}`}>
      {label || getHooverScoreLabel(kind, score)}
    </span>
  );
}

function ScoreBlock({
  kind,
  page,
}: {
  kind: ScoreKind;
  page: HooverPage;
}) {
  const score =
    kind === "strangeness" ? page.strangenessScore : page.reliabilityScore;
  const label =
    kind === "strangeness" ? page.strangenessLabelJa : page.reliabilityLabelJa;
  const reasons =
    kind === "strangeness" ? page.strangenessReasonsJa : page.reliabilityReasonsJa;
  const title = kind === "strangeness" ? "異常度" : "信頼度";

  if (typeof score !== "number" && !label && (!reasons || reasons.length === 0)) {
    return null;
  }

  return (
    <section className={`hoover-lab-score-block hoover-lab-score-block--${kind}`}>
      <div className="hoover-lab-score-header">
        <h4>{title}</h4>
        <div className="hoover-lab-score-row">
          {typeof score === "number" ? (
            <ScoreChip kind={kind} score={score} label={label} />
          ) : label ? (
            <span className={`hoover-lab-score hoover-lab-score--${kind}`}>{label}</span>
          ) : null}
        </div>
      </div>
      <ReasonList items={reasons} />
    </section>
  );
}

function DetailSection({
  title,
  children,
  tone,
}: {
  title: string;
  children: ReactNode;
  tone?: "default" | "paper" | "transcript";
}) {
  return (
    <section className={`hoover-lab-detail-section${tone ? ` hoover-lab-detail-section--${tone}` : ""}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function HooverLabViewer({ pages }: HooverLabViewerProps) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(pages[0]?.id || "");
  const [openedId, setOpenedId] = useState("");
  const [scrubYear, setScrubYear] = useState<number>(pages[0]?.year || 1947);
  const [carouselDragging, setCarouselDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const carouselItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const detailRef = useRef<HTMLElement | null>(null);
  const shouldScrollCarouselRef = useRef(false);
  const shouldScrollToDetailRef = useRef(false);
  const carouselDragRef = useRef({
    active: false,
    moved: false,
    pointerId: 0,
    scrollLeft: 0,
    startX: 0,
  });
  const normalizedQuery = query.trim().toLowerCase();

  const orderedPages = useMemo(() => [...pages].sort(comparePages), [pages]);

  const filteredPages = useMemo(() => {
    if (!normalizedQuery) {
      return orderedPages;
    }

    return orderedPages.filter((page) => getHooverSearchText(page).includes(normalizedQuery));
  }, [normalizedQuery, orderedPages]);

  const yearRange = useMemo(() => getYearRange(filteredPages), [filteredPages]);

  const activePage =
    filteredPages.find((page) => page.id === activeId) ||
    filteredPages[0] ||
    null;
  const openedPage = filteredPages.find((page) => page.id === openedId) || null;
  const activeIndex = activePage ? filteredPages.findIndex((page) => page.id === activePage.id) : -1;

  useEffect(() => {
    if (filteredPages.length === 0) {
      if (activeId) {
        setActiveId("");
      }
      setOpenedId("");

      return;
    }

    if (!filteredPages.some((page) => page.id === activeId)) {
      const nextPage = findPageAtOrAfterYear(filteredPages, scrubYear) || filteredPages[0];
      setActiveId(nextPage.id);
      setScrubYear(typeof nextPage.year === "number" ? nextPage.year : scrubYear);
    }

    if (openedId && !filteredPages.some((page) => page.id === openedId)) {
      setOpenedId("");
    }
  }, [activeId, filteredPages, openedId, scrubYear]);

  useEffect(() => {
    if (!activePage) {
      return;
    }

    if (typeof activePage.year === "number" && activePage.year !== scrubYear) {
      setScrubYear(activePage.year);
    }
  }, [activePage, scrubYear]);

  useEffect(() => {
    if (activeIndex < 0 || !shouldScrollCarouselRef.current) {
      return;
    }

    shouldScrollCarouselRef.current = false;
    carouselItemRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  useEffect(() => {
    if (!openedPage || !shouldScrollToDetailRef.current) {
      return;
    }

    shouldScrollToDetailRef.current = false;
    detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [openedPage?.id]);

  function pickPage(page: HooverPage) {
    setActiveId(page.id);
    setOpenedId(page.id);
    shouldScrollToDetailRef.current = true;
    if (typeof page.year === "number") {
      setScrubYear(page.year);
    }
  }

  function handleYearChange(value: number) {
    setScrubYear(value);
    const nextPage = findPageAtOrAfterYear(filteredPages, value);

    if (nextPage) {
      shouldScrollCarouselRef.current = true;
      setActiveId(nextPage.id);
    }
  }

  function scrollCarousel(direction: -1 | 1) {
    const element = carouselRef.current;

    if (!element) {
      return;
    }

    const activeItem = carouselItemRefs.current[activeIndex];
    const distance = activeItem?.getBoundingClientRect().width || element.clientWidth * 0.8;

    element.scrollBy({
      left: distance * direction,
      behavior: "smooth",
    });
  }

  function startCarouselDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select")) {
      return;
    }

    carouselDragRef.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      scrollLeft: event.currentTarget.scrollLeft,
      startX: event.clientX,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setCarouselDragging(true);
  }

  function moveCarouselDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = carouselDragRef.current;

    if (!drag.active || drag.pointerId !== event.pointerId) {
      return;
    }

    const delta = event.clientX - drag.startX;

    if (Math.abs(delta) > 4) {
      drag.moved = true;
    }

    event.currentTarget.scrollLeft = drag.scrollLeft - delta;
  }

  function endCarouselDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = carouselDragRef.current;

    if (!drag.active || drag.pointerId !== event.pointerId) {
      return;
    }

    carouselDragRef.current = {
      active: false,
      moved: drag.moved,
      pointerId: 0,
      scrollLeft: 0,
      startX: 0,
    };
    event.currentTarget.releasePointerCapture(event.pointerId);
    setCarouselDragging(false);
  }

  useEffect(() => {
    const element = carouselRef.current;

    if (!element || filteredPages.length === 0) {
      return;
    }

    let frame = 0;

    const updateActiveIndex = () => {
      frame = 0;
      const containerRect = element.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      carouselItemRefs.current.forEach((item, indexValue) => {
        if (!item) {
          return;
        }

        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(itemCenter - containerCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = indexValue;
        }
      });

      const nextPage = filteredPages[closestIndex];
      if (nextPage) {
        setActiveId(nextPage.id);
      }
    };

    const onScroll = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateActiveIndex);
    };

    updateActiveIndex();
    element.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      element.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [filteredPages]);

  const sliderMin = yearRange?.min || activePage?.year || 1947;
  const sliderMax = yearRange?.max || sliderMin;

  return (
    <section className="hoover-lab-viewer" aria-label="Hoover Lab データ品質ビューア">
      <div className="hoover-lab-toolbar">
        <label className="hoover-lab-search">
          <span>検索</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Section、Serial、人物、組織、地名、用語で検索"
          />
        </label>

        <label className="hoover-lab-year-control">
          <div className="hoover-lab-year-control-head">
            <span>年代</span>
            <strong>{scrubYear}年</strong>
          </div>
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={1}
            value={scrubYear}
            onChange={(event) => handleYearChange(Number(event.target.value))}
            aria-label="年代を選ぶ"
          />
          <div className="hoover-lab-year-control-scale" aria-hidden="true">
            <span>{sliderMin}年</span>
            <span>{sliderMax}年</span>
          </div>
        </label>

        <div className="hoover-lab-meta-row" aria-label="サンプル統計">
          <span>
            {filteredPages.length} / {pages.length} ページ
          </span>
          <span>
            {activePage
              ? `選択中: ${activePage.sectionOrSerial} p.${activePage.pageNumber}`
              : "選択中: なし"}
          </span>
        </div>
      </div>

      <div className="hoover-lab-layout">
        <section className="hoover-lab-carousel-shell" aria-label="ページカルーセル">
          <div className="hoover-lab-carousel-header">
            <p className="hoover-lab-carousel-hint">横にスワイプしてページを選べます。</p>
            <div className="hoover-lab-carousel-buttons" aria-label="カルーセル操作">
              <button type="button" aria-label="前のページ" onClick={() => scrollCarousel(-1)}>
                ←
              </button>
              <button type="button" aria-label="次のページ" onClick={() => scrollCarousel(1)}>
                →
              </button>
            </div>
          </div>

          {filteredPages.length > 0 ? (
            <div
              className={`hoover-lab-carousel${carouselDragging ? " hoover-lab-carousel--dragging" : ""}`}
              ref={carouselRef}
              tabIndex={0}
              onPointerDown={startCarouselDrag}
              onPointerMove={moveCarouselDrag}
              onPointerUp={endCarouselDrag}
              onPointerCancel={endCarouselDrag}
            >
              {filteredPages.map((page, index) => {
                const isActive = activePage?.id === page.id;

                return (
                  <div
                    key={page.id}
                    className={`hoover-lab-carousel-item${
                      isActive ? " hoover-lab-carousel-item--active" : " hoover-lab-carousel-item--inactive"
                    }`}
                    ref={(element) => {
                      carouselItemRefs.current[index] = element;
                    }}
                  >
                    <button
                      type="button"
                      className="hoover-lab-page-card"
                      aria-pressed={openedPage?.id === page.id}
                      onClick={() => pickPage(page)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          pickPage(page);
                        }
                      }}
                    >
                      <div className="hoover-lab-card-top">
                        <span className="hoover-lab-card-kicker">{page.sectionOrSerial}</span>
                        <span className="hoover-lab-card-page">p.{page.pageNumber}</span>
                      </div>
                      <strong>{page.documentId}</strong>
                      <span className="hoover-lab-card-meta">
                        {formatHooverOptionalText(page.dateLabelJa)} / {formatHooverOptionalText(page.documentTypeJa)}
                      </span>
                      <p className="hoover-lab-card-summary">{page.summaryJa}</p>
                      <div className="hoover-lab-card-badges">
                        <span className={`hoover-lab-ocr hoover-lab-ocr--${page.ocrQuality}`}>
                          OCR {hooverOcrQualityLabels[page.ocrQuality]}
                        </span>
                        {page.strangenessScore !== undefined ? (
                          <ScoreChip
                            kind="strangeness"
                            score={page.strangenessScore}
                            label={page.strangenessLabelJa}
                          />
                        ) : null}
                        {page.reliabilityScore !== undefined ? (
                          <ScoreChip
                            kind="reliability"
                            score={page.reliabilityScore}
                            label={page.reliabilityLabelJa}
                          />
                        ) : null}
                      </div>
                      <div className="hoover-lab-card-flags">
                        {page.warningFlags.map((flag) => (
                          <span key={flag}>{flag}</span>
                        ))}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="hoover-lab-empty">
              <h2>該当ページがありません</h2>
              <p>検索語を変えるか、年代スライダーを戻してサンプル全体を確認してください。</p>
            </div>
          )}
        </section>

        {openedPage ? (
          <article className="hoover-lab-detail" ref={detailRef}>
            <header className="hoover-lab-detail-header">
              <p>{openedPage.documentId}</p>
              <h2>
                {openedPage.sectionOrSerial} <span>p.{openedPage.pageNumber}</span>
              </h2>
              <div className="hoover-lab-detail-header-row">
                <span>{formatHooverOptionalText(openedPage.dateLabelJa)}</span>
                <span>{formatHooverOptionalText(openedPage.documentTypeJa)}</span>
                <span>OCR {hooverOcrQualityLabels[openedPage.ocrQuality]}</span>
              </div>
            </header>

            {openedPage.classificationCautionJa ? (
              <aside className="hoover-lab-caution">
                <strong>注意</strong>
                <p>{openedPage.classificationCautionJa}</p>
              </aside>
            ) : null}

            <dl className="hoover-lab-facts">
              <MetadataRow label="資料名 / Section / Serial" value={openedPage.sectionOrSerial} />
              <MetadataRow label="ページ番号" value={openedPage.pageNumber} />
              <MetadataRow label="年代" value={formatHooverOptionalYear(openedPage.year)} />
              <MetadataRow label="文書種別" value={formatHooverOptionalText(openedPage.documentTypeJa)} />
              <MetadataRow label="資料番号" value={openedPage.documentId} />
              <MetadataRow label="OCR品質" value={hooverOcrQualityLabels[openedPage.ocrQuality]} />
            </dl>

            <DetailSection title="注意フラグ">
              <TagList items={openedPage.warningFlags} />
            </DetailSection>

            <DetailSection title="日本語要約" tone="paper">
              <p>{openedPage.summaryJa}</p>
            </DetailSection>

            <DetailSection title="本文のポイント">
              <ul className="hoover-lab-points">
                {openedPage.pointsJa.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection title="日本語全文訳" tone="paper">
              <p>{openedPage.translationJa}</p>
            </DetailSection>

            <DetailSection title="英語転写テキスト" tone="transcript">
              <p>{openedPage.textEn}</p>
            </DetailSection>

            <DetailSection title="メタデータ">
              <dl className="hoover-lab-metadata">
                <MetadataRow label="ID" value={openedPage.id} />
                <MetadataRow label="Source" value={openedPage.source} />
                <MetadataRow label="Document ID" value={openedPage.documentId} />
                <MetadataRow label="Section / Serial" value={openedPage.sectionOrSerial} />
                <MetadataRow label="Year" value={formatHooverOptionalYear(openedPage.year)} />
                <MetadataRow label="日本語キーワード" value={joinOrFallback(openedPage.keywordsJa)} />
                <MetadataRow label="英語キーワード" value={joinOrFallback(openedPage.keywordsEn)} />
                <MetadataRow label="トピック" value={joinOrFallback(openedPage.topicsJa)} />
                <MetadataRow label="人物" value={joinOrFallback(openedPage.people)} />
                <MetadataRow label="組織" value={joinOrFallback(openedPage.organizations)} />
                <MetadataRow label="地名" value={joinOrFallback(openedPage.places)} />
              </dl>
            </DetailSection>

            {(openedPage.sightingFeatures?.length ||
              openedPage.strangenessScore !== undefined ||
              openedPage.reliabilityScore !== undefined ||
              openedPage.strangenessReasonsJa?.length ||
              openedPage.reliabilityReasonsJa?.length) ? (
              <div className="hoover-lab-judgement">
                {openedPage.sightingFeatures?.length ? (
                  <section className="hoover-lab-judgement-panel">
                    <h3>判断材料</h3>
                    <TagList items={openedPage.sightingFeatures} />
                  </section>
                ) : null}
                <ScoreBlock kind="strangeness" page={openedPage} />
                <ScoreBlock kind="reliability" page={openedPage} />
              </div>
            ) : null}

            <DetailSection title="確認リンク">
              <div className="hoover-lab-links">
                <a href={openedPage.sourcePdfUrl} target="_blank" rel="noreferrer">
                  元PDFを開く
                </a>
                <a href={openedPage.sourcePdfPageUrl} target="_blank" rel="noreferrer">
                  該当ページを開く
                </a>
              </div>
            </DetailSection>
          </article>
        ) : null}
      </div>
    </section>
  );
}
