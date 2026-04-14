import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import { openSessionFromReferral as openSessionDb } from "@/lib/db/referrals";
import { openSessionFromReferral as openSessionMock } from "@/lib/mock/store";
import { createRouteClient } from "@/lib/supabase/route";
import type { ReferralComplexity, SubValueKey, ThreeRKey } from "@/types";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAppUser();

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can open sessions." }, { status: 403 });
  }

  const body = (await request.json()) as {
    complexity: ReferralComplexity;
    primary_r: ThreeRKey;
    primary_sub_value: SubValueKey;
    secondary_r?: ThreeRKey | null;
    secondary_sub_value?: SubValueKey | null;
    tertiary_r?: ThreeRKey | null;
    tertiary_sub_value?: SubValueKey | null;
  };

  const session = isMockMode()
    ? openSessionMock(params.id, body, auth.user.id)
    : await openSessionDb(createRouteClient(), params.id, body, auth.user.id);

  return NextResponse.json({ session });
}

