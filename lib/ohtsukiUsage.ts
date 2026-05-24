import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

export const OHTSUKI_USER_DAILY_LIMIT = 3;
export const OHTSUKI_DAILY_TOTAL_LIMIT = 500;
export const OHTSUKI_MONTHLY_TOTAL_LIMIT = 2000;
export const OHTSUKI_DAILY_GUARD_REMAINING = 50;
export const OHTSUKI_MONTHLY_GUARD_REMAINING = 200;

type StoreState = {
  users: Record<string, number>;
  dailyTotals: Record<string, number>;
  monthlyTotals: Record<string, number>;
  developerDailyTotals: Record<string, number>;
  developerMonthlyTotals: Record<string, number>;
};

type UsageSnapshot = {
  userDaily: number;
  dailyTotal: number;
  monthlyTotal: number;
  developerDaily: number;
  developerMonthly: number;
};

const STORE_PATH = process.env.OHTSUKI_USAGE_STORE_PATH || path.join(os.tmpdir(), "ohtsuki-usage.json");

const fallbackState: StoreState = {
  users: {},
  dailyTotals: {},
  monthlyTotals: {},
  developerDailyTotals: {},
  developerMonthlyTotals: {},
};

function currentDayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function currentMonthKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
}

function userKey(userId: string, dayKey = currentDayKey()) {
  return `${userId}:${dayKey}`;
}

async function readState(): Promise<StoreState> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<StoreState>;

    return {
      users: parsed.users || {},
      dailyTotals: parsed.dailyTotals || {},
      monthlyTotals: parsed.monthlyTotals || {},
      developerDailyTotals: parsed.developerDailyTotals || {},
      developerMonthlyTotals: parsed.developerMonthlyTotals || {},
    };
  } catch {
    return fallbackState;
  }
}

async function writeState(state: StoreState) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

export function getOhtsukiUserId(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("ohtsuki_user_id="));
  const value = cookie?.split("=").slice(1).join("=");

  return value ? decodeURIComponent(value) : null;
}

export function isLocalRequest(request: Request) {
  const host = request.headers.get("host") || "";

  return (
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]") ||
    host.includes("localhost:")
  );
}

export function isDeveloperRequest(request: Request) {
  if (!isLocalRequest(request)) {
    return false;
  }

  const expected = process.env.OHTSUKI_DEVELOPER_TOKEN;
  const headerToken = request.headers.get("x-ohtsuki-developer-token");

  return Boolean(expected && headerToken && expected === headerToken);
}

export async function getUsageSnapshot(userId: string): Promise<UsageSnapshot> {
  const state = await readState();
  const dayKey = currentDayKey();
  const monthKey = currentMonthKey();

  return {
    userDaily: state.users[userKey(userId, dayKey)] || 0,
    dailyTotal: state.dailyTotals[dayKey] || 0,
    monthlyTotal: state.monthlyTotals[monthKey] || 0,
    developerDaily: state.developerDailyTotals[dayKey] || 0,
    developerMonthly: state.developerMonthlyTotals[monthKey] || 0,
  };
}

export async function recordDetailedUsage(userId: string, isDeveloper = false) {
  const state = await readState();
  const dayKey = currentDayKey();
  const monthKey = currentMonthKey();
  const key = userKey(userId, dayKey);

  state.users[key] = (state.users[key] || 0) + 1;
  state.dailyTotals[dayKey] = (state.dailyTotals[dayKey] || 0) + 1;
  state.monthlyTotals[monthKey] = (state.monthlyTotals[monthKey] || 0) + 1;

  if (isDeveloper) {
    state.developerDailyTotals[dayKey] = (state.developerDailyTotals[dayKey] || 0) + 1;
    state.developerMonthlyTotals[monthKey] = (state.developerMonthlyTotals[monthKey] || 0) + 1;
  }

  await writeState(state);
}

export function buildQuotaStatus(snapshot: UsageSnapshot, isDeveloper: boolean, hasApiKey: boolean) {
  const userRemaining = Math.max(0, OHTSUKI_USER_DAILY_LIMIT - snapshot.userDaily);
  const dailyRemaining = Math.max(0, OHTSUKI_DAILY_TOTAL_LIMIT - snapshot.dailyTotal);
  const monthlyRemaining = Math.max(0, OHTSUKI_MONTHLY_TOTAL_LIMIT - snapshot.monthlyTotal);
  const userLimitReached = snapshot.userDaily >= OHTSUKI_USER_DAILY_LIMIT;
  const guardReached =
    dailyRemaining <= OHTSUKI_DAILY_GUARD_REMAINING || monthlyRemaining <= OHTSUKI_MONTHLY_GUARD_REMAINING;
  const hardLimitReached = dailyRemaining <= 0 || monthlyRemaining <= 0;

  if (!hasApiKey) {
    return {
      mode: "simple" as const,
      canUseSightengine: false,
      reason: "api_key_missing" as const,
      notice: "Sightengine APIキーが未設定です。メタデータとファイル情報による簡易判定を表示しています。",
      userRemaining,
      dailyRemaining,
      monthlyRemaining,
      snapshot,
    };
  }

  if (hardLimitReached) {
    return {
      mode: "simple" as const,
      canUseSightengine: false,
      reason: "system_limit" as const,
      notice:
        "現在、詳細AI判定は一時停止中です。無料枠保護のため、外部AI判定APIを使用せず、簡易判定を表示しています。",
      userRemaining,
      dailyRemaining,
      monthlyRemaining,
      snapshot,
    };
  }

  if (!isDeveloper && userLimitReached) {
    return {
      mode: "simple" as const,
      canUseSightengine: false,
      reason: "user_daily_limit" as const,
      notice: "本日の詳細AI判定は上限に達しました。この結果は簡易判定として表示しています。",
      userRemaining,
      dailyRemaining,
      monthlyRemaining,
      snapshot,
    };
  }

  if (!isDeveloper && guardReached) {
    return {
      mode: "simple" as const,
      canUseSightengine: false,
      reason: "free_tier_guard" as const,
      notice:
        "現在、詳細AI判定は一時停止中です。無料枠保護のため、外部AI判定APIを使用せず、簡易判定を表示しています。",
      userRemaining,
      dailyRemaining,
      monthlyRemaining,
      snapshot,
    };
  }

  return {
    mode: "detailed" as const,
    canUseSightengine: true,
    reason: "allowed" as const,
    notice: "この判定は、メタデータ検査と外部AI判定APIの結果を組み合わせた詳細判定です。",
    userRemaining,
    dailyRemaining,
    monthlyRemaining,
    snapshot,
  };
}
