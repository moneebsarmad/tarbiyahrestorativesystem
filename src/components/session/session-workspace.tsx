"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  BookOpenCheck,
  Copy,
  LoaderCircle,
  Milestone,
  RefreshCcw,
  Sparkles
} from "lucide-react";

import { ArabicText } from "@/components/session/ArabicText";
import { PhaseNavigation } from "@/components/session/PhaseNavigation";
import { StudentWorksheetPanel } from "@/components/session/StudentWorksheetPanel";
import { ComplexityBadge, RBadge, SubValueBadge } from "@/components/tarbiyah/badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EMOTIONAL_STATES,
  HARM_AFFECTED_OPTIONS,
  SESSION_PHASES,
  STORY_CONTEXT_TAGS,
  SUB_VALUE_DEFINITIONS,
  getReadableDate,
  getReadableDateTime
} from "@/lib/tarbiyah";
import { cn } from "@/lib/utils";
import type { JsonValue, TarbiyahWorksheetResponseRow } from "@/types";
import { SUB_VALUE_LABELS } from "@/lib/data/infractions";
import type { SessionWorkspaceData } from "@/types/view-models";

type PhasePayload = Record<string, JsonValue | undefined>;

interface SessionWorkspaceProps {
  initialSession: SessionWorkspaceData;
  readOnly: boolean;
  appUrl: string;
}

interface CompletionSummary {
  actionStepCount: number;
  muraqabahReason: string | null;
}

function ensurePhaseValue(value: JsonValue | undefined) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as PhasePayload;
  }

  return {} as PhasePayload;
}

function readActionSteps(value: JsonValue): Array<{
  description: string;
  r: string;
  sub_value: string;
  due_date?: string | null;
}> {
  return Array.isArray(value) ? (value as Array<{ description: string; r: string; sub_value: string; due_date?: string | null }>) : [];
}

function readWorksheetState(worksheet: TarbiyahWorksheetResponseRow | null) {
  if (!worksheet?.submitted_at) {
    return "idle" as const;
  }

  const ageMs = Date.now() - new Date(worksheet.submitted_at).getTime();
  return ageMs < 15000 ? ("typing" as const) : ("idle" as const);
}

export function SessionWorkspace({
  initialSession,
  readOnly,
  appUrl
}: SessionWorkspaceProps) {
  const [session, setSession] = React.useState(initialSession);
  const [activePhase, setActivePhase] = React.useState("phase_1");
  const [savingPhase, setSavingPhase] = React.useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = React.useState<{
    url: string;
    expiresAt: string;
  } | null>(
    initialSession.student_token
      ? {
          url: `${appUrl}/session/${initialSession.student_token}`,
          expiresAt: initialSession.student_token_expires_at ?? ""
        }
      : null
  );
  const [completionSummary, setCompletionSummary] = React.useState<CompletionSummary | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<Record<string, number>>({});

  const phaseNotes = (session.phase_notes ?? {}) as Record<string, JsonValue>;
  const currentPhaseValue = ensurePhaseValue(phaseNotes[activePhase]);
  const worksheetState = readWorksheetState(session.worksheet);

  const syncSession = React.useCallback(async () => {
    const response = await fetch(`/api/sessions/${session.id}`, {
      cache: "no-store"
    });
    const payload = (await response.json()) as { session: SessionWorkspaceData };
    setSession(payload.session);
  }, [session.id]);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      void syncSession();
    }, 2500);

    return () => window.clearInterval(interval);
  }, [syncSession]);

  const queuePhaseSave = React.useCallback(
    (phaseKey: string, value: PhasePayload) => {
      setSavingPhase(phaseKey);
      window.clearTimeout(timeoutRef.current[phaseKey]);
      timeoutRef.current[phaseKey] = window.setTimeout(async () => {
        try {
          const response = await fetch(`/api/sessions/${session.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              type: "phase",
              phaseKey,
              value
            })
          });

          if (!response.ok) {
            throw new Error("Unable to save phase notes.");
          }

          const payload = (await response.json()) as { session: SessionWorkspaceData };
          setSession(payload.session);
          setMessage(`${SESSION_PHASES.find((phase) => phase.key === phaseKey)?.title ?? "Phase"} saved.`);
        } catch (saveError) {
          setError(saveError instanceof Error ? saveError.message : "Save failed.");
        } finally {
          setSavingPhase((current) => (current === phaseKey ? null : current));
        }
      }, 800);
    },
    [session.id]
  );

  const updatePhase = React.useCallback(
    (phaseKey: string, patch: PhasePayload) => {
      const current = ensurePhaseValue((session.phase_notes as Record<string, JsonValue>)[phaseKey]);
      const nextValue = {
        ...current,
        ...patch
      };

      setSession((currentSession) => ({
        ...currentSession,
        phase_notes: {
          ...(currentSession.phase_notes as Record<string, JsonValue>),
          [phaseKey]: nextValue
        }
      }));

      queuePhaseSave(phaseKey, nextValue);
    },
    [queuePhaseSave, session.phase_notes]
  );

  async function updateSessionPatch(patch: Partial<SessionWorkspaceData>) {
    const response = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "session",
        patch
      })
    });

    if (!response.ok) {
      throw new Error("Unable to update session.");
    }

    const payload = (await response.json()) as { session: SessionWorkspaceData };
    setSession(payload.session);
    return payload.session;
  }

  async function handleGenerateLink() {
    setError(null);

    try {
      const response = await fetch("/api/auth/session-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId: session.id
        })
      });

      if (!response.ok) {
        throw new Error("Unable to generate a student link.");
      }

      const payload = (await response.json()) as {
        url: string;
        expiresAt: string;
      };

      setGeneratedLink({
        url: payload.url.startsWith("http") ? payload.url : `${appUrl}${payload.url}`,
        expiresAt: payload.expiresAt
      });
      await syncSession();
    } catch (linkError) {
      setError(linkError instanceof Error ? linkError.message : "Unable to generate link.");
    }
  }

  async function handleCopyLink() {
    if (!generatedLink) {
      return;
    }

    await navigator.clipboard.writeText(generatedLink.url);
    setMessage("Student link copied.");
  }

  async function handleAnchorSwap(anchorId: string) {
    setError(null);

    try {
      await updateSessionPatch({
        islamic_anchor_id: anchorId
      });
      setMessage("Session anchor updated.");
    } catch (anchorError) {
      setError(anchorError instanceof Error ? anchorError.message : "Unable to swap anchor.");
    }
  }

  async function handleActionStepSelect(
    subValue: string,
    template: { description: string; r: string; subValue: string }
  ) {
    const currentSteps = readActionSteps(session.action_steps);
    const nextSteps = [
      ...currentSteps.filter((step) => step.sub_value !== subValue),
      {
        description: template.description,
        r: template.r,
        sub_value: template.subValue,
        due_date: session.follow_up_date
      }
    ];

    try {
      await updateSessionPatch({
        action_steps: nextSteps
      });
    } catch (stepError) {
      setError(stepError instanceof Error ? stepError.message : "Unable to update action steps.");
    }
  }

  async function handleActionStepDueDate(subValue: string, dueDate: string) {
    const currentSteps = readActionSteps(session.action_steps);
    const nextSteps = currentSteps.map((step) =>
      step.sub_value === subValue
        ? {
            ...step,
            due_date: dueDate
          }
        : step
    );

    try {
      await updateSessionPatch({
        action_steps: nextSteps
      });
    } catch (stepError) {
      setError(stepError instanceof Error ? stepError.message : "Unable to update due date.");
    }
  }

  async function handleCompleteSession() {
    setError(null);

    try {
      const response = await fetch(`/api/sessions/${session.id}/complete`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Unable to complete session.");
      }

      const payload = (await response.json()) as {
        session: SessionWorkspaceData;
        summary: CompletionSummary;
      };

      setSession(payload.session);
      setCompletionSummary(payload.summary);
      setMessage("Session closed successfully.");
    } catch (completionError) {
      setError(
        completionError instanceof Error ? completionError.message : "Unable to complete session."
      );
    }
  }

  const referral = session.referral;
  const student = session.student;
  const selectedActionSteps = readActionSteps(session.action_steps);

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <PhaseNavigation
          activePhase={activePhase}
          completed={session.phases_completed}
          onSelect={setActivePhase}
        />
        <Card className="border-border/80 bg-bg-card/90">
          <CardContent className="p-4 text-xs text-text-secondary">
            {savingPhase ? (
              <div className="flex items-center gap-2 text-accent-green">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                Saving {SESSION_PHASES.find((phase) => phase.key === savingPhase)?.title}...
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-semibold uppercase tracking-[0.16em] text-text-muted">
                  Progress
                </p>
                <p>
                  {session.phases_completed.length} / {SESSION_PHASES.length} phases touched
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-none bg-gradient-to-br from-[#173326] via-[#1f4d39] to-[#225b43] text-white">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/15 bg-white/10 text-white">
                Session #{session.session_number}
              </Badge>
              <ComplexityBadge complexity={referral?.complexity} />
              {referral?.primary_r ? <RBadge r={referral.primary_r} /> : null}
              {referral?.primary_sub_value ? <SubValueBadge subValue={referral.primary_sub_value} /> : null}
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/65">Student</p>
                <h2 className="mt-2 text-3xl text-white">{student?.name ?? "Unknown student"}</h2>
                <p className="mt-2 text-sm text-white/75">
                  {student?.grade ? `Grade ${student.grade}` : "Grade unknown"} · Session date{" "}
                  {getReadableDate(session.session_date)}
                </p>
                <p className="mt-4 max-w-2xl text-sm text-white/80">
                  {referral?.staff_notes ?? "No staff notes captured on the referral."}
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/65">Infraction</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {referral?.infraction?.replaceAll("_", " ") ?? "Unmapped referral"}
                </p>
                <p className="mt-3 text-sm text-white/75">
                  Follow-up date: {getReadableDate(session.follow_up_date)}
                </p>
                <p className="mt-2 text-sm text-white/75">
                  Status: {session.status === "completed" ? "Completed" : "Open"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {message ? (
          <div className="rounded-3xl border border-accent-green/20 bg-accent-green/8 px-4 py-3 text-sm text-accent-green">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-3xl border border-flag-muraaqabah/20 bg-flag-muraaqabah/8 px-4 py-3 text-sm text-flag-muraaqabah">
            {error}
          </div>
        ) : null}

        <PhaseBody
          activePhase={activePhase}
          phaseValue={currentPhaseValue}
          session={session}
          readOnly={readOnly}
          generatedLink={generatedLink}
          appUrl={appUrl}
          onGenerateLink={handleGenerateLink}
          onCopyLink={handleCopyLink}
          onAnchorSwap={handleAnchorSwap}
          onActionStepSelect={handleActionStepSelect}
          onActionStepDueDate={handleActionStepDueDate}
          onUpdatePhase={(patch) => updatePhase(activePhase, patch)}
          onUpdateSession={async (patch) => {
            try {
              await updateSessionPatch(patch);
            } catch (sessionError) {
              setError(sessionError instanceof Error ? sessionError.message : "Unable to update session.");
            }
          }}
          onCompleteSession={handleCompleteSession}
        />

        {completionSummary ? (
          <Card className="border-accent-green/20 bg-accent-green/6">
            <CardHeader>
              <CardTitle className="text-2xl">Session summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <SummaryStat
                label="Action steps committed"
                value={String(completionSummary.actionStepCount)}
                icon={Milestone}
              />
              <SummaryStat
                label="Follow-up date"
                value={getReadableDate(session.follow_up_date)}
                icon={BookOpenCheck}
              />
              <SummaryStat
                label="Murāqabah"
                value={completionSummary.muraqabahReason ? "Flagged" : "Not flagged"}
                icon={Sparkles}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>

      <StudentWorksheetPanel
        worksheet={session.worksheet}
        studentName={student?.name ?? "Student"}
        liveState={worksheetState}
      />
    </div>
  );
}

function PhaseBody({
  activePhase,
  phaseValue,
  session,
  readOnly,
  generatedLink,
  onGenerateLink,
  onCopyLink,
  onAnchorSwap,
  onActionStepSelect,
  onActionStepDueDate,
  onUpdatePhase,
  onUpdateSession,
  onCompleteSession
}: {
  activePhase: string;
  phaseValue: PhasePayload;
  session: SessionWorkspaceData;
  readOnly: boolean;
  generatedLink: { url: string; expiresAt: string } | null;
  appUrl: string;
  onGenerateLink: () => void;
  onCopyLink: () => void;
  onAnchorSwap: (anchorId: string) => void;
  onActionStepSelect: (
    subValue: string,
    template: { description: string; r: string; subValue: string }
  ) => void;
  onActionStepDueDate: (subValue: string, dueDate: string) => void;
  onUpdatePhase: (patch: PhasePayload) => void;
  onUpdateSession: (patch: Partial<SessionWorkspaceData>) => Promise<void>;
  onCompleteSession: () => void;
}) {
  const referral = session.referral;
  const selectedActionSteps = readActionSteps(session.action_steps);

  switch (activePhase) {
    case "phase_1":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Phase 1 · Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <PromptStrip
              title="Facilitator reminders"
              items={[
                "Start with salām and help the student regulate before details.",
                "Ask one warm, non-incident question first.",
                "Look for readiness, not just compliance."
              ]}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Observed emotional state">
                <Select
                  value={String(phaseValue.emotional_state ?? "")}
                  onChange={(event) => onUpdatePhase({ emotional_state: event.target.value })}
                  disabled={readOnly}
                >
                  <option value="">Select a state</option>
                  {EMOTIONAL_STATES.map((state) => (
                    <option key={state} value={state.toLowerCase()}>
                      {state}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Student worksheet handoff">
                <div className="rounded-3xl border border-border bg-bg-secondary/60 p-4">
                  {generatedLink ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-start gap-4">
                        <QRCodeSVG value={generatedLink.url} size={104} includeMargin />
                        <div className="min-w-0 flex-1 space-y-2">
                          <Input value={generatedLink.url} readOnly />
                          <p className="text-xs text-text-secondary">
                            Expires {getReadableDateTime(generatedLink.expiresAt)}
                          </p>
                          <Button variant="secondary" onClick={onCopyLink}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy link
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-text-secondary">
                        Generate a secure worksheet link for the student&apos;s device.
                      </p>
                      <Button
                        variant="secondary"
                        disabled={readOnly}
                        onClick={onGenerateLink}
                      >
                        Generate link
                      </Button>
                    </div>
                  )}
                </div>
              </Field>
            </div>
            <Field label="Connection notes">
              <Textarea
                value={String(phaseValue.notes ?? "")}
                onChange={(event) => onUpdatePhase({ notes: event.target.value })}
                disabled={readOnly}
                placeholder="How did the student enter the session? What opened them up?"
              />
            </Field>
          </CardContent>
        </Card>
      );
    case "phase_2":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Phase 2 · Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <PromptStrip
              title="Listen for"
              items={[
                "Emotions rising underneath the story",
                "Triggers, pressure, or context before the action",
                "What the student wanted in that moment"
              ]}
            />
            <div className="flex flex-wrap gap-2">
              {STORY_CONTEXT_TAGS.map((tag) => {
                const activeTags = Array.isArray(phaseValue.context_tags)
                  ? (phaseValue.context_tags as string[])
                  : [];
                const isActive = activeTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={readOnly}
                    onClick={() =>
                      onUpdatePhase({
                        context_tags: isActive
                          ? activeTags.filter((entry) => entry !== tag)
                          : [...activeTags, tag]
                      })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition",
                      isActive
                        ? "border-accent-green bg-accent-green/10 text-accent-green"
                        : "border-border bg-white text-text-secondary"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <Field label="Student narrative">
              <Textarea
                value={String(phaseValue.notes ?? "")}
                onChange={(event) => onUpdatePhase({ notes: event.target.value })}
                disabled={readOnly}
                className="min-h-[220px]"
                placeholder="Capture the student's account, sequence, and context."
              />
            </Field>
          </CardContent>
        </Card>
      );
    case "phase_3":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Phase 3 · Mirror</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <InfoTile
                label="Primary R"
                value={referral?.primary_r ? <RBadge r={referral.primary_r} /> : "Unmapped"}
              />
              <InfoTile
                label="Sub-value"
                value={
                  referral?.primary_sub_value ? (
                    <div className="space-y-2">
                      <SubValueBadge subValue={referral.primary_sub_value} />
                      <p className="text-xs text-text-secondary">
                        {SUB_VALUE_DEFINITIONS[referral.primary_sub_value]}
                      </p>
                    </div>
                  ) : (
                    "Unmapped"
                  )
                }
              />
              <InfoTile
                label="Complexity"
                value={<ComplexityBadge complexity={referral?.complexity} />}
              />
            </div>
            <PromptStrip
              title="Mirror language"
              items={[
                "It sounds like in that moment...",
                "The pressure felt strongest when...",
                "What this touched in the 3Rs was..."
              ]}
            />
            <Field label="Mirror notes">
              <Textarea
                value={String(phaseValue.notes ?? "")}
                onChange={(event) => onUpdatePhase({ notes: event.target.value })}
                disabled={readOnly}
                placeholder="Name the primary value breach clearly and gently."
              />
            </Field>
          </CardContent>
        </Card>
      );
    case "phase_4":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Phase 4 · Anchor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {session.anchor ? (
              <ArabicText
                arabic={session.anchor.arabic_text}
                transliteration={session.anchor.transliteration}
                translation={session.anchor.translation}
                source={session.anchor.source}
              />
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-bg-secondary/50 p-5 text-sm text-text-secondary">
                No active anchor is attached to this session yet.
              </div>
            )}
            {session.anchor && Array.isArray(session.anchor.discussion_questions) ? (
              <ol className="space-y-2 rounded-3xl border border-border bg-white p-5 text-sm text-text-secondary">
                {(session.anchor.discussion_questions as string[]).map((question) => (
                  <li key={question} className="list-inside list-decimal">
                    {question}
                  </li>
                ))}
              </ol>
            ) : null}
            {!readOnly && session.anchorOptions && session.anchorOptions.length > 0 ? (
              <Field label="Swap anchor">
                <div className="grid gap-3 md:grid-cols-2">
                  {session.anchorOptions.map((anchor) => (
                    <button
                      key={anchor.id}
                      type="button"
                      onClick={() => onAnchorSwap(anchor.id)}
                      className={cn(
                        "rounded-3xl border p-4 text-left transition",
                        session.islamic_anchor_id === anchor.id
                          ? "border-accent-green bg-accent-green/6"
                          : "border-border bg-white hover:bg-bg-secondary/60"
                      )}
                    >
                      <p dir="rtl" className="font-arabic text-xl text-text-primary">
                        {anchor.arabic_text}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-text-muted">
                        {anchor.source}
                      </p>
                    </button>
                  ))}
                </div>
              </Field>
            ) : null}
            <Field label="Anchor reflection notes">
              <Textarea
                value={String(phaseValue.notes ?? "")}
                onChange={(event) => onUpdatePhase({ notes: event.target.value })}
                disabled={readOnly}
                placeholder="How did the student respond to the Islamic anchor?"
              />
            </Field>
          </CardContent>
        </Card>
      );
    case "phase_5":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Phase 5 · Harm Map</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {HARM_AFFECTED_OPTIONS.map((person) => {
                const current = Array.isArray(phaseValue.affected) ? (phaseValue.affected as string[]) : [];
                const isActive = current.includes(person);

                return (
                  <button
                    key={person}
                    type="button"
                    disabled={readOnly}
                    onClick={() =>
                      onUpdatePhase({
                        affected: isActive
                          ? current.filter((entry) => entry !== person)
                          : [...current, person]
                      })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition",
                      isActive
                        ? "border-respect bg-respect/10 text-respect"
                        : "border-border bg-white text-text-secondary"
                    )}
                  >
                    {person}
                  </button>
                );
              })}
            </div>
            <Field label="Harm description">
              <Textarea
                value={String(phaseValue.notes ?? "")}
                onChange={(event) => onUpdatePhase({ notes: event.target.value })}
                disabled={readOnly}
                placeholder="Name the impact on people, learning, trust, and school climate."
              />
            </Field>
          </CardContent>
        </Card>
      );
    case "phase_6":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Phase 6 · Action Step</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {session.actionStepOptions?.map((group) => {
              if (!group.subValue) {
                return null;
              }

              const selected = selectedActionSteps.find((step) => step.sub_value === group.subValue);

              return (
                <div key={group.subValue} className="space-y-3 rounded-3xl border border-border bg-bg-secondary/45 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Sub-value</p>
                      <p className="mt-1 font-semibold text-text-primary">
                        {SUB_VALUE_LABELS[group.subValue]}
                      </p>
                    </div>
                    {selected ? (
                      <Badge className="bg-accent-green/10 text-accent-green">Selected</Badge>
                    ) : null}
                  </div>
                  <div className="grid gap-3">
                    {group.options.map((option) => {
                      const isSelected = selected?.description === option.description;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={readOnly}
                          onClick={() =>
                            onActionStepSelect(group.subValue!, {
                              description: option.description,
                              r: option.r,
                              subValue: option.subValue
                            })
                          }
                          className={cn(
                            "rounded-3xl border p-4 text-left transition",
                            isSelected
                              ? "border-accent-green bg-white shadow-card"
                              : "border-border bg-white hover:bg-bg-secondary"
                          )}
                        >
                          <p className="font-semibold text-text-primary">{option.title}</p>
                          <p className="mt-2 text-sm text-text-secondary">{option.description}</p>
                          <p className="mt-3 text-xs text-text-muted">
                            Completed looks like: {option.completedLooksLike}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {selected ? (
                    <Field label="Due date">
                      <Input
                        type="date"
                        value={selected.due_date ?? session.follow_up_date ?? ""}
                        onChange={(event) => onActionStepDueDate(group.subValue!, event.target.value)}
                        disabled={readOnly}
                      />
                    </Field>
                  ) : null}
                </div>
              );
            })}
            <Field label="Action step notes">
              <Textarea
                value={String(phaseValue.notes ?? "")}
                onChange={(event) => onUpdatePhase({ notes: event.target.value })}
                disabled={readOnly}
                placeholder="Any coaching notes, cautions, or sequencing decisions."
              />
            </Field>
          </CardContent>
        </Card>
      );
    case "phase_7":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Phase 7 · Commitment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Student commitment statement">
              <Textarea
                value={String(phaseValue.commitment ?? phaseValue.notes ?? "")}
                onChange={(event) =>
                  onUpdatePhase({
                    commitment: event.target.value,
                    notes: event.target.value
                  })
                }
                disabled={readOnly}
                placeholder="Capture the student's own wording for what they will do next."
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Follow-up date">
                <Input
                  type="date"
                  value={session.follow_up_date ?? ""}
                  disabled={readOnly}
                  onChange={(event) => void onUpdateSession({ follow_up_date: event.target.value })}
                />
              </Field>
              <Field label="Split session option">
                <label className="flex h-11 items-center rounded-2xl border border-border bg-white px-4 text-sm text-text-primary">
                  <input
                    type="checkbox"
                    className="mr-3"
                    disabled={readOnly}
                    checked={session.status === "split_pending"}
                    onChange={(event) =>
                      void onUpdateSession({
                        status: event.target.checked ? "split_pending" : "open"
                      })
                    }
                  />
                  Schedule a second session if needed
                </label>
              </Field>
            </div>
            <div className="rounded-3xl border border-[#eadfca] bg-[#fbf6eb] p-5">
              <p dir="rtl" className="font-arabic text-2xl leading-loose text-[#3d2a18]">
                اللَّهُمَّ اهْدِنَا لِأَحْسَنِ الْأَخْلَاقِ
              </p>
              <p className="mt-3 text-sm text-[#554737]">
                O Allah, guide us to the best of character.
              </p>
            </div>
            {!readOnly ? (
              <Button size="lg" onClick={onCompleteSession}>
                Complete session
              </Button>
            ) : null}
          </CardContent>
        </Card>
      );
    default:
      return null;
  }
}

function SummaryStat({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white px-4 py-5">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-3 text-2xl font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function PromptStrip({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-border bg-bg-secondary/55 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{title}</p>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-text-secondary">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <div className="mt-3 text-sm text-text-primary">{value}</div>
    </div>
  );
}
