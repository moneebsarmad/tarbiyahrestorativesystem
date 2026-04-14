import { redirect } from "next/navigation";

import { getAuthState } from "@/lib/auth/session";
import { ROLE_HOME_ROUTE } from "@/lib/rbac/permissions";

export default async function HomePage() {
  const auth = await getAuthState();

  if (!auth.configured || !auth.user || !auth.role) {
    redirect("/login");
  }

  redirect(ROLE_HOME_ROUTE[auth.role]);
}
