"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PrincipalDashboard } from "@/components/reports/PrincipalDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ReportData } from "@/types/view-models";

export function ReportsWorkspace({
  report,
  initialFilters,
  canEmail
}: {
  report: ReportData;
  initialFilters: {
    startDate: string;
    endDate: string;
    division: string;
  };
  canEmail: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = React.useState(initialFilters);
  const [message, setMessage] = React.useState<string | null>(null);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("startDate", filters.startDate);
    params.set("endDate", filters.endDate);
    params.set("division", filters.division);
    router.push(`/reports?${params.toString()}`);
  }

  async function handleDownload() {
    const response = await fetch("/api/reports/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...filters,
        mode: "download"
      })
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "restorative-tarbiyah-report.pdf";
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  async function handleEmail() {
    const response = await fetch("/api/reports/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...filters,
        mode: "email"
      })
    });

    const payload = (await response.json()) as { emailed: boolean; mockDelivered?: boolean };
    setMessage(payload.emailed ? "Report emailed in mock mode." : "Unable to email report.");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-[28px] border border-border bg-bg-secondary/45 p-5 md:grid-cols-5">
        <Input
          type="date"
          value={filters.startDate}
          onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
        />
        <Input
          type="date"
          value={filters.endDate}
          onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
        />
        <Select
          value={filters.division}
          onChange={(event) => setFilters((current) => ({ ...current, division: event.target.value }))}
        >
          <option value="all">All divisions</option>
          <option value="elementary">Elementary</option>
          <option value="secondary">Secondary</option>
        </Select>
        <Button variant="secondary" onClick={applyFilters}>
          Apply filters
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleDownload}>Download PDF</Button>
          {canEmail ? (
            <Button variant="ghost" onClick={handleEmail}>
              Email to me
            </Button>
          ) : null}
        </div>
      </div>
      {message ? <p className="text-sm text-text-secondary">{message}</p> : null}
      <PrincipalDashboard report={report} />
    </div>
  );
}

