import type { SupabaseClient } from "@supabase/supabase-js";

import { THREE_R_LABELS, SUB_VALUE_LABELS, findInfractionByKey } from "@/lib/data/infractions";
import type { AppRole } from "@/types/auth";
import type {
  ReferralComplexity,
  StudentRow,
  SubValueKey,
  TarbiyahReferralRow,
  TarbiyahSessionRow,
  ThreeRKey
} from "@/types";
import type { ReferralDetails, ReferralWithStudent, SessionWorkspaceData } from "@/types/view-models";
import { mapStudent } from "./utils";

export async function listReferrals(
  supabase: SupabaseClient,
  role: AppRole,
  userId: string
): Promise<ReferralWithStudent[]> {
  let query = supabase
    .from("tarbiyah_referrals")
    .select("*, students(id, name, grade, house, division)")
    .order("created_at", { ascending: false });

  if (role === "staff") {
    query = query.eq("referred_by", userId);
  }

  const { data, error } = await query;
  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    ...row,
    students: undefined,
    student: mapStudent(row.students)
  })) as ReferralWithStudent[];
}

export async function getReferralDetails(
  supabase: SupabaseClient,
  id: string
): Promise<ReferralDetails | null> {
  const { data, error } = await supabase
    .from("tarbiyah_referrals")
    .select("*, students(id, name, grade, house, division), tarbiyah_sessions(id, session_number, session_date, status)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessions: SessionWorkspaceData[] = ((data as any).tarbiyah_sessions ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => ({
      ...s,
      referral: null,
      student: null,
      worksheet: null,
      anchor: null,
      action_steps_rows: []
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  return {
    ...row,
    tarbiyah_sessions: undefined,
    students: undefined,
    student: mapStudent(row.students),
    sessions
  } as ReferralDetails;
}

export async function createReferral(
  supabase: SupabaseClient,
  input: {
    student_id: string;
    referred_by: string;
    infraction: string;
    staff_notes: string;
  }
): Promise<ReferralWithStudent> {
  const infraction = findInfractionByKey(input.infraction);
  if (!infraction) throw new Error("Invalid infraction key.");

  const { data, error } = await supabase
    .from("tarbiyah_referrals")
    .insert({
      student_id: input.student_id,
      referred_by: input.referred_by,
      infraction: input.infraction,
      infraction_level: infraction.level,
      staff_notes: input.staff_notes,
      primary_r: infraction.r,
      primary_sub_value: infraction.subValue,
      status: "pending"
    })
    .select("*, students(id, name, grade, house, division)")
    .single();

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  return {
    ...row,
    students: undefined,
    student: mapStudent(row.students)
  } as ReferralWithStudent;
}

export async function openSessionFromReferral(
  supabase: SupabaseClient,
  referralId: string,
  payload: {
    complexity: ReferralComplexity;
    primary_r: ThreeRKey;
    primary_sub_value: SubValueKey;
    secondary_r?: ThreeRKey | null;
    secondary_sub_value?: SubValueKey | null;
    tertiary_r?: ThreeRKey | null;
    tertiary_sub_value?: SubValueKey | null;
  },
  tdId: string
): Promise<TarbiyahSessionRow> {
  const { error: updateError } = await supabase
    .from("tarbiyah_referrals")
    .update({ ...payload, status: "in_session" })
    .eq("id", referralId);

  if (updateError) throw updateError;

  const { data: anchor } = await supabase
    .from("islamic_anchor_library")
    .select("id")
    .eq("sub_value", payload.primary_sub_value)
    .eq("is_active", true)
    .maybeSingle();

  const { count } = await supabase
    .from("tarbiyah_sessions")
    .select("id", { count: "exact", head: true })
    .eq("referral_id", referralId);

  const phaseNotes = {
    phase_1: { notes: "" },
    phase_2: { notes: "" },
    phase_3: {
      notes: `Mapped to ${THREE_R_LABELS[payload.primary_r]} / ${SUB_VALUE_LABELS[payload.primary_sub_value]}.`
    },
    phase_4: { notes: "" },
    phase_5: { notes: "" },
    phase_6: { notes: "" },
    phase_7: { notes: "" }
  };

  const { data: session, error: insertError } = await supabase
    .from("tarbiyah_sessions")
    .insert({
      referral_id: referralId,
      session_number: (count ?? 0) + 1,
      session_date: new Date().toISOString().slice(0, 10),
      td_id: tdId,
      phase_notes: phaseNotes,
      phases_completed: [],
      islamic_anchor_id: anchor?.id ?? null,
      action_steps: [],
      status: "open"
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return session as TarbiyahSessionRow;
}

export async function listStudents(
  supabase: SupabaseClient,
  query = ""
): Promise<StudentRow[]> {
  let req = supabase
    .from("students")
    .select("id, name, grade, house, division")
    .order("student_name");

  if (query.trim()) {
    req = req.ilike("student_name", `%${query.trim()}%`);
  }

  const { data, error } = await req;
  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((s: any) => mapStudent(s)!);
}
