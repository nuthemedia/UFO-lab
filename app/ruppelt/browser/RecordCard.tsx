"use client";

import { useState } from "react";
import {
  getAgency,
  getDescriptionByLanguage,
  getDocumentType,
  getJapaneseTitle,
  getLocation,
  getPriorDisclosure,
  getRelease,
  getTitle,
  getVideoEmbedUrl,
  getVideoUrl,
  hasPriorDisclosureData,
  type PursueRecord,
} from "@/lib/pursue";
import { isInteractiveElement } from "./helpers";
import { renderHighlightedText } from "./search";
import type { CardLanguage, DetailTab, RuppeltViewMode } from "./types";

export function RecordCard({
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
  const primaryFileLabel = record.source.documentType === "IMG" ? "画像" : "PDF";
  const previewFileLabel = record.source.documentType === "IMG" ? "プレビュー" : "画像";
  const links = [
    [primaryFileLabel, record.source.downloadUrl],
    [previewFileLabel, record.source.imageUrl],
    ["動画", getVideoUrl(record)],
  ].filter(([, url]) => url);
  const hasThumbnail = Boolean(record.source.imageUrl) && !thumbnailBroken;
  const videoEmbedUrl = getVideoEmbedUrl(record);
  const hasVideoPreview = Boolean(videoEmbedUrl) && !hasThumbnail;
  const description = getDescriptionByLanguage(record, language);
  const japaneseTitle = getJapaneseTitle(record);
  const priorDisclosure = getPriorDisclosure(record);
  const disclosureLabel = hasPriorDisclosureData(record) ? priorDisclosure.labelJa : "未判定";
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
