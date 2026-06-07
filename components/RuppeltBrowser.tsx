"use client";

import { useEffect, useMemo, useReducer, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
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
  type PursueIndex,
  type PursueRecord,
  type PursueSort,
} from "@/lib/pursue";

type RuppeltBrowserProps = {
  index: PursueIndex;
  fullTextRecordIds: string[];
};

const storageKey = "ruppelt.savedRecordIds";
const viewModeStorageKey = "ruppelt.viewMode";

type RuppeltViewMode = "carousel" | "list";
type CardLanguage = "ja" | "en";
type SearchMode = "description" | "fulltext";
type DetailTab = "info" | "summary" | "fulltextJa" | "ocrTextEn" | "source";
type PriorDisclosureFilter = PriorDisclosureStatus | "unreviewed" | "";

type RuppeltFulltextMatch = {
  documentId: string;
  recordId: string;
  snippet: string;
  score?: number;
  matchedFields?: string[];
};

type FulltextStatus = "idle" | "loading" | "success" | "error";

type SearchState = {
  draftQuery: string;
  committedQuery: string;
  searchMode: SearchMode;
  fulltextStatus: FulltextStatus;
  fulltextMatches: RuppeltFulltextMatch[];
  fulltextMatchesQuery: string;
  fulltextError: string;
};

type SearchAction =
  | { type: "hydrate"; query: string; searchMode: SearchMode }
  | { type: "editQuery"; query: string }
  | { type: "commitSearch" }
  | { type: "applyExampleSearch"; query: string }
  | { type: "clearSearch" }
  | { type: "changeSearchMode"; searchMode: SearchMode }
  | { type: "fulltextStart"; query: string }
  | { type: "fulltextSuccess"; query: string; matches: RuppeltFulltextMatch[] }
  | { type: "fulltextError"; query: string; error: string };

const initialSearchState: SearchState = {
  draftQuery: "",
  committedQuery: "",
  searchMode: "description",
  fulltextStatus: "idle",
  fulltextMatches: [],
  fulltextMatchesQuery: "",
  fulltextError: "",
};

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "hydrate":
      return {
        ...state,
        draftQuery: action.query,
        committedQuery: action.query,
        searchMode: action.searchMode,
      };
    case "editQuery":
      return { ...state, draftQuery: action.query };
    case "commitSearch": {
      const nextQuery = state.draftQuery.trim();

      if (nextQuery === state.committedQuery) {
        return state;
      }

      return {
        ...state,
        committedQuery: nextQuery,
        fulltextStatus: state.searchMode === "fulltext" && nextQuery ? "loading" : "idle",
        fulltextError: "",
      };
    }
    case "applyExampleSearch": {
      const nextQuery = action.query.trim();

      return {
        ...state,
        draftQuery: nextQuery,
        committedQuery: nextQuery,
        searchMode: "fulltext",
        fulltextStatus: nextQuery ? "loading" : "idle",
        fulltextError: "",
      };
    }
    case "clearSearch":
      return {
        ...state,
        draftQuery: "",
        committedQuery: "",
        fulltextStatus: "idle",
        fulltextMatches: [],
        fulltextMatchesQuery: "",
        fulltextError: "",
      };
    case "changeSearchMode":
      return {
        ...state,
        searchMode: action.searchMode,
        fulltextStatus:
          action.searchMode === "fulltext" && state.committedQuery ? state.fulltextStatus : "idle",
        fulltextError: action.searchMode === "fulltext" ? state.fulltextError : "",
      };
    case "fulltextStart":
      if (action.query !== state.committedQuery || state.searchMode !== "fulltext") {
        return state;
      }

      return { ...state, fulltextStatus: "loading", fulltextError: "" };
    case "fulltextSuccess":
      if (action.query !== state.committedQuery || state.searchMode !== "fulltext") {
        return state;
      }

      return {
        ...state,
        fulltextStatus: "success",
        fulltextMatches: action.matches,
        fulltextMatchesQuery: action.query,
        fulltextError: "",
      };
    case "fulltextError":
      if (action.query !== state.committedQuery || state.searchMode !== "fulltext") {
        return state;
      }

      return {
        ...state,
        fulltextStatus: "error",
        fulltextMatches: [],
        fulltextMatchesQuery: action.query,
        fulltextError: action.error,
      };
    default:
      return state;
  }
}

type RuppeltDocumentDetail = {
  documentId: string;
  recordId: string;
  hasFullTextJa: boolean;
  hasOcrTextEn: boolean;
  officialUrl: string;
  summaryJa: string;
  summaryEn: string;
  fullTextJa: string;
  readableFullTextJa: string;
  ocrTextEn: string;
  noteJa: string;
  status: {
    translationJa?: string;
    summary?: string;
    humanReview?: string;
  } | null;
  document: {
    officialPdfUrl?: string;
    sourcePdfUrl?: string;
    documentStatus?: {
      ocr?: string;
      translationJa?: string;
      summary?: string;
      humanReview?: string;
    };
  } | null;
  ocrSource: {
    repo?: string;
    repoUrl?: string;
    filePath?: string;
    githubUrl?: string;
    fetchedAt?: string;
    license?: string;
    licenseUrl?: string;
  } | null;
};

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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getHighlightTerms(query: string) {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const terms = [trimmed, ...trimmed.split(/\s+/)].filter((term) => term.length > 0);
  return Array.from(new Set(terms)).sort((a, b) => b.length - a.length);
}

function renderHighlightedText(text: string, query: string): ReactNode {
  const terms = getHighlightTerms(query);

  if (!text || terms.length === 0) {
    return text;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, indexValue) => {
    const matched = terms.some((term) => part.toLowerCase() === term.toLowerCase());

    if (!matched) {
      return part;
    }

    return (
      <mark className="ruppelt-search-highlight" key={`${part}-${indexValue}`}>
        {part}
      </mark>
    );
  });
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

function normalizeSearchMode(value: string): SearchMode {
  return value === "fulltext" ? "fulltext" : "description";
}

function isInteractiveElement(target: EventTarget | null) {
  return target instanceof Element
    ? Boolean(target.closest("button, a, input, select, textarea, iframe, [role='button'], [role='tab']"))
    : false;
}

function matchesRecord(
  record: PursueRecord,
  query: string,
  release: string,
  agency: string,
  type: string,
  priorDisclosureStatus: PriorDisclosureFilter,
) {
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

function DocumentDetailPanel({
  record,
  initialTab,
  highlightQuery,
  onClose,
}: {
  record: PursueRecord;
  initialTab: DetailTab;
  highlightQuery: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<RuppeltDocumentDetail | null>(null);
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(true);
  const [tab, setTab] = useState<DetailTab>(initialTab);
  const [viewerQuery, setViewerQuery] = useState("");
  const [thumbnailBroken, setThumbnailBroken] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const previousBodyOverflow = document.body.style.overflow;

    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    setTab(initialTab);
    setViewerQuery("");
    setThumbnailBroken(false);

    fetch(`/api/ruppelt/document/${encodeURIComponent(record.source.id)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("日本語訳を読み込めませんでした。");
        }

        return response.json() as Promise<RuppeltDocumentDetail>;
      })
      .then((data) => {
        setDetail(data);
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) {
          return;
        }

        setDetailError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      });

    document.body.style.overflow = "hidden";

    return () => {
      controller.abort();
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [initialTab, record.source.id]);

  const officialUrl = detail?.officialUrl || record.source.downloadUrl || getVideoUrl(record);
  const openExternalLink = (event: MouseEvent<HTMLAnchorElement>, url: string) => {
    event.preventDefault();

    const opened = window.open(url, "_blank", "noopener,noreferrer");

    if (!opened) {
      window.location.href = url;
    }
  };
  const readableFullTextJa = detail?.readableFullTextJa || detail?.fullTextJa || "";
  const activeText = tab === "ocrTextEn" ? detail?.ocrTextEn || "" : readableFullTextJa;
  const activeHighlightQuery = viewerQuery.trim() || highlightQuery;
  const detailDescription = getDescriptionByLanguage(record, "ja");
  const priorDisclosure = getPriorDisclosure(record);
  const disclosureLabel = hasPriorDisclosureData(record) ? priorDisclosure.labelJa : "未照合";
  const hasThumbnail = Boolean(record.source.imageUrl) && !thumbnailBroken;
  const videoEmbedUrl = getVideoEmbedUrl(record);
  const hasVideoPreview = Boolean(videoEmbedUrl) && !hasThumbnail;
  const viewerMatchCount =
    viewerQuery.trim() && activeText
      ? activeText.toLowerCase().split(viewerQuery.trim().toLowerCase()).length - 1
      : 0;
  const tabs: Array<[DetailTab, string]> = [
    ["info", "資料情報"],
    ["summary", "要約"],
    ["fulltextJa", "日本語訳"],
    ["ocrTextEn", "英語原文"],
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
            <p className="ruppelt-detail-kicker">{tab === "info" ? "資料情報" : "資料詳細"}</p>
            <h2>{getTitle(record)}</h2>
          </div>
          <button type="button" aria-label="資料詳細を閉じる" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="ruppelt-detail-actions">
          {officialUrl ? (
            <a href={officialUrl} target="_blank" rel="noreferrer" onClick={(event) => openExternalLink(event, officialUrl)}>
              公式資料を開く
            </a>
          ) : (
            <span className="ruppelt-detail-action-disabled">公式資料未登録</span>
          )}
        </div>

        <div className="ruppelt-detail-tabs" role="tablist" aria-label="本文表示切り替え">
          {tabs.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ruppelt-detail-body">
          {detailLoading ? (
            <section>
              <p>読み込み中です。</p>
            </section>
          ) : detailError ? (
            <section>
              <p>{detailError}</p>
            </section>
          ) : (
            <>
              {tab === "info" ? (
                <section className="ruppelt-detail-info">
                  <div className={`ruppelt-detail-preview${hasVideoPreview ? " ruppelt-detail-preview--video" : ""}`}>
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
                      <div className="ruppelt-detail-preview-fallback">Preview not available</div>
                    )}
                  </div>
                  <div className="ruppelt-detail-info-main">
                    <h3>{renderHighlightedText(getJapaneseTitle(record), highlightQuery)}</h3>
                    <p>{renderHighlightedText(detailDescription, highlightQuery)}</p>
                  </div>
                  <dl className="ruppelt-detail-dl ruppelt-detail-dl--compact">
                    <div>
                      <dt>公開状況</dt>
                      <dd>{disclosureLabel}</dd>
                    </div>
                    <div>
                      <dt>公開日</dt>
                      <dd>{getRelease(record)}</dd>
                    </div>
                    <div>
                      <dt>資料種別</dt>
                      <dd>{getDocumentType(record)}</dd>
                    </div>
                    <div>
                      <dt>機関</dt>
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
                </section>
              ) : null}

              {tab === "summary" ? (
                <section>
                  <p className="ruppelt-detail-note">
                    この日本語全文はOCR本文をもとにした機械翻訳です。公式PDF・公式ファイルを正本とし、
                    OCR誤読や翻訳誤りを含む可能性があります。
                  </p>
                  <h3>日本語要約</h3>
                  <p>{renderHighlightedText(detail?.summaryJa || "未作成", highlightQuery)}</p>
                  <h3>英語要約</h3>
                  <p>{renderHighlightedText(detail?.summaryEn || "Not available", highlightQuery)}</p>
                </section>
              ) : null}

              {tab === "fulltextJa" ? (
                <section>
                  <div className="ruppelt-detail-search">
                    <label>
                      <span>本文内検索</span>
                      <input
                        type="search"
                        value={viewerQuery}
                        onChange={(event) => setViewerQuery(event.target.value)}
                        placeholder="日本語訳を検索"
                      />
                    </label>
                    <span>{viewerQuery.trim() ? `${viewerMatchCount} 件` : " "}</span>
                  </div>
                  <div className="ruppelt-detail-readable-text">
                    {renderHighlightedText(readableFullTextJa || "未翻訳", activeHighlightQuery)}
                  </div>
                </section>
              ) : null}

              {tab === "ocrTextEn" ? (
                <section>
                  <div className="ruppelt-detail-search">
                    <label>
                      <span>本文内検索</span>
                      <input
                        type="search"
                        value={viewerQuery}
                        onChange={(event) => setViewerQuery(event.target.value)}
                        placeholder="英語原文を検索"
                      />
                    </label>
                    <span>{viewerQuery.trim() ? `${viewerMatchCount} 件` : " "}</span>
                  </div>
                  <pre className="ruppelt-detail-fulltext ruppelt-detail-fulltext--ocr">
                    {renderHighlightedText(detail?.ocrTextEn || "OCRデータなし", activeHighlightQuery)}
                  </pre>
                </section>
              ) : null}

              {tab === "source" ? (
                <section>
                  <p className="ruppelt-detail-note">
                    公式PDF・公式ファイルを正本とし、OCRと日本語訳は閲覧補助として表示しています。
                  </p>
                  <dl className="ruppelt-detail-dl">
                    <div>
                      <dt>公式資料</dt>
                      <dd>
                        {officialUrl ? (
                          <a
                            href={officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => openExternalLink(event, officialUrl)}
                          >
                            {officialUrl}
                          </a>
                        ) : (
                          "未登録"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>OCR取得元</dt>
                      <dd>
                        {detail?.ocrSource?.githubUrl ? (
                          <a href={detail.ocrSource.githubUrl} target="_blank" rel="noreferrer">
                            {detail.ocrSource.repo || detail.ocrSource.githubUrl}
                          </a>
                        ) : (
                          detail?.ocrSource?.repo || "未登録"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>OCRファイルパス</dt>
                      <dd>{detail?.ocrSource?.filePath || "未登録"}</dd>
                    </div>
                    <div>
                      <dt>取得日時</dt>
                      <dd>{detail?.ocrSource?.fetchedAt || "未登録"}</dd>
                    </div>
                    <div>
                      <dt>ライセンス</dt>
                      <dd>{detail?.ocrSource?.license || "未登録"}</dd>
                    </div>
                    <div>
                      <dt>翻訳ステータス</dt>
                      <dd>{detail?.status?.translationJa || detail?.document?.documentStatus?.translationJa || "missing"}</dd>
                    </div>
                    <div>
                      <dt>レビュー状態</dt>
                      <dd>{detail?.status?.humanReview || detail?.document?.documentStatus?.humanReview || "unreviewed"}</dd>
                    </div>
                  </dl>
                </section>
              ) : null}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function RecordCard({
  record,
  saved,
  hasFullText,
  fulltextSnippet,
  highlightQuery,
  onToggleSaved,
  onOpenDetail,
  onOpenPriorDisclosure,
  variant = "list",
}: {
  record: PursueRecord;
  saved: boolean;
  hasFullText: boolean;
  fulltextSnippet?: string;
  highlightQuery: string;
  onToggleSaved: (id: string) => void;
  onOpenDetail: (record: PursueRecord, initialTab?: DetailTab) => void;
  onOpenPriorDisclosure: (record: PursueRecord) => void;
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
    <article
      className={`ruppelt-card ruppelt-card--${variant} ruppelt-card--openable`}
      onClick={(event) => {
        if (isInteractiveElement(event.target)) {
          return;
        }

        onOpenDetail(record, "info");
      }}
    >
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
        {hasFullText ? <span className="ruppelt-fulltext-chip">日本語全文</span> : null}
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
          {renderHighlightedText(description, highlightQuery)}
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
      {fulltextSnippet ? (
        <p className="ruppelt-card-snippet">{renderHighlightedText(fulltextSnippet, highlightQuery)}</p>
      ) : null}
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
        <button type="button" onClick={() => onOpenDetail(record, "info")}>
          資料を開く
        </button>
        {hasFullText ? (
          <button type="button" onClick={() => onOpenDetail(record, "fulltextJa")}>
            日本語全文
          </button>
        ) : null}
        {links.map(([label, url]) => (
          <a key={label} href={url} target="_blank" rel="noreferrer">
            {label}
          </a>
        ))}
      </div>
    </article>
  );
}

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
        ? "未照合"
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
