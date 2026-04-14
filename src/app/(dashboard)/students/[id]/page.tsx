import { notFound } from "next/navigation";

import { MuraaqabahBanner } from "@/components/profile/MuraaqabahBanner";
import { ParentEmailGenerator } from "@/components/profile/ParentEmailGenerator";
import { PatternNotesEditor } from "@/components/profile/PatternNotesEditor";
import { SessionHistory } from "@/components/profile/SessionHistory";
import { ThreeRProfileCard } from "@/components/profile/ThreeRProfileCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission, requireAppUser } from "@/lib/auth/session";
import { getParentEmailDraft, getStudentProfile } from "@/lib/mock/store";

export default async function StudentProfilePage({
  params
}: {
  params: { id: string };
}) {
  await requirePermission("students", "read");
  const auth = await requireAppUser();
  const profile = getStudentProfile(params.id);

  if (!profile) {
    notFound();
  }

  const latestSession = profile.sessions[0];
  const latestDraft = latestSession ? getParentEmailDraft(latestSession.id) : null;
  const activeFlag = profile.sessions.find(
    (session) => session.muraaqabah_flag && !session.muraaqabah_overridden
  );

  return (
    <div className="space-y-6">
      <Card className="border-none bg-gradient-to-br from-[#173326] via-[#22523e] to-[#2a674b] text-white">
        <CardContent className="space-y-3 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-white/70">3R student profile</p>
          <h1 className="text-3xl text-white">{profile.student.name}</h1>
          <p className="text-sm text-white/78">
            Grade {profile.student.grade ?? "?"} · {profile.student.house ?? "No house"}
          </p>
        </CardContent>
      </Card>

      {activeFlag ? <MuraaqabahBanner reason={activeFlag.muraaqabah_flag_reason ?? "manual"} /> : null}

      <ThreeRProfileCard profile={profile} />

      {auth.role === "principal" ? (
        <Card>
          <CardHeader>
            <CardTitle>Leadership snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-border bg-white p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Total sessions</p>
              <p className="mt-3 text-2xl font-semibold text-text-primary">
                {profile.summary.total_sessions}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Simple</p>
              <p className="mt-3 text-2xl font-semibold text-text-primary">
                {profile.summary.simple_sessions}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Compound</p>
              <p className="mt-3 text-2xl font-semibold text-text-primary">
                {profile.summary.compound_sessions}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-white p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Complex</p>
              <p className="mt-3 text-2xl font-semibold text-text-primary">
                {profile.summary.complex_sessions}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Sub-value breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(profile.subValueCounts).map(([key, count]) => (
              <div key={key} className="rounded-full border border-border bg-white px-3 py-2 text-sm text-text-primary">
                {key.replaceAll("_", " ")} · {count}
              </div>
            ))}
          </CardContent>
        </Card>

        {auth.role === "td" ? (
          <Card>
            <CardHeader>
              <CardTitle>Pattern notes</CardTitle>
            </CardHeader>
            <CardContent>
              <PatternNotesEditor
                studentId={profile.student.id}
                initialValue={profile.patternNotes}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>

      <SessionHistory profile={profile} role={auth.role} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Communication history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.parentComms.length === 0 ? (
              <p className="text-sm text-text-secondary">No parent communications logged yet.</p>
            ) : (
              profile.parentComms.map((comm) => (
                <div key={comm.id} className="rounded-3xl border border-border bg-white p-4">
                  <p className="font-semibold text-text-primary">{comm.email_subject}</p>
                  <p className="mt-1 text-sm text-text-secondary">{comm.recipient_email}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        {auth.role === "td" && latestSession ? (
          <Card>
            <CardHeader>
              <CardTitle>Parent email</CardTitle>
            </CardHeader>
            <CardContent>
              <ParentEmailGenerator
                sessionId={latestSession.id}
                studentId={profile.student.id}
                draft={latestDraft}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
        </>
      )}
    </div>
  );
}
