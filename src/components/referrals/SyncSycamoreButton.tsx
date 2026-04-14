"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

export function SyncSycamoreButton() {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/sycamore/sync", {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Sync failed.");
      }

      const payload = (await response.json()) as { newReferrals: number };
      setMessage(`${payload.newReferrals} new referrals imported from Sycamore.`);
    } catch {
      setMessage("Sycamore sync failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="secondary" onClick={handleSync} disabled={loading}>
        {loading ? "Syncing..." : "Sync from Sycamore"}
      </Button>
      {message ? <p className="text-sm text-text-secondary">{message}</p> : null}
    </div>
  );
}

