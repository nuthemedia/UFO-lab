"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import {
  defaultDrakeInputs,
  defaultSelectedEvidenceIds,
  defaultVisitInputs,
  drakeSliders,
  drakeSteps,
  evidenceCards,
  visitSliders,
  type DrakeStepId,
  type SliderDefinition,
} from "@/data/drake/defaults";
import {
  bayesianUpdateMultiple,
  calculateDrakeN,
  calculateDrakeSampleCounts,
  calculateVisitProbability,
  clampProbability,
  type DrakeInputs,
  type VisitInputs,
} from "@/lib/drakeMath";
import { DrakeStarField } from "./DrakeStarField";
import styles from "./DrakeApp.module.css";

const stepIds = drakeSteps.map((step) => step.id);
const visibleStepIds = stepIds.filter((stepId) => stepId !== "intro");

function formatPercent(value: number) {
  const percentage = clampProbability(value) * 100;
  if (percentage < 0.1 && percentage > 0) {
    return "<0.1%";
  }

  return `${percentage.toFixed(percentage >= 10 ? 0 : 1)}%`;
}

function formatCount(value: number) {
  if (value >= 1000) {
    return Math.round(value).toLocaleString("ja-JP");
  }

  if (value >= 10) {
    return value.toFixed(0);
  }

  if (value >= 1) {
    return value.toFixed(1);
  }

  return value.toFixed(2);
}

function formatLargeSampleCount(count: number) {
  const oku = count / 100_000_000;

  if (oku >= 100) {
    return `約${Math.round(oku).toLocaleString("ja-JP")}億`;
  }

  if (oku >= 10) {
    return `約${oku.toFixed(0)}億`;
  }

  if (oku >= 1) {
    return `約${oku.toFixed(1)}億`;
  }

  return `約${Math.round(count).toLocaleString("ja-JP")}`;
}

function getCivilizationYears(value: number) {
  const minYears = 100;
  const maxYears = 100000;
  return minYears * Math.pow(maxYears / minYears, clampProbability(value));
}

function formatCivilizationYears(value: number) {
  const years = getCivilizationYears(value);
  if (years >= 10000) {
    return `約${Math.round(years / 1000).toLocaleString("ja-JP")}千年`;
  }

  return `約${Math.round(years).toLocaleString("ja-JP")}年`;
}

function getSliderDisplayValue(id: string, value: number) {
  if (id === "civilizationLifetime") {
    return formatCivilizationYears(value);
  }

  return formatPercent(value);
}

function getEvidenceComment(likelihoodRatio: number) {
  if (likelihoodRatio >= 5) {
    return "この証拠の組み合わせでは、思考実験として来訪説を大きく強めます。ただし、科学的な決定打として扱うものではありません。";
  }

  if (likelihoodRatio >= 2) {
    return "この証拠の組み合わせでは、あなたの設定上は来訪説が強まります。ただし、代替説明を除外するものではありません。";
  }

  if (likelihoodRatio >= 1.2) {
    return "この証拠の組み合わせでは、来訪説は少し強まります。ただし、宇宙人でなくても起きやすい証拠なので、決定打ではありません。";
  }

  if (likelihoodRatio <= 0.8) {
    return "この証拠評価では、来訪説への確信は弱まります。思考実験として、別の前提でも試せます。";
  }

  return "この証拠評価では、来訪説への確信はほとんど変わりません。思考実験として、別の証拠の組み合わせも試せます。";
}

function getEvidenceStrengthLabel(likelihoodRatio: number) {
  if (likelihoodRatio >= 5) {
    return "大きく更新";
  }

  if (likelihoodRatio >= 2) {
    return "強く更新";
  }

  if (likelihoodRatio >= 1.2) {
    return "少し更新";
  }

  if (likelihoodRatio <= 0.8) {
    return "弱める";
  }

  return "ほぼ変わらない";
}

function getVisualProbabilitySignal(value: number, max = 0.35) {
  return Math.min(max, Math.sqrt(clampProbability(value)) * 2.5);
}

function getVisitCandidateVisualSignal(inputs: VisitInputs) {
  const filter =
    clampProbability(inputs.sameEra) *
    clampProbability(inputs.discoveredEarth) *
    clampProbability(inputs.travelCapability) *
    clampProbability(inputs.motivation) *
    clampProbability(inputs.observable);

  return Math.min(0.5, Math.pow(filter, 0.22) * 0.5);
}

function getVisitCandidateLabel(signal: number) {
  if (signal >= 0.34) {
    return "増えている";
  }

  if (signal >= 0.18) {
    return "わずか";
  }

  return "ほぼ見えない";
}

function getScreenInfo(step: DrakeStepId) {
  if (step === "drake") {
    return "ドレイクの式では、惑星を持つ星の割合 fp と、生命に適した惑星の数 ne を分けます。このMVPでは ne を独立スライダーにせず、惑星を持つ恒星から平均1.6個/恒星の補助仮定で惑星数を出す簡略版です。天の川銀河には約1000億〜4000億個の恒星があり、惑星は少なくとも同程度あると考えられています。";
  }

  if (step === "science") {
    return "これは正解判定ではありません。あなたの前提が、現在の科学でかなり分かっている部分と、まだ未知の部分のどこに触れているかを見ています。";
  }

  if (step === "visit") {
    return "宇宙人が存在していることと、地球に来ていることは別の問いです。この画面では来訪に必要なハードルだけを重ねます。来訪候補ライトは赤や白の光を見やすくするためのサンプル表示で、実際の星数や確率そのものではありません。";
  }

  if (step === "evidence") {
    return "UFOが未確認であることと、宇宙人由来であることは別です。選んだ証拠の組み合わせで、来訪説への更新量だけを思考実験として見ます。";
  }

  if (step === "result") {
    return "少なくとも1つの文明が存在する可能性は、推定される文明数 N から出した思考実験上の値です。結果カード内の短い流れは、生命が存在しうる候補から文明へ絞られる流れ、文明から来訪へ絞られる流れ、UFO証拠の前後で更新される流れを示します。";
  }

  return "";
}

function getSliderHelp(id: string) {
  const help: Record<string, string> = {
    planetAbundance:
      "天の川銀河の恒星のうち、惑星を持つ恒星がどれくらいあるかという前提です。推定される惑星は、平均1.6個/恒星という簡略仮定で表示します。",
    lifeChance:
      "生命の確認数ではなく、液体の水など生命に適した条件を持ちうる惑星を、あなたの前提で1000億恒星サンプルに当てはめた候補表示です。緑の星に反映されます。",
    intelligenceChance:
      "知性体の実在数ではなく、生命が存在しうる惑星のうち知性まで進むという仮定を置いた候補表示です。青い星に反映されます。",
    civilizationLifetime:
      "知性体が存在しても、通信可能な文明になり、さらに観測できる期間続くとは限りません。MVPでは、通信可能になる割合 fc と文明が続く長さ L をまとめた簡略パラメータとして扱います。",
    sameEra: "文明が存在していても、人類と同じ時代に重なっている必要があります。",
    discoveredEarth: "その文明が地球を発見している、または地球に注目できている可能性です。",
    travelCapability: "恒星間移動、または長距離探査機を送れる可能性です。",
    motivation: "地球へ来る、または探査する動機がある可能性です。",
    observable: "来訪や探査があったとして、人類側から観測される可能性です。",
  };

  return help[id] ?? "この前提を変えると、星空と推定値が変化します。";
}

function getScienceRows(inputs: DrakeInputs) {
  const getStance = (value: number) => {
    if (value < 0.45) {
      return "慎重寄り";
    }

    if (value > 0.75) {
      return "楽観寄り";
    }

    return "中間";
  };

  return [
    {
      label: "惑星の多さ",
      category: "科学的にかなり分かっている",
      stance: getStance(inputs.planetAbundance),
      reason: inputs.planetAbundance < 0.45 ? "現在の観測より低め" : inputs.planetAbundance > 0.75 ? "かなり多い前提" : "観測知見に近い中間",
      body:
        inputs.planetAbundance < 0.45
          ? "あなたの設定は慎重寄りです。現在の観測では、惑星はかなり一般的だと考えられています。"
          : "あなたの設定では、惑星が多い前提です。現在の観測でも、惑星はかなり一般的だと考えられています。",
    },
    {
      label: "生命の生まれやすさ",
      category: "まだほぼ未知",
      stance: getStance(inputs.lifeChance),
      reason: "未知なのであなたの仮定に依存",
      body: "この値はまだほぼ未知です。地球以外の生命サンプルがないため、あなたの仮定に大きく依存します。",
    },
    {
      label: "知性への進化",
      category: "あなたの仮定に大きく依存",
      stance: getStance(inputs.intelligenceChance),
      reason: inputs.intelligenceChance < 0.45 ? "知性への進化を慎重に見る前提" : "知性への進化を起きやすく見る前提",
      body: "非常に不確実な項目です。生命が存在しても、必ず知的生命になるとは限りません。",
    },
    {
      label: "文明の続く長さ",
      category: "ある程度分かっているが不確実",
      stance: getStance(inputs.civilizationLifetime),
      reason: inputs.civilizationLifetime < 0.45 ? "短く続く前提" : "長く続く前提",
      body: "技術文明がどれくらい続くかは、観測だけでは決めにくい項目です。この設定では文明の光の数が大きく変わります。",
    },
  ];
}

const thoughtExperimentNote = "この結果は、あなたの前提に基づく思考実験です。科学的な最終結論ではありません。";
const starSampleNote = "星空は確率を理解するためのサンプル表示です。実際の銀河の星数をそのまま表しているわけではありません。";
const formulaRibbonText = "N = R* · fp · ne · fl · fi · fc · L    P(θ|D) = P(D|θ)P(θ) / P(D)";

type SliderProps<T extends string> = {
  id: T;
  label: string;
  value: number;
  lowLabel: string;
  highLabel: string;
  tone?: SliderDefinition<T>["tone"];
  onChange: (value: number) => void;
};

function Slider<T extends string>({ id, label, value, tone, onChange }: SliderProps<T>) {
  const [helpOpen, setHelpOpen] = useState(false);
  return (
    <div className={styles.sliderRow} data-tone={tone}>
      <span className={styles.sliderHeader}>
        <span>
          {label}
          <button
            aria-expanded={helpOpen}
            aria-label={`${label}の説明を表示`}
            className={styles.helpButton}
            type="button"
            onClick={(event) => {
              event.preventDefault();
              setHelpOpen((open) => !open);
            }}
          >
            ?
          </button>
        </span>
        <strong>{getSliderDisplayValue(id, value)}</strong>
      </span>
      {helpOpen ? <span className={styles.sliderHelp}>{getSliderHelp(id)}</span> : null}
      <input
        type="range"
        min="0"
        max="100"
        value={Math.round(value * 100)}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
      />
    </div>
  );
}

type MetricProps = {
  label: string;
  value: string;
  note: string;
  tone?: "white" | "life" | "intelligence" | "civilization" | "visit" | "evidence";
};

function Metric({ label, value, note, tone }: MetricProps) {
  return (
    <div className={styles.metric} data-tone={tone}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{tone ? <i aria-hidden="true" /> : null}{note}</small>
    </div>
  );
}

function StarLegend({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`${styles.starLegend}${compact ? ` ${styles.starLegendCompact}` : ""}`} aria-label="星の色の意味">
      <span>
        <i data-color="white" /> 通常
      </span>
      <span>
        <i data-color="life" /> 生命が存在しうる惑星
      </span>
      <span>
        <i data-color="intelligence" /> 知性体が存在しうる惑星
      </span>
      <span>
        <i data-color="civilization" /> 通信可能な文明
      </span>
      <span>
        <i data-color="visit" /> 来訪候補・UFO証拠更新
      </span>
    </div>
  );
}

function StepTopBar({ activeStep }: { activeStep: DrakeStepId }) {
  if (activeStep === "intro") {
    return null;
  }

  const stepIndex = Math.max(0, visibleStepIds.indexOf(activeStep));
  return (
    <div className={styles.stepTopBar} aria-label="Drake の進行状況">
      <span>
        STEP {stepIndex + 1} / {visibleStepIds.length}
      </span>
      <strong>{drakeSteps.find((step) => step.id === activeStep)?.label}</strong>
      <div className={styles.stepTopTrack}>
        {visibleStepIds.map((stepId, index) => (
          <span key={stepId} className={index <= stepIndex ? styles.stepDotActive : styles.stepDot} />
        ))}
      </div>
    </div>
  );
}

type ResultMetricProps = MetricProps & {
  tone: "intelligence" | "visit" | "evidence";
  flow: "drake" | "visit" | "evidence";
};

function ResultFlowLine({ flow }: Pick<ResultMetricProps, "flow">) {
  const paths = {
    drake: "M4 10 C22 8 28 17 43 18 C58 19 67 23 82 23 C98 24 106 20 116 22",
    visit: "M4 8 C21 10 28 15 42 18 C59 22 74 26 91 26 C103 26 110 24 116 24",
    evidence: "M4 23 C24 23 40 23 58 22 C76 20 91 13 116 9",
  };

  const markerX = flow === "evidence" ? 86 : flow === "visit" ? 74 : 64;

  return (
    <svg className={styles.resultWave} viewBox="0 0 120 32" aria-hidden="true">
      <path d={paths[flow]} />
      <line x1={markerX} y1="4" x2={markerX} y2="29" />
    </svg>
  );
}

function ResultMetric({ label, value, note, tone, flow }: ResultMetricProps) {
  return (
    <div className={styles.resultMetric} data-tone={tone}>
      <span className={styles.resultIcon} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
      <span className={styles.resultFlowText}>
        {flow === "drake" ? "生命→知性→文明" : flow === "visit" ? "文明→来訪" : "見る前→見た後"}
      </span>
    </div>
  );
}

type StepShellProps = {
  children: React.ReactNode;
  className?: string;
};

function StepShell({ children, className }: StepShellProps) {
  return <div className={`${styles.stepShell}${className ? ` ${className}` : ""}`}>{children}</div>;
}

function Note({ compact = false }: { compact?: boolean }) {
  return (
    <p className={compact ? styles.noteCompact : styles.note}>{thoughtExperimentNote}</p>
  );
}

function FormulaRibbon() {
  return (
    <div className={styles.introFormulaRibbon} aria-hidden="true">
      <div className={styles.formulaRibbonTrack}>
        <span>{formulaRibbonText}</span>
        <span>{formulaRibbonText}</span>
        <span>{formulaRibbonText}</span>
      </div>
    </div>
  );
}

function IntroInfoSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.introInfoBackdrop} onClick={onClose}>
      <section
        aria-labelledby="intro-info-title"
        aria-modal="true"
        className={styles.introInfoSheet}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.introInfoHeader}>
          <h2 id="intro-info-title">Drakeとは？</h2>
          <button className={styles.introInfoClose} type="button" onClick={onClose} aria-label="説明を閉じる">
            ×
          </button>
        </div>
        <p>Drakeは、宇宙人が「いるか」と「地球に来ているか」と「UFOが証拠になるか」を分けて考える思考実験です。</p>
        <p>
          このアプリでは、ドレイクの方程式で宇宙人の存在可能性と地球来訪の事前確率を考え、UFOに関する証拠の強さを使って、ベイズ推論に基づき事後確率へ更新します。
        </p>
        <div className={styles.introInfoBlock}>
          <h3>ドレイクの方程式</h3>
          <p>天の川銀河に、通信可能な地球外文明がどれくらいありそうかを考える式です。</p>
          <code>N = R* · fp · ne · fl · fi · fc · L</code>
        </div>
        <div className={styles.introInfoBlock}>
          <h3>ベイズ推論</h3>
          <p>証拠を見たあとに、考えをどれくらい更新するかを見る考え方です。</p>
          <code>P(θ|D) = P(D|θ)P(θ) / P(D)</code>
        </div>
        <p className={styles.introInfoNote}>{thoughtExperimentNote}</p>
      </section>
    </div>
  );
}

type StarOverlayProps = {
  activeStep: DrakeStepId;
  title: string;
  body?: string;
  children?: React.ReactNode;
  infoOpen: boolean;
  onToggleInfo: () => void;
};

function StarOverlay({ activeStep, title, body, children, infoOpen, onToggleInfo }: StarOverlayProps) {
  return (
    <div className={styles.starOverlay}>
      <div className={styles.starOverlayTitle}>
        <div>
          <h2>{title}</h2>
          {body ? <p>{body}</p> : null}
        </div>
        <button className={styles.infoButton} type="button" onClick={onToggleInfo} aria-expanded={infoOpen} aria-label="注釈を表示">
          i
        </button>
      </div>
      {children ? <div className={styles.overlayMetrics}>{children}</div> : null}
      {infoOpen ? (
        <div className={styles.infoPopover}>
          <p>{body ?? title}</p>
          <p>{getScreenInfo(activeStep)}</p>
          <p>星の色の意味は、白が通常、緑が生命が存在しうる惑星、青が知性体が存在しうる惑星、金が通信可能な文明、赤や強い白が来訪候補やUFO証拠による更新を表します。</p>
          <StarLegend />
          <p>{thoughtExperimentNote}</p>
          <p>{starSampleNote}</p>
        </div>
      ) : null}
    </div>
  );
}

type FocusSliderPanelProps<T extends string> = {
  sliders: SliderDefinition<T>[];
  values: Record<T, number>;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onValueChange: (id: T, value: number) => void;
  onBack: () => void;
  onComplete: () => void;
  completeLabel: string;
};

function FocusSliderPanel<T extends string>({
  sliders,
  values,
  activeIndex,
  onActiveIndexChange,
  onValueChange,
  onBack,
  onComplete,
  completeLabel,
}: FocusSliderPanelProps<T>) {
  const slider = sliders[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === sliders.length - 1;

  if (!slider) {
    return null;
  }

  return (
    <div className={styles.focusSliderPanel}>
      <div className={styles.focusSliderMeta}>
        <span>
          {activeIndex + 1} / {sliders.length}
        </span>
        <strong>{slider.label}</strong>
      </div>
      <div className={styles.focusSliderFrame} key={slider.id}>
        <Slider
          id={slider.id}
          label={slider.label}
          lowLabel={slider.lowLabel}
          highLabel={slider.highLabel}
          tone={slider.tone}
          value={values[slider.id]}
          onChange={(value) => onValueChange(slider.id, value)}
        />
      </div>
      <div className={styles.focusDots} aria-label="前提項目の現在位置">
        {sliders.map((item, index) => (
          <button
            aria-label={`${item.label}を表示`}
            className={index === activeIndex ? styles.focusDotActive : styles.focusDot}
            key={item.id}
            type="button"
            onClick={() => onActiveIndexChange(index)}
          />
        ))}
      </div>
      <div className={styles.focusActions}>
        <button className={styles.secondaryButton} type="button" onClick={isFirst ? onBack : () => onActiveIndexChange(activeIndex - 1)}>
          {isFirst ? "戻る" : "前の前提"}
        </button>
        <button className={styles.primaryButton} type="button" onClick={isLast ? onComplete : () => onActiveIndexChange(activeIndex + 1)}>
          {isLast ? completeLabel : "次の前提"}
        </button>
      </div>
    </div>
  );
}

export function DrakeApp() {
  const [activeStep, setActiveStep] = useState<DrakeStepId>("intro");
  const [drakeInputs, setDrakeInputs] = useState<DrakeInputs>(defaultDrakeInputs);
  const [visitInputs, setVisitInputs] = useState<VisitInputs>(defaultVisitInputs);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>(defaultSelectedEvidenceIds);
  const [activeDrakeSliderIndex, setActiveDrakeSliderIndex] = useState(0);
  const [activeVisitSliderIndex, setActiveVisitSliderIndex] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const [introInfoOpen, setIntroInfoOpen] = useState(false);
  const [resultExpanded, setResultExpanded] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const derivedResult = useMemo(() => {
    const drakeEstimate = calculateDrakeN(drakeInputs);
    const drakeSampleCounts = calculateDrakeSampleCounts(drakeInputs);
    const visitProbability = calculateVisitProbability(drakeEstimate.existenceProbability, visitInputs);
    const selectedEvidenceCards = evidenceCards.filter((card) => selectedEvidenceIds.includes(card.id));
    const update = bayesianUpdateMultiple(visitProbability, selectedEvidenceCards);

    return {
      drakeEstimate,
      drakeSampleCounts,
      selectedEvidenceCards,
      starSignals: {
        planetSignal: drakeInputs.planetAbundance,
        lifeSignal: drakeEstimate.lifeSignal,
        intelligenceSignal: drakeEstimate.intelligenceSignal,
        civilizationSignal: drakeEstimate.civilizationSignal,
        visitSignal: getVisitCandidateVisualSignal(visitInputs),
        evidenceSignal: getVisualProbabilitySignal(update.posterior, 0.42),
      },
      update,
      visitProbability,
    };
  }, [drakeInputs, selectedEvidenceIds, visitInputs]);
  const scienceRows = useMemo(() => getScienceRows(drakeInputs), [drakeInputs]);
  const activeIndex = stepIds.indexOf(activeStep);
  const { drakeEstimate, drakeSampleCounts, selectedEvidenceCards, starSignals, update, visitProbability } = derivedResult;
  const evidenceStrengthLabel = getEvidenceStrengthLabel(update.likelihoodRatio);
  const visitCandidateLabel = getVisitCandidateLabel(starSignals.visitSignal);
  const visibleStarSignals = useMemo(() => {
    if (activeStep === "drake") {
      const activeSlider = drakeSliders[activeDrakeSliderIndex];
      if (activeSlider?.id === "planetAbundance") {
        return { ...starSignals, lifeSignal: 0, intelligenceSignal: 0, civilizationSignal: 0, visitSignal: 0, evidenceSignal: 0 };
      }
      if (activeSlider?.id === "lifeChance") {
        return { ...starSignals, intelligenceSignal: 0, civilizationSignal: 0, visitSignal: 0, evidenceSignal: 0 };
      }
      if (activeSlider?.id === "intelligenceChance") {
        return { ...starSignals, civilizationSignal: 0, visitSignal: 0, evidenceSignal: 0 };
      }
      return { ...starSignals, visitSignal: 0, evidenceSignal: 0 };
    }

    if (activeStep === "visit") {
      return { ...starSignals, evidenceSignal: 0 };
    }

    return starSignals;
  }, [activeDrakeSliderIndex, activeStep, starSignals]);

  useEffect(() => {
    setInfoOpen(false);
    setIntroInfoOpen(false);
    setResultExpanded(activeStep !== "result");
  }, [activeStep]);

  useEffect(() => {
    if (!introInfoOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIntroInfoOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [introInfoOpen]);

  const goNext = () => {
    setActiveStep(stepIds[Math.min(stepIds.length - 1, activeIndex + 1)]);
  };

  const goPrevious = () => {
    setActiveStep(stepIds[Math.max(0, activeIndex - 1)]);
  };

  const shouldIgnoreSwipe = (target: EventTarget | null) =>
    target instanceof Element &&
    Boolean(target.closest("input, button, a, textarea, select, [role='button'], [data-swipe-ignore='true']"));

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (shouldIgnoreSwipe(event.target)) {
      pointerStartRef.current = null;
      return;
    }

    pointerStartRef.current = { x: event.clientX, y: event.clientY, time: Date.now() };
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || shouldIgnoreSwipe(event.target)) {
      return;
    }

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const age = Date.now() - start.time;
    if (age > 900) {
      return;
    }

    if (activeStep === "intro" && dy < -70 && Math.abs(dy) > Math.abs(dx) * 1.25) {
      goNext();
      return;
    }

    if (activeStep !== "intro" && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      if (dx < 0) {
        goNext();
      } else if (activeIndex > 1) {
        goPrevious();
      }
    }
  };

  const reset = () => {
    setActiveStep("intro");
    setDrakeInputs(defaultDrakeInputs);
    setVisitInputs(defaultVisitInputs);
    setSelectedEvidenceIds(defaultSelectedEvidenceIds);
    setActiveDrakeSliderIndex(0);
    setActiveVisitSliderIndex(0);
  };

  const toggleEvidence = (id: string) => {
    setSelectedEvidenceIds((previous) => (previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]));
  };

  const shareOnX = (source: "intro" | "result" = "intro") => {
    const text =
      source === "result"
        ? `Drakeで思考実験をしました。私の前提では、UFOによる地球来訪可能性は${formatPercent(update.posterior)}でした。`
        : `Drakeで、宇宙人の存在・地球への来訪・UFO証拠を分けて考える思考実験をしました。`;
    const url = "https://ufolab.tokyo/drake";
    const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
  };

  const renderDrakeMetrics = () => {
    const activeSlider = drakeSliders[activeDrakeSliderIndex];

    if (activeSlider?.id === "planetAbundance") {
      return (
        <>
          <Metric
            label="惑星を持つ恒星"
            value={formatLargeSampleCount(drakeSampleCounts.planetHostingStarCount)}
            note="1000億個の恒星を母数にした思考実験"
            tone="white"
          />
          <Metric
            label="推定される惑星"
            value={formatLargeSampleCount(drakeSampleCounts.estimatedPlanetCount)}
            note="平均1.6個/恒星の簡略仮定"
            tone="white"
          />
        </>
      );
    }

    if (activeSlider?.id === "lifeChance") {
      return (
        <>
          <Metric
            label="生命が存在しうる惑星"
            value={formatLargeSampleCount(drakeSampleCounts.lifeBearingPlanetCount)}
            note="生命に適した条件のサンプル表示"
            tone="life"
          />
        </>
      );
    }

    if (activeSlider?.id === "intelligenceChance") {
      return (
        <>
          <Metric
            label="知性体が存在しうる惑星"
            value={formatLargeSampleCount(drakeSampleCounts.intelligencePlanetCount)}
            note="知性まで進む候補のサンプル表示"
            tone="intelligence"
          />
        </>
      );
    }

    return (
      <>
        <Metric
          label="通信可能な文明"
          value={formatCount(drakeSampleCounts.communicationCivilizationCount)}
          note="知性体の惑星から、通信可能になり、観測できる期間続く見込みで絞っています"
          tone="civilization"
        />
        <Metric label="通信可能な文明として続く見込み" value={formatCivilizationYears(drakeInputs.civilizationLifetime)} note="金の星に反映" tone="civilization" />
      </>
    );
  };

  const renderStarOverlay = () => {
    if (activeStep === "intro") {
      return null;
    }

    if (activeStep === "drake") {
      return (
        <StarOverlay
          activeStep={activeStep}
          title="天の川銀河に、生命が存在しうる候補はどれくらいあるでしょう？"
          infoOpen={infoOpen}
          onToggleInfo={() => setInfoOpen((open) => !open)}
        >
          {renderDrakeMetrics()}
        </StarOverlay>
      );
    }

    if (activeStep === "science") {
      return (
        <StarOverlay
          activeStep={activeStep}
          title="あなたの前提は、現在の科学と比べてどこが楽観的で、どこが慎重でしょうか？"
          infoOpen={infoOpen}
          onToggleInfo={() => setInfoOpen((open) => !open)}
        />
      );
    }

    if (activeStep === "visit") {
      return (
        <StarOverlay
          activeStep={activeStep}
          title="宇宙人が存在するとしても、地球に来るにはいくつものハードルがあります。"
          body="宇宙人が存在することと、地球に来ていることは別の問いです。"
          infoOpen={infoOpen}
          onToggleInfo={() => setInfoOpen((open) => !open)}
        >
          <Metric label="少なくとも1つの文明が存在する可能性" value={formatPercent(drakeEstimate.existenceProbability)} note="Drake Equation の出力" tone="civilization" />
          <Metric label="証拠を見る前の来訪可能性" value={formatPercent(visitProbability)} note="この設定では" tone="visit" />
          <Metric label="来訪候補ライト" value={visitCandidateLabel} note="赤/白の星に反映" tone="evidence" />
        </StarOverlay>
      );
    }

    if (activeStep === "evidence") {
      return (
        <StarOverlay
          activeStep={activeStep}
          title="この証拠で、考えはどれくらい変わる？"
          body="UFO証拠を選ぶと、この証拠の組み合わせではどれくらい更新されるかを計算します。"
          infoOpen={infoOpen}
          onToggleInfo={() => setInfoOpen((open) => !open)}
        >
          <Metric label="証拠を見る前" value={formatPercent(visitProbability)} note="prior" tone="visit" />
          <Metric label="証拠の強さ" value={evidenceStrengthLabel} note={`LR ${update.likelihoodRatio.toFixed(1)}x`} tone="evidence" />
          <Metric label="証拠を見た後" value={formatPercent(update.posterior)} note="posterior" tone="visit" />
        </StarOverlay>
      );
    }

    return (
      <StarOverlay
        activeStep={activeStep}
        title="あなたの銀河"
        body="前提とUFO証拠で変化した、思考実験としての最終状態です。"
        infoOpen={infoOpen}
        onToggleInfo={() => setInfoOpen((open) => !open)}
      >
        <StarLegend compact />
      </StarOverlay>
    );
  };

  return (
    <main className={styles.page} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
      <section className={`${styles.starPanel}${activeStep === "intro" ? ` ${styles.starPanelIntro}` : ""}`}>
        <DrakeStarField
          {...visibleStarSignals}
          mode={activeStep === "intro" ? "ambient" : activeStep === "result" ? "result" : "interactive"}
        />
        <div className={styles.starShade} />
        {activeStep === "intro" ? <FormulaRibbon /> : null}
        {renderStarOverlay()}
        {activeStep !== "intro" ? (
          <p className={styles.starNote}>{starSampleNote}</p>
        ) : null}
      </section>
      <StepTopBar activeStep={activeStep} />
      {activeStep !== "intro" ? (
        <div className={styles.swipeNav} aria-label="ステップ移動">
          <button className={styles.swipePrev} type="button" onClick={goPrevious} disabled={activeIndex <= 1} aria-label="前のステップへ">
            ‹
          </button>
          <button
            className={styles.swipeNext}
            type="button"
            onClick={goNext}
            disabled={activeIndex >= stepIds.length - 1}
            aria-label="次のステップへ"
          >
            ›
          </button>
        </div>
      ) : null}

      <section
        className={`${activeStep === "intro" ? styles.introPanel : styles.controlPanel}${
          activeStep === "science" || activeStep === "evidence" || activeStep === "result" ? ` ${styles.expandedControlPanel}` : ""
        }`}
        data-swipe-ignore={activeStep === "intro" ? undefined : true}
      >
        {activeStep === "intro" ? (
          <div className={styles.introCopy}>
            <h1>Drake</h1>
            <p className={styles.subtitle}>宇宙人はいるのか、地球に来ているのか</p>
            <p>存在、来訪、証拠。3つに分けて考える。</p>
            <button className={styles.introInfoButton} type="button" onClick={() => setIntroInfoOpen(true)}>
              Drakeとは？
            </button>
            <button className={styles.swipeUpHint} type="button" onClick={goNext} aria-label="上に進む">
              ↑
            </button>
            <button className={styles.primaryButton} type="button" onClick={goNext}>
              はじめる
            </button>
            <a className={styles.introFooterLink} href="https://ufolab.tokyo" target="_blank" rel="noreferrer">
              UFO Lab Tokyo
            </a>
            <button className={styles.introShareButton} type="button" onClick={() => shareOnX("intro")} aria-label="Xで共有する">
              <span aria-hidden="true">↗</span>
              Xで共有
            </button>
          </div>
        ) : null}
        {introInfoOpen ? <IntroInfoSheet onClose={() => setIntroInfoOpen(false)} /> : null}

        {activeStep === "drake" ? (
          <StepShell>
            <FocusSliderPanel
              sliders={drakeSliders}
              values={drakeInputs}
              activeIndex={activeDrakeSliderIndex}
              onActiveIndexChange={setActiveDrakeSliderIndex}
              onValueChange={(id, value) => setDrakeInputs((previous) => ({ ...previous, [id]: value }))}
              onBack={goPrevious}
              onComplete={goNext}
              completeLabel="科学比較へ"
            />
          </StepShell>
        ) : null}

        {activeStep === "science" ? (
          <StepShell className={styles.foregroundStepShell}>
            <div className={styles.cardStack} key={`science-${activeStep}`}>
              {scienceRows.map((row, index) => (
                <article className={styles.infoCard} key={row.label} style={{ "--card-index": index } as CSSProperties}>
                  <h3>{row.label}</h3>
                  <span>{row.category}</span>
                  <em>あなたの設定: {row.stance}</em>
                  <small>{row.reason}</small>
                  <p>{row.body}</p>
                </article>
              ))}
            </div>
            <Note />
            <div className={styles.stickyActions}>
              <button className={styles.secondaryButton} type="button" onClick={goPrevious}>
                戻る
              </button>
              <button className={styles.primaryButton} type="button" onClick={goNext}>
                次へ
              </button>
            </div>
          </StepShell>
        ) : null}

        {activeStep === "visit" ? (
          <StepShell>
            <FocusSliderPanel
              sliders={visitSliders}
              values={visitInputs}
              activeIndex={activeVisitSliderIndex}
              onActiveIndexChange={setActiveVisitSliderIndex}
              onValueChange={(id, value) => setVisitInputs((previous) => ({ ...previous, [id]: value }))}
              onBack={goPrevious}
              onComplete={goNext}
              completeLabel="証拠を見る"
            />
          </StepShell>
        ) : null}

        {activeStep === "evidence" ? (
          <StepShell className={styles.foregroundStepShell}>
            <p className={styles.lead}>UFO証拠を選ぶと、プリセットされた証拠の強さで来訪説への更新量を計算します。</p>
            <div className={styles.evidenceGrid} data-swipe-ignore="true">
              {evidenceCards.map((card) => (
                <button
                  className={selectedEvidenceIds.includes(card.id) ? styles.evidenceCardActive : styles.evidenceCard}
                  key={card.id}
                  type="button"
                  onClick={() => toggleEvidence(card.id)}
                  aria-pressed={selectedEvidenceIds.includes(card.id)}
                >
                  <span className={styles.evidenceCheck} aria-hidden="true" />
                  <strong>{card.label}</strong>
                  <small>{card.signal}</small>
                  <span>{card.description}</span>
                  <em>{card.strengthLabel}</em>
                </button>
              ))}
            </div>
            <p className={styles.selectionSummary}>
              選択した証拠: {selectedEvidenceCards.length} 件 / この証拠の組み合わせでは {evidenceStrengthLabel}
            </p>
            <p className={styles.comment}>{getEvidenceComment(update.likelihoodRatio)}</p>
            <div className={styles.stickyActions}>
              <button className={styles.secondaryButton} type="button" onClick={goPrevious}>
                戻る
              </button>
              <button className={styles.primaryButton} type="button" onClick={goNext}>
                結果へ
              </button>
            </div>
          </StepShell>
        ) : null}

        {activeStep === "result" ? (
          <>
            <button className={styles.resultPeekButton} type="button" onClick={() => setResultExpanded((expanded) => !expanded)}>
              {resultExpanded ? "銀河に戻る" : "結果を見る"}
            </button>
            {resultExpanded ? (
              <StepShell>
                <h2 className={styles.resultSectionTitle}>3つの予測</h2>
                <div className={styles.resultMetricStack}>
                  <ResultMetric
                    label="通信可能な文明存在の予測"
                    value={formatPercent(drakeEstimate.existenceProbability)}
                    note={`少なくとも1つの文明 / 通信可能な文明 ${formatCount(drakeEstimate.civilizationCount)}`}
                    tone="intelligence"
                    flow="drake"
                  />
                  <ResultMetric
                    label="地球来訪の予測"
                    value={formatPercent(visitProbability)}
                    note="証拠を見る前の来訪可能性"
                    tone="visit"
                    flow="visit"
                  />
                  <ResultMetric
                    label="証拠確認後の来訪予測"
                    value={formatPercent(update.posterior)}
                    note="UFO証拠による更新後"
                    tone="evidence"
                    flow="evidence"
                  />
                </div>
                <p className={styles.resultCopy}>
                  あなたの前提では、生命が存在しうる候補は{drakeEstimate.lifeSignal > 0.25 ? "多め" : "控えめ"}に表示されました。
                  そこから知性体が存在しうる候補、通信可能な文明、地球に届く可能性へと別々に絞っています。
                </p>
                <p className={styles.resultCopy}>{getEvidenceComment(update.likelihoodRatio)}</p>
                <StarLegend />
                <Note />
                <div className={styles.resultActions}>
                  <button className={styles.secondaryButton} type="button" onClick={() => setActiveStep("drake")}>
                    前提を変えてもう一度
                  </button>
                  <button className={styles.secondaryButton} type="button" onClick={() => shareOnX("result")}>
                    Xで共有する
                  </button>
                  <button className={styles.primaryButton} type="button" onClick={reset}>
                    最初に戻る
                  </button>
                </div>
              </StepShell>
            ) : (
              <div className={styles.galaxyOnlyHint}>
                <span>あなたの銀河</span>
                <small>前提とUFO証拠で変化した、思考実験としての最終状態です。</small>
              </div>
            )}
          </>
        ) : null}

        {activeStep !== "intro" &&
        activeStep !== "result" &&
        activeStep !== "drake" &&
        activeStep !== "visit" &&
        activeStep !== "science" &&
        activeStep !== "evidence" ? (
          <div className={styles.navRow}>
            <button className={styles.secondaryButton} type="button" onClick={goPrevious} disabled={activeIndex === 0}>
              戻る
            </button>
            <button className={styles.primaryButton} type="button" onClick={goNext}>
              次へ
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
