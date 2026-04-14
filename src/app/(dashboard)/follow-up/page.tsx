import { requirePermission } from "@/lib/auth/session";
import { FollowUpBoard } from "@/components/follow-up/follow-up-board";
import { isMockMode } from "@/lib/env";
import { listActionSteps as listActionStepsDb, getFlaggedSessions } from "@/lib/db/reports";
import { getStoreSnapshot, listActionSteps as listActionStepsMock } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/server";

export default async function FollowUpPage() {
  await requirePermission("sessions", "update");

  let actionSteps;
  let flaggedSessions;

  if (isMockMode()) {
    const store = getStoreSnapshot();
    actionSteps = listActionStepsMock();
    flaggedSessions = store.sessions
      .filter((session) => session.muraaqabah_flag && !session.muraaqabah_overridden)
      .map((session) => {
        const referral = store.referrals.find((entry) => entry.id === session.referral_id);
        const student = referral
          ? store.students.find((entry) => entry.id === referral.student_id)
          : null;
        return {
          id: session.id,
          studentName: student?.name ?? "Unknown",
          grade: student?.grade ?? "?",
          reason: session.muraaqabah_flag_reason ?? "manual",
          sessionCount: store.sessions.filter((entry) => entry.referral_id === session.referral_id).length
        };
      });
  } else {
    const supabase = createClient();
    [actionSteps, flaggedSessions] = await Promise.all([
      listActionStepsDb(supabase),
      getFlaggedSessions(supabase)
    ]);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Phase 6</p>
        <h1 className="mt-2 text-3xl">Follow-up tracker</h1>
      </div>
      <FollowUpBoard actionSteps={actionSteps} flaggedSessions={flaggedSessions} />
    </div>
  );
}

