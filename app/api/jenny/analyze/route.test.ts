import { beforeEach, describe, expect, it, vi } from "vitest";

const analyzeJennyReport = vi.fn();
const reserveJennyQuota = vi.fn();
const rollback = vi.fn();

vi.mock("@/lib/jenny/jev", () => ({ analyzeJennyReport }));
vi.mock("@/lib/jenny/quota", () => ({
  JENNY_COOKIE_NAME: "jenny_user_id",
  JennyQuotaUnavailableError: class JennyQuotaUnavailableError extends Error {},
  readJennyUserId: () => "test-user",
  reserveJennyQuota,
}));

const validCore = {
  schemaVersion: "jenny-1" as const,
  questionSetVersion: "jev-ufo-v1" as const,
  questionCount: 20 as const,
  durationMs: 120,
  microSignals: [],
  summary: {
    strangeness: 8,
    reliability: 6,
    closeEncounter: { code: "CE1" as const, labelJa: "第一種接近遭遇", fit: 80 },
    trueUfo: 70,
    evidenceStrength: 40,
    fakeIndicators: 10,
  },
};

describe("POST /api/jenny/analyze", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.AI_GATEWAY_API_KEY = "test-key";
    reserveJennyQuota.mockResolvedValue({ allowed: true, remainingToday: 4, resetsAt: "2026-09-20T15:00:00.000Z", rollback });
    analyzeJennyReport.mockResolvedValue(validCore);
  });

  it("rejects short input before reserving quota", async () => {
    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/jenny/analyze", { method: "POST", body: JSON.stringify({ reportText: "短い文章" }) }));
    expect(response.status).toBe(400);
    expect(reserveJennyQuota).not.toHaveBeenCalled();
  });

  it("returns the analysis and quota", async () => {
    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/jenny/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reportText: "観測日時と場所、物体の形状、距離、動き、周囲の状況、複数の証言、記録の有無を含む十分に長い目撃報告です。".repeat(3) }),
    }));
    expect(response.status).toBe(200);
    expect(analyzeJennyReport).toHaveBeenCalledTimes(1);
    expect((await response.json()).quota.remainingToday).toBe(4);
  });

  it("does not call Jev after the daily limit", async () => {
    reserveJennyQuota.mockResolvedValue({ allowed: false, remainingToday: 0, resetsAt: "2026-09-20T15:00:00.000Z", rollback });
    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/jenny/analyze", {
      method: "POST",
      body: JSON.stringify({ reportText: "目撃日時、場所、距離、形、動き、音、周辺への影響を詳しく記録した報告文章です。".repeat(4) }),
    }));
    expect(response.status).toBe(429);
    expect(analyzeJennyReport).not.toHaveBeenCalled();
  });

  it("rolls quota back when the provider fails", async () => {
    analyzeJennyReport.mockRejectedValue(new Error("provider failed"));
    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/jenny/analyze", {
      method: "POST",
      body: JSON.stringify({ reportText: "目撃日時、場所、距離、形、動き、音、周辺への影響を詳しく記録した報告文章です。".repeat(4) }),
    }));
    expect(response.status).toBe(503);
    expect(rollback).toHaveBeenCalledTimes(1);
  });
});
