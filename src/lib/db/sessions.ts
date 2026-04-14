import type { SupabaseClient } from "@supabase/supabase-js";

import { getActionStepTemplates } from "@/lib/data/action-step-templates";
import type { AppRole } from "@/types/auth";
import type {
  IslamicAnchorRow,
  JsonValue,
  StudentRow,
  SubValueKey,
  TarbiyahActionStepRow,
  TarbiyahReferralRow,
  TarbiyahSessionRow,
  TarbiyahWorksheetResponseRow
} from "@/types";
import type { SessionWorkspaceData } from "@/types/view-models";
import { mapStudent } from "./utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildWorkspaceData(
  session: TarbiyahSessionRow,
  referral: TarbiyahReferralRow | null,
  student: StudentRow | null,
  worksheet: TarbiyahWorksheetResponseRow | null,
  anchor: IslamicAnchorRow | null,
  actionStepRows: TarbiyahActionStepRow[],
  anchorOptions: IslamicAnchorRow[] = []
): SessionWorkspaceData {
  const subValues = [
    referral?.primary_sub_value,
    referral?.secondary_sub_value,
    referral?.tertiary_sub_value
  ].filter(Boolean) as SubValueKey[];

  const actionStepOptions = subValues.map((subValue) => ({
    subValue,
    options: getActionStepTemplates(subValue, referral?.infraction_level ?? 1)
  }));

  return {
    ...session,
    referral,
    student,
    worksheet,
    anchor,
    action_steps_rows: actionStepRows,
    actionStepOptions,
    anchorOptions,
    complexity: referral?.complexity ?? undefined
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSession(row: any): TarbiyahSessionRow {
  const { tarbiyah_referrals, tarbiyah_worksheet_responses, tarbiyah_action_steps, islamic_anchor_library, ...rest } = row;
  void tarbiyah_referrals; void tarbiyah_worksheet_responses; void tarbiyah_action_steps; void islamic_anchor_library;
  return rest as TarbiyahSessionRow;
}

async function fetchWorkspaceById(
  supabase: SupabaseClient,
  id: string
): Promise<SessionWorkspaceData | null> {
  const { data, error } = await supabase
    .from("tarbiyah_sessions")
    .select(`
      *,
      tarbiyah_referrals(*, students(id, name, grade, house, division)),
      tarbiyah_worksheet_responses(*),
      tarbiyah_action_steps(*),
      islamic_anchor_library(*)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  const referral: TarbiyahReferralRow | null = row.tarbiyah_referrals
    ? { ...row.tarbiyah_referrals, students: undefined }
    : null;

  const student = mapStudent(row.tarbiyah_referrals?.students ?? null);
  const worksheet: TarbiyahWorksheetResponseRow | null =
    row.tarbiyah_worksheet_responses?.[0] ?? null;
  const anchor: IslamicAnchorRow | null = row.islamic_anchor_library ?? null;
  const actionStepRows: TarbiyahActionStepRow[] = row.tarbiyah_action_steps ?? [];

  // Fetch anchor options for sub values on this referral
  const subValues = [
    referral?.primary_sub_value,
    referral?.secondary_sub_value,
    referral?.tertiary_sub_value
  ].filter(Boolean) as SubValueKey[];

  let anchorOptions: IslamicAnchorRow[] = [];
  if (subValues.length > 0) {
    const { data: anchors } = await supabase
      .from("islamic_anchor_library")
      .select("*")
      .in("sub_value", subValues)
      .eq("is_active", true);
    anchorOptions = (anchors ?? []) as IslamicAnchorRow[];
  }

  return buildWorkspaceData(
    rowToSession(row),
    referral,
    student,
    worksheet,
    anchor,
    actionStepRows,
    anchorOptions
  );
}

// ---------------------------------------------------------------------------
// Exported functions
// ---------------------------------------------------------------------------

export async function listSessions(
  supabase: SupabaseClient,
  role: AppRole
): Promise<SessionWorkspaceData[]> {
  if (role !== "td" && role !== "counselor") return [];

  const { data, error } = await supabase
    .from("tarbiyah_sessions")
    .select(`
      *,
      tarbiyah_referrals(*, students(id, name, grade, house, division)),
      tarbiyah_worksheet_responses(*),
      tarbiyah_action_steps(*),
      islamic_anchor_library(*)
    `)
    .order("session_date", { ascending: false });

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => {
    const referral: TarbiyahReferralRow | null = row.tarbiyah_referrals
      ? { ...row.tarbiyah_referrals, students: undefined }
      : null;
    const student = mapStudent(row.tarbiyah_referrals?.students ?? null);
    const worksheet = row.tarbiyah_worksheet_responses?.[0] ?? null;
    const anchor = row.islamic_anchor_library ?? null;
    const actionStepRows = row.tarbiyah_action_steps ?? [];
    return buildWorkspaceData(rowToSession(row), referral, student, worksheet, anchor, actionStepRows);
  });
}

export async function getSessionWorkspace(
  supabase: SupabaseClient,
  id: string
): Promise<SessionWorkspaceData | null> {
  return fetchWorkspaceById(supabase, id);
}

export async function updateSession(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<TarbiyahSessionRow>
): Promise<SessionWorkspaceData> {
  const { error } = await supabase
    .from("tarbiyah_sessions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;

  const workspace = await fetchWorkspaceById(supabase, id);
  if (!workspace) throw new Error("Session not found.");
  return workspace;
}

export async function updateSessionPhase(
  supabase: SupabaseClient,
  id: string,
  phaseKey: string,
  value: JsonValue
): Promise<SessionWorkspaceData> {
  const { data: current, error: fetchError } = await supabase
    .from("tarbiyah_sessions")
    .select("phase_notes, phases_completed")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  const phaseNotes = {
    ...(current.phase_notes as Record<string, JsonValue>),
    [phaseKey]: value
  };

  const completed = new Set<number>(current.phases_completed as number[]);
  const phaseNumber = Number(phaseKey.replace("phase_", ""));
  if (value && phaseNumber) completed.add(phaseNumber);

  const { error } = await supabase
    .from("tarbiyah_sessions")
    .update({
      phase_notes: phaseNotes,
      phases_completed: Array.from(completed).sort((a, b) => a - b),
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) throw error;

  const workspace = await fetchWorkspaceById(supabase, id);
  if (!workspace) throw new Error("Session not found.");
  return workspace;
}

export async function completeSession(supabase: SupabaseClient, id: string) {
  const { data: session, error: sessionError } = await supabase
    .from("tarbiyah_sessions")
    .select("*, tarbiyah_referrals(student_id, complexity, infraction_level)")
    .eq("id", id)
    .single();

  if (sessionError) throw sessionError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const referralRow = (session as any).tarbiyah_referrals;
  const selectedSteps = (session.action_steps as Array<{
    r: string; sub_value: string; description: string; due_date?: string | null;
  }>) ?? [];

  // Insert action step rows that don't already exist
  if (selectedSteps.length > 0) {
    const { data: existing } = await supabase
      .from("tarbiyah_action_steps")
      .select("description")
      .eq("session_id", id);

    const existingDescriptions = new Set((existing ?? []).map((s) => s.description));
    const today = new Date().toISOString().slice(0, 10);

    const toInsert = selectedSteps
      .filter((step) => !existingDescriptions.has(step.description))
      .map((step) => ({
        session_id: id,
        r: step.r,
        sub_value: step.sub_value,
        description: step.description,
        assigned_date: today,
        due_date: step.due_date ?? session.follow_up_date ?? null,
        completed: false
      }));

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("tarbiyah_action_steps")
        .insert(toInsert);
      if (insertError) throw insertError;
    }
  }

  // Evaluate muraqabah: 2+ sessions within 45 days or complex incident
  let muraqabahReason: string | null = null;
  if (referralRow) {
    const cutoff = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { count } = await supabase
      .from("tarbiyah_sessions")
      .select("id", { count: "exact", head: true })
      .eq("tarbiyah_referrals.student_id", referralRow.student_id)
      .gte("session_date", cutoff);

    if ((count ?? 0) >= 2) muraqabahReason = "repeat_within_45_days";
    else if (referralRow.complexity === "complex") muraqabahReason = "complex_incident";
  }

  const { error: updateError } = await supabase
    .from("tarbiyah_sessions")
    .update({
      status: "completed",
      student_token: null,
      student_token_expires_at: null,
      muraaqabah_flag: Boolean(muraqabahReason),
      muraaqabah_flag_reason: muraqabahReason,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (updateError) throw updateError;

  const newReferralStatus = muraqabahReason ? "flagged" : "completed";
  await supabase
    .from("tarbiyah_referrals")
    .update({ status: newReferralStatus, updated_at: new Date().toISOString() })
    .eq("id", session.referral_id);

  const { count: actionStepCount } = await supabase
    .from("tarbiyah_action_steps")
    .select("id", { count: "exact", head: true })
    .eq("session_id", id);

  const workspace = await fetchWorkspaceById(supabase, id);
  if (!workspace) throw new Error("Session not found.");

  return { ...workspace, summary: { actionStepCount: actionStepCount ?? 0, muraqabahReason } };
}

export async function completeActionStep(
  supabase: SupabaseClient,
  id: string,
  completionNotes: string,
  completedByRole = "td"
): Promise<TarbiyahActionStepRow> {
  const { data, error } = await supabase
    .from("tarbiyah_action_steps")
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      completed_by_role: completedByRole,
      completion_notes: completionNotes
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as TarbiyahActionStepRow;
}

export async function generateStudentToken(
  supabase: SupabaseClient,
  sessionId: string
): Promise<{ token: string; expiresAt: string; url: string }> {
  const token = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("tarbiyah_sessions")
    .update({
      student_token: token,
      student_token_expires_at: expiresAt,
      updated_at: new Date().toISOString()
    })
    .eq("id", sessionId);

  if (error) throw error;
  return { token, expiresAt, url: `/session/${token}` };
}

export async function getSessionByToken(
  supabase: SupabaseClient,
  token: string
): Promise<(SessionWorkspaceData & { complexity: string }) | null> {
  const { data, error } = await supabase
    .from("tarbiyah_sessions")
    .select("id")
    .eq("student_token", token)
    .gt("student_token_expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const workspace = await fetchWorkspaceById(supabase, data.id);
  if (!workspace) return null;

  return {
    ...workspace,
    complexity: workspace.referral?.complexity ?? "simple"
  };
}

export async function upsertWorksheetByToken(
  supabase: SupabaseClient,
  token: string,
  input: Partial<TarbiyahWorksheetResponseRow>
): Promise<TarbiyahWorksheetResponseRow> {
  const session = await getSessionByToken(supabase, token);
  if (!session || !session.student) throw new Error("Invalid or expired session token.");

  const { data, error } = await supabase
    .from("tarbiyah_worksheet_responses")
    .upsert(
      {
        session_id: session.id,
        student_id: session.student.id,
        ...input,
        submitted_at: new Date().toISOString()
      },
      { onConflict: "session_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as TarbiyahWorksheetResponseRow;
}

export async function dismissMuraaqabah(
  supabase: SupabaseClient,
  sessionId: string,
  notes: string
): Promise<SessionWorkspaceData> {
  const { data: current, error: fetchError } = await supabase
    .from("tarbiyah_sessions")
    .select("follow_up_notes")
    .eq("id", sessionId)
    .single();

  if (fetchError) throw fetchError;

  const combined = [current.follow_up_notes, `Murāqabah override: ${notes}`]
    .filter(Boolean)
    .join("\n\n");

  const { error } = await supabase
    .from("tarbiyah_sessions")
    .update({
      muraaqabah_overridden: true,
      follow_up_notes: combined,
      updated_at: new Date().toISOString()
    })
    .eq("id", sessionId);

  if (error) throw error;

  const workspace = await fetchWorkspaceById(supabase, sessionId);
  if (!workspace) throw new Error("Session not found.");
  return workspace;
}
