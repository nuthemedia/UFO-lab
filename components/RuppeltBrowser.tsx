"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getAgency,
  getDescriptionByLanguage,
  getDocumentType,
  getLocation,
  getJapaneseTitle,
  getRelease,
  getSearchText,
  getTitle,
  getVideoEmbedUrl,
  getVideoUrl,
  sortRecords,
  uniqueValues,
  type PursueIndex,
  type PursueRecord,
  type PursueSort,
} from "@/lib/pursue";

type RuppeltBrowserProps = {
  index: PursueIndex;
};

const storageKey = "ruppelt.savedRecordIds";
const viewModeStorageKey = "ruppelt.viewMode";

type RuppeltViewMode = "carousel" | "list";
type CardLanguage = "ja" | "en";

function readParam(name: string) {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get(name) || "";
}

function syncQuery(params: Record<string, string>) {
  const next = new URLSearchParams(window.location.search);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
  });

  const search = next.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
}

function readSavedIds() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || "[]") as string[];
  } catch {
    return [];
  }
}

function writeSavedIds(ids: string[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(ids));
}

function readViewMode() {
  try {
    const value = window.localStorage.getItem(viewModeStorageKey);
    return value === "list" ? "list" : "carousel";
  } catch {
    return "carousel";
  }
}

function writeViewMode(mode: RuppeltViewMode) {
  window.localStorage.setItem(viewModeStorageKey, mode);
}

function matchesRecord(record: PursueRecord, query: string, release: string, agency: string, type: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery && !getSearchText(record).includes(normalizedQuery)) {
    return false;
  }

  if (release && record.source.release !== release) {
    return false;
  }

  if (agency && record.source.agency !== agency) {
    return false;
  }

  if (type && record.source.documentType !== type) {
    return false;
  }

  return true;
}

function RecordCard({
  record,
  saved,
  onToggleSaved,
  variant = "list",
}: {
  record: PursueRecord;
  saved: boolean;
  onToggleSaved: (id: string) => void;
  variant?: RuppeltViewMode;
}) {
  const [language, setLanguage] = useState<CardLanguage>("ja");
  const [thumbnailBroken, setThumbnailBroken] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const saveLabel = saved ? "後で見るを解除" : "後で見るに追加";
  const links = [
    ["PDF", record.source.downloadUrl],
    ["画像", record.source.imageUrl],
    ["動画", getVideoUrl(record)],
  ].filter(([, url]) => url);
  const hasThumbnail = Boolean(record.source.imageUrl) && !thumbnailBroken;
  const videoEmbedUrl = getVideoEmbedUrl(record);
  const hasVideoPreview = Boolean(videoEmbedUrl) && !hasThumbnail;
  const description = getDescriptionByLanguage(record, language);
  const japaneseTitle = getJapaneseTitle(record);

  return (
    <article className={`ruppelt-card ruppelt-card--${variant}`}>
      <div className="ruppelt-card-topbar">
        <div className="ruppelt-language-switch" role="group" aria-label="表示言語">
          <button
            type="button"
            aria-pressed={language === "ja"}
            onClick={() => setLanguage("ja")}
          >
            日本語
          </button>
          <button
            type="button"
            aria-pressed={language === "en"}
            onClick={() => setLanguage("en")}
          >
            English
          </button>
        </div>
      </div>
      <button
        type="button"
        className={`ruppelt-card-save ruppelt-card-save--${variant}`}
        aria-pressed={saved}
        aria-label={saveLabel}
        title={saveLabel}
        onClick={() => onToggleSaved(record.source.id)}
      >
        <span aria-hidden="true">{saved ? "★" : "☆"}</span>
      </button>
      <div className="ruppelt-card-meta">
        <span>{getRelease(record)}</span>
        <span>{getDocumentType(record)}</span>
      </div>
      <h2>{getTitle(record)}</h2>
      {language === "ja" ? <p className="ruppelt-card-title-ja">{japaneseTitle}</p> : null}
      <div className={`ruppelt-card-thumbnail${hasVideoPreview ? " ruppelt-card-thumbnail--video" : ""}`} aria-hidden={!hasThumbnail && !hasVideoPreview}>
        {hasThumbnail ? (
          <img
            src={record.source.imageUrl}
            alt={getTitle(record)}
            loading="lazy"
            onError={() => setThumbnailBroken(true)}
          />
        ) : hasVideoPreview ? (
          <iframe
            src={videoEmbedUrl}
            title={`${getTitle(record)} 動画プレビュー`}
            loading="lazy"
            allow="fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="ruppelt-card-thumbnail-fallback">
            <span>Preview not available</span>
          </div>
        )}
      </div>
      <div className="ruppelt-card-description-block">
        <p className={`ruppelt-card-description${descriptionExpanded ? " ruppelt-card-description--expanded" : ""}`}>
          {description}
        </p>
        <button
          type="button"
          className="ruppelt-description-toggle"
          aria-expanded={descriptionExpanded}
          onClick={() => setDescriptionExpanded(!descriptionExpanded)}
        >
          {descriptionExpanded ? "閉じる" : "続きを読む"}
        </button>
      </div>
      <dl>
        <div>
          <dt>Agency</dt>
          <dd>{getAgency(record)}</dd>
        </div>
        <div>
          <dt>Incident Date</dt>
          <dd>{record.source.incidentDate || "不明"}</dd>
        </div>
        <div>
          <dt>Incident Location</dt>
          <dd>{getLocation(record)}</dd>
        </div>
      </dl>
      <div className="ruppelt-card-actions">
        {links.map(([label, url]) => (
          <a key={label} href={url} target="_blank" rel="noreferrer">
            {label}
          </a>
        ))}
      </div>
    </article>
  );
}

export function RuppeltBrowser({ index }: RuppeltBrowserProps) {
  const [query, setQuery] = useState("");
  const [release, setRelease] = useState("");
  const [agency, setAgency] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState<PursueSort>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<RuppeltViewMode>("carousel");
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const carouselItemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    setQuery(readParam("q"));
    setRelease(readParam("release"));
    setAgency(readParam("agency"));
    setType(readParam("type"));
    setSort((readParam("sort") as PursueSort) || "newest");
    setSavedIds(readSavedIds());
    setViewMode(readViewMode());
  }, []);

  useEffect(() => {
    syncQuery({ q: query, release, agency, type, sort });
  }, [agency, query, release, sort, type]);

  const releases = useMemo(() => uniqueValues(index.records, (record) => record.source.release), [index.records]);
  const agencies = useMemo(() => uniqueValues(index.records, (record) => record.source.agency), [index.records]);
  const types = useMemo(() => uniqueValues(index.records, (record) => record.source.documentType), [index.records]);
  const hasActiveFilters = Boolean(query || release || agency || type || showSavedOnly);
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
    sortLabel,
  ];
  const visibleRecords = useMemo(() => {
    const filtered = index.records.filter((record) => matchesRecord(record, query, release, agency, type));
    const savedFiltered = showSavedOnly ? filtered.filter((record) => savedIds.includes(record.source.id)) : filtered;
    return sortRecords(savedFiltered, sort);
  }, [agency, index.records, query, release, savedIds, showSavedOnly, sort, type]);

  function toggleSaved(id: string) {
    const next = savedIds.includes(id) ? savedIds.filter((savedId) => savedId !== id) : [...savedIds, id];
    setSavedIds(next);
    writeSavedIds(next);
  }

  function resetFilters() {
    setQuery("");
    setRelease("");
    setAgency("");
    setType("");
    setSort("newest");
    setShowSavedOnly(false);
    setFiltersOpen(false);
  }

  function changeViewMode(mode: RuppeltViewMode) {
    setViewMode(mode);
    writeViewMode(mode);
  }

  useEffect(() => {
    if (viewMode !== "carousel") {
      return;
    }

    if (activeCarouselIndex >= visibleRecords.length) {
      setActiveCarouselIndex(0);
    }

    const element = carouselRef.current;
    if (!element) {
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

      setActiveCarouselIndex(closestIndex);
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
  }, [viewMode, visibleRecords.length]);

  return (
    <section className="ruppelt-browser" aria-label="PURSUEレコード">
      <div className="ruppelt-controls">
        <label className="ruppelt-search">
          <span>検索</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="資料名、機関、場所、説明を検索"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
          />
        </label>

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
        <span>{visibleRecords.length} 件</span>
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

      {visibleRecords.length === 0 ? (
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
              <p className="ruppelt-carousel-hint">横にスワイプして資料を選べます。</p>
              <div className="ruppelt-carousel" ref={carouselRef} tabIndex={0}>
                {visibleRecords.map((record, itemIndex) => (
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
                      onToggleSaved={toggleSaved}
                      variant="carousel"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="ruppelt-card-grid ruppelt-card-grid--list" aria-label="一覧表示">
              {visibleRecords.map((record) => (
                <RecordCard
                  key={record.source.id}
                  record={record}
                  saved={savedIds.includes(record.source.id)}
                  onToggleSaved={toggleSaved}
                  variant="list"
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
