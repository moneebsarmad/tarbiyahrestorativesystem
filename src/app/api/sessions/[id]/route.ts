import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import {
  getSessionWorkspace as getSessionWorkspaceDb,
  updateSession as updateSessionDb,
  updateSessionPhase as updateSessionPhaseDb
} from "@/lib/db/sessions";
import {
  getSessionWorkspace as getSessionWorkspaceMock,
  updateSession as updateSessionMock,
  updateSessionPhase as updateSessionPhaseMock
} from "@/lib/mock/store";
import { createRouteClient } from "@/lib/supabase/route";
import type { JsonValue } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await requireAppUser();
  const session = isMockMode()
    ? getSessionWorkspaceMock(params.id)
    : await getSessionWorkspaceDb(createRouteClient(), params.id);

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({ session });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();
  const body = (await request.json()) as
    | {
        type: "phase";
        phaseKey: string;
        value: JsonValue;
      }
    | {
        type: "session";
        patch: Record<string, JsonValue>;
      };

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Session editing is limited to the Tarbiyah Director." }, { status: 403 });
  }

  if (body.type === "phase") {
    const updated = isMockMode()
      ? getSessionWorkspaceMock(updateSessionPhaseMock(params.id, body.phaseKey, body.value).id)
      : await updateSessionPhaseDb(createRouteClient(), params.id, body.phaseKey, body.value);
    return NextResponse.json({ session: updated });
  }

  const updated = isMockMode()
    ? getSessionWorkspaceMock(updateSessionMock(params.id, body.patch).id)
    : await updateSessionDb(createRouteClient(), params.id, body.patch);
  return NextResponse.json({ session: updated });
}

