import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { env, hasSupabaseEnv, isMockMode } from "@/lib/env";
import { getMockSessionUser } from "@/lib/mock/auth";
import { ROLE_HOME_ROUTE } from "@/lib/rbac/permissions";
import type { UserRoleRecord } from "@/types/auth";
import type { Database } from "@/types/supabase";

export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const protectedPrefixes = [
    "/dashboard",
    "/referrals",
    "/sessions",
    "/students",
    "/library",
    "/reports",
    "/follow-up"
  ];

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isMockMode()) {
    const mockUser = getMockSessionUser(request.cookies);

    if (!mockUser && isProtected) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (mockUser && pathname === "/login") {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = ROLE_HOME_ROUTE[mockUser.role];
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next({
      request
    });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.next({
      request
    });
  }

  let response = NextResponse.next({
    request
  });

  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options) {
        request.cookies.set({
          name,
          value,
          ...options
        });

        response = NextResponse.next({
          request
        });

        response.cookies.set({
          name,
          value,
          ...options
        });
      },
      remove(name: string, options) {
        request.cookies.set({
          name,
          value: "",
          ...options
        });

        response = NextResponse.next({
          request
        });

        response.cookies.set({
          name,
          value: "",
          ...options,
          maxAge: 0
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const roleRecord = user
    ? (
        (await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle()) as { data: Pick<UserRoleRecord, "role"> | null; error: unknown }
      ).data
    : null;

  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (user && !roleRecord && isProtected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("reason", "role");
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login" && roleRecord?.role) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = ROLE_HOME_ROUTE[roleRecord.role];
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return response;
}
