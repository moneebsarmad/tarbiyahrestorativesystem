import { THREE_RS, type InfractionLevel, type SubValueKey, type ThreeRKey } from "@/types";

export interface InfractionDefinition {
  key: string;
  label: string;
  description: string;
  r: ThreeRKey;
  subValue: SubValueKey;
  level: InfractionLevel;
}

export const THREE_R_LABELS: Record<ThreeRKey, string> = {
  righteousness: "Righteousness",
  respect: "Respect",
  responsibility: "Responsibility"
};

export const SUB_VALUE_LABELS: Record<SubValueKey, string> = {
  taqwa: "Taqwa",
  sidq: "Sidq",
  iffah: "Iffah",
  taharah: "Taharah",
  hilm: "Hilm",
  riayah: "Riayah",
  hifz_al_huquq: "Hifz al-Huquq",
  adab: "Adab",
  amanah: "Amanah",
  indibat: "Indibat",
  iltizam: "Iltizam",
  muraqabah: "Muraqabah"
};

export const INFRACTIONS: readonly InfractionDefinition[] = [
  {
    key: "salah_non_participation",
    label: "Deliberate Salah Non-Participation",
    description: "Knowingly refusing to join the required congregational salah without approved cause.",
    r: "righteousness",
    subValue: "taqwa",
    level: 2
  },
  {
    key: "sacred_space_disrespect",
    label: "Disrespect for Sacred Space",
    description: "Misusing the musalla, Qur'an area, or another sacred school space in a careless or mocking way.",
    r: "righteousness",
    subValue: "taqwa",
    level: 2
  },
  {
    key: "persistent_vulgar_speech",
    label: "Persistent Vulgar Speech",
    description: "Repeated coarse or obscene language that reflects disregard for Allah-conscious speech.",
    r: "righteousness",
    subValue: "taqwa",
    level: 2
  },
  {
    key: "lying_to_staff",
    label: "Lying to Staff",
    description: "Giving knowingly false information to a teacher, administrator, or counselor.",
    r: "righteousness",
    subValue: "sidq",
    level: 2
  },
  {
    key: "forged_signature_or_note",
    label: "Forged Signature or Note",
    description: "Falsifying a parent note, signature, or school authorization.",
    r: "righteousness",
    subValue: "sidq",
    level: 3
  },
  {
    key: "cheating_or_plagiarism",
    label: "Cheating or Plagiarism",
    description: "Presenting dishonest academic work, copying answers, or using unauthorized help.",
    r: "righteousness",
    subValue: "sidq",
    level: 3
  },
  {
    key: "sexualized_language",
    label: "Sexualized Language or Gestures",
    description: "Using suggestive, indecent, or sexually explicit language, comments, or gestures.",
    r: "righteousness",
    subValue: "iffah",
    level: 3
  },
  {
    key: "inappropriate_physical_contact",
    label: "Inappropriate Physical Contact",
    description: "Physical contact that violates school boundaries, modesty expectations, or student safety.",
    r: "righteousness",
    subValue: "iffah",
    level: 3
  },
  {
    key: "inappropriate_media_access",
    label: "Inappropriate Media Access",
    description: "Viewing, sharing, or possessing indecent or suggestive digital or printed content.",
    r: "righteousness",
    subValue: "iffah",
    level: 4
  },
  {
    key: "bathroom_misuse",
    label: "Bathroom or Wudu Area Misuse",
    description: "Leaving bathrooms or wudu areas in an intentionally dirty, unsafe, or disrespectful state.",
    r: "righteousness",
    subValue: "taharah",
    level: 2
  },
  {
    key: "food_or_drink_contamination",
    label: "Food or Drink Contamination",
    description: "Intentionally mishandling food, drink, or shared items in a way that creates impurity or disgust.",
    r: "righteousness",
    subValue: "taharah",
    level: 2
  },
  {
    key: "prohibited_substance_possession",
    label: "Possession of Prohibited Substances",
    description: "Possessing vaping materials, intoxicants, or other prohibited substances on campus.",
    r: "righteousness",
    subValue: "taharah",
    level: 4
  },
  {
    key: "angry_outburst",
    label: "Angry Outburst",
    description: "Losing control in a verbal outburst, shouting match, or public meltdown.",
    r: "respect",
    subValue: "hilm",
    level: 2
  },
  {
    key: "threatening_language",
    label: "Threatening Language",
    description: "Using threats, intimidation, or language meant to frighten another person.",
    r: "respect",
    subValue: "hilm",
    level: 3
  },
  {
    key: "retaliatory_conflict",
    label: "Retaliatory Conflict",
    description: "Escalating a conflict through revenge behavior instead of restraint or de-escalation.",
    r: "respect",
    subValue: "hilm",
    level: 3
  },
  {
    key: "bullying_or_harassment",
    label: "Bullying or Harassment",
    description: "Targeting a peer through repeated cruelty, humiliation, or emotional intimidation.",
    r: "respect",
    subValue: "riayah",
    level: 3
  },
  {
    key: "excluding_or_mocking_peer",
    label: "Excluding or Mocking a Peer",
    description: "Deliberately isolating, mocking, or belittling another student in a social setting.",
    r: "respect",
    subValue: "riayah",
    level: 2
  },
  {
    key: "failure_to_support_vulnerable_student",
    label: "Failure to Support a Vulnerable Student",
    description: "Ignoring or worsening harm to a younger or vulnerable student when responsible to help.",
    r: "respect",
    subValue: "riayah",
    level: 2
  },
  {
    key: "physical_aggression",
    label: "Physical Aggression",
    description: "Hitting, pushing, kicking, or other physical harm toward another person.",
    r: "respect",
    subValue: "hifz_al_huquq",
    level: 4
  },
  {
    key: "property_interference",
    label: "Taking or Tampering with Another's Property",
    description: "Using, hiding, or taking another person's belongings without permission.",
    r: "respect",
    subValue: "hifz_al_huquq",
    level: 3
  },
  {
    key: "digital_harm",
    label: "Digital Harm or Image Misuse",
    description: "Sharing embarrassing photos, messages, or digital content that violates someone else's rights.",
    r: "respect",
    subValue: "hifz_al_huquq",
    level: 3
  },
  {
    key: "staff_disrespect",
    label: "Disrespect to Staff",
    description: "Using insolent language, tone, or gestures toward a teacher or staff member.",
    r: "respect",
    subValue: "adab",
    level: 2
  },
  {
    key: "class_disruption",
    label: "Classroom Disruption",
    description: "Interrupting instruction or learning through repeated disorderly behavior.",
    r: "respect",
    subValue: "adab",
    level: 2
  },
  {
    key: "backbiting_or_mockery",
    label: "Backbiting or Mockery",
    description: "Mocking, insulting, or speaking about someone behind their back in a degrading way.",
    r: "respect",
    subValue: "adab",
    level: 2
  },
  {
    key: "theft",
    label: "Theft",
    description: "Stealing school property or the belongings of another student or staff member.",
    r: "responsibility",
    subValue: "amanah",
    level: 4
  },
  {
    key: "misuse_of_school_property",
    label: "Misuse of School Property",
    description: "Using school equipment or materials carelessly, dishonestly, or outside approved limits.",
    r: "responsibility",
    subValue: "amanah",
    level: 2
  },
  {
    key: "dishonoring_assigned_duty",
    label: "Failure in an Assigned Duty",
    description: "Neglecting a trusted class, leadership, or team responsibility after repeated reminders.",
    r: "responsibility",
    subValue: "amanah",
    level: 2
  },
  {
    key: "chronic_tardiness",
    label: "Chronic Tardiness",
    description: "Repeated late arrival to class, assemblies, or school routines without valid cause.",
    r: "responsibility",
    subValue: "indibat",
    level: 1
  },
  {
    key: "class_skipping",
    label: "Class Skipping",
    description: "Being absent from class or a required activity without permission.",
    r: "responsibility",
    subValue: "indibat",
    level: 3
  },
  {
    key: "out_of_bounds",
    label: "Leaving Assigned Area Without Permission",
    description: "Going out of bounds or leaving a supervised area without approval.",
    r: "responsibility",
    subValue: "indibat",
    level: 2
  },
  {
    key: "dress_code_violation",
    label: "Dress Code Violation",
    description: "Repeated disregard for school uniform or modesty guidelines after correction.",
    r: "responsibility",
    subValue: "iltizam",
    level: 1
  },
  {
    key: "failure_to_follow_procedure",
    label: "Failure to Follow School Procedure",
    description: "Ignoring known school procedures for transitions, pickups, attendance, or safety.",
    r: "responsibility",
    subValue: "iltizam",
    level: 2
  },
  {
    key: "unfinished_mandated_consequence",
    label: "Failure to Complete an Assigned Follow-Through",
    description: "Not completing a required school follow-through, make-up task, or restorative commitment.",
    r: "responsibility",
    subValue: "iltizam",
    level: 2
  },
  {
    key: "unauthorized_device_use",
    label: "Unauthorized Device Use",
    description: "Using a phone or device during restricted times after school expectations are already known.",
    r: "responsibility",
    subValue: "muraqabah",
    level: 2
  },
  {
    key: "repeat_behavior_after_correction",
    label: "Repeated Misconduct After Correction",
    description: "Repeating the same misconduct soon after direct correction or a prior intervention.",
    r: "responsibility",
    subValue: "muraqabah",
    level: 3
  },
  {
    key: "concealing_wrongdoing",
    label: "Concealing Wrongdoing",
    description: "Hiding misconduct or helping others hide it instead of self-reporting or seeking help.",
    r: "responsibility",
    subValue: "muraqabah",
    level: 3
  }
] as const;

export const INFRACTION_MAP = Object.fromEntries(
  INFRACTIONS.map((infraction) => [infraction.key, infraction])
) as Record<string, InfractionDefinition>;

export const INFRACTIONS_BY_R = THREE_RS.map((r) => ({
  key: r,
  label: THREE_R_LABELS[r],
  items: INFRACTIONS.filter((infraction) => infraction.r === r)
}));

export function findInfractionByKey(key: string) {
  return INFRACTION_MAP[key] ?? null;
}

export function findInfractionsBySubValue(subValue: SubValueKey) {
  return INFRACTIONS.filter((infraction) => infraction.subValue === subValue);
}
