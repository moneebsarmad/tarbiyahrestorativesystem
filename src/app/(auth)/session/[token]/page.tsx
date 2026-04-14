import { notFound } from "next/navigation";

import { StudentWorksheetForm } from "@/components/session/student-worksheet-form";
import { getSessionByToken } from "@/lib/mock/store";

export default function StudentSessionPage({
  params
}: {
  params: { token: string };
}) {
  const session = getSessionByToken(params.token);

  if (!session) {
    notFound();
  }

  return <StudentWorksheetForm session={session} />;
}

