"use client";

import { useEffect, useState, type MouseEvent } from "react";
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
import { countInlineSearchMatches, renderHighlightedText } from "./search";
import type { DetailTab, RuppeltDocumentDetail } from "./types";

export function DocumentDetailPanel({
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
      ? countInlineSearchMatches(activeText, viewerQuery)
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
