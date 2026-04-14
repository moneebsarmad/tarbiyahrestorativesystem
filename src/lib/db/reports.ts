import type { SupabaseClient } from "@supabase/supabase-js";

import { INFRACTION_MAP } from "@/lib/data/infractions";
import type { TarbiyahActionStepRow, TarbiyahReferralRow, StudentRow } from "@/types";
import type { ActionStepWithContext, ReportData } from "@/types/view-models";
import { mapStudent } from "./utils";

export async function listActionSteps(
  supabase: SupabaseClient
): Promise<ActionStepWithContext[]> {
  const { data, error } = await supabase
    .from("tarbiyah_action_steps")
    .select(`
      *,
      tarbiyah_sessions(
        id, referral_id, session_date, status,
        tarbiyah_referrals(*, students(id, name, grade, house, division))
      )
    `)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => {
    const sessionRow = row.tarbiyah_sessions;
    const referralRow = sessionRow?.tarbiyah_referrals;
    const student: StudentRow | null = mapStudent(referralRow?.students ?? null);
    const referral: TarbiyahReferralRow | null = referralRow
      ? { ...referralRow, students: undefined }
      : null;
    const session = sessionRow ? { ...sessionRow, tarbiyah_referrals: undefined } : null;

    return {
      ...row,
      tarbiyah_sessions: undefined,
      session,
      referral,
      student
    } as ActionStepWithContext;
  });
}

export async function getFlaggedSessions(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("tarbiyah_sessions")
    .select(`
      id, muraaqabah_flag_reason, referral_id,
      tarbiyah_referrals(student_id, students(id, name, grade))
    `)
    .eq("muraaqabah_flag", true)
    .eq("muraaqabah_overridden", false);

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => {
    const student = mapStudent(row.tarbiyah_referrals?.students ?? null);
    return {
      id: row.id,
      studentName: student?.name ?? "Unknown",
      grade: student?.grade ?? "?",
      reason: row.muraaqabah_flag_reason ?? "manual",
      sessionCount: 0
    };
  });
}

export async function getReportData(
  supabase: SupabaseClient,
  filters?: { startDate?: string; endDate?: string; division?: string }
): Promise<ReportData> {
  let query = supabase
    .from("tarbiyah_sessions")
    .select(`
      id, session_date, muraaqabah_flag, muraaqabah_overridden,
      tarbiyah_referrals(primary_r, complexity, infraction, students(grade, division))
    `)
    .eq("status", "completed");

  if (filters?.startDate) query = query.gte("session_date", filters.startDate);
  if (filters?.endDate) query = query.lte("session_date", filters.endDate);

  const { data, error } = await query;
  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sessions: any[] = data ?? [];

  if (filters?.division) {
    sessions = sessions.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.tarbiyah_referrals?.students?.division === filters.division
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const referrals = sessions.map((s: any) => s.tarbiyah_referrals).filter(Boolean);

  const byR: ReportData["byR"] = [
    { name: "Righteousness", value: referrals.filter((r: any) => r.primary_r === "righteousness").length },
    { name: "Respect", value: referrals.filter((r: any) => r.primary_r === "respect").length },
    { name: "Responsibility", value: referrals.filter((r: any) => r.primary_r === "responsibility").length }
  ];

  const gradeMap = sessions.reduce<Record<string, number>>((acc, s: any) => {
    const grade = s.tarbiyah_referrals?.students?.grade ?? "Unknown";
    acc[String(grade)] = (acc[String(grade)] ?? 0) + 1;
    return acc;
  }, {});

  const infractionMap = referrals.reduce<Map<string, number>>((acc, r: any) => {
    acc.set(r.infraction, (acc.get(r.infraction) ?? 0) + 1);
    return acc;
  }, new Map());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flagged = sessions.filter((s: any) => s.muraaqabah_flag && !s.muraaqabah_overridden);

  // For flagged students we need names — fetch separately
  const flaggedIds = flagged.map((s: any) => s.id);
  let flaggedStudents: ReportData["flaggedStudents"] = [];
  if (flaggedIds.length > 0) {
    const { data: flaggedRows } = await supabase
      .from("tarbiyah_sessions")
      .select(`
        id, muraaqabah_flag_reason,
        tarbiyah_referrals(students(name, grade))
      `)
      .in("id", flaggedIds);

    flaggedStudents = (flaggedRows ?? []).map((row: any) => ({
      name: row.tarbiyah_referrals?.students?.name ?? "Unknown",
      grade: String(row.tarbiyah_referrals?.students?.grade ?? "?"),
      reason: row.muraaqabah_flag_reason ?? "manual",
      sessionId: row.id
    }));
  }

  return {
    totalSessions: sessions.length,
    byR,
    byGrade: Object.entries(gradeMap).map(([name, value]) => ({ name, value })),
    byComplexity: [
      { name: "Simple", value: referrals.filter((r: any) => r.complexity === "simple").length },
      { name: "Compound", value: referrals.filter((r: any) => r.complexity === "compound").length },
      { name: "Complex", value: referrals.filter((r: any) => r.complexity === "complex").length }
    ],
    topInfractions: Array.from(infractionMap)
      .map(([key, value]) => ({ name: INFRACTION_MAP[key]?.label ?? key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    flaggedStudents
  };
}
