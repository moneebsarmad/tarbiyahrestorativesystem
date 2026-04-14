import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { updateStudentPatternNotes } from "@/lib/mock/store";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();
  const body = (await request.json()) as { notes?: string };

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can update pattern notes." }, { status: 403 });
  }

  const notes = updateStudentPatternNotes(params.id, body.notes?.trim() ?? "");
  return NextResponse.json({ notes });
}

