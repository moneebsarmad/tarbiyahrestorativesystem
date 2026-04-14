import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { openSessionFromReferral } from "@/lib/mock/store";
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

  const session = openSessionFromReferral(params.id, body, auth.user.id);
  return NextResponse.json({ session });
}

