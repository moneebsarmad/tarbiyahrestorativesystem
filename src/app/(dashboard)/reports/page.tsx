import { requireAnyPermission, requireAppUser } from "@/lib/auth/session";
import { ReportsWorkspace } from "@/components/reports/ReportsWorkspace";
import { isMockMode } from "@/lib/env";
import { getReportData as getReportDataDb } from "@/lib/db/reports";
import { getReportData as getReportDataMock } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/server";

function defaultDateRange() {
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return { start, end };
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams?: {
    startDate?: string;
    endDate?: string;
    division?: string;
  };
}) {
  await requireAnyPermission("reports", ["read", "generate", "export_pdf"]);
  const auth = await requireAppUser();
  const defaults = defaultDateRange();
  const startDate = searchParams?.startDate ?? defaults.start;
  const endDate = searchParams?.endDate ?? defaults.end;
  const division = searchParams?.division ?? "all";

  const filters = { startDate, endDate, division: division === "all" ? undefined : division };
  const report = isMockMode()
    ? getReportDataMock(filters)
    : await getReportDataDb(createClient(), filters);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Phase 9</p>
        <h1 className="mt-2 text-3xl">Reports</h1>
      </div>
      <ReportsWorkspace
        report={report}
        initialFilters={{ startDate, endDate, division }}
        canEmail={auth.role === "td" || auth.role === "principal"}
      />
    </div>
  );
}

