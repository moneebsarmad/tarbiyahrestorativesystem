import { requirePermission } from "@/lib/auth/session";
import { isMockMode } from "@/lib/env";
import { listStudents as listStudentsDb } from "@/lib/db/referrals";
import { listStudents as listStudentsMock, getInfractionOptions } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/server";
import { ReferralForm } from "@/components/referrals/ReferralForm";

export default async function NewReferralPage() {
  await requirePermission("referrals", "create");

  const students = isMockMode()
    ? listStudentsMock()
    : await listStudentsDb(createClient());

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Referral intake</p>
        <h1 className="mt-2 text-3xl">New referral</h1>
      </div>
      <ReferralForm students={students} infractions={getInfractionOptions()} />
    </div>
  );
}

