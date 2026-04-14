import { redirect } from "next/navigation";

import { requireAppUser } from "@/lib/auth/session";
import { getReportData, getStoreSnapshot, listActionSteps, listReferrals } from "@/lib/mock/store";
import { ROLE_HOME_ROUTE } from "@/lib/rbac/permissions";
import { PrincipalDashboard } from "@/components/reports/PrincipalDashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const auth = await requireAppUser();

  if (auth.role === "staff") {
    redirect(ROLE_HOME_ROUTE.staff);
  }

  const store = getStoreSnapshot();
  const referrals = listReferrals(auth.role, auth.user.id);
  const report = getReportData();
  const openSteps = listActionSteps().filter((step) => !step.completed);
  const stats = [
    { label: "Referrals in view", value: String(referrals.length) },
    { label: "Completed sessions", value: String(report.totalSessions) },
    { label: "Open action steps", value: String(openSteps.length) },
    { label: "Murāqabah flags", value: String(report.flaggedStudents.length) }
  ];

  return (
    <div className="space-y-8">
      <Card className="border-none bg-gradient-to-br from-[#173326] via-[#22523e] to-[#2a674b] text-white shadow-shell">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Badge className="border-white/15 bg-white/10 text-white">
              {auth.role === "td"
                ? "Tarbiyah Director"
                : auth.role === "counselor"
                  ? "Counselor"
                  : "Principal"}
            </Badge>
            <h1 className="mt-4 text-4xl text-white">Restorative Tarbiyah System</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/78">
              Local MVP build-out is now covering referral intake, session facilitation, student
              reflection, follow-up tracking, profiles, anchors, and reporting.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/62">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {auth.role === "principal" ? (
        <PrincipalDashboard report={report} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-2xl">Priority queue</h2>
              {referrals.slice(0, 4).map((referral) => (
                <div key={referral.id} className="rounded-3xl border border-border bg-white p-4">
                  <p className="font-semibold text-text-primary">{referral.student?.name}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {referral.infraction.replaceAll("_", " ")} · {referral.status}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-2xl">Open follow-up</h2>
              {openSteps.slice(0, 4).map((step) => (
                <div key={step.id} className="rounded-3xl border border-border bg-white p-4">
                  <p className="font-semibold text-text-primary">{step.student?.name}</p>
                  <p className="mt-1 text-sm text-text-secondary">{step.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
