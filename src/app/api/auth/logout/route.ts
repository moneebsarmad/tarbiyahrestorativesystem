import { NextResponse } from "next/server";

import { hasAuthEnv, isMockMode } from "@/lib/env";
import { clearMockSessionCookie } from "@/lib/mock/auth";
import { createRouteClient } from "@/lib/supabase/route";

export async function POST() {
  if (isMockMode()) {
    const response = NextResponse.json({ success: true });
    clearMockSessionCookie(response.cookies);
    return response;
  }

  if (hasAuthEnv()) {
    const supabase = createRouteClient();
    await supabase.auth.signOut();
  }

  return NextResponse.json({ success: true });
}
