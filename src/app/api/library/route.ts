import { NextResponse } from "next/server";

import { requireAppUser } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import { createAnchor as createAnchorDb } from "@/lib/db/library";
import { createAnchor as createAnchorMock } from "@/lib/mock/store";
import { createRouteClient } from "@/lib/supabase/route";
import type { AnchorType, JsonValue, SubValueKey } from "@/types";

export async function POST(request: Request) {
  const auth = await requireAppUser();

  if (auth.role !== "td") {
    return NextResponse.json({ error: "Only the Tarbiyah Director can add anchors." }, { status: 403 });
  }

  const body = (await request.json()) as {
    sub_value: SubValueKey;
    anchor_type: AnchorType;
    arabic_text: string;
    transliteration?: string;
    translation: string;
    source: string;
    discussion_questions?: string[];
  };

  const anchorInput = {
    sub_value: body.sub_value,
    anchor_type: body.anchor_type,
    arabic_text: body.arabic_text,
    transliteration: body.transliteration?.trim() || null,
    translation: body.translation,
    source: body.source,
    discussion_questions: (body.discussion_questions ?? []) as JsonValue,
    is_system_default: false,
    is_active: true,
    created_by: auth.user.id
  };

  const anchor = isMockMode()
    ? createAnchorMock(anchorInput)
    : await createAnchorDb(createRouteClient(), anchorInput);

  return NextResponse.json({ anchor });
}

