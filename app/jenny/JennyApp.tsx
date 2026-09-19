"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { JENNY_SIGNAL_DEFINITIONS } from "@/data/jenny/signals";
import type { JennyAnalysisResponse, JennyErrorResponse, JennyMicroSignal, JennySignalTone } from "@/lib/jenny/types";
import styles from "./jenny.module.css";

type AnalysisState = "idle" | "submitting" | "revealing" | "success" | "error";

const MIN_LENGTH = 100;
const MAX_LENGTH = 20_000;
const GROUP_LABELS = ["報告品質", "遭遇特徴", "代替説明", "証拠", "フェイク兆候"];

type ResultMetricId = "strangeness" | "reliability" | "closeEncounter" | "trueUfo" | "evidenceStrength" | "fakeIndicators";

const DETAIL_SIGNAL_IDS: Record<ResultMetricId, readonly string[]> = {
  strangeness: ["proximity", "physicalEffects", "entityPresence"],
  reliability: ["detailSpecificity", "spatiotemporalConsistency", "sourceTraceability"],
  closeEncounter: ["proximity", "physicalEffects", "entityPresence"],
  trueUfo: ["astronomicalExplanation", "humanAerialExplanation", "atmosphericOpticalExplanation"],
  evidenceStrength: ["independentWitnesses", "recordingSensorEvidence", "physicalDocumentaryEvidence"],
  fakeIndicators: ["contradictions", "fabricationSignals"],
};

function formatSignalValue(signal: JennyMicroSignal) {
  if (signal.max === 10) return `${signal.value.toFixed(1)} / 10`;
  return `${signal.value}%`;
}

function MetricBar({
  metricId,
  label,
  value,
  max,
  tone,
  display,
  details,
  expanded,
  onToggle,
}: {
  metricId: ResultMetricId;
  label: string;
  value: number;
  max: number;
  tone: JennySignalTone;
  display: string;
  details: JennyMicroSignal[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const scale = Math.max(0, Math.min(1, value / max));
  const style = { "--bar-scale": scale } as CSSProperties;
  const detailId = `jenny-details-${metricId}`;

  return (
    <div className={styles.metric}>
      <button
        type="button"
        className={styles.metricToggle}
        aria-expanded={expanded}
        aria-controls={detailId}
        aria-label={`${label}、${display}。関連する判定を${expanded ? "閉じる" : "開く"}`}
        onClick={onToggle}
      >
        <span className={styles.metricHeading}>
          <span className={styles.metricLabel}>{label}</span>
          <span className={styles.metricValue}>{display}</span>
        </span>
        <span
          className={styles.barTrack}
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={display}
        >
          <span className={`${styles.barFill} ${styles[tone]}`} style={style} />
        </span>
        <span className={styles.disclosureIcon} aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>

      <div
        id={detailId}
        className={`${styles.detailDisclosure} ${expanded ? styles.detailDisclosureOpen : ""}`}
        aria-hidden={!expanded}
      >
        <div className={styles.detailDisclosureInner}>
          <div className={styles.detailList}>
            {details.map((signal) => {
              const detailScale = Math.max(0, Math.min(1, signal.value / signal.max));
              const detailStyle = { "--bar-scale": detailScale } as CSSProperties;
              const detailDisplay = formatSignalValue(signal);

              return (
                <div className={styles.detailMetric} key={signal.id}>
                  <div className={styles.detailHeading}>
                    <span>{signal.label}</span>
                    <strong>{detailDisplay}</strong>
                  </div>
                  <div
                    className={styles.detailBarTrack}
                    role="progressbar"
                    aria-label={signal.label}
                    aria-valuemin={0}
                    aria-valuemax={signal.max}
                    aria-valuenow={signal.value}
                    aria-valuetext={detailDisplay}
                  >
                    <span className={`${styles.detailBarFill} ${styles[signal.tone]}`} style={detailStyle} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Results({ result }: { result: JennyAnalysisResponse }) {
  const { summary } = result;
  const [expandedMetric, setExpandedMetric] = useState<ResultMetricId | null>(null);
  const signalById = new Map(result.microSignals.map((signal) => [signal.id, signal]));

  function detailsFor(metricId: ResultMetricId) {
    return DETAIL_SIGNAL_IDS[metricId]
      .map((id) => signalById.get(id))
      .filter((signal): signal is JennyMicroSignal => Boolean(signal));
  }

  function toggleMetric(metricId: ResultMetricId) {
    setExpandedMetric((current) => current === metricId ? null : metricId);
  }

  return (
    <div className={styles.results}>
      <section className={styles.resultBlock} aria-labelledby="sp-heading">
        <h3 id="sp-heading">SP分類</h3>
        <div className={styles.metricList}>
          <MetricBar metricId="strangeness" label="S｜ストレンジネス" value={summary.strangeness} max={10} tone="ice" display={`${summary.strangeness.toFixed(1)} / 10`} details={detailsFor("strangeness")} expanded={expandedMetric === "strangeness"} onToggle={() => toggleMetric("strangeness")} />
          <MetricBar metricId="reliability" label="P｜報告の確からしさ" value={summary.reliability} max={10} tone="sage" display={`${summary.reliability.toFixed(1)} / 10`} details={detailsFor("reliability")} expanded={expandedMetric === "reliability"} onToggle={() => toggleMetric("reliability")} />
        </div>
      </section>

      <section className={styles.resultBlock} aria-labelledby="ce-heading">
        <h3 id="ce-heading">近接遭遇分類</h3>
        <div className={styles.metricList}>
          <MetricBar
            metricId="closeEncounter"
            label={`${summary.closeEncounter.code === "NONE" ? "" : `${summary.closeEncounter.code}｜`}${summary.closeEncounter.labelJa}`}
            value={summary.closeEncounter.fit}
            max={100}
            tone="ice"
            display={`${summary.closeEncounter.fit}%`}
            details={detailsFor("closeEncounter")}
            expanded={expandedMetric === "closeEncounter"}
            onToggle={() => toggleMetric("closeEncounter")}
          />
        </div>
      </section>

      <section className={styles.resultBlock} aria-labelledby="true-ufo-heading">
        <h3 id="true-ufo-heading">TRUE UFO度</h3>
        <div className={styles.metricList}>
          <MetricBar metricId="trueUfo" label="説明困難性" value={summary.trueUfo} max={100} tone="ice" display={`${summary.trueUfo} / 100`} details={detailsFor("trueUfo")} expanded={expandedMetric === "trueUfo"} onToggle={() => toggleMetric("trueUfo")} />
        </div>
        <p className={styles.metricNote}>異星人起源の確率ではありません。</p>
      </section>

      <section className={styles.resultBlock} aria-labelledby="evidence-heading">
        <h3 id="evidence-heading">証拠強度</h3>
        <div className={styles.metricList}>
          <MetricBar metricId="evidenceStrength" label="独立した裏付けの量と質" value={summary.evidenceStrength} max={100} tone="sage" display={`${summary.evidenceStrength} / 100`} details={detailsFor("evidenceStrength")} expanded={expandedMetric === "evidenceStrength"} onToggle={() => toggleMetric("evidenceStrength")} />
        </div>
      </section>

      <section className={styles.resultBlock} aria-labelledby="fake-heading">
        <h3 id="fake-heading">フェイク兆候</h3>
        <div className={styles.metricList}>
          <MetricBar metricId="fakeIndicators" label="文章から検出した兆候" value={summary.fakeIndicators} max={100} tone="amber" display={`${summary.fakeIndicators}%`} details={detailsFor("fakeIndicators")} expanded={expandedMetric === "fakeIndicators"} onToggle={() => toggleMetric("fakeIndicators")} />
        </div>
      </section>
    </div>
  );
}

export default function JennyApp() {
  const [reportText, setReportText] = useState("");
  const [state, setState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<JennyAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [editing, setEditing] = useState(true);
  const statusRef = useRef<HTMLHeadingElement>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  const trimmedLength = reportText.trim().length;
  const tooShort = trimmedLength > 0 && trimmedLength < MIN_LENGTH;
  const tooLong = trimmedLength > MAX_LENGTH;
  const isBusy = state === "submitting" || state === "revealing";
  const isCollapsed = !editing && state !== "idle";

  async function analyze(event?: FormEvent) {
    event?.preventDefault();
    if (isBusy || trimmedLength < MIN_LENGTH || tooLong) return;

    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    setState("submitting");
    setResult(null);
    setErrorMessage("");
    setEditing(false);
    requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      statusRef.current?.focus();
      statusRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });

    try {
      const response = await fetch("/api/jenny/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportText: reportText.trim() }),
      });
      const payload = (await response.json()) as JennyAnalysisResponse | JennyErrorResponse;

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "分析結果を受け取れませんでした。");
      }

      setResult(payload);
      setState("revealing");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      revealTimerRef.current = setTimeout(() => {
        setState("success");
        requestAnimationFrame(() => statusRef.current?.focus());
      }, reduceMotion ? 0 : 420);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "通信に失敗しました。もう一度お試しください。");
      setState("error");
      requestAnimationFrame(() => statusRef.current?.focus());
    }
  }

  function reset() {
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    setReportText("");
    setResult(null);
    setErrorMessage("");
    setState("idle");
    setEditing(true);
  }

  const statusLabel =
    state === "submitting" || state === "revealing"
      ? "20項目を分析中"
      : state === "success"
        ? "分析完了"
        : state === "error"
          ? "分析できませんでした"
          : "分析待機中";

  return (
    <>
      <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>UFO LAB TOKYO</Link>
        <div className={styles.titleLockup}>
          <span className={styles.productName}>Jenny</span>
          <span>UFO REPORT ANALYZER</span>
        </div>
      </header>

      <section className={styles.intro}>
        <h1>UFO報告文書をJevで分析</h1>
        <p>Jevが報告を一度に評価し、分類・数値・確率だけを日本語で示します。</p>
      </section>

      <div className={`${styles.workspace} ${isCollapsed ? styles.workspaceActive : ""}`}>
        <section className={`${styles.inputSurface} ${isCollapsed ? styles.inputCollapsed : ""}`} aria-labelledby="input-heading">
          {isCollapsed ? (
            <div className={styles.preview}>
              <div>
                <p className={styles.surfaceLabel}>入力した報告</p>
                <p className={styles.previewText}>{reportText.trim()}</p>
                <p className={styles.characterCount}>{trimmedLength.toLocaleString("ja-JP")}文字</p>
              </div>
              <div className={styles.secondaryActions}>
                <button type="button" onClick={() => setEditing(true)} disabled={isBusy}>入力を編集</button>
                <button type="button" onClick={reset} disabled={isBusy}>別の報告を分析</button>
              </div>
            </div>
          ) : (
            <form onSubmit={analyze}>
              <p className={styles.surfaceLabel}>REPORT INPUT</p>
              <h2 id="input-heading">目撃・調査報告を貼り付ける</h2>
              <label htmlFor="jenny-report">分析する文章</label>
              <textarea
                id="jenny-report"
                value={reportText}
                onChange={(event) => setReportText(event.target.value)}
                placeholder="日時、場所、目撃状況、物体の形や動き、証拠などが記載された報告文を貼り付けてください。"
                maxLength={MAX_LENGTH + 1}
                disabled={isBusy}
                aria-describedby="jenny-input-help jenny-input-error"
              />
              <div className={styles.inputMeta}>
                <span>{trimmedLength.toLocaleString("ja-JP")} / {MAX_LENGTH.toLocaleString("ja-JP")}文字</span>
                <span>100文字以上</span>
              </div>
              <p id="jenny-input-error" className={styles.validation} aria-live="polite">
                {tooShort ? "分析には100文字以上の文章が必要です。" : tooLong ? "文章は20,000文字以内にしてください。" : ""}
              </p>
              <p id="jenny-input-help" className={styles.privacyNote}>Jennyは本文を保存しません。分析のためAI Gateway経由でJevへ送信されるため、氏名・住所・連絡先などの個人情報は入力しないでください。</p>
              <button className={styles.primaryButton} type="submit" disabled={isBusy || trimmedLength < MIN_LENGTH || tooLong}>
                {isBusy ? "20項目を分析中" : "Jevで20項目を分析"}
              </button>
            </form>
          )}
        </section>

        <section className={styles.analysisSurface} aria-labelledby="analysis-heading" aria-busy={isBusy}>
          <div className={styles.analysisHeader}>
            <div>
              <p>JEV ANALYSIS</p>
              <h2 id="analysis-heading" ref={statusRef} tabIndex={-1}>{statusLabel}</h2>
            </div>
            {result && (state === "revealing" || state === "success") ? (
              <p className={styles.timing}>{result.questionCount}項目を{result.durationMs.toLocaleString("ja-JP")}msで評価</p>
            ) : null}
          </div>

          <p className={styles.srStatus} aria-live="polite">
            {state === "success" ? "20項目の分析が完了しました。" : statusLabel}
          </p>

          {state === "idle" ? (
            <div className={styles.waiting}>
              <p>文章を入力すると、20項目を同時に評価します。</p>
              <div className={styles.groupList}>
                {GROUP_LABELS.map((label) => <span key={label}>{label}</span>)}
              </div>
            </div>
          ) : null}

          {state === "submitting" || state === "revealing" ? (
            <div className={styles.signalGrid} aria-hidden="true">
              {JENNY_SIGNAL_DEFINITIONS.map((definition) => {
                const signal = result?.microSignals.find((item) => item.id === definition.id);
                return (
                  <div className={`${styles.signalCell} ${signal ? styles.signalReady : ""}`} key={definition.id}>
                    <span>{definition.label}</span>
                    {signal ? <strong>{formatSignalValue(signal)}</strong> : <i />}
                  </div>
                );
              })}
            </div>
          ) : null}

          {state === "success" && result ? (
            <>
              <Results result={result} />
              <p className={styles.quota}>本日の残り分析回数：{result.quota.remainingToday}回</p>
            </>
          ) : null}

          {state === "error" ? (
            <div className={styles.errorPanel} role="alert">
              <p>{errorMessage}</p>
              <div className={styles.errorActions}>
                <button type="button" onClick={() => analyze()} disabled={trimmedLength < MIN_LENGTH || tooLong}>もう一度分析する</button>
                <button type="button" onClick={() => setEditing(true)}>入力を編集</button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <aside className={styles.notice}>
        <p>Jennyの数値は文章から得られる参考評価です。報告の真偽、報告者の意図、異星人起源を断定しません。</p>
      </aside>
      </main>
      <SiteFooter className="jenny-footer" />
    </>
  );
}
