import type { HynekDashboardData, HynekSubmission, UfoTypeId } from "@/lib/hynekStore";

const TYPE_PRIORITY: UfoTypeId[] = [
  "evidence",
  "cautious",
  "romantic",
  "wonder",
  "news",
  "witness",
  "entertainment",
  "contact",
];

export const HYNEK_PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

const PREFECTURE_SET = new Set(HYNEK_PREFECTURES);

export type HynekDashboardFilterMode = "all" | "witness" | "age" | "region";

export type HynekDashboardFilterState = {
  mode: HynekDashboardFilterMode;
  age: string;
  region: string;
};

function emptyCounts() {
  return {
    totalResponses: 0,
    typeCounts: {
      evidence: 0,
      cautious: 0,
      romantic: 0,
      witness: 0,
      wonder: 0,
      news: 0,
      entertainment: 0,
      contact: 0,
    },
    q2Counts: {},
    q3Counts: {},
    q4Counts: {},
    q6Counts: {},
    q8Counts: {},
    q9Counts: {},
    q10Counts: {},
    q11Counts: {},
    q12Counts: {},
    q13Counts: {},
    ageCounts: {},
    genderCounts: {},
    regionCounts: {},
    witnessRegionCounts: {},
  } satisfies HynekDashboardData["counts"];
}

function increment(map: Record<string, number>, key: string) {
  const normalizedKey = key.trim();
  if (!normalizedKey) {
    return;
  }

  map[normalizedKey] = (map[normalizedKey] || 0) + 1;
}

function currentTimestamp() {
  return new Date().toISOString();
}

function countOf(map: Record<string, number>, key: string) {
  return map[key] || 0;
}

function isWitnessSubmission(submission: HynekSubmission) {
  return ["certain", "maybe"].includes(submission.answers.questions.q11);
}

export function filterHynekSubmissions(submissions: HynekSubmission[], filter: HynekDashboardFilterState) {
  if (filter.mode === "witness") {
    return submissions.filter(isWitnessSubmission);
  }

  if (filter.mode === "age") {
    return filter.age ? submissions.filter((submission) => submission.answers.age === filter.age) : submissions;
  }

  if (filter.mode === "region") {
    return filter.region ? submissions.filter((submission) => submission.answers.region === filter.region) : submissions;
  }

  return submissions;
}

export function aggregateHynekSubmissions(submissions: HynekSubmission[]): HynekDashboardData {
  const counts = emptyCounts();

  for (const submission of submissions) {
    counts.totalResponses += 1;
    counts.typeCounts[submission.resultType] += 1;

    increment(counts.q2Counts, submission.answers.questions.q2);
    increment(counts.q3Counts, submission.answers.questions.q3);
    increment(counts.q4Counts, submission.answers.questions.q4);
    increment(counts.q6Counts, submission.answers.questions.q6);
    increment(counts.q8Counts, submission.answers.questions.q8);
    increment(counts.q9Counts, submission.answers.questions.q9);
    increment(counts.q10Counts, submission.answers.questions.q10);
    increment(counts.q11Counts, submission.answers.questions.q11);
    increment(counts.q12Counts, submission.answers.questions.q12);
    increment(counts.q13Counts, submission.answers.questions.q13);
    increment(counts.ageCounts, submission.answers.age);
    increment(counts.genderCounts, submission.answers.gender);
    increment(counts.regionCounts, submission.answers.region);

    if (isWitnessSubmission(submission) && PREFECTURE_SET.has(submission.answers.region)) {
      increment(counts.witnessRegionCounts, submission.answers.region);
    }
  }

  const topType = TYPE_PRIORITY.reduce<UfoTypeId | null>((best, typeId) => {
    if (!best) {
      return typeId;
    }

    const bestCount = counts.typeCounts[best];
    const currentCount = counts.typeCounts[typeId];

    if (currentCount > bestCount) {
      return typeId;
    }

    return best;
  }, null);

  const summary = {
    topTypeId: topType,
    topTypeCount: topType ? counts.typeCounts[topType] : 0,
    sightingRate: counts.totalResponses
      ? Math.round(((countOf(counts.q11Counts, "certain") + countOf(counts.q11Counts, "maybe")) / counts.totalResponses) * 100)
      : 0,
    alienExistenceRate: counts.totalResponses
      ? Math.round(((countOf(counts.q3Counts, "certain") + countOf(counts.q3Counts, "likely")) / counts.totalResponses) * 100)
      : 0,
    shipRate: counts.totalResponses ? Math.round((countOf(counts.q2Counts, "ship") / counts.totalResponses) * 100) : 0,
    secretRate: counts.totalResponses
      ? Math.round(((countOf(counts.q6Counts, "hide") + countOf(counts.q6Counts, "some")) / counts.totalResponses) * 100)
      : 0,
    updatedAt: currentTimestamp(),
  } satisfies HynekDashboardData["summary"];

  return { counts, summary };
}
