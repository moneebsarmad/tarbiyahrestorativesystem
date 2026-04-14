import { ACTION_STEP_TEMPLATES, getActionStepTemplates } from "@/lib/data/action-step-templates";
import { ISLAMIC_ANCHOR_SEED } from "@/lib/data/anchors-seed";
import {
  INFRACTION_MAP,
  INFRACTIONS,
  SUB_VALUE_LABELS,
  THREE_R_LABELS,
  findInfractionByKey
} from "@/lib/data/infractions";
import { HOME_SUGGESTIONS } from "@/lib/data/home-suggestions";
import type { MockAuthUser } from "@/lib/mock/auth";
import { MOCK_AUTH_USERS } from "@/lib/mock/auth";
import type {
  IslamicAnchorRow,
  JsonValue,
  ParentCommType,
  ReferralComplexity,
  ReferralStatus,
  Student3RProfileRow,
  StudentRow,
  SubValueKey,
  TarbiyahActionStepRow,
  TarbiyahParentCommRow,
  TarbiyahReferralRow,
  TarbiyahSessionRow,
  TarbiyahWorksheetResponseRow,
  ThreeRKey
} from "@/types";

interface StudentMeritRecord {
  student_id: string;
  righteousness: number;
  respect: number;
  responsibility: number;
}

interface SycamoreLogRow {
  id: string;
  student_id: string;
  infraction_key: string;
  staff_notes: string;
  created_at: string;
  imported: boolean;
}

interface MockStoreState {
  users: MockAuthUser[];
  students: StudentRow[];
  studentMerits: StudentMeritRecord[];
  studentPatternNotes: Record<string, string>;
  referrals: TarbiyahReferralRow[];
  sessions: TarbiyahSessionRow[];
  actionSteps: TarbiyahActionStepRow[];
  anchors: IslamicAnchorRow[];
  worksheetResponses: TarbiyahWorksheetResponseRow[];
  parentComms: TarbiyahParentCommRow[];
  sycamoreLogs: SycamoreLogRow[];
}

type SessionPhaseNotes = Record<string, JsonValue>;

declare global {
  var __RTS_MOCK_STORE__: MockStoreState | undefined;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function toDateString(value: string) {
  return value.slice(0, 10);
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function seedAnchors(): IslamicAnchorRow[] {
  return ISLAMIC_ANCHOR_SEED.map((anchor, index) => ({
    ...anchor,
    id: `anchor-${index + 1}`,
    created_by: "user-td",
    created_at: daysAgo(45),
    updated_at: daysAgo(14)
  }));
}

function buildPhaseNotes(
  values: Partial<SessionPhaseNotes> = {}
): SessionPhaseNotes {
  return {
    phase_1: { notes: "" },
    phase_2: { notes: "" },
    phase_3: { notes: "" },
    phase_4: { notes: "" },
    phase_5: { notes: "" },
    phase_6: { notes: "" },
    phase_7: { notes: "" },
    ...values
  };
}

function createSeedState(): MockStoreState {
  const students: StudentRow[] = [
    { id: "student-1", name: "Ahmad Yusuf", grade: "8", house: "Ihsan", division: "secondary" },
    { id: "student-2", name: "Maryam Ali", grade: "6", house: "Sabr", division: "secondary" },
    { id: "student-3", name: "Bilal Khan", grade: "10", house: "Shukr", division: "secondary" },
    { id: "student-4", name: "Amina Hassan", grade: "4", house: "Ihsan", division: "elementary" },
    { id: "student-5", name: "Zayd Rahman", grade: "7", house: "Sabr", division: "secondary" },
    { id: "student-6", name: "Khadijah Noor", grade: "11", house: "Shukr", division: "secondary" }
  ];

  const anchors = seedAnchors();

  const referrals: TarbiyahReferralRow[] = [
    {
      id: "referral-1",
      student_id: "student-1",
      referred_by: "user-staff",
      infraction: "staff_disrespect",
      infraction_level: 2,
      staff_notes: "Used a dismissive tone during redirection and refused to reset.",
      sycamore_log_id: null,
      complexity: "simple",
      primary_r: "respect",
      primary_sub_value: "adab",
      secondary_r: null,
      secondary_sub_value: null,
      tertiary_r: null,
      tertiary_sub_value: null,
      status: "completed",
      created_at: daysAgo(9),
      updated_at: daysAgo(8)
    },
    {
      id: "referral-2",
      student_id: "student-2",
      referred_by: "user-staff",
      infraction: "chronic_tardiness",
      infraction_level: 1,
      staff_notes: "Late to class three times this week.",
      sycamore_log_id: null,
      complexity: "simple",
      primary_r: "responsibility",
      primary_sub_value: "indibat",
      secondary_r: null,
      secondary_sub_value: null,
      tertiary_r: null,
      tertiary_sub_value: null,
      status: "pending",
      created_at: daysAgo(2),
      updated_at: daysAgo(2)
    },
    {
      id: "referral-3",
      student_id: "student-3",
      referred_by: "user-staff",
      infraction: "cheating_or_plagiarism",
      infraction_level: 3,
      staff_notes: "Copied a substantial portion of an assessment.",
      sycamore_log_id: null,
      complexity: "compound",
      primary_r: "righteousness",
      primary_sub_value: "sidq",
      secondary_r: "responsibility",
      secondary_sub_value: "amanah",
      tertiary_r: null,
      tertiary_sub_value: null,
      status: "completed",
      created_at: daysAgo(20),
      updated_at: daysAgo(18)
    },
    {
      id: "referral-4",
      student_id: "student-5",
      referred_by: "user-staff",
      infraction: "bullying_or_harassment",
      infraction_level: 3,
      staff_notes: "Repeatedly mocked a peer in class and online.",
      sycamore_log_id: null,
      complexity: "complex",
      primary_r: "respect",
      primary_sub_value: "riayah",
      secondary_r: "respect",
      secondary_sub_value: "adab",
      tertiary_r: "responsibility",
      tertiary_sub_value: "muraqabah",
      status: "flagged",
      created_at: daysAgo(6),
      updated_at: daysAgo(5)
    }
  ];

  const sessions: TarbiyahSessionRow[] = [
    {
      id: "session-1",
      referral_id: "referral-1",
      session_number: 1,
      session_date: toDateString(daysAgo(8)),
      td_id: "user-td",
      phase_notes: buildPhaseNotes({
        phase_1: { emotional_state: "defensive", notes: "Started tense, settled after salam." },
        phase_2: { notes: "Student admitted feeling embarrassed in front of peers." },
        phase_3: { notes: "Connected behavior to adab and honoring classroom authority." },
        phase_4: { notes: "Discussed Al-Hujurat 49:11." },
        phase_5: { notes: "Teacher and classmates were affected by the disruption." },
        phase_6: { notes: "Selected respectful language reset and classroom amends." },
        phase_7: { notes: "Committed to reset tone and apologize before next class." }
      }),
      phases_completed: [1, 2, 3, 4, 5, 6, 7],
      islamic_anchor_id: anchors.find((anchor) => anchor.sub_value === "adab")?.id ?? null,
      action_steps: [
        {
          id: "adab-respectful-language",
          r: "respect",
          sub_value: "adab",
          description: "Use a respectful script during redirection.",
          due_date: toDateString(daysAgo(-2))
        }
      ],
      follow_up_date: toDateString(daysAgo(-2)),
      follow_up_notes: "Monitor language in class for one week.",
      parent_contacted: true,
      parent_conference_held: false,
      muraaqabah_flag: false,
      muraaqabah_flag_reason: null,
      muraaqabah_overridden: false,
      student_token: null,
      student_token_expires_at: null,
      status: "completed",
      created_at: daysAgo(8),
      updated_at: daysAgo(8)
    },
    {
      id: "session-2",
      referral_id: "referral-3",
      session_number: 1,
      session_date: toDateString(daysAgo(18)),
      td_id: "user-td",
      phase_notes: buildPhaseNotes({
        phase_1: { emotional_state: "scared", notes: "Student worried about parent response." },
        phase_2: { notes: "Pressure around grades and procrastination came up repeatedly." },
        phase_3: { notes: "Explored sidq and amanah together as a compound concern." },
        phase_4: { notes: "Reviewed At-Tawbah 9:119 and Al-Mu'minun 23:8." },
        phase_5: { notes: "Trust of teacher and family were harmed." },
        phase_6: { notes: "Selected truth and repair statement plus trust task." },
        phase_7: { notes: "Student committed to honest re-submission and teacher conference." }
      }),
      phases_completed: [1, 2, 3, 4, 5, 6, 7],
      islamic_anchor_id: anchors.find((anchor) => anchor.sub_value === "sidq")?.id ?? null,
      action_steps: [
        {
          id: "sidq-truth-repair",
          r: "righteousness",
          sub_value: "sidq",
          description: "State the truth clearly to the teacher and own the copied work.",
          due_date: toDateString(daysAgo(-7))
        },
        {
          id: "amanah-trust-task",
          r: "responsibility",
          sub_value: "amanah",
          description: "Complete a monitored trust task with the classroom teacher.",
          due_date: toDateString(daysAgo(-6))
        }
      ],
      follow_up_date: toDateString(daysAgo(-6)),
      follow_up_notes: "Check academic honesty and teacher trust in one week.",
      parent_contacted: true,
      parent_conference_held: true,
      muraaqabah_flag: false,
      muraaqabah_flag_reason: null,
      muraaqabah_overridden: false,
      student_token: null,
      student_token_expires_at: null,
      status: "completed",
      created_at: daysAgo(18),
      updated_at: daysAgo(18)
    },
    {
      id: "session-3",
      referral_id: "referral-4",
      session_number: 1,
      session_date: toDateString(daysAgo(5)),
      td_id: "user-td",
      phase_notes: buildPhaseNotes({
        phase_1: { emotional_state: "upset", notes: "Student minimized impact at first." },
        phase_2: { notes: "Peer group pressure and online behavior escalated the harm." },
        phase_3: { notes: "Complex pattern touching riayah, adab, and muraqabah." },
        phase_4: { notes: "Discussed Ad-Duhaa 93:9 and Qaf 50:18." },
        phase_5: { notes: "Peer dignity and school climate were both harmed." },
        phase_6: { notes: "Chose support plan, respectful language reset, and self-monitoring card." },
        phase_7: { notes: "Commitment includes direct apology and daily accountability." }
      }),
      phases_completed: [1, 2, 3, 4, 5, 6, 7],
      islamic_anchor_id: anchors.find((anchor) => anchor.sub_value === "riayah")?.id ?? null,
      action_steps: [
        {
          id: "riayah-support-plan",
          r: "respect",
          sub_value: "riayah",
          description: "Complete one intentional act of support toward the harmed peer.",
          due_date: toDateString(daysAgo(-1))
        },
        {
          id: "adab-respectful-language",
          r: "respect",
          sub_value: "adab",
          description: "Replace mocking speech with a respectful script in class and online.",
          due_date: toDateString(daysAgo(-1))
        },
        {
          id: "muraqabah-self-monitoring-card",
          r: "responsibility",
          sub_value: "muraqabah",
          description: "Track words and online behavior daily for the week.",
          due_date: toDateString(daysAgo(-1))
        }
      ],
      follow_up_date: toDateString(daysAgo(-1)),
      follow_up_notes: "Monitor peer interactions and online speech closely.",
      parent_contacted: false,
      parent_conference_held: false,
      muraaqabah_flag: true,
      muraaqabah_flag_reason: "complex_incident",
      muraaqabah_overridden: false,
      student_token: null,
      student_token_expires_at: null,
      status: "completed",
      created_at: daysAgo(5),
      updated_at: daysAgo(5)
    }
  ];

  const actionSteps: TarbiyahActionStepRow[] = [
    {
      id: "action-1",
      session_id: "session-1",
      r: "respect",
      sub_value: "adab",
      description: "Use a respectful script during redirection.",
      assigned_date: toDateString(daysAgo(8)),
      due_date: toDateString(daysAgo(-2)),
      completed: true,
      completed_at: daysAgo(1),
      completed_by_role: "student",
      completion_notes: "Teacher reported improved tone all week.",
      created_at: daysAgo(8)
    },
    {
      id: "action-2",
      session_id: "session-2",
      r: "righteousness",
      sub_value: "sidq",
      description: "State the truth clearly to the teacher and own the copied work.",
      assigned_date: toDateString(daysAgo(18)),
      due_date: toDateString(daysAgo(-7)),
      completed: true,
      completed_at: daysAgo(10),
      completed_by_role: "student",
      completion_notes: "Student completed a truthful re-submission conversation.",
      created_at: daysAgo(18)
    },
    {
      id: "action-3",
      session_id: "session-2",
      r: "responsibility",
      sub_value: "amanah",
      description: "Complete a monitored trust task with the classroom teacher.",
      assigned_date: toDateString(daysAgo(18)),
      due_date: toDateString(daysAgo(-6)),
      completed: false,
      completed_at: null,
      completed_by_role: null,
      completion_notes: null,
      created_at: daysAgo(18)
    },
    {
      id: "action-4",
      session_id: "session-3",
      r: "respect",
      sub_value: "riayah",
      description: "Complete one intentional act of support toward the harmed peer.",
      assigned_date: toDateString(daysAgo(5)),
      due_date: toDateString(daysAgo(-1)),
      completed: false,
      completed_at: null,
      completed_by_role: null,
      completion_notes: null,
      created_at: daysAgo(5)
    },
    {
      id: "action-5",
      session_id: "session-3",
      r: "responsibility",
      sub_value: "muraqabah",
      description: "Track words and online behavior daily for the week.",
      assigned_date: toDateString(daysAgo(5)),
      due_date: toDateString(daysAgo(-1)),
      completed: false,
      completed_at: null,
      completed_by_role: null,
      completion_notes: null,
      created_at: daysAgo(5)
    }
  ];

  const worksheetResponses: TarbiyahWorksheetResponseRow[] = [
    {
      id: "worksheet-1",
      session_id: "session-3",
      student_id: "student-5",
      what_happened: "I kept making jokes and then posted one thing online after school.",
      feelings: "I felt pressured to be funny and then annoyed.",
      who_affected: "The student I targeted and other classmates who saw it.",
      prophet_reflection: "The Prophet ﷺ would not humiliate someone.",
      righteousness_response: null,
      respect_response: "I need to protect people's dignity instead of chasing laughs.",
      responsibility_response: "I need to stop before I post or say things when I'm trying to impress people.",
      submitted_at: daysAgo(5)
    }
  ];

  const parentComms: TarbiyahParentCommRow[] = [
    {
      id: "comm-1",
      session_id: "session-1",
      student_id: "student-1",
      comm_type: "email_summary",
      sent_at: daysAgo(7),
      sent_by: "user-td",
      recipient_email: "family.ahmad@example.org",
      email_subject: "RTS follow-up for Ahmad Yusuf",
      email_body: "Ahmad completed a restorative session focused on adab and respectful language.",
      notes: "Parent appreciated same-day communication.",
      created_at: daysAgo(7)
    }
  ];

  const sycamoreLogs: SycamoreLogRow[] = [
    {
      id: "syc-1",
      student_id: "student-6",
      infraction_key: "unauthorized_device_use",
      staff_notes: "Phone visible and used twice during instruction.",
      created_at: daysAgo(1),
      imported: false
    },
    {
      id: "syc-2",
      student_id: "student-4",
      infraction_key: "class_disruption",
      staff_notes: "Repeated interruptions during small group work.",
      created_at: daysAgo(1),
      imported: false
    }
  ];

  return {
    users: MOCK_AUTH_USERS,
    students,
    studentPatternNotes: {
      "student-1": "Responds well to calm openings and private repair prompts.",
      "student-5": "Needs closer follow-up on peer-directed language and online carryover."
    },
    studentMerits: [
      { student_id: "student-1", righteousness: 3, respect: 8, responsibility: 5 },
      { student_id: "student-2", righteousness: 4, respect: 5, responsibility: 6 },
      { student_id: "student-3", righteousness: 5, respect: 4, responsibility: 4 },
      { student_id: "student-4", righteousness: 7, respect: 7, responsibility: 6 },
      { student_id: "student-5", righteousness: 3, respect: 2, responsibility: 3 },
      { student_id: "student-6", righteousness: 6, respect: 6, responsibility: 5 }
    ],
    referrals,
    sessions,
    actionSteps,
    anchors,
    worksheetResponses,
    parentComms,
    sycamoreLogs
  };
}

function getStore(): MockStoreState {
  if (!globalThis.__RTS_MOCK_STORE__) {
    globalThis.__RTS_MOCK_STORE__ = createSeedState();
  }

  return globalThis.__RTS_MOCK_STORE__;
}

function withReferralStudent(referral: TarbiyahReferralRow) {
  const store = getStore();
  const student = store.students.find((entry) => entry.id === referral.student_id) ?? null;

  return {
    ...referral,
    student
  };
}

function withSessionDetails(session: TarbiyahSessionRow) {
  const store = getStore();
  const referral = store.referrals.find((entry) => entry.id === session.referral_id) ?? null;
  const student = referral
    ? store.students.find((entry) => entry.id === referral.student_id) ?? null
    : null;
  const worksheet = store.worksheetResponses.find((entry) => entry.session_id === session.id) ?? null;
  const anchor = session.islamic_anchor_id
    ? store.anchors.find((entry) => entry.id === session.islamic_anchor_id) ?? null
    : null;
  const actionSteps = store.actionSteps.filter((entry) => entry.session_id === session.id);

  return {
    ...session,
    referral,
    student,
    worksheet,
    anchor,
    action_steps_rows: actionSteps
  };
}

function currentDateString() {
  return new Date().toISOString();
}

function currentDateOnly() {
  return currentDateString().slice(0, 10);
}

export function listMockUsers() {
  return getStore().users;
}

export function listReferrals(role: MockAuthUser["role"], userId: string) {
  const store = getStore();

  if (role === "staff") {
    return store.referrals
      .filter((referral) => referral.referred_by === userId)
      .map(withReferralStudent)
      .sort((a, b) => (a.created_at && b.created_at ? b.created_at.localeCompare(a.created_at) : 0));
  }

  return store.referrals
    .map(withReferralStudent)
    .sort((a, b) => (a.created_at && b.created_at ? b.created_at.localeCompare(a.created_at) : 0));
}

export function getReferralDetails(id: string) {
  const store = getStore();
  const referral = store.referrals.find((entry) => entry.id === id);

  if (!referral) {
    return null;
  }

  const student = store.students.find((entry) => entry.id === referral.student_id) ?? null;
  const sessions = store.sessions
    .filter((session) => session.referral_id === referral.id)
    .map(withSessionDetails);

  return {
    ...referral,
    student,
    sessions
  };
}

export function createReferral(input: {
  student_id: string;
  referred_by: string;
  infraction: string;
  staff_notes: string;
}) {
  const store = getStore();
  const infraction = findInfractionByKey(input.infraction);

  if (!infraction) {
    throw new Error("Invalid infraction key.");
  }

  const now = currentDateString();
  const referral: TarbiyahReferralRow = {
    id: makeId("referral"),
    student_id: input.student_id,
    referred_by: input.referred_by,
    infraction: input.infraction,
    infraction_level: infraction.level,
    staff_notes: input.staff_notes,
    sycamore_log_id: null,
    complexity: null,
    primary_r: infraction.r,
    primary_sub_value: infraction.subValue,
    secondary_r: null,
    secondary_sub_value: null,
    tertiary_r: null,
    tertiary_sub_value: null,
    status: "pending",
    created_at: now,
    updated_at: now
  };

  store.referrals.unshift(referral);
  return withReferralStudent(referral);
}

export function syncMockSycamore() {
  const store = getStore();
  const imported: TarbiyahReferralRow[] = [];

  for (const log of store.sycamoreLogs.filter((entry) => !entry.imported)) {
    const infraction = findInfractionByKey(log.infraction_key);
    if (!infraction) {
      continue;
    }

    const referral: TarbiyahReferralRow = {
      id: makeId("referral"),
      student_id: log.student_id,
      referred_by: "user-staff",
      infraction: log.infraction_key,
      infraction_level: infraction.level,
      staff_notes: log.staff_notes,
      sycamore_log_id: log.id,
      complexity: null,
      primary_r: infraction.r,
      primary_sub_value: infraction.subValue,
      secondary_r: null,
      secondary_sub_value: null,
      tertiary_r: null,
      tertiary_sub_value: null,
      status: "pending",
      created_at: log.created_at,
      updated_at: log.created_at
    };

    imported.push(referral);
    store.referrals.unshift(referral);
    log.imported = true;
  }

  return imported.map(withReferralStudent);
}

export function listSessions(role: MockAuthUser["role"]) {
  const store = getStore();

  if (role !== "td" && role !== "counselor") {
    return [];
  }

  return store.sessions
    .slice()
    .sort((a, b) => b.session_date.localeCompare(a.session_date))
    .map(withSessionDetails);
}

export function getSessionWorkspace(id: string) {
  const store = getStore();
  const session = store.sessions.find((entry) => entry.id === id);

  if (!session) {
    return null;
  }

  const details = withSessionDetails(session);
  const referral = details.referral;
  const subValues = [
    referral?.primary_sub_value,
    referral?.secondary_sub_value,
    referral?.tertiary_sub_value
  ].filter(Boolean) as SubValueKey[];

  const actionStepOptions = subValues.map((subValue) => ({
    subValue,
    options: getActionStepTemplates(subValue, referral?.infraction_level ?? 1)
  }));

  const anchorOptions = subValues.flatMap((subValue) =>
    getStore().anchors.filter((anchor) => anchor.sub_value === subValue && anchor.is_active)
  );

  return {
    ...details,
    actionStepOptions,
    anchorOptions
  };
}

export function openSessionFromReferral(
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
) {
  const store = getStore();
  const referral = store.referrals.find((entry) => entry.id === referralId);

  if (!referral) {
    throw new Error("Referral not found.");
  }

  Object.assign(referral, {
    ...payload,
    status: "scheduled" as ReferralStatus,
    updated_at: currentDateString()
  });

  const anchor = store.anchors.find(
    (entry) => entry.sub_value === payload.primary_sub_value && entry.is_active
  );

  const session: TarbiyahSessionRow = {
    id: makeId("session"),
    referral_id: referral.id,
    session_number: 1,
    session_date: currentDateOnly(),
    td_id: tdId,
    phase_notes: buildPhaseNotes({
      phase_3: {
        notes: `Mapped to ${THREE_R_LABELS[payload.primary_r]} / ${SUB_VALUE_LABELS[payload.primary_sub_value]}.`
      }
    }),
    phases_completed: [],
    islamic_anchor_id: anchor?.id ?? null,
    action_steps: [],
    follow_up_date: null,
    follow_up_notes: null,
    parent_contacted: false,
    parent_conference_held: false,
    muraaqabah_flag: false,
    muraaqabah_flag_reason: null,
    muraaqabah_overridden: false,
    student_token: null,
    student_token_expires_at: null,
    status: "open",
    created_at: currentDateString(),
    updated_at: currentDateString()
  };

  referral.status = "in_session";
  store.sessions.unshift(session);

  return withSessionDetails(session);
}

export function updateSession(sessionId: string, patch: Partial<TarbiyahSessionRow>) {
  const store = getStore();
  const session = store.sessions.find((entry) => entry.id === sessionId);

  if (!session) {
    throw new Error("Session not found.");
  }

  Object.assign(session, patch, {
    updated_at: currentDateString()
  });

  return withSessionDetails(session);
}

export function updateSessionPhase(sessionId: string, phaseKey: string, value: JsonValue) {
  const store = getStore();
  const session = store.sessions.find((entry) => entry.id === sessionId);

  if (!session) {
    throw new Error("Session not found.");
  }

  const nextPhaseNotes = {
    ...(session.phase_notes as SessionPhaseNotes),
    [phaseKey]: value
  };

  const completed = new Set(session.phases_completed);
  const phaseNumber = Number(phaseKey.replace("phase_", ""));

  if (value && phaseNumber) {
    completed.add(phaseNumber);
  }

  session.phase_notes = nextPhaseNotes;
  session.phases_completed = Array.from(completed).sort((a, b) => a - b);
  session.updated_at = currentDateString();

  return withSessionDetails(session);
}

export function generateStudentToken(sessionId: string) {
  const store = getStore();
  const session = store.sessions.find((entry) => entry.id === sessionId);

  if (!session) {
    throw new Error("Session not found.");
  }

  const token = makeId("token");
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  session.student_token = token;
  session.student_token_expires_at = expiresAt;
  session.updated_at = currentDateString();

  return {
    token,
    expiresAt,
    url: `/session/${token}`
  };
}

export function getSessionByToken(token: string) {
  const store = getStore();
  const session = store.sessions.find(
    (entry) =>
      entry.student_token === token &&
      entry.student_token_expires_at &&
      new Date(entry.student_token_expires_at).getTime() > Date.now()
  );

  if (!session) {
    return null;
  }

  const details = withSessionDetails(session);

  return {
    ...details,
    complexity: details.referral?.complexity ?? "simple"
  };
}

export function upsertWorksheetByToken(
  token: string,
  input: Partial<TarbiyahWorksheetResponseRow>
) {
  const session = getSessionByToken(token);

  if (!session || !session.student) {
    throw new Error("Invalid or expired session token.");
  }

  const store = getStore();
  const existing = store.worksheetResponses.find((entry) => entry.session_id === session.id);

  if (existing) {
    Object.assign(existing, input, {
      submitted_at: currentDateString()
    });
    return existing;
  }

  const created: TarbiyahWorksheetResponseRow = {
    id: makeId("worksheet"),
    session_id: session.id,
    student_id: session.student.id,
    what_happened: input.what_happened ?? null,
    feelings: input.feelings ?? null,
    who_affected: input.who_affected ?? null,
    prophet_reflection: input.prophet_reflection ?? null,
    righteousness_response: input.righteousness_response ?? null,
    respect_response: input.respect_response ?? null,
    responsibility_response: input.responsibility_response ?? null,
    submitted_at: currentDateString()
  };

  store.worksheetResponses.push(created);
  return created;
}

function getStudentSessions(studentId: string) {
  const store = getStore();
  const referralIds = store.referrals.filter((entry) => entry.student_id === studentId).map((entry) => entry.id);
  return store.sessions.filter((entry) => referralIds.includes(entry.referral_id));
}

function evaluateMuraqabah(studentId: string, referral: TarbiyahReferralRow) {
  const recentSessions = getStudentSessions(studentId).filter((session) => {
    const ageMs = Date.now() - new Date(session.session_date).getTime();
    return ageMs <= 45 * 24 * 60 * 60 * 1000;
  });

  if (recentSessions.length >= 2) {
    return "repeat_within_45_days";
  }

  if (referral.complexity === "complex") {
    return "complex_incident";
  }

  return null;
}

export function completeSession(sessionId: string) {
  const store = getStore();
  const session = store.sessions.find((entry) => entry.id === sessionId);

  if (!session) {
    throw new Error("Session not found.");
  }

  const referral = store.referrals.find((entry) => entry.id === session.referral_id);

  if (!referral) {
    throw new Error("Referral not found.");
  }

  const selectedActionSteps = (session.action_steps as Array<{
    id?: string;
    r: ThreeRKey;
    sub_value: SubValueKey;
    description: string;
    due_date?: string | null;
  }>) ?? [];

  for (const step of selectedActionSteps) {
    const exists = store.actionSteps.some(
      (entry) => entry.session_id === session.id && entry.description === step.description
    );

    if (!exists) {
      store.actionSteps.push({
        id: makeId("action"),
        session_id: session.id,
        r: step.r,
        sub_value: step.sub_value,
        description: step.description,
        assigned_date: currentDateOnly(),
        due_date: step.due_date ?? session.follow_up_date,
        completed: false,
        completed_at: null,
        completed_by_role: null,
        completion_notes: null,
        created_at: currentDateString()
      });
    }
  }

  const muraqabahReason = evaluateMuraqabah(referral.student_id, referral);

  session.status = "completed";
  session.student_token = null;
  session.student_token_expires_at = null;
  session.muraaqabah_flag = Boolean(muraqabahReason);
  session.muraaqabah_flag_reason = muraqabahReason;
  session.updated_at = currentDateString();

  referral.status = muraqabahReason ? "flagged" : "completed";
  referral.updated_at = currentDateString();

  return {
    ...withSessionDetails(session),
    summary: {
      actionStepCount: store.actionSteps.filter((entry) => entry.session_id === session.id).length,
      muraqabahReason
    }
  };
}

export function listActionSteps() {
  const store = getStore();

  return store.actionSteps
    .slice()
    .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
    .map((step) => {
      const session = store.sessions.find((entry) => entry.id === step.session_id) ?? null;
      const referral = session
        ? store.referrals.find((entry) => entry.id === session.referral_id) ?? null
        : null;
      const student = referral
        ? store.students.find((entry) => entry.id === referral.student_id) ?? null
        : null;

      return {
        ...step,
        session,
        referral,
        student
      };
    });
}

export function completeActionStep(actionStepId: string, completionNotes: string, completedByRole = "td") {
  const store = getStore();
  const actionStep = store.actionSteps.find((entry) => entry.id === actionStepId);

  if (!actionStep) {
    throw new Error("Action step not found.");
  }

  actionStep.completed = true;
  actionStep.completed_at = currentDateString();
  actionStep.completed_by_role = completedByRole;
  actionStep.completion_notes = completionNotes;

  return actionStep;
}

export function dismissMuraaqabah(sessionId: string, notes: string) {
  const session = getStore().sessions.find((entry) => entry.id === sessionId);

  if (!session) {
    throw new Error("Session not found.");
  }

  session.muraaqabah_overridden = true;
  session.follow_up_notes = [session.follow_up_notes, `Murāqabah override: ${notes}`]
    .filter(Boolean)
    .join("\n\n");
  session.updated_at = currentDateString();

  return withSessionDetails(session);
}

export function listAnchors() {
  return getStore().anchors.slice().sort((a, b) => a.sub_value.localeCompare(b.sub_value));
}

export function createAnchor(input: Omit<IslamicAnchorRow, "id" | "created_at" | "updated_at">) {
  const store = getStore();
  const anchor: IslamicAnchorRow = {
    ...input,
    id: makeId("anchor"),
    created_at: currentDateString(),
    updated_at: currentDateString()
  };

  store.anchors.unshift(anchor);
  return anchor;
}

export function updateAnchor(anchorId: string, patch: Partial<IslamicAnchorRow>) {
  const anchor = getStore().anchors.find((entry) => entry.id === anchorId);

  if (!anchor) {
    throw new Error("Anchor not found.");
  }

  Object.assign(anchor, patch, {
    updated_at: currentDateString()
  });

  return anchor;
}

export function deleteAnchor(anchorId: string) {
  const store = getStore();
  const index = store.anchors.findIndex((entry) => entry.id === anchorId);

  if (index === -1) {
    throw new Error("Anchor not found.");
  }

  if (store.anchors[index].is_system_default) {
    store.anchors[index].is_active = false;
    return store.anchors[index];
  }

  const [deleted] = store.anchors.splice(index, 1);
  return deleted;
}

export function getStudentProfile(studentId: string) {
  const store = getStore();
  const student = store.students.find((entry) => entry.id === studentId);

  if (!student) {
    return null;
  }

  const referrals = store.referrals.filter((entry) => entry.student_id === studentId);
  const sessions = getStudentSessions(studentId).map(withSessionDetails);
  const merits = store.studentMerits.find((entry) => entry.student_id === studentId) ?? {
    student_id: studentId,
    righteousness: 0,
    respect: 0,
    responsibility: 0
  };

  const byR = {
    righteousness: referrals.filter((entry) => entry.primary_r === "righteousness").length,
    respect: referrals.filter((entry) => entry.primary_r === "respect").length,
    responsibility: referrals.filter((entry) => entry.primary_r === "responsibility").length
  };

  const summary: Student3RProfileRow = {
    student_id: student.id,
    name: student.name,
    grade: student.grade,
    house: student.house,
    division: student.division,
    righteousness_demerits: byR.righteousness,
    respect_demerits: byR.respect,
    responsibility_demerits: byR.responsibility,
    righteousness_merits: merits.righteousness,
    respect_merits: merits.respect,
    responsibility_merits: merits.responsibility,
    total_sessions: sessions.length,
    simple_sessions: referrals.filter((entry) => entry.complexity === "simple").length,
    compound_sessions: referrals.filter((entry) => entry.complexity === "compound").length,
    complex_sessions: referrals.filter((entry) => entry.complexity === "complex").length,
    action_step_completion_rate:
      sessions.length === 0
        ? 0
        : Number(
            (
              store.actionSteps.filter(
                (entry) =>
                  sessions.some((session) => session.id === entry.session_id) && entry.completed
              ).length /
              Math.max(
                store.actionSteps.filter((entry) =>
                  sessions.some((session) => session.id === entry.session_id)
                ).length,
                1
              )
            ).toFixed(2)
          ),
    last_session_date: sessions[0]?.session_date ?? null,
    muraaqabah_active: sessions.some(
      (entry) => entry.muraaqabah_flag && !entry.muraaqabah_overridden
    )
  };

  const subValueCounts = referrals.reduce<Record<string, number>>((accumulator, referral) => {
    for (const subValue of [
      referral.primary_sub_value,
      referral.secondary_sub_value,
      referral.tertiary_sub_value
    ]) {
      if (subValue) {
        accumulator[subValue] = (accumulator[subValue] ?? 0) + 1;
      }
    }

    return accumulator;
  }, {});

  return {
    student,
    summary,
    merits,
    patternNotes: store.studentPatternNotes[studentId] ?? "",
    referrals,
    sessions,
    actionSteps: store.actionSteps.filter((entry) =>
      sessions.some((session) => session.id === entry.session_id)
    ),
    parentComms: store.parentComms.filter((entry) => entry.student_id === studentId),
    subValueCounts
  };
}

export function updateStudentPatternNotes(studentId: string, notes: string) {
  const store = getStore();
  const student = store.students.find((entry) => entry.id === studentId);

  if (!student) {
    throw new Error("Student not found.");
  }

  store.studentPatternNotes[studentId] = notes;
  return notes;
}

export function listStudents(query = "") {
  const lowered = query.toLowerCase();

  return getStore().students.filter((student) => {
    if (!lowered) {
      return true;
    }

    return `${student.name ?? ""} ${student.grade ?? ""}`.toLowerCase().includes(lowered);
  });
}

export function sendParentComm(input: {
  session_id: string;
  student_id: string;
  parent_email: string;
  subject: string;
  body: string;
  sent_by: string;
  comm_type?: ParentCommType;
}) {
  const store = getStore();
  const comm: TarbiyahParentCommRow = {
    id: makeId("comm"),
    session_id: input.session_id,
    student_id: input.student_id,
    comm_type: input.comm_type ?? "email_summary",
    sent_at: currentDateString(),
    sent_by: input.sent_by,
    recipient_email: input.parent_email,
    email_subject: input.subject,
    email_body: input.body,
    notes: "Mock delivery recorded locally.",
    created_at: currentDateString()
  };

  store.parentComms.unshift(comm);
  return comm;
}

export function getParentEmailDraft(sessionId: string) {
  const session = withSessionDetails(
    getStore().sessions.find((entry) => entry.id === sessionId) as TarbiyahSessionRow
  );
  const referral = session.referral;
  const student = session.student;

  if (!referral || !student) {
    return null;
  }

  const actionStep = getStore().actionSteps.find((entry) => entry.session_id === sessionId);
  const suggestionBank =
    HOME_SUGGESTIONS[(referral.primary_sub_value ?? "adab") as SubValueKey] ?? [];

  return {
    subject: `Restorative Tarbiyah Follow-Up for ${student.name}`,
    body: `${student.name} participated in a restorative tarbiyah session focused on ${THREE_R_LABELS[referral.primary_r ?? "respect"]} and ${SUB_VALUE_LABELS[(referral.primary_sub_value ?? "adab") as SubValueKey]}. The committed action step is: ${actionStep?.description ?? "to complete the agreed reflection and repair plan"}. Follow-up is scheduled for ${session.follow_up_date ?? "the next available school day"}.`,
    suggestions: suggestionBank
  };
}

export function getReportData(filters?: {
  startDate?: string;
  endDate?: string;
  division?: string;
}) {
  const store = getStore();
  const sessions = store.sessions
    .filter((session) => session.status === "completed")
    .filter((session) => {
      if (filters?.startDate && session.session_date < filters.startDate) {
        return false;
      }

      if (filters?.endDate && session.session_date > filters.endDate) {
        return false;
      }

      if (filters?.division) {
        const referral = store.referrals.find((entry) => entry.id === session.referral_id);
        const student = referral
          ? store.students.find((entry) => entry.id === referral.student_id)
          : null;

        return student?.division === filters.division;
      }

      return true;
    })
    .map(withSessionDetails);

  const referrals = sessions
    .map((session) => session.referral)
    .filter(Boolean) as TarbiyahReferralRow[];

  const byR = [
    {
      name: "Righteousness",
      value: referrals.filter((referral) => referral.primary_r === "righteousness").length
    },
    {
      name: "Respect",
      value: referrals.filter((referral) => referral.primary_r === "respect").length
    },
    {
      name: "Responsibility",
      value: referrals.filter((referral) => referral.primary_r === "responsibility").length
    }
  ];

  const byGrade = sessions.reduce<Record<string, number>>((accumulator, session) => {
    const grade = session.student?.grade ?? "Unknown";
    accumulator[grade] = (accumulator[grade] ?? 0) + 1;
    return accumulator;
  }, {});

  const flagged = sessions.filter(
    (session) => session.muraaqabah_flag && !session.muraaqabah_overridden
  );

  return {
    totalSessions: sessions.length,
    byR,
    byGrade: Object.entries(byGrade).map(([name, value]) => ({ name, value })),
    byComplexity: [
      { name: "Simple", value: referrals.filter((referral) => referral.complexity === "simple").length },
      { name: "Compound", value: referrals.filter((referral) => referral.complexity === "compound").length },
      { name: "Complex", value: referrals.filter((referral) => referral.complexity === "complex").length }
    ],
    topInfractions: Array.from(
      referrals.reduce<Map<string, number>>((accumulator, referral) => {
        accumulator.set(referral.infraction, (accumulator.get(referral.infraction) ?? 0) + 1);
        return accumulator;
      }, new Map())
    )
      .map(([key, value]) => ({
        name: INFRACTION_MAP[key]?.label ?? key,
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    flaggedStudents: flagged.map((session) => ({
      name: session.student?.name ?? "Unknown",
      grade: session.student?.grade ?? "Unknown",
      reason: session.muraaqabah_flag_reason ?? "manual",
      sessionId: session.id
    }))
  };
}

export function listActionStepTemplates(subValue: SubValueKey, level: number) {
  return getActionStepTemplates(subValue, level);
}

export function listActionStepTemplateGroups(referral: TarbiyahReferralRow | null) {
  if (!referral) {
    return [];
  }

  return [
    { r: referral.primary_r, subValue: referral.primary_sub_value },
    { r: referral.secondary_r, subValue: referral.secondary_sub_value },
    { r: referral.tertiary_r, subValue: referral.tertiary_sub_value }
  ]
    .filter((entry): entry is { r: ThreeRKey; subValue: SubValueKey } => Boolean(entry.r && entry.subValue))
    .map((entry) => ({
      ...entry,
      options: listActionStepTemplates(entry.subValue, referral.infraction_level ?? 1)
    }));
}

export function getInfractionOptions() {
  return INFRACTIONS;
}

export function getAnchorOptionsForSubValue(subValue: SubValueKey) {
  return getStore().anchors.filter((anchor) => anchor.sub_value === subValue && anchor.is_active);
}

export function getStoreSnapshot() {
  return getStore();
}

export function resetMockStore() {
  globalThis.__RTS_MOCK_STORE__ = createSeedState();
}
