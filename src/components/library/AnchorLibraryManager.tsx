"use client";

import * as React from "react";

import { ArabicText } from "@/components/session/ArabicText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SUB_VALUE_LABELS } from "@/lib/data/infractions";
import type { IslamicAnchorRow, SubValueKey } from "@/types";

export function AnchorLibraryManager({ anchors }: { anchors: IslamicAnchorRow[] }) {
  const [form, setForm] = React.useState({
    sub_value: "adab" as SubValueKey,
    anchor_type: "ayah",
    arabic_text: "",
    transliteration: "",
    translation: "",
    source: "",
    discussion_questions: ""
  });
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const response = await fetch("/api/library", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        discussion_questions: form.discussion_questions
          .split("\n")
          .map((entry) => entry.trim())
          .filter(Boolean)
      })
    });

    setMessage(response.ok ? "Anchor saved. Refresh the page to view it." : "Unable to save anchor.");
  }

  async function handleHide(anchorId: string) {
    const response = await fetch(`/api/library/${anchorId}`, {
      method: "DELETE"
    });

    setMessage(response.ok ? "Anchor hidden or deleted. Refresh the page to update the list." : "Unable to update anchor.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="grid gap-4">
        {anchors.map((anchor) => (
          <div key={anchor.id} className="rounded-[28px] border border-border bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-text-muted">
                  {SUB_VALUE_LABELS[anchor.sub_value]} · {anchor.anchor_type}
                </p>
                <p className="mt-1 text-sm text-text-secondary">{anchor.source}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => void handleHide(anchor.id)}>
                {anchor.is_system_default ? "Hide" : "Delete"}
              </Button>
            </div>
            <div className="mt-4">
              <ArabicText
                arabic={anchor.arabic_text}
                transliteration={anchor.transliteration}
                translation={anchor.translation}
                source={anchor.source}
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>
      <form className="space-y-4 rounded-[28px] border border-border bg-bg-secondary/45 p-5" onSubmit={handleCreate}>
        <h2 className="text-2xl">Add anchor</h2>
        <Select
          value={form.sub_value}
          onChange={(event) =>
            setForm((current) => ({ ...current, sub_value: event.target.value as SubValueKey }))
          }
        >
          {Object.entries(SUB_VALUE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          value={form.anchor_type}
          onChange={(event) => setForm((current) => ({ ...current, anchor_type: event.target.value }))}
        >
          <option value="ayah">Ayah</option>
          <option value="hadith">Hadith</option>
        </Select>
        <Textarea
          dir="rtl"
          className="font-arabic text-xl"
          placeholder="Arabic text"
          value={form.arabic_text}
          onChange={(event) => setForm((current) => ({ ...current, arabic_text: event.target.value }))}
        />
        <Input
          placeholder="Transliteration"
          value={form.transliteration}
          onChange={(event) =>
            setForm((current) => ({ ...current, transliteration: event.target.value }))
          }
        />
        <Textarea
          placeholder="Translation"
          value={form.translation}
          onChange={(event) => setForm((current) => ({ ...current, translation: event.target.value }))}
        />
        <Input
          placeholder="Source"
          value={form.source}
          onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}
        />
        <Textarea
          placeholder="Discussion questions, one per line"
          value={form.discussion_questions}
          onChange={(event) =>
            setForm((current) => ({ ...current, discussion_questions: event.target.value }))
          }
        />
        {message ? <p className="text-sm text-text-secondary">{message}</p> : null}
        <Button type="submit">Save anchor</Button>
      </form>
    </div>
  );
}

