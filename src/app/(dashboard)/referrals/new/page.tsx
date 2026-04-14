import { requirePermission } from "@/lib/auth/session";
import { getInfractionOptions, listStudents } from "@/lib/mock/store";
import { ReferralForm } from "@/components/referrals/ReferralForm";

export default async function NewReferralPage() {
  await requirePermission("referrals", "create");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Referral intake</p>
        <h1 className="mt-2 text-3xl">New referral</h1>
      </div>
      <ReferralForm students={listStudents()} infractions={getInfractionOptions()} />
    </div>
  );
}

