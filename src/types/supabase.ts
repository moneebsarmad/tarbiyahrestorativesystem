import type { AppRole, Campus } from "@/types/auth";
import type {
  IslamicAnchorRow,
  JsonValue,
  SessionOutcomeViewRow,
  Student3RProfileRow,
  StudentRow,
  TarbiyahActionStepRow,
  TarbiyahParentCommRow,
  TarbiyahReferralRow,
  TarbiyahSessionRow,
  TarbiyahWorksheetResponseRow
} from "@/types";

export type Json = JsonValue;

export type Database = {
  public: {
    Tables: {
      students: {
        Row: StudentRow;
        Insert: {
          id: string;
          name?: string | null;
          grade?: string | null;
          house?: string | null;
          division?: StudentRow["division"];
        };
        Update: {
          id?: string;
          name?: string | null;
          grade?: string | null;
          house?: string | null;
          division?: StudentRow["division"];
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: AppRole;
          campus: Campus | null;
          created_at: string | null;
        };
        Insert: {
          user_id: string;
          role: AppRole;
          campus?: Campus | null;
          created_at?: string | null;
        };
        Update: {
          user_id?: string;
          role?: AppRole;
          campus?: Campus | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      tarbiyah_referrals: {
        Row: TarbiyahReferralRow;
        Insert: {
          id?: string;
          student_id: string;
          referred_by?: string | null;
          infraction: string;
          infraction_level?: number | null;
          staff_notes?: string | null;
          sycamore_log_id?: string | null;
          complexity?: TarbiyahReferralRow["complexity"];
          primary_r?: TarbiyahReferralRow["primary_r"];
          primary_sub_value?: TarbiyahReferralRow["primary_sub_value"];
          secondary_r?: TarbiyahReferralRow["secondary_r"];
          secondary_sub_value?: TarbiyahReferralRow["secondary_sub_value"];
          tertiary_r?: TarbiyahReferralRow["tertiary_r"];
          tertiary_sub_value?: TarbiyahReferralRow["tertiary_sub_value"];
          status?: TarbiyahReferralRow["status"];
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<TarbiyahReferralRow>;
        Relationships: [];
      };
      tarbiyah_sessions: {
        Row: TarbiyahSessionRow;
        Insert: {
          id?: string;
          referral_id: string;
          session_number?: number;
          session_date: string;
          td_id: string;
          phase_notes?: Json;
          phases_completed?: number[];
          islamic_anchor_id?: string | null;
          action_steps?: Json;
          follow_up_date?: string | null;
          follow_up_notes?: string | null;
          parent_contacted?: boolean;
          parent_conference_held?: boolean;
          muraaqabah_flag?: boolean;
          muraaqabah_flag_reason?: string | null;
          muraaqabah_overridden?: boolean;
          student_token?: string | null;
          student_token_expires_at?: string | null;
          status?: TarbiyahSessionRow["status"];
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<TarbiyahSessionRow>;
        Relationships: [];
      };
      tarbiyah_action_steps: {
        Row: TarbiyahActionStepRow;
        Insert: {
          id?: string;
          session_id: string;
          r: TarbiyahActionStepRow["r"];
          sub_value: TarbiyahActionStepRow["sub_value"];
          description: string;
          assigned_date: string;
          due_date?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          completed_by_role?: string | null;
          completion_notes?: string | null;
          created_at?: string | null;
        };
        Update: Partial<TarbiyahActionStepRow>;
        Relationships: [];
      };
      islamic_anchor_library: {
        Row: IslamicAnchorRow;
        Insert: {
          id?: string;
          sub_value: IslamicAnchorRow["sub_value"];
          anchor_type: IslamicAnchorRow["anchor_type"];
          arabic_text: string;
          transliteration?: string | null;
          translation: string;
          source: string;
          discussion_questions?: Json;
          is_system_default?: boolean;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<IslamicAnchorRow>;
        Relationships: [];
      };
      tarbiyah_worksheet_responses: {
        Row: TarbiyahWorksheetResponseRow;
        Insert: {
          id?: string;
          session_id: string;
          student_id: string;
          what_happened?: string | null;
          feelings?: string | null;
          who_affected?: string | null;
          prophet_reflection?: string | null;
          righteousness_response?: string | null;
          respect_response?: string | null;
          responsibility_response?: string | null;
          submitted_at?: string | null;
        };
        Update: Partial<TarbiyahWorksheetResponseRow>;
        Relationships: [];
      };
      tarbiyah_parent_comms: {
        Row: TarbiyahParentCommRow;
        Insert: {
          id?: string;
          session_id: string;
          student_id: string;
          comm_type: TarbiyahParentCommRow["comm_type"];
          sent_at?: string | null;
          sent_by?: string | null;
          recipient_email?: string | null;
          email_subject?: string | null;
          email_body?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: Partial<TarbiyahParentCommRow>;
        Relationships: [];
      };
    };
    Views: {
      student_3r_profile: {
        Row: Student3RProfileRow;
      };
      student_3r_profile_read: {
        Row: Student3RProfileRow;
      };
      tarbiyah_session_outcomes: {
        Row: SessionOutcomeViewRow;
      };
    };
    Functions: {
      current_app_role: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      refresh_student_3r_profile: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
