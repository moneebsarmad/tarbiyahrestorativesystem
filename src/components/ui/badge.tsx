import * as React from "react";

import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-transparent px-3 py-1 text-xs font-medium tracking-[0.12em] uppercase",
        className
      )}
      {...props}
    />
  );
}
