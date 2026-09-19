import type { JennyQuestionId } from "@/data/jenny/questions";
import type { JennySignalGroup, JennySignalTone } from "@/lib/jenny/types";

export type JennySignalDefinition = {
  id: JennyQuestionId;
  group: JennySignalGroup;
  label: string;
  max: number;
  tone: JennySignalTone;
};

export const JENNY_SIGNAL_DEFINITIONS: readonly JennySignalDefinition[] = [
  { id: "reliability", group: "report", label: "報告の確からしさ", max: 10, tone: "sage" },
  { id: "detailSpecificity", group: "report", label: "記述の具体性", max: 100, tone: "sage" },
  { id: "spatiotemporalConsistency", group: "report", label: "時空間的一貫性", max: 100, tone: "sage" },
  { id: "sourceTraceability", group: "report", label: "情報源の追跡性", max: 100, tone: "sage" },
  { id: "strangeness", group: "encounter", label: "ストレンジネス", max: 10, tone: "ice" },
  { id: "closeEncounter", group: "encounter", label: "近接遭遇分類", max: 100, tone: "ice" },
  { id: "proximity", group: "encounter", label: "接近度", max: 100, tone: "ice" },
  { id: "physicalEffects", group: "encounter", label: "物理・環境作用", max: 100, tone: "ice" },
  { id: "entityPresence", group: "encounter", label: "存在者・搭乗者", max: 100, tone: "ice" },
  { id: "trueUfo", group: "alternatives", label: "TRUE UFO度", max: 100, tone: "ice" },
  { id: "astronomicalExplanation", group: "alternatives", label: "天体説明", max: 100, tone: "ice" },
  { id: "humanAerialExplanation", group: "alternatives", label: "人工飛翔物説明", max: 100, tone: "ice" },
  { id: "atmosphericOpticalExplanation", group: "alternatives", label: "気象・光学説明", max: 100, tone: "ice" },
  { id: "evidenceStrength", group: "evidence", label: "証拠強度", max: 100, tone: "sage" },
  { id: "independentWitnesses", group: "evidence", label: "独立した複数目撃", max: 100, tone: "sage" },
  { id: "recordingSensorEvidence", group: "evidence", label: "記録・センサー証拠", max: 100, tone: "sage" },
  { id: "physicalDocumentaryEvidence", group: "evidence", label: "物理・同時代資料", max: 100, tone: "sage" },
  { id: "fakeIndicators", group: "fake", label: "フェイク兆候", max: 100, tone: "amber" },
  { id: "contradictions", group: "fake", label: "内部・時系列矛盾", max: 100, tone: "amber" },
  { id: "fabricationSignals", group: "fake", label: "創作・加工兆候", max: 100, tone: "amber" },
] as const;
