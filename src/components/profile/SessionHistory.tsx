import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReadableDate } from "@/lib/tarbiyah";
import type { AppRole } from "@/types/auth";
import type { StudentProfileData } from "@/types/view-models";

export function SessionHistory({
  profile,
  role
}: {
  profile: StudentProfileData;
  role: AppRole;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {profile.sessions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-bg-secondary/45 p-5 text-sm text-text-secondary">
            No sessions yet for this student.
          </div>
        ) : (
          profile.sessions.map((session) => (
            <div key={session.id} className="rounded-3xl border border-border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {getReadableDate(session.session_date)}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {role === "principal"
                      ? "Restorative session on record"
                      : session.referral?.infraction.replaceAll("_", " ")}
                  </p>
                </div>
                {role === "td" || role === "counselor" ? (
                  <Link href={`/sessions/${session.id}`} className="text-sm font-medium text-accent-green">
                    Open session
                  </Link>
                ) : null}
              </div>
              {role !== "principal" ? (
                <p className="mt-3 text-xs text-text-muted">
                  {session.action_steps_rows.length} action steps · {session.status}
                </p>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
