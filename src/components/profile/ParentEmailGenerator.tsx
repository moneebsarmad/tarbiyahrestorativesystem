"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ParentEmailGeneratorProps {
  sessionId: string;
  studentId: string;
  draft: {
    subject: string;
    body: string;
    suggestions: string[];
  } | null;
}

export function ParentEmailGenerator({
  sessionId,
  studentId,
  draft
}: ParentEmailGeneratorProps) {
  const [recipient, setRecipient] = React.useState("parent@example.com");
  const [subject, setSubject] = React.useState(draft?.subject ?? "");
  const [body, setBody] = React.useState(draft?.body ?? "");
  const [message, setMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  if (!draft) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-bg-secondary/45 p-5 text-sm text-text-secondary">
        Complete the session to generate a parent email draft.
      </div>
    );
  }

  async function handleSend() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/email/parent-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          session_id: sessionId,
          student_id: studentId,
          parent_email: recipient,
          subject,
          body
        })
      });

      if (!response.ok) {
        throw new Error("Unable to send email.");
      }

      setMessage("Parent email logged in the mock communication history.");
    } catch (sendError) {
      setMessage(sendError instanceof Error ? sendError.message : "Unable to send email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-bg-secondary/45 p-5">
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
          One thing at home
        </span>
        <Select
          onChange={(event) => {
            if (!event.target.value) {
              return;
            }

            setBody((current) => `${current}\n\nOne thing at home: ${event.target.value}`);
          }}
          defaultValue=""
        >
          <option value="">Select a suggestion</option>
          {draft.suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion}>
              {suggestion}
            </option>
          ))}
        </Select>
      </label>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
          Parent email
        </span>
        <Input value={recipient} onChange={(event) => setRecipient(event.target.value)} />
      </label>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
          Subject
        </span>
        <Input value={subject} onChange={(event) => setSubject(event.target.value)} />
      </label>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
          Body
        </span>
        <Textarea value={body} onChange={(event) => setBody(event.target.value)} />
      </label>
      {message ? <p className="text-sm text-text-secondary">{message}</p> : null}
      <Button onClick={handleSend} disabled={loading}>
        {loading ? "Sending..." : "Send parent email"}
      </Button>
    </div>
  );
}

