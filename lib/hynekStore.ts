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

const fallbackState: StoreState = {
  submissions: {},
};

function currentTimestamp() {
  return new Date().toISOString();
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

function aggregateState(state: StoreState): HynekDashboardData {
  return aggregateHynekSubmissions(Object.values(state.submissions));
}

export function getHynekUserId(request: Request) {
  return readCookie(request, "hynek_user_id");
}

export async function recordHynekSubmission(submission: HynekSubmission) {
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
