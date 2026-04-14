"use client";

import { Check, Circle } from "lucide-react";

import { SESSION_PHASES } from "@/lib/tarbiyah";
import { cn } from "@/lib/utils";

interface PhaseNavigationProps {
  activePhase: string;
  completed: number[];
  onSelect: (phaseKey: string) => void;
}

export function PhaseNavigation({
  activePhase,
  completed,
  onSelect
}: PhaseNavigationProps) {
  return (
    <div className="space-y-2">
      {SESSION_PHASES.map((phase) => {
        const isActive = phase.key === activePhase;
        const isComplete = completed.includes(phase.number);

        return (
          <button
            key={phase.key}
            type="button"
            onClick={() => onSelect(phase.key)}
            className={cn(
              "flex w-full items-start gap-3 rounded-3xl border px-4 py-3 text-left transition",
              isActive
                ? "border-accent-green/25 bg-accent-green/8"
                : "border-border bg-white hover:bg-bg-secondary/70"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                isComplete
                  ? "border-accent-green bg-accent-green text-white"
                  : isActive
                    ? "border-accent-green text-accent-green"
                    : "border-border text-text-muted"
              )}
            >
              {isComplete ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3 fill-current" />}
            </span>
            <span className="space-y-1">
              <span className="block text-sm font-semibold text-text-primary">
                {phase.number}. {phase.title}
              </span>
              <span className="block text-xs text-text-secondary">{phase.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

