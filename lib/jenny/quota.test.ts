import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { JENNY_DAILY_LIMIT, reserveJennyQuota } from "./quota";

const originalKvUrl = process.env.KV_REST_API_URL;
const originalKvToken = process.env.KV_REST_API_TOKEN;
const originalVercel = process.env.VERCEL;

describe("Jenny local daily quota", () => {
  beforeEach(() => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.VERCEL;
  });

  afterEach(() => {
    if (originalKvUrl) process.env.KV_REST_API_URL = originalKvUrl;
    else delete process.env.KV_REST_API_URL;
    if (originalKvToken) process.env.KV_REST_API_TOKEN = originalKvToken;
    else delete process.env.KV_REST_API_TOKEN;
    if (originalVercel) process.env.VERCEL = originalVercel;
    else delete process.env.VERCEL;
  });

  it("allows five reservations, rejects the sixth, and restores a failed reservation", async () => {
    const userId = `test-${crypto.randomUUID()}`;
    const reservations = [];

    for (let index = 0; index < JENNY_DAILY_LIMIT; index += 1) {
      reservations.push(await reserveJennyQuota(userId));
    }

    expect(reservations.every((reservation) => reservation.allowed)).toBe(true);
    expect((await reserveJennyQuota(userId)).allowed).toBe(false);

    await reservations[0].rollback();
    expect((await reserveJennyQuota(userId)).allowed).toBe(true);
  });
});
