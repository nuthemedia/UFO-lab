"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getAgency,
  getDescription,
  getJapaneseTitle,
  getLocation,
  getPriorDisclosure,
  getRelease,
  getSearchText,
  getTitle,
  getVideoEmbedUrl,
  getVideoUrl,
  hasPriorDisclosureData,
  parseDate,
  priorDisclosureLabels,
  priorDisclosureStatusOptions,
  uniqueValues,
  type PriorDisclosureStatus,
  type PursueRecord,
} from "@/lib/pursue";
import { readSavedIds, syncQuery, writeSavedIds } from "@/app/ruppelt/browser/helpers";
import { PriorDisclosurePanel } from "@/app/ruppelt/browser/PriorDisclosurePanel";
import { renderHighlightedText } from "@/app/ruppelt/browser/search";

type StatusFilter = PriorDisclosureStatus | "unreviewed" | "";

function statusFor(record: PursueRecord): StatusFilter {
  return hasPriorDisclosureData(record) ? getPriorDisclosure(record).status : "unreviewed";
}

function statusLabel(record: PursueRecord) {
  return hasPriorDisclosureData(record) ? getPriorDisclosure(record).labelJa : "未判定";
}

function sortVideos(records: PursueRecord[]) {
  return [...records].sort((a, b) => {
    const releaseDifference = parseDate(b.source.release) - parseDate(a.source.release);
    return releaseDifference || getTitle(a).localeCompare(getTitle(b), "en");
  });
}

function param(name: string) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

export function RuppeltVideoViewer({ records }: { records: PursueRecord[] }) {
  const allVideos = useMemo(() => sortVideos(records), [records]);
  const releases = useMemo(() => uniqueValues(allVideos, getRelease), [allVideos]);
  const agencies = useMemo(() => uniqueValues(allVideos, getAgency), [allVideos]);
  const [hydrated, setHydrated] = useState(false);
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [release, setRelease] = useState("");
  const [agency, setAgency] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState(allVideos[0]?.source.id || "");
  const [listOpen, setListOpen] = useState(false);
  const [disclosureRecord, setDisclosureRecord] = useState<PursueRecord | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const initialQuery = param("q");
    const initialStatus = param("status") as StatusFilter;
    queueMicrotask(() => {
      setDraftQuery(initialQuery);
      setQuery(initialQuery);
      setRelease(param("release"));
      setAgency(param("agency"));
      setStatus(
        initialStatus === "unreviewed" || priorDisclosureStatusOptions.includes(initialStatus as PriorDisclosureStatus)
          ? initialStatus
          : "",
      );
      setSavedOnly(param("saved") === "1");
      setSavedIds(readSavedIds());
      setCurrentId(param("id") || allVideos[0]?.source.id || "");
      setHydrated(true);
    });
  }, [allVideos]);

  const filteredVideos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allVideos.filter((record) => {
      if (normalizedQuery && !getSearchText(record).includes(normalizedQuery)) return false;
      if (release && getRelease(record) !== release) return false;
      if (agency && getAgency(record) !== agency) return false;
      if (status && statusFor(record) !== status) return false;
      if (savedOnly && !savedIds.includes(record.source.id)) return false;
      return true;
    });
  }, [agency, allVideos, query, release, savedIds, savedOnly, status]);

  const requestedIndex = filteredVideos.findIndex((record) => record.source.id === currentId);
  const current = requestedIndex >= 0 ? filteredVideos[requestedIndex] : filteredVideos[0] || null;
  const currentIndex = current
    ? filteredVideos.findIndex((record) => record.source.id === current.source.id)
    : -1;

  useEffect(() => {
    if (!hydrated) return;
    syncQuery({
      id: current?.source.id || "",
      q: query,
      release,
      agency,
      status,
      saved: savedOnly ? "1" : "",
    });
  }, [agency, current?.source.id, hydrated, query, release, savedOnly, status]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (disclosureRecord) setDisclosureRecord(null);
      else setListOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [disclosureRecord]);

  const selectVideo = useCallback((id: string) => {
    setCurrentId(id);
    setListOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const move = useCallback(
    (direction: -1 | 1) => {
      const index = filteredVideos.findIndex((record) => record.source.id === current?.source.id);
      const next = filteredVideos[index + direction];
      if (next) selectVideo(next.source.id);
    },
    [current?.source.id, filteredVideos, selectVideo],
  );

  const toggleSaved = useCallback(() => {
    if (!current) return;
    setSavedIds((previous) => {
      const next = previous.includes(current.source.id)
        ? previous.filter((id) => id !== current.source.id)
        : [...previous, current.source.id];
      writeSavedIds(next);
      return next;
    });
  }, [current]);

  const resetFilters = () => {
    setDraftQuery("");
    setQuery("");
    setRelease("");
    setAgency("");
    setStatus("");
    setSavedOnly(false);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if ((event.target as Element).closest("button, a, input, select, iframe")) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) return;
    move(dx < 0 ? 1 : -1);
  };

  const isSaved = current ? savedIds.includes(current.source.id) : false;
  const embedUrl = current ? getVideoEmbedUrl(current) : "";
  const officialUrl = current ? getVideoUrl(current) : "";

  return (
    <main className="ruppelt-video-page">
      <header className="ruppelt-video-header">
        <Link href="/ruppelt">← Ruppelt</Link>
        <div>
          <strong>動画ビューアー</strong>
          <span>{allVideos.length}件</span>
        </div>
        <button
          type="button"
          className={isSaved ? "is-saved" : ""}
          aria-label={isSaved ? "後で見るから解除" : "後で見るに追加"}
          aria-pressed={isSaved}
          onClick={toggleSaved}
          disabled={!current}
        >
          ★
        </button>
      </header>

      <div className="ruppelt-video-layout">
        <section className="ruppelt-video-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          {current ? (
            <>
              <div className="ruppelt-video-player">
                {embedUrl ? (
                  <iframe
                    key={current.source.id}
                    src={embedUrl}
                    title={`${getTitle(current)} 動画`}
                    allow="fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <p>この動画は埋め込み表示に対応していません。</p>
                )}
              </div>

              <article className="ruppelt-video-information">
                <div className="ruppelt-video-meta-row">
                  <span>{getRelease(current)}</span>
                  <span>{current.source.incidentDate || "日付不明"}</span>
                  <button
                    type="button"
                    className={`ruppelt-prior-disclosure ruppelt-prior-disclosure--${statusFor(current)}`}
                    onClick={() => setDisclosureRecord(current)}
                  >
                    {statusLabel(current)} ⓘ
                  </button>
                </div>
                <h1>{renderHighlightedText(getTitle(current), query)}</h1>
                <p className="ruppelt-video-title-ja">
                  {renderHighlightedText(getJapaneseTitle(current), query)}
                </p>
                <p className="ruppelt-video-description">
                  {renderHighlightedText(getDescription(current), query)}
                </p>
                <dl>
                  <div><dt>機関</dt><dd>{renderHighlightedText(getAgency(current), query)}</dd></div>
                  <div><dt>場所</dt><dd>{renderHighlightedText(getLocation(current), query)}</dd></div>
                </dl>
                {officialUrl ? (
                  <a className="ruppelt-video-official" href={officialUrl} target="_blank" rel="noreferrer noopener">
                    DVIDSで公式動画を開く ↗
                  </a>
                ) : null}
                <p className="ruppelt-video-swipe-note">動画の外側を左右にスワイプして移動できます。</p>
              </article>
            </>
          ) : (
            <div className="ruppelt-video-empty">
              <h1>該当する動画がありません</h1>
              <p>検索語や絞り込み条件を変えてください。</p>
              <button type="button" onClick={resetFilters}>条件をすべて解除</button>
            </div>
          )}
        </section>

        <VideoList
          records={filteredVideos}
          currentId={current?.source.id || ""}
          query={query}
          draftQuery={draftQuery}
          release={release}
          agency={agency}
          status={status}
          savedOnly={savedOnly}
          releases={releases}
          agencies={agencies}
          open={listOpen}
          onClose={() => setListOpen(false)}
          onDraftQuery={setDraftQuery}
          onSearch={() => setQuery(draftQuery.trim())}
          onRelease={setRelease}
          onAgency={setAgency}
          onStatus={setStatus}
          onSavedOnly={setSavedOnly}
          onReset={resetFilters}
          onSelect={selectVideo}
        />
      </div>

      <nav className="ruppelt-video-navigation" aria-label="動画の移動">
        <button type="button" onClick={() => move(-1)} disabled={!current || currentIndex <= 0}>← 前へ</button>
        <button type="button" onClick={() => setListOpen(true)}>
          一覧 <span>{current ? currentIndex + 1 : 0} / {filteredVideos.length}</span>
        </button>
        <button type="button" onClick={() => move(1)} disabled={!current || currentIndex >= filteredVideos.length - 1}>次へ →</button>
      </nav>

      {disclosureRecord ? (
        <PriorDisclosurePanel record={disclosureRecord} onClose={() => setDisclosureRecord(null)} />
      ) : null}
    </main>
  );
}

function VideoList({
  records,
  currentId,
  query,
  draftQuery,
  release,
  agency,
  status,
  savedOnly,
  releases,
  agencies,
  open,
  onClose,
  onDraftQuery,
  onSearch,
  onRelease,
  onAgency,
  onStatus,
  onSavedOnly,
  onReset,
  onSelect,
}: {
  records: PursueRecord[];
  currentId: string;
  query: string;
  draftQuery: string;
  release: string;
  agency: string;
  status: StatusFilter;
  savedOnly: boolean;
  releases: string[];
  agencies: string[];
  open: boolean;
  onClose: () => void;
  onDraftQuery: (value: string) => void;
  onSearch: () => void;
  onRelease: (value: string) => void;
  onAgency: (value: string) => void;
  onStatus: (value: StatusFilter) => void;
  onSavedOnly: (value: boolean) => void;
  onReset: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <button
        className={`ruppelt-video-list-backdrop ${open ? "is-open" : ""}`}
        type="button"
        aria-label="動画一覧を閉じる"
        onClick={onClose}
      />
      <aside className={`ruppelt-video-list ${open ? "is-open" : ""}`} aria-label="動画一覧">
        <div className="ruppelt-video-list-header">
          <div><strong>動画一覧</strong><span>{records.length}件</span></div>
          <button type="button" onClick={onClose} aria-label="動画一覧を閉じる">×</button>
        </div>
        <form
          className="ruppelt-video-list-filters"
          onSubmit={(event) => { event.preventDefault(); onSearch(); }}
        >
          <label>
            <span>動画を検索</span>
            <div><input value={draftQuery} onChange={(event) => onDraftQuery(event.target.value)} /><button type="submit">検索</button></div>
          </label>
          <div className="ruppelt-video-filter-grid">
            <label><span>公開日</span><select value={release} onChange={(event) => onRelease(event.target.value)}><option value="">すべて</option>{releases.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span>機関</span><select value={agency} onChange={(event) => onAgency(event.target.value)}><option value="">すべて</option>{agencies.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span>公開状況</span><select value={status} onChange={(event) => onStatus(event.target.value as StatusFilter)}><option value="">すべて</option>{priorDisclosureStatusOptions.map((value) => <option key={value} value={value}>{priorDisclosureLabels[value]}</option>)}<option value="unreviewed">未判定</option></select></label>
          </div>
          <label className="ruppelt-video-saved-filter"><input type="checkbox" checked={savedOnly} onChange={(event) => onSavedOnly(event.target.checked)} />保存済みだけ</label>
          <button className="ruppelt-video-reset" type="button" onClick={onReset}>条件を解除</button>
        </form>
        <div className="ruppelt-video-list-items">
          {records.map((record) => (
            <button
              type="button"
              key={record.source.id}
              className={record.source.id === currentId ? "is-current" : ""}
              onClick={() => onSelect(record.source.id)}
            >
              {record.source.imageUrl ? (
                // Official PURSUE thumbnails are remote URLs and are intentionally not mirrored.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={record.source.imageUrl} alt="" loading="lazy" />
              ) : <span className="ruppelt-video-list-placeholder">VID</span>}
              <span className="ruppelt-video-list-copy">
                <strong>{renderHighlightedText(getJapaneseTitle(record), query)}</strong>
                <small>{getRelease(record)} · {statusLabel(record)}</small>
              </span>
            </button>
          ))}
          {records.length === 0 ? <p>条件に合う動画がありません。</p> : null}
        </div>
      </aside>
    </>
  );
}
