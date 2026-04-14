"use client";

import { Clock3, FilePenLine, LoaderCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReadableDateTime } from "@/lib/tarbiyah";
import type { TarbiyahWorksheetResponseRow } from "@/types";

interface StudentWorksheetPanelProps {
  worksheet: TarbiyahWorksheetResponseRow | null;
  studentName: string;
  liveState: "idle" | "typing";
}

export function StudentWorksheetPanel({
  worksheet,
  studentName,
  liveState
}: StudentWorksheetPanelProps) {
  const sections = [
    { label: "What happened", value: worksheet?.what_happened },
    { label: "Feelings", value: worksheet?.feelings },
    { label: "Who was affected", value: worksheet?.who_affected },
    { label: "Prophetic reflection", value: worksheet?.prophet_reflection },
    { label: "Righteousness", value: worksheet?.righteousness_response },
    { label: "Respect", value: worksheet?.respect_response },
    { label: "Responsibility", value: worksheet?.responsibility_response }
  ].filter((section) => Boolean(section.value));

  const status = worksheet ? "In progress" : "Not started";

  return (
    <Card className="sticky top-4 border-border/80 bg-[#fbfaf6]">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Worksheet</p>
            <CardTitle className="text-xl">{studentName}</CardTitle>
          </div>
          <div className="rounded-full bg-bg-secondary px-3 py-1 text-xs font-medium text-text-secondary">
            {status}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          {liveState === "typing" ? (
            <>
              <LoaderCircle className="h-3.5 w-3.5 animate-spin text-accent-green" />
              Student is responding...
            </>
          ) : (
            <>
              <Clock3 className="h-3.5 w-3.5" />
              Last update {getReadableDateTime(worksheet?.submitted_at)}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-white p-5 text-sm text-text-secondary">
            <div className="flex items-center gap-3 text-text-primary">
              <FilePenLine className="h-4 w-4" />
              Waiting for student input
            </div>
            <p className="mt-2">
              Generate the session link in Phase 1, then keep this panel open while the student
              responds.
            </p>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.label} className="rounded-3xl border border-border bg-white p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{section.label}</p>
              <p className="mt-2 text-sm leading-6 text-text-primary">{section.value}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

