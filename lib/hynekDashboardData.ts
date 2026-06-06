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
const AGE_FILTER_OPTIONS = ["10代", "20代", "30代", "40代", "50代", "60代以上", "回答しない"];
const REGION_FILTER_OPTIONS = [...HYNEK_PREFECTURES, "海外", "回答しない"];

export type HynekDashboardFilterMode = "all" | "witness" | "age" | "region";

export type HynekDashboardFilterState = {
  mode: HynekDashboardFilterMode;
  age: string;
  region: string;
};

export type HynekDashboardViews = {
  all: HynekDashboardData;
  witness: HynekDashboardData;
  byAge: Record<string, HynekDashboardData>;
  byRegion: Record<string, HynekDashboardData>;
};

function emptyCounts(): HynekDashboardData["counts"] {
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

function cloneCounts(counts: HynekDashboardData["counts"]) {
  return {
    totalResponses: counts.totalResponses,
    typeCounts: { ...counts.typeCounts },
    q2Counts: { ...counts.q2Counts },
    q3Counts: { ...counts.q3Counts },
    q4Counts: { ...counts.q4Counts },
    q6Counts: { ...counts.q6Counts },
    q8Counts: { ...counts.q8Counts },
    q9Counts: { ...counts.q9Counts },
    q10Counts: { ...counts.q10Counts },
    q11Counts: { ...counts.q11Counts },
    q12Counts: { ...counts.q12Counts },
    q13Counts: { ...counts.q13Counts },
    ageCounts: { ...counts.ageCounts },
    genderCounts: { ...counts.genderCounts },
    regionCounts: { ...counts.regionCounts },
    witnessRegionCounts: { ...counts.witnessRegionCounts },
  } satisfies HynekDashboardData["counts"];
}

function mergeMapCounts(target: Record<string, number>, source: Record<string, number>) {
  for (const [key, value] of Object.entries(source)) {
    target[key] = (target[key] || 0) + value;
  }
}

function summaryFromCounts(counts: HynekDashboardData["counts"]) {
  const topType = TYPE_PRIORITY.reduce<UfoTypeId | null>((best, typeId) => {
    if (!best) {
      return typeId;
    }

    return counts.typeCounts[typeId] > counts.typeCounts[best] ? typeId : best;
  }, null);

  return {
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
}

function addDashboardData(base: HynekDashboardData, addition: HynekDashboardData) {
  const counts = cloneCounts(base.counts);

  counts.totalResponses += addition.counts.totalResponses;
  mergeMapCounts(counts.typeCounts, addition.counts.typeCounts);
  mergeMapCounts(counts.q2Counts, addition.counts.q2Counts);
  mergeMapCounts(counts.q3Counts, addition.counts.q3Counts);
  mergeMapCounts(counts.q4Counts, addition.counts.q4Counts);
  mergeMapCounts(counts.q6Counts, addition.counts.q6Counts);
  mergeMapCounts(counts.q8Counts, addition.counts.q8Counts);
  mergeMapCounts(counts.q9Counts, addition.counts.q9Counts);
  mergeMapCounts(counts.q10Counts, addition.counts.q10Counts);
  mergeMapCounts(counts.q11Counts, addition.counts.q11Counts);
  mergeMapCounts(counts.q12Counts, addition.counts.q12Counts);
  mergeMapCounts(counts.q13Counts, addition.counts.q13Counts);
  mergeMapCounts(counts.ageCounts, addition.counts.ageCounts);
  mergeMapCounts(counts.genderCounts, addition.counts.genderCounts);
  mergeMapCounts(counts.regionCounts, addition.counts.regionCounts);
  mergeMapCounts(counts.witnessRegionCounts, addition.counts.witnessRegionCounts);

  return {
    counts,
    summary: summaryFromCounts(counts),
  };
}

export function emptyHynekDashboardData() {
  const counts = emptyCounts();

  return {
    counts,
    summary: summaryFromCounts(counts),
  };
}

export function aggregateHynekDashboardViews(submissions: HynekSubmission[]): HynekDashboardViews {
  return {
    all: aggregateHynekSubmissions(submissions),
    witness: aggregateHynekSubmissions(submissions.filter(isWitnessSubmission)),
    byAge: Object.fromEntries(AGE_FILTER_OPTIONS.map((age) => [age, aggregateHynekSubmissions(submissions.filter((submission) => submission.answers.age === age))])),
    byRegion: Object.fromEntries(
      REGION_FILTER_OPTIONS.map((region) => [region, aggregateHynekSubmissions(submissions.filter((submission) => submission.answers.region === region))]),
    ),
  };
}

export function addHynekSubmissionToDashboardViews(views: HynekDashboardViews, submission: HynekSubmission): HynekDashboardViews {
  const singleSubmissionData = aggregateHynekSubmissions([submission]);
  const age = submission.answers.age;
  const region = submission.answers.region;

  return {
    all: addDashboardData(views.all, singleSubmissionData),
    witness: isWitnessSubmission(submission) ? addDashboardData(views.witness, singleSubmissionData) : views.witness,
    byAge: {
      ...views.byAge,
      [age]: addDashboardData(views.byAge[age] || emptyHynekDashboardData(), singleSubmissionData),
    },
    byRegion: {
      ...views.byRegion,
      [region]: addDashboardData(views.byRegion[region] || emptyHynekDashboardData(), singleSubmissionData),
    },
  };
}

export function emptyHynekDashboardViews(): HynekDashboardViews {
  return {
    all: emptyHynekDashboardData(),
    witness: emptyHynekDashboardData(),
    byAge: {},
    byRegion: {},
  };
}
