export const APP_ROLES = ["td", "counselor", "principal", "staff", "student"] as const;
export const CAMPUSES = ["elementary", "secondary", "both"] as const;

export type AppRole = (typeof APP_ROLES)[number];
export type Campus = (typeof CAMPUSES)[number];

export interface UserRoleRecord {
  user_id: string;
  role: AppRole;
  campus: Campus | null;
  created_at: string | null;
}

export interface AuthSessionPayload {
  configured: boolean;
  authenticated: boolean;
  user: {
    id: string;
    email: string | null;
  } | null;
  role: UserRoleRecord | null;
}
