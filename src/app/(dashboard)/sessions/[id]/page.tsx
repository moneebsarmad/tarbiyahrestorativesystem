import { notFound } from "next/navigation";

import { SessionWorkspace } from "@/components/session/session-workspace";
import { requireAnyPermission, requireAppUser } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { getSessionWorkspace } from "@/lib/mock/store";

export default async function SessionWorkspacePage({
  params
}: {
  params: { id: string };
}) {
  await requireAnyPermission("sessions", ["create", "read", "update"]);
  const auth = await requireAppUser();
  const session = getSessionWorkspace(params.id);

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

