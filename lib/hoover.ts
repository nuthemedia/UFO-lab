export type HooverOcrQuality = "high" | "medium" | "low" | "unknown";

export type HooverWarningFlag =
  | "AI/OCR転写"
  | "原文確認推奨"
  | "判読不能箇所あり"
  | "黒塗りあり"
  | "手作業サンプル";

export type HooverPage = {
  id: string;
  source: string;
  documentId: string;
  sectionOrSerial: string;
  pageNumber: number;
  sourcePdfUrl: string;
  sourcePdfPageUrl: string;
  textEn: string;
  translationJa: string;
  summaryJa: string;
  pointsJa: string[];
  keywordsJa: string[];
  keywordsEn: string[];
  topicsJa: string[];
  people: string[];
  organizations: string[];
  places: string[];
  year: number | null;
  dateLabelJa: string | null;
  documentTypeJa: string | null;
  ocrQuality: HooverOcrQuality;
  warningFlags: HooverWarningFlag[];
  strangenessScore?: 0 | 1 | 2 | 3 | 4 | 5;
  reliabilityScore?: 0 | 1 | 2 | 3 | 4 | 5;
  strangenessLabelJa?: "高" | "中" | "低" | "該当なし";
  reliabilityLabelJa?: "高" | "中" | "低" | "不明";
  strangenessReasonsJa?: string[];
  reliabilityReasonsJa?: string[];
  sightingFeatures?: string[];
  classificationCautionJa?: string;
};

export const hooverOcrQualityLabels: Record<HooverOcrQuality, string> = {
  high: "高",
  medium: "中",
  low: "低",
  unknown: "不明",
};

export const hooverScoreLabels = {
  strangeness: {
    0: "該当なし",
    1: "低",
    2: "低",
    3: "中",
    4: "高",
    5: "高",
  } as const,
  reliability: {
    0: "不明",
    1: "低",
    2: "低",
    3: "中",
    4: "高",
    5: "高",
  } as const,
};

export function formatHooverOptionalText(value: string | null | undefined) {
  return value && value.trim() ? value.trim() : "不明";
}

export function formatHooverOptionalYear(value: number | null | undefined) {
  return typeof value === "number" ? String(value) : "不明";
}

export function getHooverScoreLabel(kind: "strangeness" | "reliability", score: 0 | 1 | 2 | 3 | 4 | 5) {
  return hooverScoreLabels[kind][score];
}

export function getHooverSearchText(page: HooverPage) {
  return [
    page.id,
    page.source,
    page.documentId,
    page.sectionOrSerial,
    String(page.pageNumber),
    page.textEn,
    page.translationJa,
    page.summaryJa,
    page.documentTypeJa || "",
    page.dateLabelJa || "",
    ...page.pointsJa,
    ...page.keywordsJa,
    ...page.keywordsEn,
    ...page.topicsJa,
    ...page.people,
    ...page.organizations,
    ...page.places,
    ...page.warningFlags,
    page.classificationCautionJa || "",
    ...(page.strangenessReasonsJa || []),
    ...(page.reliabilityReasonsJa || []),
    ...(page.sightingFeatures || []),
  ]
    .join(" ")
    .toLowerCase();
}
