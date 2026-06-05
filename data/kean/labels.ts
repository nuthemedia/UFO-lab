import type { BeginnerTier, PersonCategory } from "@/data/kean/types";

export const keanPersonCategoryLabels: Record<PersonCategory, string> = {
  journalist: "記者・報道",
  whistleblower: "内部告発・証言",
  pilot: "パイロット",
  government: "政府・議会",
  senator: "上院",
  researcher: "研究・民間活動",
  skeptic: "検証・懐疑分析",
  filmmaker: "映像・メディア",
  "japan-politics": "日本政治",
  "public-figure": "公的発信",
  "controversial-claimant": "要注意の主張者",
};

export const keanBeginnerTierLabels: Record<BeginnerTier, string> = {
  core: "まず読む",
  important: "重要人物",
  context: "文脈理解",
};

export const keanTagLabels: Record<string, string> = {
  AATIP: "AATIP",
  "Area 51": "エリア51",
  "Las Vegas": "ラスベガス報道",
  NYT: "New York Times報道",
  PURSUE: "PURSUE公開",
  "The Debrief": "The Debrief報道",
  UAPTF: "UAP Task Force",
  analysis: "分析・検証",
  claims: "主張・証言",
  controversial: "検証上の注意",
  culture: "文化的影響",
  disclosure: "ディスクロージャー運動",
  documentary: "ドキュメンタリー",
  film: "映画",
  government: "政府関係",
  hearing: "議会公聴会",
  internet: "ネット発信",
  interview: "インタビュー",
  journalism: "報道・ジャーナリズム",
  media: "メディア発信",
  navy: "海軍",
  ocean: "海洋・安全保障",
  policy: "政策・制度",
  "public communication": "公的発信",
  skeptic: "懐疑・検証",
  video: "映像公開",
  whistleblower: "内部告発",
};

export function getKeanTagLabel(tag: string) {
  return keanTagLabels[tag] ?? tag;
}
