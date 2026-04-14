import type { InfractionLevel, SubValueKey, ThreeRKey } from "@/types";

export interface ActionStepTemplate {
  id: string;
  r: ThreeRKey;
  subValue: SubValueKey;
  title: string;
  description: string;
  completedLooksLike: string;
  levels: readonly InfractionLevel[];
}

function buildTemplate(
  subValue: SubValueKey,
  r: ThreeRKey,
  suffix: string,
  title: string,
  description: string,
  completedLooksLike: string,
  levels: readonly InfractionLevel[]
): ActionStepTemplate {
  return {
    id: `${subValue}-${suffix}`,
    r,
    subValue,
    title,
    description,
    completedLooksLike,
    levels
  };
}

export const ACTION_STEP_TEMPLATES: readonly ActionStepTemplate[] = [
  buildTemplate("taqwa", "righteousness", "dua-reset", "Daily du'a reset", "Pause before each school day with a short du'a and intention reset.", "Student can describe the du'a routine and has practiced it consistently for a week.", [1, 2]),
  buildTemplate("taqwa", "righteousness", "salah-check", "Salah readiness plan", "Create a concrete plan for being ready and present for school salah.", "Student arrives prepared and on time for the next scheduled prayers.", [2, 3, 4]),
  buildTemplate("sidq", "righteousness", "truth-repair", "Truth and repair statement", "State the truth clearly to the affected adult or peer and describe what was hidden.", "Student gives a direct truthful account without deflection.", [1, 2, 3]),
  buildTemplate("sidq", "righteousness", "honesty-journal", "Honesty reflection journal", "Write a short reflection on what fear or pressure made dishonesty feel easier.", "Student completes the reflection and discusses one honest alternative response.", [2, 3, 4]),
  buildTemplate("iffah", "righteousness", "boundary-plan", "Personal boundary plan", "Name the trigger, reset point, and one concrete protective boundary for future situations.", "Student can explain the boundary and when to use it.", [2, 3, 4]),
  buildTemplate("iffah", "righteousness", "device-guardrails", "Device guardrails", "Limit device access and identify which settings, places, or times need protection.", "Student follows the agreed device guardrails for one week.", [3, 4]),
  buildTemplate("taharah", "righteousness", "clean-space", "Restore the shared space", "Clean and restore the space that was treated carelessly.", "Area is restored and student can explain why cleanliness matters in Islam.", [1, 2]),
  buildTemplate("taharah", "righteousness", "purity-routine", "Purity routine", "Practice a short hygiene and adab routine tied to wudu or shared spaces.", "Student completes the routine independently over several days.", [1, 2, 3]),
  buildTemplate("hilm", "respect", "pause-script", "Pause script", "Use a three-step pause script before responding in anger.", "Student can repeat the script and report using it in a difficult moment.", [1, 2]),
  buildTemplate("hilm", "respect", "repair-after-anger", "Repair after anger", "Apologize for the outburst and name the point where restraint was lost.", "Student makes a direct repair and identifies the earlier turning point.", [2, 3, 4]),
  buildTemplate("riayah", "respect", "care-action", "Intentional care action", "Do one concrete act of care for the harmed person or school community.", "Student completes the care action and reflects on its effect.", [1, 2]),
  buildTemplate("riayah", "respect", "support-plan", "Support plan for peers", "Identify how to include, support, or protect vulnerable peers in future interactions.", "Student articulates a support plan and follows one step of it.", [2, 3]),
  buildTemplate("hifz_al_huquq", "respect", "rights-repair", "Restore the right", "Return, replace, or restore what was taken, damaged, or violated.", "The harmed person's right is materially restored where possible.", [2, 3, 4]),
  buildTemplate("hifz_al_huquq", "respect", "consent-reset", "Permission and consent reset", "Practice asking before touching, taking, posting, or using what belongs to someone else.", "Student consistently asks permission in monitored follow-up.", [1, 2, 3]),
  buildTemplate("adab", "respect", "respectful-language", "Respectful language reset", "Replace mocking or rude phrases with a respectful script.", "Student can use the respectful script in a role-play or real interaction.", [1, 2]),
  buildTemplate("adab", "respect", "classroom-amends", "Classroom amends", "Repair the disruption by helping restore the learning environment.", "Student completes the amends task and re-enters class appropriately.", [2, 3]),
  buildTemplate("amanah", "responsibility", "trust-task", "Trust task", "Take responsibility for one entrusted duty and document follow-through.", "Student completes the duty without reminders for the agreed period.", [1, 2]),
  buildTemplate("amanah", "responsibility", "property-repair", "Property repair or restitution", "Repair, replace, or repay for what was misused or damaged.", "The trust or property is restored and documented.", [2, 3, 4]),
  buildTemplate("indibat", "responsibility", "routine-reset", "Routine reset", "Build a short daily routine around the weak point: arrival, transitions, or class readiness.", "Student follows the routine for several consecutive school days.", [1, 2]),
  buildTemplate("indibat", "responsibility", "attendance-plan", "Attendance accountability plan", "Set a monitored plan for punctuality and staying in the assigned space.", "Student meets the attendance target in follow-up.", [2, 3, 4]),
  buildTemplate("iltizam", "responsibility", "commitment-checklist", "Commitment checklist", "Break an existing commitment into visible daily or weekly checkpoints.", "Student shows consistent completion of the checkpoints.", [1, 2]),
  buildTemplate("iltizam", "responsibility", "follow-through-conference", "Follow-through conference", "Meet with the responsible adult to review unfinished obligations and next deadlines.", "Student attends the conference and completes the new follow-through steps.", [2, 3, 4]),
  buildTemplate("muraqabah", "responsibility", "self-monitoring-card", "Self-monitoring card", "Track the target behavior and triggers at least once each day.", "Student completes the card honestly over the follow-up period.", [1, 2, 3]),
  buildTemplate("muraqabah", "responsibility", "accountability-checkin", "Accountability check-in", "Do a short daily check-in with a trusted adult about the repeated pattern.", "Student completes the check-ins and can name what they noticed.", [2, 3, 4])
] as const;

export function getActionStepTemplates(subValue: SubValueKey, level: number) {
  return ACTION_STEP_TEMPLATES.filter(
    (template) => template.subValue === subValue && template.levels.includes(level as InfractionLevel)
  );
}
