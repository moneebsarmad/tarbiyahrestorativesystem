import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import { completeActionStep as completeActionStepDb } from "@/lib/db/sessions";
import { completeActionStep as completeActionStepMock } from "@/lib/mock/store";
import { createRouteClient } from "@/lib/supabase/route";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();
  const body = (await request.json()) as { notes?: string };

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can complete action steps." }, { status: 403 });
  }

  const actionStep = isMockMode()
    ? completeActionStepMock(params.id, body.notes?.trim() ?? "", auth.role)
    : await completeActionStepDb(createRouteClient(), params.id, body.notes?.trim() ?? "", auth.role);
  return NextResponse.json({ actionStep });
}

