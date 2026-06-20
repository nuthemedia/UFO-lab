import type { DrakeInputs, VisitInputs } from "@/lib/drakeMath";

export type DrakeStepId = "intro" | "drake" | "science" | "visit" | "evidence" | "result";

export type SliderDefinition<T extends string> = {
  id: T;
  label: string;
  lowLabel: string;
  highLabel: string;
  tone?: "life" | "intelligence" | "civilization" | "visit";
};

export type EvidenceCard = {
  id: string;
  label: string;
  description: string;
  signal: string;
  strengthLabel: string;
  likelihoodIfVisit: number;
  likelihoodIfNoVisit: number;
};

export const drakeSteps: { id: DrakeStepId; label: string }[] = [
  { id: "intro", label: "導入" },
  { id: "drake", label: "存在" },
  { id: "science", label: "科学比較" },
  { id: "visit", label: "来訪" },
  { id: "evidence", label: "証拠" },
  { id: "result", label: "結果" },
];

export const defaultDrakeInputs: DrakeInputs = {
  planetAbundance: 0.72,
  lifeChance: 0.34,
  intelligenceChance: 0.18,
  civilizationLifetime: 0.22,
};

export const defaultVisitInputs: VisitInputs = {
  sameEra: 0.28,
  discoveredEarth: 0.2,
  travelCapability: 0.16,
  motivation: 0.24,
  observable: 0.3,
};

export const drakeSliders: SliderDefinition<keyof DrakeInputs>[] = [
  { id: "planetAbundance", label: "惑星を持つ星の割合", lowLabel: "まれ", highLabel: "多い", tone: "life" },
  { id: "lifeChance", label: "生命の生まれる確率", lowLabel: "難しい", highLabel: "起きやすい", tone: "life" },
  { id: "intelligenceChance", label: "知性をもつ進化の確率", lowLabel: "まれ", highLabel: "進みやすい", tone: "intelligence" },
  { id: "civilizationLifetime", label: "文明の続く長さ", lowLabel: "短い", highLabel: "長い", tone: "civilization" },
];

export const visitSliders: SliderDefinition<keyof VisitInputs>[] = [
  { id: "sameEra", label: "人類と同じ時代に存在している確率", lowLabel: "ずれている", highLabel: "重なる", tone: "visit" },
  { id: "discoveredEarth", label: "地球を発見している確率", lowLabel: "見つけにくい", highLabel: "見つけやすい", tone: "visit" },
  {
    id: "travelCapability",
    label: "恒星間移動または探査機送付が可能な確率",
    lowLabel: "難しい",
    highLabel: "可能",
    tone: "visit",
  },
  { id: "motivation", label: "地球に来る動機がある確率", lowLabel: "低い", highLabel: "高い", tone: "visit" },
  { id: "observable", label: "人類に観測される確率", lowLabel: "見えにくい", highLabel: "観測されやすい", tone: "visit" },
];

export const defaultSelectedEvidenceIds = ["photo-video"];

export const evidenceCards: EvidenceCard[] = [
  {
    id: "witness",
    label: "目撃証言",
    description: "ひとりまたは少数の観測者による証言。",
    signal: "観測記録",
    strengthLabel: "ほぼ中立",
    likelihoodIfVisit: 0.52,
    likelihoodIfNoVisit: 0.5,
  },
  {
    id: "multiple-witnesses",
    label: "複数の目撃者",
    description: "独立した複数人が似た現象を報告している。",
    signal: "独立証言",
    strengthLabel: "弱い更新",
    likelihoodIfVisit: 0.56,
    likelihoodIfNoVisit: 0.5,
  },
  {
    id: "photo-video",
    label: "写真・映像",
    description: "画像や動画として残っているが、解釈の余地がある。",
    signal: "映像記録",
    strengthLabel: "弱い更新",
    likelihoodIfVisit: 0.55,
    likelihoodIfNoVisit: 0.5,
  },
  {
    id: "infrared",
    label: "赤外線映像",
    description: "可視光以外のセンサーで記録されている。",
    signal: "IRセンサー",
    strengthLabel: "弱い更新",
    likelihoodIfVisit: 0.58,
    likelihoodIfNoVisit: 0.5,
  },
  {
    id: "radar",
    label: "レーダー記録",
    description: "目視とは別に機器上の反応が残っている。",
    signal: "レーダー",
    strengthLabel: "少し強い",
    likelihoodIfVisit: 0.6,
    likelihoodIfNoVisit: 0.48,
  },
  {
    id: "multi-sensor",
    label: "複数センサー",
    description: "異なる種類の観測が同じ現象を示している。",
    signal: "複合観測",
    strengthLabel: "中くらい",
    likelihoodIfVisit: 0.64,
    likelihoodIfNoVisit: 0.44,
  },
  {
    id: "physical",
    label: "物証",
    description: "痕跡や試料など、物理的な手がかりがある。",
    signal: "物理的痕跡",
    strengthLabel: "強い更新",
    likelihoodIfVisit: 0.7,
    likelihoodIfNoVisit: 0.35,
  },
  {
    id: "independent-review",
    label: "独立機関による検証",
    description: "利害の離れた機関が調査・検証している。",
    signal: "独立検証",
    strengthLabel: "やや強い",
    likelihoodIfVisit: 0.68,
    likelihoodIfNoVisit: 0.4,
  },
];
