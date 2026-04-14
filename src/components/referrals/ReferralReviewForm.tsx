"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SUB_VALUE_LABELS, THREE_R_LABELS } from "@/lib/data/infractions";
import type { ReferralComplexity, SubValueKey, ThreeRKey } from "@/types";
import type { ReferralDetails } from "@/types/view-models";

interface ReferralReviewFormProps {
  referral: ReferralDetails;
}

type MappingRow = {
  prefix: "primary" | "secondary" | "tertiary";
  label: string;
};

const mappingRows: MappingRow[] = [
  { prefix: "primary", label: "Primary mapping" },
  { prefix: "secondary", label: "Secondary mapping" },
  { prefix: "tertiary", label: "Tertiary mapping" }
];

export function ReferralReviewForm({ referral }: ReferralReviewFormProps) {
  const router = useRouter();
  const [complexity, setComplexity] = React.useState<ReferralComplexity>(referral.complexity ?? "simple");
  const [values, setValues] = React.useState({
    primary_r: referral.primary_r ?? "respect",
    primary_sub_value: referral.primary_sub_value ?? "adab",
    secondary_r: referral.secondary_r ?? "",
    secondary_sub_value: referral.secondary_sub_value ?? "",
    tertiary_r: referral.tertiary_r ?? "",
    tertiary_sub_value: referral.tertiary_sub_value ?? ""
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/referrals/${referral.id}/open-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          complexity,
          primary_r: values.primary_r,
          primary_sub_value: values.primary_sub_value,
          secondary_r: complexity !== "simple" ? values.secondary_r || null : null,
          secondary_sub_value: complexity !== "simple" ? values.secondary_sub_value || null : null,
          tertiary_r: complexity === "complex" ? values.tertiary_r || null : null,
          tertiary_sub_value: complexity === "complex" ? values.tertiary_sub_value || null : null
        })
      });

      if (!response.ok) {
        throw new Error("Unable to open session.");
      }

      const payload = (await response.json()) as { session: { id: string } };
      router.push(`/sessions/${payload.session.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to open session.");
    } finally {
      setLoading(false);
    }
  }

  const visibleRows = complexity === "simple" ? 1 : complexity === "compound" ? 2 : 3;

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
          Complexity
        </span>
        <Select value={complexity} onChange={(event) => setComplexity(event.target.value as ReferralComplexity)}>
          <option value="simple">Simple</option>
          <option value="compound">Compound</option>
          <option value="complex">Complex</option>
        </Select>
      </label>

      <div className="space-y-4">
        {mappingRows.slice(0, visibleRows).map((row) => {
          const rKey = `${row.prefix}_r` as const;
          const subValueKey = `${row.prefix}_sub_value` as const;

          return (
            <div key={row.prefix} className="grid gap-4 rounded-3xl border border-border bg-bg-secondary/55 p-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
                  {row.label} · R
                </span>
                <Select
                  value={String(values[rKey])}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [rKey]: event.target.value
                    }))
                  }
                >
                  {Object.entries(THREE_R_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
                  {row.label} · Sub-value
                </span>
                <Select
                  value={String(values[subValueKey])}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [subValueKey]: event.target.value
                    }))
                  }
                >
                  {Object.entries(SUB_VALUE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
          );
        })}
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
          Review notes
        </span>
        <Textarea
          defaultValue={referral.staff_notes ?? ""}
          readOnly
          className="bg-bg-secondary/40"
        />
      </label>

      {error ? (
        <div className="rounded-3xl border border-flag-muraaqabah/20 bg-flag-muraaqabah/8 px-4 py-3 text-sm text-flag-muraaqabah">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Opening..." : "Open session"}
      </Button>
    </form>
  );
}

