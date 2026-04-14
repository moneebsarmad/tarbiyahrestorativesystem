import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { generateStudentToken } from "@/lib/mock/store";

export async function POST(request: Request) {
  const auth = await requireAppUser();

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can generate session links." }, { status: 403 });
  }

  const body = (await request.json()) as { sessionId?: string };

  if (!body.sessionId) {
    return NextResponse.json({ error: "Session ID is required." }, { status: 400 });
  }

  const token = generateStudentToken(body.sessionId);

  return NextResponse.json({
    token: token.token,
    expiresAt: token.expiresAt,
    url: `${env.appUrl}${token.url}`
  });
}

