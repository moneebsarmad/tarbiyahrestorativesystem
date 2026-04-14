import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm text-text-primary shadow-sm transition placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green/40",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
