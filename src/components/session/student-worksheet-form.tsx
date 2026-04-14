"use client";

import * as React from "react";
import { HeartHandshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { THREE_R_LABELS } from "@/lib/data/infractions";
import type { SessionWorkspaceData } from "@/types/view-models";

interface StudentWorksheetFormProps {
  session: SessionWorkspaceData & { complexity?: string | null };
}

export function StudentWorksheetForm({ session }: StudentWorksheetFormProps) {
  const isElementary = Number(session.student?.grade ?? "0") <= 5;
  const [form, setForm] = React.useState({
    what_happened: session.worksheet?.what_happened ?? "",
    feelings: session.worksheet?.feelings ?? "",
    who_affected: session.worksheet?.who_affected ?? "",
    prophet_reflection: session.worksheet?.prophet_reflection ?? "",
    righteousness_response: session.worksheet?.righteousness_response ?? "",
    respect_response: session.worksheet?.respect_response ?? "",
    responsibility_response: session.worksheet?.responsibility_response ?? ""
  });
  const [status, setStatus] = React.useState("Ready to reflect");
  const timeoutRef = React.useRef<number | null>(null);

  const visibleModules = [
    session.referral?.primary_r,
    session.referral?.secondary_r,
    session.referral?.tertiary_r
  ].filter(Boolean) as Array<"righteousness" | "respect" | "responsibility">;

  React.useEffect(() => {
    window.clearTimeout(timeoutRef.current ?? undefined);
    timeoutRef.current = window.setTimeout(async () => {
      setStatus("Saving...");

      try {
        const response = await fetch(`/api/worksheet/${session.student_token}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        });

        if (!response.ok) {
          throw new Error("Unable to save worksheet.");
        }

        setStatus("Saved");
      } catch {
        setStatus("Save failed");
      }
    }, 900);

    return () => {
      window.clearTimeout(timeoutRef.current ?? undefined);
    };
  }, [form, session.student_token]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(45,106,79,0.08),transparent_32%),#faf7ef] px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="border-none bg-gradient-to-br from-[#173326] via-[#22523e] to-[#2a674b] text-white shadow-shell">
          <CardContent className="space-y-4 p-6 md:p-8">
            <div className="flex items-center gap-3 text-white/85">
              <HeartHandshake className="h-5 w-5" />
              <span className="text-sm uppercase tracking-[0.18em]">Tarbiyah Reflection</span>
            </div>
            <div>
              <h1 className="text-3xl text-white">Take a breath and reflect honestly.</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/78">
                This worksheet helps your Tarbiyah Director understand what happened, how you were
                feeling, and what repair should look like.
              </p>
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">{status}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isElementary ? "Tell the story simply" : "Tell the story honestly"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label={isElementary ? "What happened?" : "What happened from the beginning?"}>
              <Textarea
                value={form.what_happened}
                onChange={(event) => setForm((current) => ({ ...current, what_happened: event.target.value }))}
                placeholder="Write what happened in your own words."
              />
            </Field>
            <Field label={isElementary ? "How were you feeling?" : "What were you feeling right before and after?"}>
              {isElementary ? (
                <Select
                  value={form.feelings}
                  onChange={(event) => setForm((current) => ({ ...current, feelings: event.target.value }))}
                >
                  <option value="">Choose a feeling</option>
                  <option value="upset">Upset</option>
                  <option value="frustrated">Frustrated</option>
                  <option value="embarrassed">Embarrassed</option>
                  <option value="sad">Sad</option>
                  <option value="calm">Calm</option>
                </Select>
              ) : (
                <Textarea
                  value={form.feelings}
                  onChange={(event) => setForm((current) => ({ ...current, feelings: event.target.value }))}
                  placeholder="Describe the feelings and pressure in that moment."
                />
              )}
            </Field>
            <Field label="Who was affected?">
              <Textarea
                value={form.who_affected}
                onChange={(event) => setForm((current) => ({ ...current, who_affected: event.target.value }))}
                placeholder="Who was affected and how?"
              />
            </Field>
            <Field label="What would the Prophet ﷺ want from you now?">
              <Textarea
                value={form.prophet_reflection}
                onChange={(event) =>
                  setForm((current) => ({ ...current, prophet_reflection: event.target.value }))
                }
                placeholder="Write what a better response would look like."
              />
            </Field>
          </CardContent>
        </Card>

        {visibleModules.map((r) => (
          <Card key={r}>
            <CardHeader>
              <CardTitle>{THREE_R_LABELS[r]} reflection</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form[`${r}_response` as keyof typeof form]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [`${r}_response`]: event.target.value
                  }))
                }
                placeholder={`What does ${THREE_R_LABELS[r]} ask of you next?`}
              />
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => setStatus("Keep going. Changes save automatically.")}>
            Continue reflecting
          </Button>
        </div>
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

