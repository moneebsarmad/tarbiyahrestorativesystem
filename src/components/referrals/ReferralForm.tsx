"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { THREE_R_LABELS } from "@/lib/data/infractions";
import type { StudentRow } from "@/types";

interface InfractionOption {
  key: string;
  label: string;
  description: string;
  r: "righteousness" | "respect" | "responsibility";
  level: number;
}

interface ReferralFormProps {
  students: StudentRow[];
  infractions: readonly InfractionOption[];
}

export function ReferralForm({ students, infractions }: ReferralFormProps) {
  const router = useRouter();
  const [studentId, setStudentId] = React.useState(students[0]?.id ?? "");
  const [infraction, setInfraction] = React.useState("");
  const [staffNotes, setStaffNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedInfraction = infractions.find((entry) => entry.key === infraction);
  const groups = ["righteousness", "respect", "responsibility"] as const;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          student_id: studentId,
          infraction,
          staff_notes: staffNotes
        })
      });

      if (!response.ok) {
        throw new Error("Unable to submit referral.");
      }

      router.push("/referrals");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit referral.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Submit a referral</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Student">
              <Select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} {student.grade ? `· Grade ${student.grade}` : ""}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Search student">
              <Input
                list="student-options"
                placeholder="Type a student name"
                onChange={(event) => {
                  const student = students.find((entry) => entry.name === event.target.value);
                  if (student) {
                    setStudentId(student.id);
                  }
                }}
              />
              <datalist id="student-options">
                {students.map((student) => (
                  <option key={student.id} value={student.name ?? ""} />
                ))}
              </datalist>
            </Field>
          </div>

          <Field label="Infraction">
            <Select value={infraction} onChange={(event) => setInfraction(event.target.value)} required>
              <option value="">Select an infraction</option>
              {groups.map((group) => (
                <optgroup key={group} label={THREE_R_LABELS[group]}>
                  {infractions
                    .filter((entry) => entry.r === group)
                    .map((entry) => (
                      <option key={entry.key} value={entry.key}>
                        {entry.label}
                      </option>
                    ))}
                </optgroup>
              ))}
            </Select>
          </Field>

          {selectedInfraction ? (
            <div className="grid gap-4 rounded-3xl border border-border bg-bg-secondary/55 p-5 md:grid-cols-3">
              <Info label="Mapped R" value={THREE_R_LABELS[selectedInfraction.r]} />
              <Info label="Severity level" value={`Level ${selectedInfraction.level}`} />
              <Info label="Description" value={selectedInfraction.description} />
            </div>
          ) : null}

          <Field label="Staff notes">
            <Textarea
              value={staffNotes}
              onChange={(event) => setStaffNotes(event.target.value)}
              placeholder="Briefly describe what happened and any immediate context."
            />
          </Field>

          {error ? (
            <div className="rounded-3xl border border-flag-muraaqabah/20 bg-flag-muraaqabah/8 px-4 py-3 text-sm text-flag-muraaqabah">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || !studentId || !infraction}>
              {submitting ? "Submitting..." : "Submit referral"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className="mt-2 text-sm text-text-primary">{value}</p>
    </div>
  );
}

