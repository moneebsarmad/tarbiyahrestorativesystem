import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { deleteAnchor, updateAnchor } from "@/lib/mock/store";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can edit anchors." }, { status: 403 });
  }

  const patch = (await request.json()) as Record<string, unknown>;
  const anchor = updateAnchor(params.id, patch);
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

  const anchor = deleteAnchor(params.id);
  return NextResponse.json({ anchor });
}

