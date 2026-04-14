"use client";

import * as React from "react";

import { hasPermission, type PermissionAction, type PermissionResource } from "@/lib/rbac/permissions";
import type { AppRole, AuthSessionPayload, UserRoleRecord } from "@/types/auth";

interface RoleContextValue {
  configured: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  role: AppRole | null;
  roleRecord: UserRoleRecord | null;
  userEmail: string | null;
  refresh: () => Promise<void>;
  can: (resource: PermissionResource, action: PermissionAction) => boolean;
}

const RoleContext = React.createContext<RoleContextValue | undefined>(undefined);

interface RoleProviderProps {
  children: React.ReactNode;
  initialState: AuthSessionPayload;
}

export function RoleProvider({ children, initialState }: RoleProviderProps) {
  const [payload, setPayload] = React.useState<AuthSessionPayload>(initialState);
  const [loading, setLoading] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "same-origin"
      });

      const data = (await response.json()) as AuthSessionPayload;
      setPayload(data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!initialState.configured || initialState.role) {
      return;
    }

    void refresh();
  }, [initialState.configured, initialState.role, refresh]);

  const value = React.useMemo<RoleContextValue>(
    () => ({
      configured: payload.configured,
      loading,
      isAuthenticated: payload.authenticated,
      role: payload.role?.role ?? null,
      roleRecord: payload.role,
      userEmail: payload.user?.email ?? null,
      refresh,
      can: (resource, action) => hasPermission(payload.role?.role, resource, action)
    }),
    [loading, payload, refresh]
  );

  return React.createElement(RoleContext.Provider, { value }, children);
}

export function useRole() {
  const context = React.useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used within a RoleProvider.");
  }

  return context;
}
