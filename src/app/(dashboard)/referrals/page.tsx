import Link from "next/link";

import { requireAnyPermission, requireAppUser } from "@/lib/auth/session";
import { listReferrals } from "@/lib/mock/store";
import { getReadableDate } from "@/lib/tarbiyah";
import { ComplexityBadge, StatusBadge } from "@/components/tarbiyah/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncSycamoreButton } from "@/components/referrals/SyncSycamoreButton";

export default async function ReferralsPage() {
  await requireAnyPermission("referrals", ["create", "read", "read_own"]);
  const auth = await requireAppUser();
  const referrals = listReferrals(auth.role, auth.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Phase 3</p>
          <h1 className="mt-2 text-3xl">Referrals</h1>
        </div>
        <div className="flex items-center gap-3">
          {auth.role === "td" ? <SyncSycamoreButton /> : null}
          {auth.role === "staff" ? (
            <Link href="/referrals/new">
              <Button>New referral</Button>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        {referrals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-text-secondary">
              No referrals yet.
            </CardContent>
          </Card>
        ) : (
          referrals.map((referral) => (
            <Card key={referral.id}>
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-text-primary">{referral.student?.name}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {referral.infraction.replaceAll("_", " ")} · Grade {referral.student?.grade ?? "?"}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-text-muted">
                    Submitted {getReadableDate(referral.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={referral.status} />
                  <ComplexityBadge complexity={referral.complexity} />
                  {(auth.role === "td" || auth.role === "counselor") && (
                    <Link href={`/referrals/${referral.id}`}>
                      <Button variant="secondary">
                        {auth.role === "td" ? "Review" : "View"}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

