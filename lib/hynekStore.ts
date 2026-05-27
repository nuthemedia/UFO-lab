import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

export type UfoTypeId =
  | "evidence"
  | "cautious"
  | "romantic"
  | "witness"
  | "wonder"
  | "news"
  | "entertainment"
  | "contact";

export type QuestionId =
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q5"
  | "q6"
  | "q7"
  | "q8"
  | "q9"
  | "q10"
  | "q11"
  | "q12"
  | "q13"
  | "q14"
  | "q15";

export type AnswersState = {
  questions: Record<QuestionId, string>;
  age: string;
  gender: string;
  region: string;
};

export type HynekSubmission = {
  userId: string;
  submittedAt: string;
  resultType: UfoTypeId;
  totalScore: number;
  answers: AnswersState;
};

export type HynekDashboardCounts = {
  totalResponses: number;
  typeCounts: Record<UfoTypeId, number>;
  q2Counts: Record<string, number>;
  q3Counts: Record<string, number>;
  q4Counts: Record<string, number>;
  q6Counts: Record<string, number>;
  q8Counts: Record<string, number>;
  q9Counts: Record<string, number>;
  q10Counts: Record<string, number>;
  q11Counts: Record<string, number>;
  q12Counts: Record<string, number>;
  q13Counts: Record<string, number>;
  ageCounts: Record<string, number>;
  genderCounts: Record<string, number>;
  regionCounts: Record<string, number>;
  witnessRegionCounts: Record<string, number>;
};

export type HynekDashboardSummary = {
  topTypeId: UfoTypeId | null;
  topTypeCount: number;
  sightingRate: number;
  alienExistenceRate: number;
  shipRate: number;
  secretRate: number;
  updatedAt: string;
};

export type HynekDashboardData = {
  counts: HynekDashboardCounts;
  summary: HynekDashboardSummary;
};

type StoreState = {
  submissions: Record<string, HynekSubmission>;
};

const STORE_PATH = process.env.HYNEK_STORE_PATH || path.join(os.tmpdir(), "hynek-store.json");
const KV_SUBMISSION_INDEX_KEY = "hynek:submission-users";

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

const PREFECTURE_SET = new Set([
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
]);

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
  } satisfies HynekDashboardCounts;
}

const fallbackState: StoreState = {
  submissions: {},
};

function hasKvConfig() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKvClient() {
  if (!hasKvConfig()) {
    return null;
  }

  const { kv } = await import("@vercel/kv");

  return kv;
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

function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  const value = cookie?.split("=").slice(1).join("=");

  return value ? decodeURIComponent(value) : null;
}

async function readState(): Promise<StoreState> {
  const kv = await getKvClient();

  if (kv) {
    try {
      const userIds = (await kv.smembers<string[]>(KV_SUBMISSION_INDEX_KEY)) || [];
      const submissionKeys = userIds.map((userId) => `hynek:submission:${userId}`);
      const rawSubmissions = submissionKeys.length ? await kv.mget(...submissionKeys) : [];
      const submissions = Object.fromEntries(
        userIds.flatMap((userId, index) => {
          const rawSubmission = rawSubmissions[index];

          if (typeof rawSubmission !== "string") {
            return [];
          }

          try {
            return [[userId, JSON.parse(rawSubmission) as HynekSubmission]];
          } catch {
            return [];
          }
        }),
      );

      return { submissions };
    } catch {
      return fallbackState;
    }
  }

  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoreState>;

    return {
      submissions: parsed.submissions || {},
    };
  } catch {
    return fallbackState;
  }
}

async function writeState(state: StoreState) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

async function writeKvSubmission(submission: HynekSubmission) {
  const kv = await getKvClient();

  if (!kv) {
    return null;
  }

  const submissionKey = `hynek:submission:${submission.userId}`;
  const inserted = await kv.set(submissionKey, JSON.stringify(submission), { nx: true });

  if (inserted) {
    await kv.sadd(KV_SUBMISSION_INDEX_KEY, submission.userId);
  }

  return inserted !== null;
}

function aggregateState(state: StoreState): HynekDashboardData {
  const counts = emptyCounts();

  for (const submission of Object.values(state.submissions)) {
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

  const summary: HynekDashboardSummary = {
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
  };

  return { counts, summary };
}

export function getHynekUserId(request: Request) {
  return readCookie(request, "hynek_user_id");
}

export async function recordHynekSubmission(submission: HynekSubmission) {
  const recordedInKv = await writeKvSubmission(submission);

  if (typeof recordedInKv === "boolean") {
    const dashboard = await getHynekDashboardData();

    return {
      recorded: recordedInKv,
      totalResponses: dashboard.counts.totalResponses,
      dashboard,
    };
  }

  const state = await readState();
  const alreadyRecorded = Boolean(state.submissions[submission.userId]);

  if (!alreadyRecorded) {
    state.submissions[submission.userId] = submission;
    await writeState(state);
  }

  const dashboard = aggregateState(state);

  return {
    recorded: !alreadyRecorded,
    totalResponses: dashboard.counts.totalResponses,
    dashboard,
  };
}

export async function getHynekDashboardData() {
  return aggregateState(await readState());
}

export function hasHynekWitnessRegion(region: string) {
  return PREFECTURE_SET.has(region);
}

export function createHynekSubmission(submission: Omit<HynekSubmission, "submittedAt">) {
  return {
    ...submission,
    submittedAt: currentTimestamp(),
  };
}
