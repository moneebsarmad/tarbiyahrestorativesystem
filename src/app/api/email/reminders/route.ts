import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import { listActionSteps as listActionStepsDb } from "@/lib/db/reports";
import { listActionSteps as listActionStepsMock } from "@/lib/mock/store";
import { createRouteClient } from "@/lib/supabase/route";
import { getDaysRemaining } from "@/lib/tarbiyah";

export async function POST() {
  const auth = await requireAppUser();

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can trigger reminders." }, { status: 403 });
  }

  const allSteps = isMockMode()
    ? listActionStepsMock()
    : await listActionStepsDb(createRouteClient());

  const dueSoon = allSteps.filter((step) => {
    if (step.completed) {
      return false;
    }

    const remaining = getDaysRemaining(step.due_date);
    return remaining !== null && remaining <= 2;
  });

  return NextResponse.json({
    emailed: true,
    mockDelivered: true,
    steps: dueSoon
  });
}

