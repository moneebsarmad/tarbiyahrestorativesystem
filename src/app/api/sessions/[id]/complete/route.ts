import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import { completeSession as completeSessionDb } from "@/lib/db/sessions";
import { completeSession as completeSessionMock } from "@/lib/mock/store";
import { createRouteClient } from "@/lib/supabase/route";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can complete sessions." }, { status: 403 });
  }

  const result = isMockMode()
    ? completeSessionMock(params.id)
    : await completeSessionDb(createRouteClient(), params.id);

  return NextResponse.json({
    session: result,
    summary: result.summary
  });
}

