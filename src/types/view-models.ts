import type {
  IslamicAnchorRow,
  Student3RProfileRow,
  StudentRow,
  TarbiyahActionStepRow,
  TarbiyahParentCommRow,
  TarbiyahReferralRow,
  TarbiyahSessionRow,
  TarbiyahWorksheetResponseRow
} from "@/types";
import type { ActionStepTemplate } from "@/lib/data/action-step-templates";

export interface ReferralWithStudent extends TarbiyahReferralRow {
  student: StudentRow | null;
}

export interface ReferralDetails extends TarbiyahReferralRow {
  student: StudentRow | null;
  sessions: SessionWorkspaceData[];
}

export interface SessionWorkspaceData extends TarbiyahSessionRow {
  referral: TarbiyahReferralRow | null;
  student: StudentRow | null;
  worksheet: TarbiyahWorksheetResponseRow | null;
  anchor: IslamicAnchorRow | null;
  action_steps_rows: TarbiyahActionStepRow[];
  actionStepOptions?: Array<{
    subValue: TarbiyahReferralRow["primary_sub_value"];
    options: ActionStepTemplate[];
  }>;
  anchorOptions?: IslamicAnchorRow[];
  complexity?: TarbiyahReferralRow["complexity"];
}

export interface ActionStepWithContext extends TarbiyahActionStepRow {
  session: TarbiyahSessionRow | null;
  referral: TarbiyahReferralRow | null;
  student: StudentRow | null;
}

export interface StudentProfileData {
  student: StudentRow;
  summary: Student3RProfileRow;
  merits: {
    student_id: string;
    righteousness: number;
    respect: number;
    responsibility: number;
  };
  patternNotes: string;
  referrals: TarbiyahReferralRow[];
  sessions: SessionWorkspaceData[];
  actionSteps: TarbiyahActionStepRow[];
  parentComms: TarbiyahParentCommRow[];
  subValueCounts: Record<string, number>;
}

export interface ReportDataPoint {
  name: string;
  value: number;
}

export interface ReportData {
  totalSessions: number;
  byR: ReportDataPoint[];
  byGrade: ReportDataPoint[];
  byComplexity: ReportDataPoint[];
  topInfractions: ReportDataPoint[];
  flaggedStudents: Array<{
    name: string;
    grade: string;
    reason: string;
    sessionId: string;
  }>;
}

