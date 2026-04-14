import { NextResponse } from "next/server";

import { isMockMode } from "@/lib/env";
import {
  getSessionByToken as getSessionByTokenDb,
  upsertWorksheetByToken as upsertWorksheetByTokenDb
} from "@/lib/db/sessions";
import {
  getSessionByToken as getSessionByTokenMock,
  upsertWorksheetByToken as upsertWorksheetByTokenMock
} from "@/lib/mock/store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const session = isMockMode()
    ? getSessionByTokenMock(params.token)
    : await getSessionByTokenDb(createAdminClient(), params.token);

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

  const worksheet = isMockMode()
    ? upsertWorksheetByTokenMock(params.token, body)
    : await upsertWorksheetByTokenDb(createAdminClient(), params.token, body);

  return NextResponse.json({ worksheet });
}

