import {
  REFERRAL_STATUSES,
  type ReferralComplexity,
  type ReferralStatus,
  type SubValueKey,
  type ThreeRKey
} from "@/types";
import { SUB_VALUE_LABELS, THREE_R_LABELS } from "@/lib/data/infractions";

export const SESSION_PHASES = [
  {
    key: "phase_1",
    number: 1,
    title: "Connection",
    description: "Warm opening, regulation, and readiness."
  },
  {
    key: "phase_2",
    number: 2,
    title: "Story",
    description: "Hear the student's account and context."
  },
  {
    key: "phase_3",
    number: 3,
    title: "Mirror",
    description: "Map the moment to the 3Rs and sub-values."
  },
  {
    key: "phase_4",
    number: 4,
    title: "Anchor",
    description: "Ground the reflection in Qur'an or hadith."
  },
  {
    key: "phase_5",
    number: 5,
    title: "Harm Map",
    description: "Name the people and spaces affected."
  },
  {
    key: "phase_6",
    number: 6,
    title: "Action Step",
    description: "Choose restorative follow-through."
  },
  {
    key: "phase_7",
    number: 7,
    title: "Commitment",
    description: "Capture the student's commitment and next date."
  }
] as const;

export const EMOTIONAL_STATES = [
  "Defensive",
  "Scared",
  "Indifferent",
  "Upset",
  "Calm",
  "Open"
] as const;

export const STORY_CONTEXT_TAGS = [
  "peer conflict",
  "authority conflict",
  "impulse",
  "outside pressure",
  "pattern"
] as const;

export const HARM_AFFECTED_OPTIONS = [
  "Self",
  "Peer(s)",
  "Teacher",
  "Family",
  "House",
  "Community",
  "School"
] as const;

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  pending: "Pending",
  td_review: "TD Review",
  scheduled: "Scheduled",
  in_session: "In Session",
  completed: "Completed",
  flagged: "Flagged"
};

export const COMPLEXITY_LABELS: Record<ReferralComplexity, string> = {
  simple: "Simple",
  compound: "Compound",
  complex: "Complex"
};

export const SUB_VALUE_DEFINITIONS: Record<SubValueKey, string> = {
  taqwa: "Allah-conscious restraint and reverence in choices.",
  sidq: "Truthfulness and honesty without deflection.",
  iffah: "Modesty, dignity, and guarded boundaries.",
  taharah: "Cleanliness and respect for purity in shared spaces.",
  hilm: "Self-control and calm restraint under pressure.",
  riayah: "Care for the dignity and wellbeing of others.",
  hifz_al_huquq: "Protecting the rights, safety, and property of others.",
  adab: "Respectful conduct, tone, and presence.",
  amanah: "Trustworthiness with duties, people, and resources.",
  indibat: "Discipline, punctuality, and staying within limits.",
  iltizam: "Consistent follow-through on known obligations.",
  muraqabah: "Self-monitoring and awareness before repetition."
};

export function getRTheme(r: ThreeRKey | null | undefined) {
  switch (r) {
    case "righteousness":
      return {
        text: "text-righteousness",
        bg: "bg-righteousness/10",
        border: "border-righteousness/20"
      };
    case "respect":
      return {
        text: "text-respect",
        bg: "bg-respect/10",
        border: "border-respect/20"
      };
    case "responsibility":
      return {
        text: "text-responsibility",
        bg: "bg-responsibility/10",
        border: "border-responsibility/20"
      };
    default:
      return {
        text: "text-text-primary",
        bg: "bg-bg-secondary",
        border: "border-border"
      };
  }
}

export function getComplexityTheme(complexity: ReferralComplexity | null | undefined) {
  switch (complexity) {
    case "simple":
      return "bg-accent-green/10 text-accent-green";
    case "compound":
      return "bg-accent-gold/12 text-accent-gold";
    case "complex":
      return "bg-flag-muraaqabah/10 text-flag-muraaqabah";
    default:
      return "bg-bg-secondary text-text-secondary";
  }
}

export function getStatusTheme(status: ReferralStatus | null | undefined) {
  switch (status) {
    case "completed":
      return "bg-accent-green/10 text-accent-green";
    case "flagged":
      return "bg-flag-muraaqabah/10 text-flag-muraaqabah";
    case "pending":
      return "bg-accent-gold/12 text-accent-gold";
    case "in_session":
    case "scheduled":
      return "bg-respect/10 text-respect";
    case "td_review":
      return "bg-righteousness/10 text-righteousness";
    default:
      return "bg-bg-secondary text-text-secondary";
  }
}

export function getSubValueSummary(
  r: ThreeRKey | null | undefined,
  subValue: SubValueKey | null | undefined
) {
  if (!r || !subValue) {
    return "Not yet mapped";
  }

  return `${THREE_R_LABELS[r]} / ${SUB_VALUE_LABELS[subValue]}`;
}

export function getReadableDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function getReadableDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function getDaysRemaining(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const target = new Date(value);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const diff = target.getTime() - start.getTime();
  return Math.round(diff / (24 * 60 * 60 * 1000));
}

export function getRoleHomeSummary(statuses: ReferralStatus[]) {
  return REFERRAL_STATUSES.reduce<Record<ReferralStatus, number>>((accumulator, status) => {
    accumulator[status] = statuses.filter((entry) => entry === status).length;
    return accumulator;
  }, {} as Record<ReferralStatus, number>);
}

