import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { getSessionWorkspace, updateSession, updateSessionPhase } from "@/lib/mock/store";
import type { JsonValue } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await requireAppUser();
  const session = getSessionWorkspace(params.id);

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
    const updated = updateSessionPhase(params.id, body.phaseKey, body.value);
    return NextResponse.json({ session: getSessionWorkspace(updated.id) });
  }

  const updated = updateSession(params.id, body.patch);
  return NextResponse.json({ session: getSessionWorkspace(updated.id) });
}

