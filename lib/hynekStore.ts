import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { aggregateHynekSubmissions } from "@/lib/hynekDashboardData";

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

function parseStoredSubmission(rawSubmission: unknown): HynekSubmission | null {
  if (typeof rawSubmission === "string") {
    try {
      return JSON.parse(rawSubmission) as HynekSubmission;
    } catch {
      return null;
    }
  }

  if (rawSubmission && typeof rawSubmission === "object") {
    return rawSubmission as HynekSubmission;
  }

  return null;
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
      const entries = await Promise.all(
        userIds.map(async (userId) => {
          const rawSubmission = await kv.get<unknown>(`hynek:submission:${userId}`);
          const submission = parseStoredSubmission(rawSubmission);

          return submission ? ([userId, submission] as const) : null;
        }),
      );
      const submissions = Object.fromEntries(
        entries.filter((entry): entry is readonly [string, HynekSubmission] => Boolean(entry)),
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
  return aggregateHynekSubmissions(Object.values(state.submissions));
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

export async function getHynekDashboardSubmissions() {
  const state = await readState();

  return Object.values(state.submissions);
}

export function createHynekSubmission(submission: Omit<HynekSubmission, "submittedAt">) {
  return {
    ...submission,
    submittedAt: currentTimestamp(),
  };
}
