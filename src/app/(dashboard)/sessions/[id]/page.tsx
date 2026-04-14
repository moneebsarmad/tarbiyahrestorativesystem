import { notFound } from "next/navigation";

import { SessionWorkspace } from "@/components/session/session-workspace";
import { requireAnyPermission, requireAppUser } from "@/lib/auth/session";
import { env, isMockMode } from "@/lib/env";
import { getSessionWorkspace as getSessionWorkspaceDb } from "@/lib/db/sessions";
import { getSessionWorkspace as getSessionWorkspaceMock } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/server";

export default async function SessionWorkspacePage({
  params
}: {
  params: { id: string };
}) {
  await requireAnyPermission("sessions", ["create", "read", "update"]);
  const auth = await requireAppUser();
  const session = isMockMode()
    ? getSessionWorkspaceMock(params.id)
    : await getSessionWorkspaceDb(createClient(), params.id);

  if (!session) {
    notFound();
  }

  return (
    <SessionWorkspace
      initialSession={session}
      readOnly={auth.role !== "td"}
      appUrl={env.appUrl}
    />
  );
}

