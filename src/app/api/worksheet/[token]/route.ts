import { NextResponse } from "next/server";

import { getSessionByToken, upsertWorksheetByToken } from "@/lib/mock/store";

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const session = getSessionByToken(params.token);

  if (!session) {
    return NextResponse.json({ error: "Session token is invalid or expired." }, { status: 404 });
  }

  return NextResponse.json({ session });
}

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const body = (await request.json()) as Record<string, string | null>;
  const worksheet = upsertWorksheetByToken(params.token, body);

  return NextResponse.json({ worksheet });
}

