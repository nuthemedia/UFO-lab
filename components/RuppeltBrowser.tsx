"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  getAgency,
  getDescriptionByLanguage,
  getDocumentType,
  hasPriorDisclosureData,
  getLocation,
  getPriorDisclosure,
  getJapaneseTitle,
  getRelease,
  getSearchFacets,
  getSearchText,
  getDocumentId,
  getTitle,
  getVideoEmbedUrl,
  getVideoUrl,
  priorDisclosureConfidenceLabels,
  priorDisclosureLabels,
  priorDisclosureStatusOptions,
  sortRecords,
  uniqueValues,
  type PriorDisclosureAttributionSource,
  type PriorDisclosureStatus,
  type PursueDescriptionSearchEntry,
  type PursueFulltextSearchEntry,
  type PursueIndex,
  type PursueRecord,
  type PursueSearchMode,
  type PursueSharedDocumentBundle,
  type PursueSort,
} from "@/lib/pursue";

type RuppeltBrowserProps = {
  index: PursueIndex;
  descriptionSearchIndex: PursueDescriptionSearchEntry[];
};

type RuppeltSharedDataResponse = {
  sharedDocuments: Record<string, PursueSharedDocumentBundle>;
  fulltextSearchIndex: PursueFulltextSearchEntry[];
};

const storageKey = "ruppelt.savedRecordIds";
const viewModeStorageKey = "ruppelt.viewMode";

type RuppeltViewMode = "carousel" | "list";
type CardLanguage = "ja" | "en";
type PriorDisclosureFilter = PriorDisclosureStatus | "unreviewed" | "";
type DetailTab = "overview" | "summary" | "fulltext" | "metadata" | "source";

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

function normalizePriorDisclosureFilter(value: string): PriorDisclosureFilter {
  if (value === "unreviewed") {
    return "unreviewed";
  }

  return priorDisclosureStatusOptions.includes(value as PriorDisclosureStatus)
    ? (value as PriorDisclosureStatus)
    : "";
}

function normalizeSearchMode(value: string): PursueSearchMode {
  return value === "fulltext" ? "fulltext" : "description";
}

function matchesRecord(
  record: PursueRecord,
  query: string,
  release: string,
  agency: string,
  type: string,
  priorDisclosureStatus: PriorDisclosureFilter,
  searchMode: PursueSearchMode,
  descriptionSearchByRecordId: Map<string, string>,
  fulltextSearchByRecordId: Map<string, string>,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery) {
    const searchText =
      searchMode === "fulltext"
        ? fulltextSearchByRecordId.get(record.source.id) || ""
        : descriptionSearchByRecordId.get(record.source.id) || getSearchText(record);

    if (!searchText.includes(normalizedQuery)) {
      return false;
    }
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

  if (priorDisclosureStatus === "unreviewed") {
    return !record.priorDisclosure;
  }

  if (priorDisclosureStatus && !record.priorDisclosure) {
    return false;
  }

  if (priorDisclosureStatus && getSearchFacets(record).priorDisclosureStatus !== priorDisclosureStatus) {
    return false;
  }

  return true;
}

const statusStateLabels = {
  missing: "なし",
  ocr_imported_unverified: "OCR取得済み・未確認",
  ocr_verified: "OCR確認済み",
  machine_translation: "機械翻訳",
  translation_reviewed: "翻訳レビュー済み",
  summary_generated: "要約生成済み",
  summary_reviewed: "要約レビュー済み",
};

const ocrQualityLabels = {
  none: "OCRなし",
  low: "低",
  medium: "中",
  high: "高",
  unknown: "不明",
};

function getAttributionLabel(source: PriorDisclosureAttributionSource) {
  const labels: Record<PriorDisclosureAttributionSource, string> = {
    they_are_here: "they-are-here.com",
    ruppelt: "Ruppelt",
    nara: "NARA",
    fbi_vault: "FBI Vault",
    nasa: "NASA",
    aaro: "AARO",
    cia_crest: "CIA Reading Room / CREST",
    black_vault: "The Black Vault",
    internet_archive: "Internet Archive",
    wikimedia_commons: "Wikimedia Commons",
    dvids: "DVIDS",
    news: "報道",
    research_site: "研究者サイト",
  };

  return labels[source];
}

function PriorDisclosurePanel({
  record,
  onClose,
}: {
  record: PursueRecord;
  onClose: () => void;
}) {
  const priorDisclosure = getPriorDisclosure(record);
  const disclosureLabel = hasPriorDisclosureData(record) ? priorDisclosure.labelJa : "未照合";
  const confidenceLabel = priorDisclosureConfidenceLabels[priorDisclosure.confidence];
  const visibleAttribution = priorDisclosure.attribution.filter((item) => item.visible !== "hidden");
  const evidenceNotes = Array.from(
    new Set([
      ...priorDisclosure.evidenceSummaryJa,
      ...priorDisclosure.evidence.map((item) => item.noteJa),
    ].filter(Boolean)),
  );
  const hasEvidence = evidenceNotes.length > 0;

  return (
    <div className="ruppelt-disclosure-layer" role="presentation" onClick={onClose}>
      <aside
        className="ruppelt-disclosure-panel"
        role="dialog"
        aria-modal="true"
        aria-label="公開状況の詳細"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ruppelt-disclosure-header">
          <div>
            <p className="ruppelt-disclosure-kicker">公開状況</p>
            <h2>{disclosureLabel}</h2>
          </div>
          <button type="button" aria-label="公開状況の詳細を閉じる" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="ruppelt-disclosure-status-row">
          <span>信頼度：{confidenceLabel}</span>
          {priorDisclosure.ruppeltVerified ? <span>Ruppelt確認済み</span> : null}
        </div>

        <section>
          <h3>判定材料</h3>
          {hasEvidence ? (
            <ul>
              {evidenceNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>公開状況を判断できる材料はまだ登録されていません。</p>
          )}
        </section>

        {priorDisclosure.evidence.some((item) => item.url) ? (
          <section>
            <h3>確認リンク</h3>
            <div className="ruppelt-disclosure-links">
              {priorDisclosure.evidence
                .filter((item) => item.url)
                .map((item) => (
                  <a key={`${item.label}-${item.url}`} href={item.url} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                ))}
            </div>
          </section>
        ) : null}

        {priorDisclosure.reviewerNoteJa ? (
          <section>
            <h3>補足メモ</h3>
            <p>{priorDisclosure.reviewerNoteJa}</p>
          </section>
        ) : null}

        {visibleAttribution.length > 0 ? (
          <p className="ruppelt-disclosure-reference">
            参考照合元：
            {visibleAttribution.map((item, indexValue) => (
              <span key={`${item.source}-${item.sourceUrl || indexValue}`}>
                {indexValue > 0 ? "、" : ""}
                {item.sourceUrl ? (
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                    {getAttributionLabel(item.source)}
                  </a>
                ) : (
                  getAttributionLabel(item.source)
                )}
              </span>
            ))}
          </p>
        ) : null}
      </aside>
    </div>
  );
}

function DetailPanel({
  record,
  bundle,
  onClose,
  initialTab = "overview",
}: {
  record: PursueRecord;
  bundle?: PursueSharedDocumentBundle;
  onClose: () => void;
  initialTab?: DetailTab;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);
  const document = bundle?.document;
  const ocr = bundle?.ocr;
  const translation = bundle?.translationJa;
  const documentId = getDocumentId(record);
  const officialPdfUrl = document?.officialPdfUrl || record.source.downloadUrl;
  const tabs: Array<[DetailTab, string]> = [
    ["overview", "概要"],
    ["summary", "要約"],
    ["fulltext", "全文"],
    ["metadata", "メタデータ"],
    ["source", "出典"],
  ];

  return (
    <div className="ruppelt-detail-layer" role="presentation" onClick={onClose}>
      <aside
        className="ruppelt-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-label="資料詳細"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ruppelt-detail-header">
          <div>
            <p className="ruppelt-detail-kicker">資料詳細</p>
            <h2>{getTitle(record)}</h2>
          </div>
          <button type="button" aria-label="資料詳細を閉じる" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="ruppelt-detail-tabs" role="tablist" aria-label="資料詳細タブ">
          {tabs.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={activeTab === value}
              aria-pressed={activeTab === value}
              onClick={() => setActiveTab(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ruppelt-detail-body">
          {activeTab === "overview" ? (
            <section>
              <h3>概要</h3>
              <p>{getDescriptionByLanguage(record, "ja")}</p>
              <div className="ruppelt-detail-actions">
                {officialPdfUrl ? (
                  <a href={officialPdfUrl} target="_blank" rel="noreferrer">
                    公式PDFを開く
                  </a>
                ) : null}
                <button type="button" onClick={() => setActiveTab("summary")}>
                  要約を見る
                </button>
              </div>
            </section>
          ) : null}

          {activeTab === "summary" ? (
            <section>
              <h3>日本語要約</h3>
              {translation?.summaryJa ? <p>{translation.summaryJa}</p> : <p>未作成</p>}
              <h3>英語要約</h3>
              {translation?.summaryEn ? <p lang="en">{translation.summaryEn}</p> : <p>未作成</p>}
              {translation?.noteJa ? <p className="ruppelt-detail-note">{translation.noteJa}</p> : null}
            </section>
          ) : null}

          {activeTab === "fulltext" ? (
            <section>
              <div className="ruppelt-detail-actions">
                {officialPdfUrl ? (
                  <a href={officialPdfUrl} target="_blank" rel="noreferrer">
                    公式PDFを開く
                  </a>
                ) : null}
              </div>
              <h3>日本語全文訳</h3>
              {translation?.fullTextJa ? (
                <div className="ruppelt-detail-fulltext">{translation.fullTextJa}</div>
              ) : (
                <p>未翻訳</p>
              )}
              <h3>英語OCR全文</h3>
              {ocr?.ocrTextEn ? (
                <pre className="ruppelt-detail-fulltext" lang="en">
                  {ocr.ocrTextEn}
                </pre>
              ) : (
                <p>OCRデータなし</p>
              )}
            </section>
          ) : null}

          {activeTab === "metadata" ? (
            <section>
              <h3>メタデータ</h3>
              <dl className="ruppelt-detail-dl">
                <div>
                  <dt>Document ID</dt>
                  <dd>{documentId}</dd>
                </div>
                <div>
                  <dt>Agency</dt>
                  <dd>{record.source.agency || "不明"}</dd>
                </div>
                <div>
                  <dt>Release</dt>
                  <dd>{record.source.release || "不明"}</dd>
                </div>
                <div>
                  <dt>Incident Date</dt>
                  <dd>{record.source.incidentDate || "不明"}</dd>
                </div>
                <div>
                  <dt>Incident Location</dt>
                  <dd>{record.source.incidentLocation || "不明"}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{record.source.documentType || "不明"}</dd>
                </div>
              </dl>
            </section>
          ) : null}

          {activeTab === "source" ? (
            <section>
              <h3>出典</h3>
              <p>公式PDFを正本とし、OCR・翻訳・要約は検索と閲覧のための補助データです。</p>
              <dl className="ruppelt-detail-dl">
                <div>
                  <dt>公式PDF</dt>
                  <dd>
                    {officialPdfUrl ? (
                      <a href={officialPdfUrl} target="_blank" rel="noreferrer">
                        war.gov
                      </a>
                    ) : (
                      "なし"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>OCR取得元</dt>
                  <dd>
                    {ocr?.source.githubUrl ? (
                      <a href={ocr.source.githubUrl} target="_blank" rel="noreferrer">
                        {ocr.source.repo}
                      </a>
                    ) : (
                      "OCRデータなし"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>OCRファイルパス</dt>
                  <dd>{ocr?.source.filePath || "OCRデータなし"}</dd>
                </div>
                <div>
                  <dt>取得日時</dt>
                  <dd>{ocr?.source.fetchedAt || "OCRデータなし"}</dd>
                </div>
                <div>
                  <dt>ライセンス</dt>
                  <dd>{ocr?.source.license || "OCRデータなし"}</dd>
                </div>
                <div>
                  <dt>OCR状態</dt>
                  <dd>{ocr ? statusStateLabels[ocr.status.ocr] : "OCRなし"}</dd>
                </div>
                <div>
                  <dt>OCR品質</dt>
                  <dd>{ocr ? ocrQualityLabels[ocr.ocrQuality] : "OCRなし"}</dd>
                </div>
                <div>
                  <dt>翻訳状態</dt>
                  <dd>
                    {translation ? statusStateLabels[translation.status.translationJa] : "未翻訳"}
                  </dd>
                </div>
                <div>
                  <dt>要約状態</dt>
                  <dd>{translation ? statusStateLabels[translation.status.summary] : "未作成"}</dd>
                </div>
                <div>
                  <dt>レビュー状態</dt>
                  <dd>{translation?.status.humanReview === "reviewed" ? "レビュー済み" : "未レビュー"}</dd>
                </div>
              </dl>
            </section>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function RecordCard({
  record,
  saved,
  onToggleSaved,
  onOpenPriorDisclosure,
  onOpenDetail,
  variant = "list",
}: {
  record: PursueRecord;
  saved: boolean;
  onToggleSaved: (id: string) => void;
  onOpenPriorDisclosure: (record: PursueRecord) => void;
  onOpenDetail: (record: PursueRecord, tab?: DetailTab) => void;
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
  const priorDisclosure = getPriorDisclosure(record);
  const disclosureLabel = hasPriorDisclosureData(record) ? priorDisclosure.labelJa : "未照合";
  const disclosureStatusClass = record.priorDisclosure?.status || "unreviewed";

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
        <button
          type="button"
          className={`ruppelt-prior-disclosure ruppelt-prior-disclosure--${disclosureStatusClass}`}
          aria-label={`公開状況の詳細を表示: ${disclosureLabel}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onOpenPriorDisclosure(record);
          }}
        >
          {disclosureLabel} <span aria-hidden="true">ⓘ</span>
        </button>
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
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onTouchEnd={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpenDetail(record, "fulltext");
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpenDetail(record, "fulltext");
          }}
        >
          日本語全文
        </button>
        {links.map(([label, url]) => (
          <a key={label} href={url} target="_blank" rel="noreferrer">
            {label}
          </a>
        ))}
      </div>
    </article>
  );
}

export function RuppeltBrowser({
  index,
  descriptionSearchIndex,
}: RuppeltBrowserProps) {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<PursueSearchMode>("description");
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
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<PursueRecord | null>(null);
  const [selectedDetailTab, setSelectedDetailTab] = useState<DetailTab>("overview");
  const [sharedDocuments, setSharedDocuments] = useState<Record<string, PursueSharedDocumentBundle>>({});
  const [fulltextSearchIndex, setFulltextSearchIndex] = useState<PursueFulltextSearchEntry[]>([]);
  const [sharedDataLoading, setSharedDataLoading] = useState(false);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [carouselDragging, setCarouselDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const carouselItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const carouselDragRef = useRef({
    active: false,
    moved: false,
    pointerId: 0,
    scrollLeft: 0,
    startX: 0,
  });

  useEffect(() => {
    setQuery(readParam("q"));
    setSearchMode(normalizeSearchMode(readParam("target")));
    setRelease(readParam("release"));
    setAgency(readParam("agency"));
    setType(readParam("type"));
    setPriorDisclosureStatus(normalizePriorDisclosureFilter(readParam("status")));
    setSort((readParam("sort") as PursueSort) || "newest");
    setSavedIds(readSavedIds());
    setViewMode(readViewMode());
  }, []);

  async function loadSharedData() {
    if (sharedDataLoading || fulltextSearchIndex.length > 0 || Object.keys(sharedDocuments).length > 0) {
      return;
    }

    setSharedDataLoading(true);

    try {
      const response = await fetch("/api/ruppelt/shared-data");

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as RuppeltSharedDataResponse;
      setSharedDocuments(data.sharedDocuments || {});
      setFulltextSearchIndex(data.fulltextSearchIndex || []);
    } finally {
      setSharedDataLoading(false);
    }
  }

  useEffect(() => {
    if (searchMode === "fulltext") {
      void loadSharedData();
    }
  }, [searchMode]);

  useEffect(() => {
    syncQuery({
      q: query,
      target: searchMode === "fulltext" ? searchMode : "",
      release,
      agency,
      type,
      status: priorDisclosureStatus,
      sort,
    });
  }, [agency, priorDisclosureStatus, query, release, searchMode, sort, type]);

  const releases = useMemo(() => uniqueValues(index.records, (record) => record.source.release), [index.records]);
  const agencies = useMemo(() => uniqueValues(index.records, (record) => record.source.agency), [index.records]);
  const types = useMemo(() => uniqueValues(index.records, (record) => record.source.documentType), [index.records]);
  const descriptionSearchByRecordId = useMemo(
    () => new Map(descriptionSearchIndex.map((entry) => [entry.recordId, entry.searchText])),
    [descriptionSearchIndex],
  );
  const fulltextSearchByRecordId = useMemo(
    () => new Map(fulltextSearchIndex.map((entry) => [entry.recordId, entry.searchText])),
    [fulltextSearchIndex],
  );
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
        ? "未照合"
        : priorDisclosureStatus
          ? priorDisclosureLabels[priorDisclosureStatus]
          : "すべて"
    }`,
    `検索対象: ${searchMode === "fulltext" ? "全文" : "資料説明"}`,
    sortLabel,
  ];
  const visibleRecords = useMemo(() => {
    const filtered = index.records.filter((record) =>
      matchesRecord(
        record,
        query,
        release,
        agency,
        type,
        priorDisclosureStatus,
        searchMode,
        descriptionSearchByRecordId,
        fulltextSearchByRecordId,
      ),
    );
    const savedFiltered = showSavedOnly ? filtered.filter((record) => savedIds.includes(record.source.id)) : filtered;
    return sortRecords(savedFiltered, sort);
  }, [
    agency,
    descriptionSearchByRecordId,
    fulltextSearchByRecordId,
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

  function resetFilters() {
    setQuery("");
    setSearchMode("description");
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

  function openDetail(record: PursueRecord, tab: DetailTab = "overview") {
    setSelectedDetailTab(tab);
    setSelectedDetailRecord(record);
    void loadSharedData();
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

        <div className="ruppelt-search-mode" role="group" aria-label="検索対象">
          <button
            type="button"
            aria-pressed={searchMode === "description"}
            onClick={() => setSearchMode("description")}
          >
            資料説明
          </button>
          <button
            type="button"
            aria-pressed={searchMode === "fulltext"}
            onClick={() => setSearchMode("fulltext")}
          >
            全文
          </button>
        </div>

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
                未照合（{unreviewedCount}）
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
                className={`ruppelt-carousel${carouselDragging ? " ruppelt-carousel--dragging" : ""}`}
                ref={carouselRef}
                tabIndex={0}
                onPointerDown={startCarouselDrag}
                onPointerMove={moveCarouselDrag}
                onPointerUp={endCarouselDrag}
                onPointerCancel={endCarouselDrag}
                onClickCapture={(event) => {
                  const target = event.target;
                  const isCardControl =
                    target instanceof Element &&
                    Boolean(
                      target.closest(
                        ".ruppelt-card-actions button, .ruppelt-card-actions a, .ruppelt-prior-disclosure, .ruppelt-card-save, .ruppelt-language-switch button, .ruppelt-description-toggle",
                      ),
                    );

                  if (isCardControl) {
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
                      onOpenPriorDisclosure={setSelectedDisclosureRecord}
                      onOpenDetail={openDetail}
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
                  onOpenPriorDisclosure={setSelectedDisclosureRecord}
                  onOpenDetail={openDetail}
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
      {selectedDetailRecord ? (
        <DetailPanel
          record={selectedDetailRecord}
          bundle={sharedDocuments[getDocumentId(selectedDetailRecord)]}
          initialTab={selectedDetailTab}
          onClose={() => setSelectedDetailRecord(null)}
        />
      ) : null}
    </section>
  );
}
