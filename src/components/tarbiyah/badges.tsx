"use client";

import type { ReferralComplexity, ReferralStatus, SubValueKey, ThreeRKey } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  COMPLEXITY_LABELS,
  REFERRAL_STATUS_LABELS,
  getComplexityTheme,
  getRTheme
} from "@/lib/tarbiyah";
import { SUB_VALUE_LABELS, THREE_R_LABELS } from "@/lib/data/infractions";
import { cn } from "@/lib/utils";

export function RBadge({ r }: { r: ThreeRKey | null | undefined }) {
  if (!r) {
    return <Badge className="bg-bg-secondary text-text-secondary">Unmapped</Badge>;
  }

  const theme = getRTheme(r);

  return <Badge className={cn(theme.bg, theme.text)}>{THREE_R_LABELS[r]}</Badge>;
}

export function SubValueBadge({ subValue }: { subValue: SubValueKey | null | undefined }) {
  if (!subValue) {
    return <Badge className="bg-bg-secondary text-text-secondary">No sub-value</Badge>;
  }

  return <Badge className="bg-white text-text-primary border border-border">{SUB_VALUE_LABELS[subValue]}</Badge>;
}

export function ComplexityBadge({
  complexity
}: {
  complexity: ReferralComplexity | null | undefined;
}) {
  if (!complexity) {
    return <Badge className="bg-bg-secondary text-text-secondary">Unassigned</Badge>;
  }

  return <Badge className={getComplexityTheme(complexity)}>{COMPLEXITY_LABELS[complexity]}</Badge>;
}

export function StatusBadge({ status }: { status: ReferralStatus | null | undefined }) {
  if (!status) {
    return <Badge className="bg-bg-secondary text-text-secondary">Unknown</Badge>;
  }

  return <Badge className={cn("border-transparent", getComplexityTheme("simple"), getStatusTheme(status))}>{REFERRAL_STATUS_LABELS[status]}</Badge>;
}

function getStatusTheme(status: ReferralStatus) {
  switch (status) {
    case "completed":
      return "bg-accent-green/10 text-accent-green";
    case "flagged":
      return "bg-flag-muraaqabah/10 text-flag-muraaqabah";
    case "pending":
      return "bg-accent-gold/12 text-accent-gold";
    case "in_session":
    case "scheduled":
      return "bg-respect/10 text-respect";
    case "td_review":
      return "bg-righteousness/10 text-righteousness";
    default:
      return "bg-bg-secondary text-text-secondary";
  }
}

