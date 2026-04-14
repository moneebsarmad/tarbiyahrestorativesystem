import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

import type { AppRole, Campus, UserRoleRecord } from "@/types/auth";

export const MOCK_SESSION_COOKIE = "rts-mock-session";

interface CookieReader {
  get(name: string): { value: string } | undefined;
}

export interface MockAuthUser {
  id: string;
  email: string;
  password: string;
  role: AppRole;
  campus: Campus;
  name: string;
}

export const MOCK_AUTH_USERS: MockAuthUser[] = [
  {
    id: "user-td",
    email: "moneeb@bha.org",
    password: "password123",
    role: "td",
    campus: "both",
    name: "Moneeb Sarmad"
  },
  {
    id: "user-counselor",
    email: "counselor-test@bha.org",
    password: "password123",
    role: "counselor",
    campus: "both",
    name: "Counselor Demo"
  },
  {
    id: "user-principal",
    email: "principal-test@bha.org",
    password: "password123",
    role: "principal",
    campus: "both",
    name: "Principal Demo"
  },
  {
    id: "user-staff",
    email: "staff-test@bha.org",
    password: "password123",
    role: "staff",
    campus: "both",
    name: "Staff Demo"
  }
];

export function findMockUserByCredentials(email: string, password: string) {
  return (
    MOCK_AUTH_USERS.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase().trim() && user.password === password
    ) ?? null
  );
}

export function findMockUserById(id: string) {
  return MOCK_AUTH_USERS.find((user) => user.id === id) ?? null;
}

export function setMockSessionCookie(cookies: ResponseCookies, userId: string) {
  cookies.set(MOCK_SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function clearMockSessionCookie(cookies: ResponseCookies) {
  cookies.set(MOCK_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 0
  });
}

export function getMockSessionUser(cookies: CookieReader) {
  const userId = cookies.get(MOCK_SESSION_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  return findMockUserById(userId);
}

export function toMockRoleRecord(user: MockAuthUser): UserRoleRecord {
  return {
    user_id: user.id,
    role: user.role,
    campus: user.campus,
    created_at: new Date().toISOString()
  };
}
