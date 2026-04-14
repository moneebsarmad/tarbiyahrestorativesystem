"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Mail } from "lucide-react";

import { ROLE_HOME_ROUTE } from "@/lib/rbac/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  configured: boolean;
  nextPath?: string;
}

export function LoginForm({ configured, nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!configured) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = (await response.json()) as {
        error?: string;
        role?: keyof typeof ROLE_HOME_ROUTE | null;
      };

      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        return;
      }

      const fallbackRoute = data.role ? ROLE_HOME_ROUTE[data.role] : "/dashboard";
      const destination = nextPath && nextPath.startsWith("/") ? nextPath : fallbackRoute;

      router.replace(destination);
      router.refresh();
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-text-primary">Email</span>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            type="email"
            autoComplete="email"
            placeholder="name@bha.org"
            value={email}
            disabled={!configured || isSubmitting}
            onChange={(event) => setEmail(event.target.value)}
            className="pl-11"
          />
        </div>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-text-primary">Password</span>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            disabled={!configured || isSubmitting}
            onChange={(event) => setPassword(event.target.value)}
            className="pl-11"
          />
        </div>
      </label>

      {error ? (
        <div className="rounded-2xl border border-flag-muraaqabah/20 bg-flag-muraaqabah/5 px-4 py-3 text-sm text-flag-muraaqabah">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={!configured || isSubmitting}
        className="w-full justify-center gap-2"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
