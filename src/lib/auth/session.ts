import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { hasSupabaseEnv, isMockMode } from "@/lib/env";
import { getMockSessionUser, toMockRoleRecord } from "@/lib/mock/auth";
import {
  ROLE_HOME_ROUTE,
  hasAnyPermission,
  hasPermission,
  type PermissionAction,
  type PermissionResource
} from "@/lib/rbac/permissions";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, UserRoleRecord } from "@/types/auth";

export interface AuthState {
  configured: boolean;
  user: User | null;
  roleRecord: UserRoleRecord | null;
  role: AppRole | null;
}

export const getAuthState = cache(async (): Promise<AuthState> => {
  if (isMockMode()) {
    const mockUser = getMockSessionUser(cookies());

    return {
      configured: true,
      user: mockUser
        ? ({
            id: mockUser.id,
            email: mockUser.email
          } as User)
        : null,
      roleRecord: mockUser ? toMockRoleRecord(mockUser) : null,
      role: mockUser?.role ?? null
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      configured: false,
      user: null,
      roleRecord: null,
      role: null
    };
  }

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      configured: true,
      user: null,
      roleRecord: null,
      role: null
    };
  }

  const { data: roleRecord } = (await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()) as { data: UserRoleRecord | null; error: unknown };

  return {
    configured: true,
    user,
    roleRecord,
    role: roleRecord?.role ?? null
  };
});

export async function requireAuthenticatedUser() {
  const auth = await getAuthState();

  if (!auth.configured) {
    redirect("/login?reason=setup");
  }

  if (!auth.user) {
    redirect("/login");
  }

  return auth;
}

export async function requireAppUser() {
  const auth = await requireAuthenticatedUser();

  if (!auth.roleRecord) {
    redirect("/login?reason=role");
  }

  return auth as AuthState & {
    user: User;
    roleRecord: UserRoleRecord;
    role: AppRole;
  };
}

export async function requirePermission(
  resource: PermissionResource,
  action: PermissionAction
) {
  const auth = await requireAppUser();

  if (!hasPermission(auth.role, resource, action)) {
    redirect(ROLE_HOME_ROUTE[auth.role]);
  }

  return auth;
}

export async function requireAnyPermission(
  resource: PermissionResource,
  actions: PermissionAction[]
) {
  const auth = await requireAppUser();

  if (!hasAnyPermission(auth.role, resource, actions)) {
    redirect(ROLE_HOME_ROUTE[auth.role]);
  }

  return auth;
}
