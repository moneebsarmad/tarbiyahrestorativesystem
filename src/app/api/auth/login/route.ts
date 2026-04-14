import { NextResponse } from "next/server";

import { hasAuthEnv, isMockMode } from "@/lib/env";
import { findMockUserByCredentials, setMockSessionCookie } from "@/lib/mock/auth";
import { createRouteClient } from "@/lib/supabase/route";
import type { UserRoleRecord } from "@/types/auth";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      {
        error: "Email and password are required."
      },
      { status: 400 }
    );
  }

  if (isMockMode()) {
    const mockUser = findMockUserByCredentials(email, password);

    if (!mockUser) {
      return NextResponse.json(
        {
          error: "Invalid demo credentials."
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      user: {
        id: mockUser.id,
        email: mockUser.email
      },
      role: mockUser.role
    });

    setMockSessionCookie(response.cookies, mockUser.id);
    return response;
  }

  if (!hasAuthEnv()) {
    return NextResponse.json(
      {
        error: "Supabase environment variables are not configured."
      },
      { status: 503 }
    );
  }

  const supabase = createRouteClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    return NextResponse.json(
      {
        error: error?.message ?? "Unable to sign in."
      },
      { status: 401 }
    );
  }

  const { data: roleRecord } = (await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", data.user.id)
    .maybeSingle()) as { data: UserRoleRecord | null; error: unknown };

  if (!roleRecord) {
    await supabase.auth.signOut();

    return NextResponse.json(
      {
        error: "Your account is missing a user_roles entry."
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email
    },
    role: roleRecord.role
  });
}
