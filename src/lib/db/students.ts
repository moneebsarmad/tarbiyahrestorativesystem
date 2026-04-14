import type { SupabaseClient } from "@supabase/supabase-js";

import { HOME_SUGGESTIONS } from "@/lib/data/home-suggestions";
import { THREE_R_LABELS, SUB_VALUE_LABELS } from "@/lib/data/infractions";
import type {
  Student3RProfileRow,
  StudentRow,
  SubValueKey,
  TarbiyahActionStepRow,
  TarbiyahParentCommRow,
  TarbiyahReferralRow
} from "@/types";
import type { SessionWorkspaceData, StudentProfileData } from "@/types/view-models";
import { mapStudent } from "./utils";
import { getSessionWorkspace } from "./sessions";

export async function getStudentProfile(
  supabase: SupabaseClient,
  studentId: string
): Promise<StudentProfileData | null> {
  // Student base row
  const { data: studentRow, error: studentError } = await supabase
    .from("students")
    .select("id, name, grade, house, division")
    .eq("id", studentId)
    .maybeSingle();

  if (studentError) throw studentError;
  if (!studentRow) return null;

  const student = mapStudent(studentRow)!;

  // Referrals for this student
  const { data: referralRows, error: referralError } = await supabase
    .from("tarbiyah_referrals")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (referralError) throw referralError;
  const referrals = (referralRows ?? []) as TarbiyahReferralRow[];
  const referralIds = referrals.map((r) => r.id);

  // Sessions for these referrals
  let sessions: SessionWorkspaceData[] = [];
  if (referralIds.length > 0) {
    const { data: sessionIds } = await supabase
      .from("tarbiyah_sessions")
      .select("id")
      .in("referral_id", referralIds)
      .order("session_date", { ascending: false });

    sessions = await Promise.all(
      (sessionIds ?? []).map((row) => getSessionWorkspace(supabase, row.id))
    ).then((results) => results.filter(Boolean) as SessionWorkspaceData[]);
  }

  // Action steps for these sessions
  const sessionIds = sessions.map((s) => s.id);
  let actionSteps: TarbiyahActionStepRow[] = [];
  if (sessionIds.length > 0) {
    const { data: steps } = await supabase
      .from("tarbiyah_action_steps")
      .select("*")
      .in("session_id", sessionIds);
    actionSteps = (steps ?? []) as TarbiyahActionStepRow[];
  }

  // Parent comms
  const { data: commRows } = await supabase
    .from("tarbiyah_parent_comms")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  const parentComms = (commRows ?? []) as TarbiyahParentCommRow[];

  // Pattern notes
  const { data: notesRow } = await supabase
    .from("student_pattern_notes")
    .select("notes")
    .eq("student_id", studentId)
    .maybeSingle();
  const patternNotes = notesRow?.notes ?? "";

  // Build summary
  const byR = {
    righteousness: referrals.filter((r) => r.primary_r === "righteousness").length,
    respect: referrals.filter((r) => r.primary_r === "respect").length,
    responsibility: referrals.filter((r) => r.primary_r === "responsibility").length
  };
  const completedSteps = actionSteps.filter((s) => s.completed).length;
  const summary: Student3RProfileRow = {
    student_id: student.id,
    name: student.name,
    grade: student.grade,
    house: student.house,
    division: student.division,
    righteousness_demerits: byR.righteousness,
    respect_demerits: byR.respect,
    responsibility_demerits: byR.responsibility,
    righteousness_merits: 0,
    respect_merits: 0,
    responsibility_merits: 0,
    total_sessions: sessions.length,
    simple_sessions: referrals.filter((r) => r.complexity === "simple").length,
    compound_sessions: referrals.filter((r) => r.complexity === "compound").length,
    complex_sessions: referrals.filter((r) => r.complexity === "complex").length,
    action_step_completion_rate:
      actionSteps.length === 0 ? 0 : Number((completedSteps / actionSteps.length).toFixed(2)),
    last_session_date: sessions[0]?.session_date ?? null,
    muraaqabah_active: sessions.some((s) => s.muraaqabah_flag && !s.muraaqabah_overridden)
  };

  // Sub-value counts
  const subValueCounts = referrals.reduce<Record<string, number>>((acc, r) => {
    for (const sv of [r.primary_sub_value, r.secondary_sub_value, r.tertiary_sub_value]) {
      if (sv) acc[sv] = (acc[sv] ?? 0) + 1;
    }
    return acc;
  }, {});

  return {
    student,
    summary,
    merits: { student_id: student.id, righteousness: 0, respect: 0, responsibility: 0 },
    patternNotes,
    referrals,
    sessions,
    actionSteps,
    parentComms,
    subValueCounts
  };
}

export async function updateStudentPatternNotes(
  supabase: SupabaseClient,
  studentId: string,
  notes: string
): Promise<string> {
  const { error } = await supabase
    .from("student_pattern_notes")
    .upsert(
      { student_id: studentId, notes, updated_at: new Date().toISOString() },
      { onConflict: "student_id" }
    );

  if (error) throw error;
  return notes;
}

export async function sendParentComm(
  supabase: SupabaseClient,
  input: {
    session_id: string;
    student_id: string;
    parent_email: string;
    subject: string;
    body: string;
    sent_by: string;
  }
): Promise<TarbiyahParentCommRow> {
  const { data, error } = await supabase
    .from("tarbiyah_parent_comms")
    .insert({
      session_id: input.session_id,
      student_id: input.student_id,
      comm_type: "email_summary",
      sent_at: new Date().toISOString(),
      sent_by: input.sent_by,
      recipient_email: input.parent_email,
      email_subject: input.subject,
      email_body: input.body,
      notes: "Delivered via RTS."
    })
    .select()
    .single();

  if (error) throw error;
  return data as TarbiyahParentCommRow;
}

export async function getParentEmailDraft(
  supabase: SupabaseClient,
  sessionId: string
): Promise<{ subject: string; body: string; suggestions: string[] } | null> {
  const { data, error } = await supabase
    .from("tarbiyah_sessions")
    .select(`
      id, follow_up_date,
      tarbiyah_referrals(primary_r, primary_sub_value),
      tarbiyah_action_steps(description)
    `)
    .eq("id", sessionId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  const referral = row.tarbiyah_referrals;
  const primaryR = referral?.primary_r ?? "respect";
  const primarySV = (referral?.primary_sub_value ?? "adab") as SubValueKey;
  const actionStep = row.tarbiyah_action_steps?.[0];

  // Fetch student name via referral → student join
  const { data: studentRow } = await supabase
    .from("tarbiyah_referrals")
    .select("students(name)")
    .eq("tarbiyah_sessions.id", sessionId)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const studentName = (studentRow as any)?.students?.name ?? "the student";

  return {
    subject: `Restorative Tarbiyah Follow-Up for ${studentName}`,
    body: `${studentName} participated in a restorative tarbiyah session focused on ${THREE_R_LABELS[primaryR as keyof typeof THREE_R_LABELS] ?? primaryR} and ${SUB_VALUE_LABELS[primarySV]}. The committed action step is: ${actionStep?.description ?? "to complete the agreed reflection and repair plan"}. Follow-up is scheduled for ${row.follow_up_date ?? "the next available school day"}.`,
    suggestions: HOME_SUGGESTIONS[primarySV] ?? []
  };
}

export { listStudents } from "./referrals";
