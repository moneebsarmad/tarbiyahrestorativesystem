import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import { updateAnchor as updateAnchorDb, deleteAnchor as deleteAnchorDb } from "@/lib/db/library";
import { updateAnchor as updateAnchorMock, deleteAnchor as deleteAnchorMock } from "@/lib/mock/store";
import { createRouteClient } from "@/lib/supabase/route";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can edit anchors." }, { status: 403 });
  }

  const patch = (await request.json()) as Record<string, unknown>;
  const anchor = isMockMode()
    ? updateAnchorMock(params.id, patch)
    : await updateAnchorDb(createRouteClient(), params.id, patch);
  return NextResponse.json({ anchor });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can hide anchors." }, { status: 403 });
  }

  const anchor = isMockMode()
    ? deleteAnchorMock(params.id)
    : await deleteAnchorDb(createRouteClient(), params.id);
  return NextResponse.json({ anchor });
}

