import type { AppRole } from "@/types/auth";

export type PermissionResource =
  | "referrals"
  | "sessions"
  | "students"
  | "library"
  | "reports"
  | "parent_comms"
  | "worksheet";

export type PermissionAction = string;

export const ROLE_LABELS: Record<AppRole, string> = {
  td: "Tarbiyah Director",
  counselor: "Counselor",
  principal: "Principal",
  staff: "Staff",
  student: "Student"
};

export const ROLE_HOME_ROUTE: Record<AppRole, string> = {
  td: "/dashboard",
  counselor: "/dashboard",
  principal: "/dashboard",
  staff: "/referrals",
  student: "/login"
};

export const PERMISSIONS: Record<
  AppRole,
  Partial<Record<PermissionResource, PermissionAction[]>>
> = {
  td: {
    referrals: ["create", "read", "update", "delete", "sync_sycamore"],
    sessions: ["create", "read", "update", "delete", "read_phase_notes"],
    students: ["read", "update_notes"],
    library: ["create", "read", "update", "delete"],
    reports: ["generate", "read", "export_pdf"],
    parent_comms: ["create", "read", "send"]
  },
  counselor: {
    referrals: ["read"],
    sessions: ["read"],
    students: ["read"],
    reports: ["read"],
    parent_comms: ["read"]
  },
  principal: {
    students: ["read"],
    reports: ["read", "export_pdf"]
  },
  staff: {
    referrals: ["create", "read_own"],
    sessions: ["read_status_own"]
  },
  student: {
    worksheet: ["create"]
  }
};

export function hasPermission(
  role: AppRole | null | undefined,
  resource: PermissionResource,
  action: PermissionAction
) {
  if (!role) {
    return false;
  }

  return PERMISSIONS[role][resource]?.includes(action) ?? false;
}

export function hasAnyPermission(
  role: AppRole | null | undefined,
  resource: PermissionResource,
  actions: PermissionAction[]
) {
  return actions.some((action) => hasPermission(role, resource, action));
}
