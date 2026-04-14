import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { completeSession } from "@/lib/mock/store";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can complete sessions." }, { status: 403 });
  }

  const result = completeSession(params.id);

  return NextResponse.json({
    session: result,
    summary: result.summary
  });
}

