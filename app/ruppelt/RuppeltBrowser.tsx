"use client";

import { useEffect, useMemo, useReducer, useRef, useState, type PointerEvent } from "react";
import {
  priorDisclosureLabels,
  priorDisclosureStatusOptions,
  sortRecords,
  uniqueValues,
  type PriorDisclosureStatus,
  type PursueIndex,
  type PursueRecord,
  type PursueSort,
} from "@/lib/pursue";
import { DocumentDetailPanel } from "./browser/DocumentDetailPanel";
import { PriorDisclosurePanel } from "./browser/PriorDisclosurePanel";
import { RecordCard } from "./browser/RecordCard";
import {
  isInteractiveElement,
  readParam,
  readSavedIds,
  readViewMode,
  syncQuery,
  writeSavedIds,
  writeViewMode,
} from "./browser/helpers";
import {
  initialSearchState,
  matchesRecord,
  normalizePriorDisclosureFilter,
  normalizeSearchMode,
  searchReducer,
} from "./browser/search";
import type {
  DetailTab,
  PriorDisclosureFilter,
  RuppeltFulltextMatch,
  RuppeltViewMode,
} from "./browser/types";

type RuppeltBrowserProps = {
  index: PursueIndex;
  fullTextRecordIds: string[];
};

export function RuppeltBrowser({ index, fullTextRecordIds }: RuppeltBrowserProps) {
  const [searchState, dispatchSearch] = useReducer(searchReducer, initialSearchState);
  const [release, setRelease] = useState("");
  const [agency, setAgency] = useState("");
  const [type, setType] = useState("");
  const [priorDisclosureStatus, setPriorDisclosureStatus] = useState<PriorDisclosureFilter>("");
  const [sort, setSort] = useState<PursueSort>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<RuppeltViewMode>("carousel");
  const [selectedDisclosureRecord, setSelectedDisclosureRecord] = useState<PursueRecord | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<{ record: PursueRecord; initialTab: DetailTab } | null>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [carouselDragging, setCarouselDragging] = useState(false);
  const [carouselScrolling, setCarouselScrolling] = useState(false);
  const [searchHydrated, setSearchHydrated] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const carouselItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const carouselScrollFrameRef = useRef(0);
  const carouselScrollTimeoutRef = useRef(0);
  const stableVisibleRecordsRef = useRef<PursueRecord[]>([]);
  const searchComposingRef = useRef(false);
  const searchHydratedRef = useRef(false);
  const carouselDragRef = useRef({
    active: false,
    moved: false,
    pointerId: 0,
    scrollLeft: 0,
    startX: 0,
  });
  const {
    committedQuery: query,
    draftQuery,
    fulltextError,
    fulltextMatches,
    fulltextMatchesQuery,
    fulltextStatus,
    searchMode,
  } = searchState;
  const fulltextLoading = fulltextStatus === "loading";

  useEffect(() => {
    const initialQuery = readParam("q");

    dispatchSearch({
      type: "hydrate",
      query: initialQuery,
      searchMode: normalizeSearchMode(readParam("searchMode")),
    });
    setRelease(readParam("release"));
    setAgency(readParam("agency"));
    setType(readParam("type"));
    setPriorDisclosureStatus(normalizePriorDisclosureFilter(readParam("status")));
    setSort((readParam("sort") as PursueSort) || "newest");
    setSavedIds(readSavedIds());
    setViewMode(readViewMode());
    window.requestAnimationFrame(() => {
      searchHydratedRef.current = true;
      setSearchHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!searchHydratedRef.current) {
      return;
    }

    syncQuery({
      q: query,
      searchMode: searchMode === "fulltext" ? searchMode : "",
      release,
      agency,
      type,
      status: priorDisclosureStatus,
      sort,
    });
  }, [agency, priorDisclosureStatus, query, release, searchMode, sort, type]);

  const fullTextRecordIdSet = useMemo(() => new Set(fullTextRecordIds), [fullTextRecordIds]);

  useEffect(() => {
    if (searchMode !== "fulltext" || !query.trim()) {
      return;
    }

    const controller = new AbortController();
    const requestQuery = query.trim();

    dispatchSearch({ type: "fulltextStart", query: requestQuery });

    fetch(`/api/ruppelt/fulltext-search?q=${encodeURIComponent(requestQuery)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("全文検索を読み込めませんでした。");
        }

        return response.json() as Promise<{ matches: RuppeltFulltextMatch[] }>;
      })
      .then((data) => {
        dispatchSearch({
          type: "fulltextSuccess",
          query: requestQuery,
          matches: data.matches || [],
        });
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) {
          return;
        }

        dispatchSearch({
          type: "fulltextError",
          query: requestQuery,
          error: error.message,
        });
      });

    return () => controller.abort();
  }, [query, searchMode]);

  const releases = useMemo(() => uniqueValues(index.records, (record) => record.source.release), [index.records]);
  const agencies = useMemo(() => uniqueValues(index.records, (record) => record.source.agency), [index.records]);
  const types = useMemo(() => uniqueValues(index.records, (record) => record.source.documentType), [index.records]);
  const priorDisclosureCounts = useMemo(() => {
    return index.records.reduce<Record<PriorDisclosureStatus, number>>(
      (counts, record) => {
        if (record.priorDisclosure) {
          counts[record.priorDisclosure.status] += 1;
        }

        return counts;
      },
      {
        first_time_public: 0,
        previously_public: 0,
        partial: 0,
        known_case_new_file: 0,
        unknown: 0,
      },
    );
  }, [index.records]);
  const unreviewedCount = useMemo(
    () => index.records.filter((record) => !record.priorDisclosure).length,
    [index.records],
  );
  const hasActiveFilters = Boolean(query || release || agency || type || priorDisclosureStatus || showSavedOnly);
  const normalizedQuery = query.trim();
  const fulltextResultPending =
    searchMode === "fulltext" &&
    Boolean(normalizedQuery) &&
    (fulltextLoading || fulltextMatchesQuery !== normalizedQuery);
  const fulltextMatchById = useMemo(() => {
    if (fulltextMatchesQuery !== normalizedQuery) {
      return new Map<string, RuppeltFulltextMatch>();
    }

    return new Map(fulltextMatches.map((match) => [match.recordId, match]));
  }, [fulltextMatches, fulltextMatchesQuery, normalizedQuery]);
  const sortLabel = {
    newest: "新しい順",
    oldest: "古い順",
    title: "資料名順",
    agency: "機関順",
  }[sort];
  const activeFilterChips = [
    `公開日: ${release || "すべて"}`,
    `機関: ${agency || "すべて"}`,
    `種別: ${type || "すべて"}`,
    `公開状況: ${
      priorDisclosureStatus === "unreviewed"
        ? "未判定"
        : priorDisclosureStatus
          ? priorDisclosureLabels[priorDisclosureStatus]
          : "すべて"
    }`,
    sortLabel,
  ];
  const searchExamples = ["Roswell", "日本"];
  const visibleRecords = useMemo(() => {
    const fulltextMatchedIds =
      fulltextMatchesQuery === query.trim()
        ? new Set(fulltextMatches.map((match) => match.recordId))
        : new Set<string>();
    const filtered = index.records.filter((record) => {
      const filterOnlyMatch = matchesRecord(record, "", release, agency, type, priorDisclosureStatus);

      if (!filterOnlyMatch) {
        return false;
      }

      if (searchMode !== "fulltext") {
        return matchesRecord(record, query, release, agency, type, priorDisclosureStatus);
      }

      if (!query.trim()) {
        return true;
      }

      if (fulltextResultPending) {
        return false;
      }

      return (
        matchesRecord(record, query, release, agency, type, priorDisclosureStatus) ||
        fulltextMatchedIds.has(record.source.id)
      );
    });
    const savedFiltered = showSavedOnly ? filtered.filter((record) => savedIds.includes(record.source.id)) : filtered;
    return sortRecords(savedFiltered, sort);
  }, [
    agency,
    fulltextMatches,
    fulltextMatchesQuery,
    fulltextResultPending,
    index.records,
    priorDisclosureStatus,
    query,
    release,
    savedIds,
    searchMode,
    showSavedOnly,
    sort,
    type,
  ]);

  function toggleSaved(id: string) {
    const next = savedIds.includes(id) ? savedIds.filter((savedId) => savedId !== id) : [...savedIds, id];
    setSavedIds(next);
    writeSavedIds(next);
  }

  function applySearch() {
    dispatchSearch({ type: "commitSearch" });
  }

  function clearSearch() {
    dispatchSearch({ type: "clearSearch" });
  }

  function applyExampleSearch(example: string) {
    dispatchSearch({ type: "applyExampleSearch", query: example });
  }

  function openDetail(record: PursueRecord, initialTab: DetailTab = "info") {
    setSelectedDetail({ record, initialTab });
  }

  function resetFilters() {
    dispatchSearch({ type: "clearSearch" });
    dispatchSearch({ type: "changeSearchMode", searchMode: "description" });
    setRelease("");
    setAgency("");
    setType("");
    setPriorDisclosureStatus("");
    setSort("newest");
    setShowSavedOnly(false);
    setFiltersOpen(false);
  }

  function changeViewMode(mode: RuppeltViewMode) {
    setViewMode(mode);
    writeViewMode(mode);
  }

  function scrollCarousel(direction: -1 | 1) {
    const element = carouselRef.current;

    if (!element) {
      return;
    }

    const activeItem = carouselItemRefs.current[activeCarouselIndex];
    const distance = activeItem?.getBoundingClientRect().width || element.clientWidth * 0.8;

    element.scrollBy({
      left: distance * direction,
      behavior: "smooth",
    });
  }

  function startCarouselDrag(event: PointerEvent<HTMLDivElement>) {
    if (isInteractiveElement(event.target)) {
      return;
    }

    if (event.pointerType === "touch" || event.button !== 0) {
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

  const hasPendingSearch = draftQuery.trim() !== query;
  if (!fulltextResultPending) {
    stableVisibleRecordsRef.current = visibleRecords;
  }

  const displayedRecords = fulltextResultPending ? stableVisibleRecordsRef.current : visibleRecords;
  const resultCountLabel = !searchHydrated
    ? "検索準備中..."
    : hasPendingSearch
      ? "検索語は未反映です"
    : fulltextResultPending
      ? "日本語全文訳を検索中..."
      : `${displayedRecords.length} 件`;

  useEffect(() => {
    if (viewMode !== "carousel") {
      return;
    }

    if (activeCarouselIndex >= displayedRecords.length) {
      setActiveCarouselIndex(0);
    }

    const element = carouselRef.current;
    if (!element) {
      return;
    }

    const updateActiveIndex = () => {
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

      setActiveCarouselIndex(closestIndex);
      setCarouselScrolling(false);
    };

    const onScroll = () => {
      setCarouselScrolling(true);

      if (carouselScrollFrameRef.current) {
        window.cancelAnimationFrame(carouselScrollFrameRef.current);
        carouselScrollFrameRef.current = 0;
      }

      if (carouselScrollTimeoutRef.current) {
        window.clearTimeout(carouselScrollTimeoutRef.current);
      }

      carouselScrollTimeoutRef.current = window.setTimeout(() => {
        carouselScrollFrameRef.current = window.requestAnimationFrame(() => {
          carouselScrollFrameRef.current = 0;
          updateActiveIndex();
        });
      }, 120);
    };

    updateActiveIndex();
    element.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      element.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (carouselScrollFrameRef.current) {
        window.cancelAnimationFrame(carouselScrollFrameRef.current);
        carouselScrollFrameRef.current = 0;
      }
      if (carouselScrollTimeoutRef.current) {
        window.clearTimeout(carouselScrollTimeoutRef.current);
        carouselScrollTimeoutRef.current = 0;
      }
    };
  }, [displayedRecords.length, viewMode]);

  useEffect(() => {
    if (viewMode !== "carousel") {
      return;
    }

    const element = carouselRef.current;

    setActiveCarouselIndex(0);

    if (!element) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      element.scrollTo({ left: 0, behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [agency, priorDisclosureStatus, query, release, showSavedOnly, type, viewMode]);

  return (
    <section className="ruppelt-browser" aria-label="PURSUEレコード">
      <div className="ruppelt-controls">
        <form
          className="ruppelt-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label>
            <span>検索</span>
            <input
              type="search"
              value={draftQuery}
              onChange={(event) => dispatchSearch({ type: "editQuery", query: event.target.value })}
              onCompositionStart={() => {
                searchComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                searchComposingRef.current = false;
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.nativeEvent.isComposing || searchComposingRef.current)) {
                  event.preventDefault();
                  return;
                }

                if (event.key === "Enter") {
                  event.preventDefault();
                  applySearch();
                }
              }}
              placeholder={searchMode === "fulltext" ? "日本語全文・英語OCRを検索" : "資料名、機関、場所、説明を検索"}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="search"
            />
          </label>
          <div className="ruppelt-search-actions">
            <button type="button" onClick={applySearch}>
              検索
            </button>
            {draftQuery || query ? (
              <button type="button" onClick={clearSearch}>
                クリア
              </button>
            ) : null}
          </div>
        </form>
        <div className="ruppelt-search-examples" aria-label="検索例">
          <span>検索例</span>
          {searchExamples.map((example) => (
            <button key={example} type="button" onClick={() => applyExampleSearch(example)}>
              {example}
            </button>
          ))}
        </div>
        <p className="ruppelt-search-note" aria-live="polite">
          {query || hasPendingSearch ? (
            <>
              {query ? `検索中: ${query}` : "検索条件なし"}
              {hasPendingSearch ? " / 未反映" : ""}
            </>
          ) : (
            " "
          )}
        </p>
        <div className="ruppelt-search-mode" role="group" aria-label="検索対象">
          <button
            type="button"
            aria-pressed={searchMode === "description"}
            onClick={() => dispatchSearch({ type: "changeSearchMode", searchMode: "description" })}
          >
            日本語資料説明
          </button>
          <button
            type="button"
            aria-pressed={searchMode === "fulltext"}
            onClick={() => dispatchSearch({ type: "changeSearchMode", searchMode: "fulltext" })}
          >
            日本語全文訳
          </button>
        </div>
        <p className="ruppelt-search-note" aria-live="polite">
          {searchMode === "fulltext" ? (
            <>
              {query
                ? "日本語全文訳と資料説明をまとめて検索しています"
                : "日本語全文訳検索は検索語を入力してください"}
              {fulltextLoading ? " / 検索中" : ""}
              {fulltextError ? ` / ${fulltextError}` : ""}
            </>
          ) : (
            " "
          )}
        </p>

        <div className="ruppelt-filter-summary">
          <button
            type="button"
            className="ruppelt-filter-toggle"
            aria-expanded={filtersOpen}
            aria-controls="ruppelt-filter-panel"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            絞り込み
          </button>
          <div className="ruppelt-filter-chips" aria-label="現在の絞り込み条件">
            {activeFilterChips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        </div>

        <div
          id="ruppelt-filter-panel"
          className={`ruppelt-filter-row${filtersOpen ? " ruppelt-filter-row--open" : ""}`}
        >
          <label className="ruppelt-filter-field">
            <span>公開日</span>
            <select value={release} onChange={(event) => setRelease(event.target.value)} aria-label="公開日">
              <option value="">すべての公開日</option>
              {releases.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="ruppelt-filter-field">
            <span>機関</span>
            <select value={agency} onChange={(event) => setAgency(event.target.value)} aria-label="機関">
              <option value="">すべての機関</option>
              {agencies.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="ruppelt-filter-field">
            <span>資料種別</span>
            <select value={type} onChange={(event) => setType(event.target.value)} aria-label="資料種別">
              <option value="">すべての資料種別</option>
              {types.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="ruppelt-filter-field">
            <span>公開状況</span>
            <select
              value={priorDisclosureStatus}
              onChange={(event) => setPriorDisclosureStatus(normalizePriorDisclosureFilter(event.target.value))}
              aria-label="公開状況"
            >
              <option value="">すべての公開状況</option>
              <option value="unreviewed" disabled={unreviewedCount === 0}>
                未判定（{unreviewedCount}）
              </option>
              {priorDisclosureStatusOptions.map((value) => (
                <option key={value} value={value} disabled={priorDisclosureCounts[value] === 0}>
                  {priorDisclosureLabels[value]}（{priorDisclosureCounts[value]}）
                </option>
              ))}
            </select>
          </label>
          <label className="ruppelt-filter-field">
            <span>並び順</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as PursueSort)} aria-label="並び順">
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="title">資料名順</option>
              <option value="agency">機関順</option>
            </select>
          </label>
        </div>
      </div>

      <div className="ruppelt-result-bar">
        <span>{resultCountLabel}</span>
        <div className="ruppelt-result-actions">
          <div className="ruppelt-view-toggle" role="tablist" aria-label="表示切り替え">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "carousel"}
              aria-pressed={viewMode === "carousel"}
              onClick={() => changeViewMode("carousel")}
            >
              カルーセル
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "list"}
              aria-pressed={viewMode === "list"}
              onClick={() => changeViewMode("list")}
            >
              一覧
            </button>
          </div>
          <button type="button" aria-pressed={showSavedOnly} onClick={() => setShowSavedOnly(!showSavedOnly)}>
            ⭐️を確認
          </button>
          <button type="button" onClick={resetFilters}>
            リセット
          </button>
        </div>
      </div>

      {displayedRecords.length === 0 ? (
        <div className="ruppelt-empty">
          <p className="eyebrow">No records</p>
          <h2>表示できる資料がありません</h2>
          <p>
            {hasActiveFilters
              ? "いまの絞り込み条件では一致がありません。Release や Agency を All に戻すと見つかる場合があります。"
              : "静的JSONにPURSUEレコードを追加してください。"}
          </p>
        </div>
      ) : (
        <>
          {viewMode === "carousel" ? (
            <div className="ruppelt-carousel-shell" aria-label="カルーセル表示">
              <div className="ruppelt-carousel-header">
                <p className="ruppelt-carousel-hint">横にスワイプして資料を選べます。</p>
                <div className="ruppelt-carousel-buttons" aria-label="カルーセル操作">
                  <button type="button" aria-label="前の資料" onClick={() => scrollCarousel(-1)}>
                    ←
                  </button>
                  <button type="button" aria-label="次の資料" onClick={() => scrollCarousel(1)}>
                    →
                  </button>
                </div>
              </div>
              <div
                className={`ruppelt-carousel${carouselDragging ? " ruppelt-carousel--dragging" : ""}${
                  carouselScrolling ? " ruppelt-carousel--scrolling" : ""
                }`}
                ref={carouselRef}
                tabIndex={0}
                onPointerDown={startCarouselDrag}
                onPointerMove={moveCarouselDrag}
                onPointerUp={endCarouselDrag}
                onPointerCancel={endCarouselDrag}
                onClickCapture={(event) => {
                  if (isInteractiveElement(event.target)) {
                    carouselDragRef.current.moved = false;
                    return;
                  }

                  if (carouselDragRef.current.moved) {
                    event.preventDefault();
                    event.stopPropagation();
                    carouselDragRef.current.moved = false;
                  }
                }}
              >
                {displayedRecords.map((record, itemIndex) => (
                  <div
                    key={record.source.id}
                    className={`ruppelt-carousel-item${
                      itemIndex === activeCarouselIndex
                        ? " ruppelt-carousel-item--active"
                        : " ruppelt-carousel-item--inactive"
                    }`}
                    ref={(element) => {
                      carouselItemRefs.current[itemIndex] = element;
                    }}
                  >
                    <RecordCard
                      record={record}
                      saved={savedIds.includes(record.source.id)}
                      hasFullText={fullTextRecordIdSet.has(record.source.id)}
                      fulltextSnippet={fulltextMatchById.get(record.source.id)?.snippet}
                      highlightQuery={query}
                      onToggleSaved={toggleSaved}
                      onOpenDetail={openDetail}
                      onOpenPriorDisclosure={setSelectedDisclosureRecord}
                      variant="carousel"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="ruppelt-card-grid ruppelt-card-grid--list" aria-label="一覧表示">
              {displayedRecords.map((record) => (
                <RecordCard
                  key={record.source.id}
                  record={record}
                  saved={savedIds.includes(record.source.id)}
                  hasFullText={fullTextRecordIdSet.has(record.source.id)}
                  fulltextSnippet={fulltextMatchById.get(record.source.id)?.snippet}
                  highlightQuery={query}
                  onToggleSaved={toggleSaved}
                  onOpenDetail={openDetail}
                  onOpenPriorDisclosure={setSelectedDisclosureRecord}
                  variant="list"
                />
              ))}
            </div>
          )}
        </>
      )}
      {selectedDisclosureRecord ? (
        <PriorDisclosurePanel
          record={selectedDisclosureRecord}
          onClose={() => setSelectedDisclosureRecord(null)}
        />
      ) : null}
      {selectedDetail ? (
        <DocumentDetailPanel
          record={selectedDetail.record}
          initialTab={selectedDetail.initialTab}
          highlightQuery={query}
          onClose={() => setSelectedDetail(null)}
        />
      ) : null}
    </section>
  );
}
