import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import { dismissMuraaqabah as dismissMuraaqabahDb } from "@/lib/db/sessions";
import { dismissMuraaqabah as dismissMuraaqabahMock } from "@/lib/mock/store";
import { createRouteClient } from "@/lib/supabase/route";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();
  const body = (await request.json()) as { notes?: string };

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can dismiss Murāqabah flags." }, { status: 403 });
  }

  const session = isMockMode()
    ? dismissMuraaqabahMock(params.id, body.notes?.trim() ?? "Dismissed.")
    : await dismissMuraaqabahDb(createRouteClient(), params.id, body.notes?.trim() ?? "Dismissed.");
  return NextResponse.json({ session });
}

