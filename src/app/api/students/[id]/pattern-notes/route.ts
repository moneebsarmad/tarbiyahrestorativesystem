import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import { updateStudentPatternNotes as updatePatternNotesDb } from "@/lib/db/students";
import { updateStudentPatternNotes as updatePatternNotesMock } from "@/lib/mock/store";
import { createRouteClient } from "@/lib/supabase/route";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();
  const body = (await request.json()) as { notes?: string };

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can update pattern notes." }, { status: 403 });
  }

  const notes = isMockMode()
    ? updatePatternNotesMock(params.id, body.notes?.trim() ?? "")
    : await updatePatternNotesDb(createRouteClient(), params.id, body.notes?.trim() ?? "");
  return NextResponse.json({ notes });
}

