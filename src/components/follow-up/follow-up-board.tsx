"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RBadge } from "@/components/tarbiyah/badges";
import { getDaysRemaining, getReadableDate } from "@/lib/tarbiyah";
import type { ActionStepWithContext } from "@/types/view-models";

interface FollowUpBoardProps {
  actionSteps: ActionStepWithContext[];
  flaggedSessions: Array<{
    id: string;
    studentName: string;
    grade: string;
    reason: string;
    sessionCount: number;
  }>;
}

export function FollowUpBoard({ actionSteps, flaggedSessions }: FollowUpBoardProps) {
  const [gradeFilter, setGradeFilter] = React.useState("all");
  const [rFilter, setRFilter] = React.useState("all");
  const [overdueOnly, setOverdueOnly] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const filteredSteps = actionSteps.filter((step) => {
    if (step.completed) {
      return false;
    }

    if (gradeFilter !== "all" && step.student?.grade !== gradeFilter) {
      return false;
    }

    if (rFilter !== "all" && step.r !== rFilter) {
      return false;
    }

    if (overdueOnly) {
      return (getDaysRemaining(step.due_date) ?? 0) < 0;
    }

    return true;
  });

  async function handleComplete(stepId: string) {
    const notes = window.prompt("Completion notes");
    if (notes === null) {
      return;
    }

    const response = await fetch(`/api/action-steps/${stepId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ notes })
    });

    setMessage(response.ok ? "Action step completed. Refresh to update the board." : "Unable to complete action step.");
  }

  async function handleDismiss(sessionId: string) {
    const notes = window.prompt("Dismissal notes");
    if (notes === null) {
      return;
    }

    const response = await fetch(`/api/muraaqabah/${sessionId}/dismiss`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ notes })
    });

    setMessage(response.ok ? "Murāqabah flag dismissed. Refresh to update." : "Unable to dismiss flag.");
  }

  async function handleReminderDigest() {
    const response = await fetch("/api/email/reminders", {
      method: "POST"
    });

    setMessage(response.ok ? "Reminder digest generated in mock mode." : "Unable to trigger reminders.");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-[28px] border border-border bg-bg-secondary/45 p-5 md:grid-cols-4">
        <Select value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)}>
          <option value="all">All grades</option>
          {Array.from(new Set(actionSteps.map((step) => step.student?.grade).filter(Boolean))).map((grade) => (
            <option key={grade} value={grade ?? ""}>
              Grade {grade}
            </option>
          ))}
        </Select>
        <Select value={rFilter} onChange={(event) => setRFilter(event.target.value)}>
          <option value="all">All Rs</option>
          <option value="righteousness">Righteousness</option>
          <option value="respect">Respect</option>
          <option value="responsibility">Responsibility</option>
        </Select>
        <label className="flex h-11 items-center gap-3 rounded-2xl border border-border bg-white px-4 text-sm text-text-primary">
          <input type="checkbox" checked={overdueOnly} onChange={(event) => setOverdueOnly(event.target.checked)} />
          Overdue only
        </label>
        <Button variant="secondary" onClick={handleReminderDigest}>
          Send reminder digest
        </Button>
      </div>

      {message ? <p className="text-sm text-text-secondary">{message}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-3">
          {filteredSteps.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-border bg-bg-secondary/35 p-6 text-sm text-text-secondary">
              No open action steps match the current filters.
            </div>
          ) : (
            filteredSteps.map((step) => {
              const remaining = getDaysRemaining(step.due_date);

              return (
                <div
                  key={step.id}
                  className={`rounded-[28px] border p-5 ${remaining !== null && remaining < 0 ? "border-flag-muraaqabah/25 bg-flag-muraaqabah/6" : "border-border bg-white"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">{step.student?.name}</p>
                      <p className="mt-1 text-sm text-text-secondary">
                        Grade {step.student?.grade ?? "?"} · {step.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <RBadge r={step.r} />
                      <Button variant="ghost" size="sm" onClick={() => void handleComplete(step.id)}>
                        Mark complete
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-6 text-sm text-text-secondary">
                    <span>Due {getReadableDate(step.due_date)}</span>
                    <span>
                      {remaining === null ? "No due date" : remaining < 0 ? `${Math.abs(remaining)} days overdue` : `${remaining} days remaining`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-[28px] border border-border bg-white p-5">
            <h2 className="text-2xl">Murāqabah flags</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Repeat patterns and complex incidents that need closer attention.
            </p>
          </div>
          {flaggedSessions.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-border bg-bg-secondary/35 p-6 text-sm text-text-secondary">
              No active flags.
            </div>
          ) : (
            flaggedSessions.map((flag) => (
              <div key={flag.id} className="rounded-[28px] border border-flag-muraaqabah/25 bg-white p-5">
                <p className="font-semibold text-text-primary">{flag.studentName}</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Grade {flag.grade} · {flag.reason.replaceAll("_", " ")}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-text-muted">
                  {flag.sessionCount} sessions in view
                </p>
                <Button className="mt-4" variant="ghost" size="sm" onClick={() => void handleDismiss(flag.id)}>
                  Override / dismiss
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

