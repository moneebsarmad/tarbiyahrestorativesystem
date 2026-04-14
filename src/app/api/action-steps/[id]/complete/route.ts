import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { completeActionStep } from "@/lib/mock/store";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();
  const body = (await request.json()) as { notes?: string };

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can complete action steps." }, { status: 403 });
  }

  const actionStep = completeActionStep(params.id, body.notes?.trim() ?? "", auth.role);
  return NextResponse.json({ actionStep });
}

