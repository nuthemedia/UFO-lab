export const JENNY_DAILY_LIMIT = 5;
export const JENNY_COOKIE_NAME = "jenny_user_id";

type MemoryQuota = Map<string, number>;

type QuotaReservation = {
  allowed: boolean;
  remainingToday: number;
  resetsAt: string;
  rollback: () => Promise<void>;
};

export class JennyQuotaUnavailableError extends Error {
  constructor() {
    super("Jenny quota storage is unavailable.");
    this.name = "JennyQuotaUnavailableError";
  }
}

function getMemoryQuota() {
  const holder = globalThis as typeof globalThis & { __jennyMemoryQuota?: MemoryQuota };
  holder.__jennyMemoryQuota ??= new Map<string, number>();
  return holder.__jennyMemoryQuota;
}

function jstWindow(now = new Date()) {
  const shifted = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const [year, month, day] = shifted.toISOString().slice(0, 10).split("-").map(Number);
  const reset = new Date(Date.UTC(year, month - 1, day + 1) - 9 * 60 * 60 * 1000);

  return {
    dayKey: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    resetsAt: reset.toISOString(),
    ttlSeconds: Math.max(60, Math.ceil((reset.getTime() - now.getTime()) / 1000)),
  };
}

function hasKvConfig() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function requiresPersistentQuota() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

export function readJennyUserId(request: Request) {
  const cookie = (request.headers.get("cookie") || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${JENNY_COOKIE_NAME}=`));
  const value = cookie?.split("=").slice(1).join("=");
  return value ? decodeURIComponent(value) : null;
}

export async function reserveJennyQuota(userId: string): Promise<QuotaReservation> {
  const window = jstWindow();
  const key = `jenny:quota:v1:${window.dayKey}:${userId}`;

  if (hasKvConfig()) {
    try {
      const { kv } = await import("@vercel/kv");
      const used = await kv.incr(key);
      if (used === 1) await kv.expire(key, window.ttlSeconds);

      if (used > JENNY_DAILY_LIMIT) {
        await kv.decr(key);
        return {
          allowed: false,
          remainingToday: 0,
          resetsAt: window.resetsAt,
          rollback: async () => {},
        };
      }

      let rolledBack = false;
      return {
        allowed: true,
        remainingToday: JENNY_DAILY_LIMIT - used,
        resetsAt: window.resetsAt,
        rollback: async () => {
          if (rolledBack) return;
          rolledBack = true;
          await kv.decr(key);
        },
      };
    } catch {
      throw new JennyQuotaUnavailableError();
    }
  }

  if (requiresPersistentQuota()) throw new JennyQuotaUnavailableError();

  const store = getMemoryQuota();
  const used = store.get(key) ?? 0;
  if (used >= JENNY_DAILY_LIMIT) {
    return {
      allowed: false,
      remainingToday: 0,
      resetsAt: window.resetsAt,
      rollback: async () => {},
    };
  }

  store.set(key, used + 1);
  let rolledBack = false;
  return {
    allowed: true,
    remainingToday: JENNY_DAILY_LIMIT - used - 1,
    resetsAt: window.resetsAt,
    rollback: async () => {
      if (rolledBack) return;
      rolledBack = true;
      const current = store.get(key) ?? 1;
      if (current <= 1) store.delete(key);
      else store.set(key, current - 1);
    },
  };
}
