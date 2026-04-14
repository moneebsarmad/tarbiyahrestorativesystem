import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import { createReferral as createReferralDb } from "@/lib/db/referrals";
import { createReferral as createReferralMock } from "@/lib/mock/store";
import { createRouteClient } from "@/lib/supabase/route";

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

  const input = {
    student_id: body.student_id,
    infraction: body.infraction,
    staff_notes: body.staff_notes?.trim() ?? "",
    referred_by: auth.user.id
  };

  const referral = isMockMode()
    ? createReferralMock(input)
    : await createReferralDb(createRouteClient(), input);

  return NextResponse.json({ referral });
}

