import Link from "next/link";

import { requireAnyPermission, requireAppUser } from "@/lib/auth/session";
import { listSessions } from "@/lib/mock/store";
import { ComplexityBadge } from "@/components/tarbiyah/badges";
import { Card, CardContent } from "@/components/ui/card";
import { getReadableDate } from "@/lib/tarbiyah";

export default async function SessionsPage() {
  await requireAnyPermission("sessions", ["create", "read"]);
  const auth = await requireAppUser();
  const sessions = listSessions(auth.role);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Phase 4</p>
        <h1 className="mt-2 text-3xl">Sessions</h1>
      </div>
      <div className="grid gap-4">
        {sessions.map((session) => (
          <Link key={session.id} href={`/sessions/${session.id}`}>
            <Card className="transition hover:-translate-y-0.5 hover:shadow-shell">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-lg font-semibold text-text-primary">{session.student?.name}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {session.referral?.infraction.replaceAll("_", " ")} · {getReadableDate(session.session_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ComplexityBadge complexity={session.referral?.complexity} />
                  <span className="text-sm text-text-secondary">{session.status}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

