import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { createReferral } from "@/lib/mock/store";

export async function POST(request: Request) {
  const auth = await requireAppUser();
  const body = (await request.json()) as {
    student_id?: string;
    infraction?: string;
    staff_notes?: string;
  };

  if (!body.student_id || !body.infraction) {
    return NextResponse.json({ error: "Student and infraction are required." }, { status: 400 });
  }

  const referral = createReferral({
    student_id: body.student_id,
    infraction: body.infraction,
    staff_notes: body.staff_notes?.trim() ?? "",
    referred_by: auth.user.id
  });

  return NextResponse.json({ referral });
}

