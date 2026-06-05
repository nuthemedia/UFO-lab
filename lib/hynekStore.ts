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

export type HynekKvDiagnostics = {
  checkedAt: string;
  kvConfigured: boolean;
  kvConnected: boolean;
  index: {
    members: number;
    parsedSubmissions: number;
    missingOrInvalidSubmissions: number;
  };
  individualKeys: {
    keys: number;
    parsedSubmissions: number;
    invalidSubmissions: number;
  };
  legacyHash: {
    fields: number;
    parsedSubmissions: number;
    invalidSubmissions: number;
  };
  recoverableSubmissions: number;
  currentDashboardResponses: number;
  errors: string[];
};

export type HynekKvRepairResult = {
  checkedAt: string;
  dryRun: boolean;
  kvConfigured: boolean;
  kvConnected: boolean;
  recoverableSubmissions: number;
  indexMembersToWrite: number;
  currentKeysToWrite: number;
  repaired: boolean;
  message: string;
  errors: string[];
};

const STORE_PATH = process.env.HYNEK_STORE_PATH || path.join(os.tmpdir(), "hynek-store.json");
const KV_LEGACY_SUBMISSIONS_KEY = "hynek:submissions";
const KV_SUBMISSION_KEY_PREFIX = "hynek:submission:";
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

type KvClient = NonNullable<Awaited<ReturnType<typeof getKvClient>>>;

function entriesToState(entries: Array<readonly [string, HynekSubmission]>): StoreState {
  return {
    submissions: Object.fromEntries(entries),
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function uniqueEntries(...entryGroups: Array<Array<readonly [string, HynekSubmission]>>) {
  const submissions = new Map<string, HynekSubmission>();

  for (const entries of entryGroups) {
    for (const [userId, submission] of entries) {
      submissions.set(userId, submission);
    }
  }

  return Array.from(submissions.entries());
}

async function readKvEntriesByUserId(kv: KvClient, userIds: string[]) {
  const entries = await Promise.all(
    userIds.map(async (userId) => {
      const rawSubmission = await kv.get<unknown>(`${KV_SUBMISSION_KEY_PREFIX}${userId}`);
      const submission = parseStoredSubmission(rawSubmission);

      return submission ? ([userId, submission] as const) : null;
    }),
  );

  return entries.filter((entry): entry is readonly [string, HynekSubmission] => Boolean(entry));
}

async function scanKvSubmissionEntries(kv: KvClient) {
  const entries: Array<readonly [string, HynekSubmission]> = [];

  for await (const key of kv.scanIterator({ match: `${KV_SUBMISSION_KEY_PREFIX}*`, count: 100 })) {
    const rawSubmission = await kv.get<unknown>(key);
    const submission = parseStoredSubmission(rawSubmission);

    if (submission) {
      entries.push([submission.userId || key.slice(KV_SUBMISSION_KEY_PREFIX.length), submission]);
    }
  }

  return entries;
}

async function scanKvSubmissionKeys(kv: KvClient) {
  const keys: string[] = [];

  for await (const key of kv.scanIterator({ match: `${KV_SUBMISSION_KEY_PREFIX}*`, count: 100 })) {
    keys.push(key);
  }

  return keys;
}

async function readLegacyKvSubmissionEntries(kv: KvClient) {
  const rawSubmissions = (await kv.hgetall<Record<string, unknown>>(KV_LEGACY_SUBMISSIONS_KEY)) || {};

  return Object.entries(rawSubmissions).flatMap(([userId, rawSubmission]) => {
    const submission = parseStoredSubmission(rawSubmission);

    return submission ? [[userId, submission] as const] : [];
  });
}

async function repairKvSubmissionIndex(kv: KvClient, entries: Array<readonly [string, HynekSubmission]>) {
  if (entries.length === 0) {
    return;
  }

  const userIds = entries.map(([userId]) => userId);
  await kv.sadd(KV_SUBMISSION_INDEX_KEY, userIds[0], ...userIds.slice(1));
}

async function migrateLegacyKvSubmissions(kv: KvClient, entries: Array<readonly [string, HynekSubmission]>) {
  await Promise.all(
    entries.map(async ([userId, submission]) => {
      await kv.set(`${KV_SUBMISSION_KEY_PREFIX}${userId}`, JSON.stringify(submission), { nx: true });
    }),
  );
  await repairKvSubmissionIndex(kv, entries);
}

async function readKvState(kv: KvClient): Promise<StoreState> {
  const userIds = ((await kv.smembers(KV_SUBMISSION_INDEX_KEY)) || []) as string[];
  const indexedEntries = await readKvEntriesByUserId(kv, userIds);

  if (indexedEntries.length > 0) {
    return entriesToState(indexedEntries);
  }

  const scannedEntries = await scanKvSubmissionEntries(kv);

  if (scannedEntries.length > 0) {
    await repairKvSubmissionIndex(kv, scannedEntries);
    return entriesToState(scannedEntries);
  }

  const legacyEntries = await readLegacyKvSubmissionEntries(kv);

  if (legacyEntries.length > 0) {
    await migrateLegacyKvSubmissions(kv, legacyEntries);
    return entriesToState(legacyEntries);
  }

  return fallbackState;
}

export async function getHynekKvDiagnostics(): Promise<HynekKvDiagnostics> {
  const diagnostics: HynekKvDiagnostics = {
    checkedAt: currentTimestamp(),
    kvConfigured: hasKvConfig(),
    kvConnected: false,
    index: {
      members: 0,
      parsedSubmissions: 0,
      missingOrInvalidSubmissions: 0,
    },
    individualKeys: {
      keys: 0,
      parsedSubmissions: 0,
      invalidSubmissions: 0,
    },
    legacyHash: {
      fields: 0,
      parsedSubmissions: 0,
      invalidSubmissions: 0,
    },
    recoverableSubmissions: 0,
    currentDashboardResponses: 0,
    errors: [],
  };
  const kv = await getKvClient();

  if (!kv) {
    diagnostics.errors.push("KV_REST_API_URL or KV_REST_API_TOKEN is not configured.");
    return diagnostics;
  }

  diagnostics.kvConnected = true;

  try {
    const userIds = ((await kv.smembers(KV_SUBMISSION_INDEX_KEY)) || []) as string[];
    const indexedEntries = await readKvEntriesByUserId(kv, userIds);

    diagnostics.index.members = userIds.length;
    diagnostics.index.parsedSubmissions = indexedEntries.length;
    diagnostics.index.missingOrInvalidSubmissions = Math.max(0, userIds.length - indexedEntries.length);

    const individualKeys = await scanKvSubmissionKeys(kv);
    const individualEntries = await scanKvSubmissionEntries(kv);

    diagnostics.individualKeys.keys = individualKeys.length;
    diagnostics.individualKeys.parsedSubmissions = individualEntries.length;
    diagnostics.individualKeys.invalidSubmissions = Math.max(0, individualKeys.length - individualEntries.length);

    const rawLegacy = (await kv.hgetall<Record<string, unknown>>(KV_LEGACY_SUBMISSIONS_KEY)) || {};
    const legacyEntries = await readLegacyKvSubmissionEntries(kv);
    const legacyFieldCount = Object.keys(rawLegacy).length;

    diagnostics.legacyHash.fields = legacyFieldCount;
    diagnostics.legacyHash.parsedSubmissions = legacyEntries.length;
    diagnostics.legacyHash.invalidSubmissions = Math.max(0, legacyFieldCount - legacyEntries.length);
    diagnostics.recoverableSubmissions = uniqueEntries(indexedEntries, individualEntries, legacyEntries).length;
    diagnostics.currentDashboardResponses = diagnostics.recoverableSubmissions;
  } catch (error) {
    diagnostics.errors.push(errorMessage(error));
  }

  return diagnostics;
}

export async function repairHynekKvSubmissions({ dryRun }: { dryRun: boolean }): Promise<HynekKvRepairResult> {
  const result: HynekKvRepairResult = {
    checkedAt: currentTimestamp(),
    dryRun,
    kvConfigured: hasKvConfig(),
    kvConnected: false,
    recoverableSubmissions: 0,
    indexMembersToWrite: 0,
    currentKeysToWrite: 0,
    repaired: false,
    message: "",
    errors: [],
  };
  const kv = await getKvClient();

  if (!kv) {
    result.message = "KV is not configured. No repair was attempted.";
    result.errors.push("KV_REST_API_URL or KV_REST_API_TOKEN is not configured.");
    return result;
  }

  result.kvConnected = true;

  try {
    const userIds = ((await kv.smembers(KV_SUBMISSION_INDEX_KEY)) || []) as string[];
    const indexedEntries = await readKvEntriesByUserId(kv, userIds);
    const individualEntries = await scanKvSubmissionEntries(kv);
    const legacyEntries = await readLegacyKvSubmissionEntries(kv);
    const recoverableEntries = uniqueEntries(indexedEntries, individualEntries, legacyEntries);
    const currentUserIds = new Set(userIds);
    const currentKeyUserIds = new Set(individualEntries.map(([userId]) => userId));

    result.recoverableSubmissions = recoverableEntries.length;
    result.indexMembersToWrite = recoverableEntries.filter(([userId]) => !currentUserIds.has(userId)).length;
    result.currentKeysToWrite = recoverableEntries.filter(([userId]) => !currentKeyUserIds.has(userId)).length;

    if (recoverableEntries.length === 0) {
      result.message = "No recoverable Hynek submissions were found in the connected KV store.";
      return result;
    }

    if (dryRun) {
      result.message = "Dry run complete. No KV writes were performed.";
      return result;
    }

    await Promise.all(
      recoverableEntries.map(async ([userId, submission]) => {
        await kv.set(`${KV_SUBMISSION_KEY_PREFIX}${userId}`, JSON.stringify(submission), { nx: true });
      }),
    );
    await repairKvSubmissionIndex(kv, recoverableEntries);

    result.repaired = true;
    result.message = "Hynek KV submissions were repaired.";
  } catch (error) {
    result.errors.push(errorMessage(error));
    result.message = "Hynek KV repair failed.";
  }

  return result;
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
      return await readKvState(kv);
    } catch (error) {
      console.error("Hynek KV read failed", error);
      return fallbackState;
    }
  }

  try {
    const raw = await fs.readFile(/* turbopackIgnore: true */ STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoreState>;

    return {
      submissions: parsed.submissions || {},
    };
  } catch {
    return fallbackState;
  }
}

async function writeState(state: StoreState) {
  await fs.mkdir(path.dirname(/* turbopackIgnore: true */ STORE_PATH), { recursive: true });
  await fs.writeFile(/* turbopackIgnore: true */ STORE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

async function writeKvSubmission(submission: HynekSubmission) {
  const kv = await getKvClient();

  if (!kv) {
    return null;
  }

  const submissionKey = `${KV_SUBMISSION_KEY_PREFIX}${submission.userId}`;
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
