"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function PatternNotesEditor({
  studentId,
  initialValue
}: {
  studentId: string;
  initialValue: string;
}) {
  const [notes, setNotes] = React.useState(initialValue);
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleSave() {
    const response = await fetch(`/api/students/${studentId}/pattern-notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ notes })
    });

    setMessage(response.ok ? "Pattern notes saved in mock mode." : "Unable to save notes.");
  }

  return (
    <div className="space-y-4">
      <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
      {message ? <p className="text-sm text-text-secondary">{message}</p> : null}
      <Button onClick={handleSave}>Save notes</Button>
    </div>
  );
}

