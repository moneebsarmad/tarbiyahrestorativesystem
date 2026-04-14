import { NextResponse } from "next/server";

import { getAuthState } from "@/lib/auth/session";

export async function GET() {
  const auth = await getAuthState();

  return NextResponse.json({
    configured: auth.configured,
    authenticated: Boolean(auth.user),
    user: auth.user
      ? {
          id: auth.user.id,
          email: auth.user.email
        }
      : null,
    role: auth.roleRecord
  });
}
