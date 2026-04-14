import { notFound } from "next/navigation";

import { StudentWorksheetForm } from "@/components/session/student-worksheet-form";
import { isMockMode } from "@/lib/env";
import { getSessionByToken as getSessionByTokenDb } from "@/lib/db/sessions";
import { getSessionByToken as getSessionByTokenMock } from "@/lib/mock/store";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StudentSessionPage({
  params
}: {
  params: { token: string };
}) {
  const session = isMockMode()
    ? getSessionByTokenMock(params.token)
    : await getSessionByTokenDb(createAdminClient(), params.token);

  if (!session) {
    notFound();
  }

  return <StudentWorksheetForm session={session} />;
}

