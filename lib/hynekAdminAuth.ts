import { NextResponse } from "next/server";

export function assertHynekAdmin(request: Request) {
  const expected = process.env.HYNEK_ADMIN_TOKEN;
  const actual = request.headers.get("x-hynek-admin-token");

  if (!expected) {
    return NextResponse.json({ error: "Hynek admin token is not configured." }, { status: 503 });
  }

  if (!actual || actual !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}
