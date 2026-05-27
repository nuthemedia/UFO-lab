import { NextResponse } from "next/server";
import {
  createHynekSubmission,
  getHynekDashboardData,
  getHynekUserId,
  recordHynekSubmission,
  type AnswersState,
  type HynekSubmission,
  type UfoTypeId,
} from "@/lib/hynekStore";

export const runtime = "nodejs";

type HynekSubmitPayload = {
  resultType?: UfoTypeId;
  totalScore?: number;
  answers?: AnswersState;
};

function isValidSubmissionPayload(value: unknown): value is HynekSubmitPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as HynekSubmitPayload;

  return Boolean(payload.resultType && payload.answers && typeof payload.answers === "object");
}

export async function GET() {
  const dashboard = await getHynekDashboardData();

  return NextResponse.json(dashboard);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as unknown;

  if (!isValidSubmissionPayload(payload)) {
    return NextResponse.json({ error: "診断結果の送信データが不正です。" }, { status: 400 });
  }

  const userId = getHynekUserId(request) || crypto.randomUUID();
  const submission = createHynekSubmission({
    userId,
    resultType: payload.resultType,
    totalScore: Number(payload.totalScore || 0),
    answers: payload.answers,
  } as HynekSubmission);

  const result = await recordHynekSubmission(submission);
  const response = NextResponse.json({
    recorded: result.recorded,
    totalResponses: result.totalResponses,
    dashboard: result.dashboard,
  });

  if (!getHynekUserId(request)) {
    response.cookies.set("hynek_user_id", userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}
