import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireAppUser } from "@/lib/auth/session";
import { RoleProvider } from "@/lib/rbac/useRole";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = await requireAppUser();

  if (auth.role === "student") {
    redirect("/login?reason=student");
  }

  return (
    <RoleProvider
      initialState={{
        configured: true,
        authenticated: true,
        user: {
          id: auth.user.id,
          email: auth.user.email ?? null
        },
        role: auth.roleRecord
      }}
    >
      <DashboardShell>{children}</DashboardShell>
    </RoleProvider>
  );
}
