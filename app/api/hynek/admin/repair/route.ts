import { NextResponse } from "next/server";
import { assertHynekAdmin } from "@/lib/hynekAdminAuth";
import { repairHynekKvSubmissions } from "@/lib/hynekStore";

export const runtime = "nodejs";

function shouldDryRun(request: Request) {
  const url = new URL(request.url);

  return url.searchParams.get("dryRun") !== "false";
}

export async function GET(request: Request) {
  const authError = assertHynekAdmin(request);

  if (authError) {
    return authError;
  }

  return NextResponse.json(await repairHynekKvSubmissions({ dryRun: true }));
}

export async function POST(request: Request) {
  const authError = assertHynekAdmin(request);

  if (authError) {
    return authError;
  }

  return NextResponse.json(await repairHynekKvSubmissions({ dryRun: shouldDryRun(request) }));
}
