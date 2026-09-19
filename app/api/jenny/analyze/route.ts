import { NextResponse } from "next/server";
import { analyzeJennyReport } from "@/lib/jenny/jev";
import {
  JENNY_COOKIE_NAME,
  JennyQuotaUnavailableError,
  readJennyUserId,
  reserveJennyQuota,
} from "@/lib/jenny/quota";
import { InvalidJevResponseError } from "@/lib/jenny/transform";
import type { JennyAnalysisResponse, JennyErrorCode, JennyErrorResponse } from "@/lib/jenny/types";

export const runtime = "nodejs";

const MIN_REPORT_LENGTH = 100;
const MAX_REPORT_LENGTH = 20_000;

function errorResponse(error: string, code: JennyErrorCode, status: number, quota?: JennyErrorResponse["quota"]) {
  return NextResponse.json<JennyErrorResponse>({ error, code, ...(quota ? { quota } : {}) }, { status });
}

function setAnonymousCookie(response: NextResponse, userId: string, isNewUser: boolean) {
  if (!isNewUser) return response;
  response.cookies.set(JENNY_COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse("本文を読み取れませんでした。", "INVALID_INPUT", 400);
  }

  const reportText =
    payload && typeof payload === "object" && "reportText" in payload && typeof payload.reportText === "string"
      ? payload.reportText.trim()
      : "";

  if (reportText.length < MIN_REPORT_LENGTH) {
    return errorResponse("分析する文章を100文字以上入力してください。", "INVALID_INPUT", 400);
  }

  if (reportText.length > MAX_REPORT_LENGTH) {
    return errorResponse("文章は20,000文字以内にしてください。", "INPUT_TOO_LONG", 413);
  }

  if (!process.env.AI_GATEWAY_API_KEY) {
    return errorResponse("現在Jev分析を利用できません。しばらくしてからお試しください。", "SERVICE_UNAVAILABLE", 503);
  }

  const existingUserId = readJennyUserId(request);
  const userId = existingUserId || crypto.randomUUID();

  let reservation;
  try {
    reservation = await reserveJennyQuota(userId);
  } catch (error) {
    if (error instanceof JennyQuotaUnavailableError) {
      return errorResponse("利用回数を確認できませんでした。しばらくしてからお試しください。", "SERVICE_UNAVAILABLE", 503);
    }
    return errorResponse("現在Jev分析を利用できません。しばらくしてからお試しください。", "SERVICE_UNAVAILABLE", 503);
  }

  const quota = { remainingToday: reservation.remainingToday, resetsAt: reservation.resetsAt };
  if (!reservation.allowed) {
    return setAnonymousCookie(
      errorResponse("本日の分析回数は上限に達しました。明日もう一度お試しください。", "DAILY_LIMIT", 429, quota),
      userId,
      !existingUserId,
    );
  }

  try {
    const analysis = await analyzeJennyReport(reportText, userId);
    const response = NextResponse.json<JennyAnalysisResponse>({ ...analysis, quota });
    return setAnonymousCookie(response, userId, !existingUserId);
  } catch (error) {
    try {
      await reservation.rollback();
    } catch {
      // Do not expose quota storage details or the report text.
    }

    if (error instanceof InvalidJevResponseError) {
      return setAnonymousCookie(
        errorResponse("Jevの分析結果を確認できませんでした。もう一度お試しください。", "INVALID_JEV_RESPONSE", 502),
        userId,
        !existingUserId,
      );
    }

    return setAnonymousCookie(
      errorResponse("Jev分析に接続できませんでした。しばらくしてからお試しください。", "SERVICE_UNAVAILABLE", 503),
      userId,
      !existingUserId,
    );
  }
}
