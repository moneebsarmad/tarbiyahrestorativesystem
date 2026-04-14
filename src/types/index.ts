export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue | undefined }
  | JsonValue[];

export const THREE_RS = ["righteousness", "respect", "responsibility"] as const;
export const SUB_VALUE_KEYS = [
  "taqwa",
  "sidq",
  "iffah",
  "taharah",
  "hilm",
  "riayah",
  "hifz_al_huquq",
  "adab",
  "amanah",
  "indibat",
  "iltizam",
  "muraqabah"
] as const;
export const REFERRAL_COMPLEXITIES = ["simple", "compound", "complex"] as const;
export const REFERRAL_STATUSES = [
  "pending",
  "td_review",
  "scheduled",
  "in_session",
  "completed",
  "flagged"
] as const;
export const SESSION_STATUSES = ["open", "completed", "split_pending"] as const;
export const ANCHOR_TYPES = ["ayah", "hadith"] as const;
export const PARENT_COMM_TYPES = ["email_summary", "conference", "phone"] as const;
export const STUDENT_DIVISIONS = ["elementary", "secondary"] as const;

export type ThreeRKey = (typeof THREE_RS)[number];
export type SubValueKey = (typeof SUB_VALUE_KEYS)[number];
export type ReferralComplexity = (typeof REFERRAL_COMPLEXITIES)[number];
export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];
export type SessionStatus = (typeof SESSION_STATUSES)[number];
export type AnchorType = (typeof ANCHOR_TYPES)[number];
export type ParentCommType = (typeof PARENT_COMM_TYPES)[number];
export type StudentDivision = (typeof STUDENT_DIVISIONS)[number];
export type InfractionLevel = 1 | 2 | 3 | 4;

export interface StudentRow {
  id: string;
  name: string | null;
  grade: string | null;
  house: string | null;
  division: StudentDivision | null;
}

export interface TarbiyahReferralRow {
  id: string;
  student_id: string;
  referred_by: string | null;
  infraction: string;
  infraction_level: number | null;
  staff_notes: string | null;
  sycamore_log_id: string | null;
  complexity: ReferralComplexity | null;
  primary_r: ThreeRKey | null;
  primary_sub_value: SubValueKey | null;
  secondary_r: ThreeRKey | null;
  secondary_sub_value: SubValueKey | null;
  tertiary_r: ThreeRKey | null;
  tertiary_sub_value: SubValueKey | null;
  status: ReferralStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface TarbiyahSessionRow {
  id: string;
  referral_id: string;
  session_number: number;
  session_date: string;
  td_id: string;
  phase_notes: JsonValue;
  phases_completed: number[];
  islamic_anchor_id: string | null;
  action_steps: JsonValue;
  follow_up_date: string | null;
  follow_up_notes: string | null;
  parent_contacted: boolean;
  parent_conference_held: boolean;
  muraaqabah_flag: boolean;
  muraaqabah_flag_reason: string | null;
  muraaqabah_overridden: boolean;
  student_token: string | null;
  student_token_expires_at: string | null;
  status: SessionStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface TarbiyahActionStepRow {
  id: string;
  session_id: string;
  r: ThreeRKey;
  sub_value: SubValueKey;
  description: string;
  assigned_date: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  completed_by_role: string | null;
  completion_notes: string | null;
  created_at: string | null;
}

export interface IslamicAnchorRow {
  id: string;
  sub_value: SubValueKey;
  anchor_type: AnchorType;
  arabic_text: string;
  transliteration: string | null;
  translation: string;
  source: string;
  discussion_questions: JsonValue;
  is_system_default: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TarbiyahWorksheetResponseRow {
  id: string;
  session_id: string;
  student_id: string;
  what_happened: string | null;
  feelings: string | null;
  who_affected: string | null;
  prophet_reflection: string | null;
  righteousness_response: string | null;
  respect_response: string | null;
  responsibility_response: string | null;
  submitted_at: string | null;
}

export interface TarbiyahParentCommRow {
  id: string;
  session_id: string;
  student_id: string;
  comm_type: ParentCommType;
  sent_at: string | null;
  sent_by: string | null;
  recipient_email: string | null;
  email_subject: string | null;
  email_body: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface Student3RProfileRow {
  student_id: string;
  name: string | null;
  grade: string | null;
  house: string | null;
  division: StudentDivision | null;
  righteousness_demerits: number;
  respect_demerits: number;
  responsibility_demerits: number;
  righteousness_merits: number;
  respect_merits: number;
  responsibility_merits: number;
  total_sessions: number;
  simple_sessions: number;
  compound_sessions: number;
  complex_sessions: number;
  action_step_completion_rate: number;
  last_session_date: string | null;
  muraaqabah_active: boolean;
}

export interface SessionOutcomeViewRow {
  id: string;
  referral_id: string;
  student_id: string;
  session_number: number;
  session_date: string;
  td_id: string;
  islamic_anchor_id: string | null;
  follow_up_date: string | null;
  follow_up_notes: string | null;
  parent_contacted: boolean;
  parent_conference_held: boolean;
  muraaqabah_flag: boolean;
  muraaqabah_flag_reason: string | null;
  muraaqabah_overridden: boolean;
  status: SessionStatus;
  created_at: string | null;
  updated_at: string | null;
}
