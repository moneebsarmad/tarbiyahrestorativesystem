import Link from "next/link";

import { requirePermission } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import { getStudentProfile as getStudentProfileDb, listStudents as listStudentsDb } from "@/lib/db/students";
import { getStudentProfile as getStudentProfileMock, listStudents as listStudentsMock } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function StudentsPage({
  searchParams
}: {
  searchParams?: {
    q?: string;
  };
}) {
  await requirePermission("students", "read");
  const supabase = createClient();
  const students = isMockMode()
    ? listStudentsMock(searchParams?.q ?? "")
    : await listStudentsDb(supabase, searchParams?.q ?? "");

  const profiles = await Promise.all(
    students.map((s) =>
      isMockMode()
        ? Promise.resolve(getStudentProfileMock(s.id))
        : getStudentProfileDb(supabase, s.id)
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Phase 7</p>
        <h1 className="mt-2 text-3xl">Student profiles</h1>
      </div>

      <form className="max-w-md" action="/students">
        <Input name="q" defaultValue={searchParams?.q ?? ""} placeholder="Search students" />
      </form>

      <div className="grid gap-4">
        {students.map((student, index) => {
          const profile = profiles[index];

          return (
            <Link key={student.id} href={`/students/${student.id}`}>
              <Card className="transition hover:-translate-y-0.5 hover:shadow-shell">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-lg font-semibold text-text-primary">{student.name}</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      Grade {student.grade ?? "?"} · {student.house ?? "No house"}
                    </p>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {profile?.summary.muraaqabah_active ? "Murāqabah active" : `${profile?.summary.total_sessions ?? 0} sessions`}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

