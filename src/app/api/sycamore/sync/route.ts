import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { syncMockSycamore } from "@/lib/mock/store";

export async function POST() {
  const auth = await requireAppUser();

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can sync Sycamore." }, { status: 403 });
  }

  const imported = syncMockSycamore();

  return NextResponse.json({
    newReferrals: imported.length,
    referrals: imported
  });
}

