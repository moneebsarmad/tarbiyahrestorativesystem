import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { listActionSteps } from "@/lib/mock/store";
import { getDaysRemaining } from "@/lib/tarbiyah";

export async function POST() {
  const auth = await requireAppUser();

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can trigger reminders." }, { status: 403 });
  }

  const dueSoon = listActionSteps().filter((step) => {
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

