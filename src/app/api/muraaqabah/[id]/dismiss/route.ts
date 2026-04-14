import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { dismissMuraaqabah } from "@/lib/mock/store";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();
  const body = (await request.json()) as { notes?: string };

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can dismiss Murāqabah flags." }, { status: 403 });
  }

  const session = dismissMuraaqabah(params.id, body.notes?.trim() ?? "Dismissed in mock workflow.");
  return NextResponse.json({ session });
}

