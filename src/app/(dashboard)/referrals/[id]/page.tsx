import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAnyPermission, requireAppUser } from "@/lib/auth/session";
import { getReferralDetails as getReferralDetailsDb } from "@/lib/db/referrals";
import { getReferralDetails as getReferralDetailsMock } from "@/lib/mock/store";
import { isMockMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { ComplexityBadge, RBadge, StatusBadge, SubValueBadge } from "@/components/tarbiyah/badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferralReviewForm } from "@/components/referrals/ReferralReviewForm";

export default async function ReferralDetailPage({
  params
}: {
  params: { id: string };
}) {
  await requireAnyPermission("referrals", ["read", "update"]);
  const auth = await requireAppUser();
  const referral = isMockMode()
    ? getReferralDetailsMock(params.id)
    : await getReferralDetailsDb(createClient(), params.id);

  if (!referral) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Referral review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={referral.status} />
            <ComplexityBadge complexity={referral.complexity} />
            <RBadge r={referral.primary_r} />
            <SubValueBadge subValue={referral.primary_sub_value} />
          </div>
          <div className="rounded-3xl border border-border bg-bg-secondary/45 p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Student</p>
            <p className="mt-2 text-xl font-semibold text-text-primary">{referral.student?.name}</p>
            <p className="mt-1 text-sm text-text-secondary">
              Grade {referral.student?.grade ?? "?"}
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-white p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Staff notes</p>
            <p className="mt-2 text-sm leading-7 text-text-primary">{referral.staff_notes}</p>
          </div>
          {referral.sessions.length > 0 ? (
            <div className="rounded-3xl border border-border bg-white p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Existing sessions</p>
              <div className="mt-3 space-y-3">
                {referral.sessions.map((session) => (
                  <Link key={session.id} href={`/sessions/${session.id}`} className="block rounded-2xl border border-border px-4 py-3 text-sm text-accent-green">
                    Session {session.session_number} · {session.session_date}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{auth.role === "td" ? "Map and open session" : "Referral summary"}</CardTitle>
        </CardHeader>
        <CardContent>
          {auth.role === "td" ? (
            <ReferralReviewForm referral={referral} />
          ) : (
            <p className="text-sm text-text-secondary">
              Counselors can review referral context here, but only the Tarbiyah Director can open
              or edit the session mapping.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

