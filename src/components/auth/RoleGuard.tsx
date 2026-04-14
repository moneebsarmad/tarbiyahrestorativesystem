"use client";

import { Spinner } from "@/components/ui/spinner";
import { useRole } from "@/lib/rbac/useRole";
import type { PermissionAction, PermissionResource } from "@/lib/rbac/permissions";

interface RoleGuardProps {
  children: React.ReactNode;
  resource: PermissionResource;
  action: PermissionAction;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  resource,
  action,
  fallback = null,
  loadingFallback
}: RoleGuardProps) {
  const { loading, can } = useRole();

  if (loading) {
    return (
      loadingFallback ?? (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Spinner />
          Checking access...
        </div>
      )
    );
  }

  if (!can(resource, action)) {
    return fallback;
  }

  return <>{children}</>;
}
