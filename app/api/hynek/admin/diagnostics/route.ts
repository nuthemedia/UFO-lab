import { NextResponse } from "next/server";
import { assertHynekAdmin } from "@/lib/hynekAdminAuth";
import { getHynekKvDiagnostics } from "@/lib/hynekStore";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authError = assertHynekAdmin(request);

  if (authError) {
    return authError;
  }

  return NextResponse.json(await getHynekKvDiagnostics());
}
