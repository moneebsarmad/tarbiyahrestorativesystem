import { redirect } from "next/navigation";

import { getAuthState } from "@/lib/auth/session";
import { hasAuthEnv, isMockMode } from "@/lib/env";
import { ROLE_HOME_ROUTE, ROLE_LABELS } from "@/lib/rbac/permissions";
import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const reasonMessages: Record<string, string> = {
  setup:
    "Supabase environment variables are not configured yet. Add them to .env.local before testing live authentication.",
  role:
    "Your account is authenticated, but it does not have a matching row in public.user_roles yet.",
  student:
    "Student dashboard accounts are not enabled in the MVP. Students join sessions through time-scoped links only."
};

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const auth = await getAuthState();

  if (auth.user && auth.role) {
    redirect(ROLE_HOME_ROUTE[auth.role]);
  }

  const reason = typeof searchParams?.reason === "string" ? searchParams.reason : undefined;
  const nextPath = typeof searchParams?.next === "string" ? searchParams.next : undefined;

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="hidden flex-col justify-between rounded-[32px] border border-white/60 bg-gradient-to-br from-[#143224] via-[#1a3f2e] to-[#214e39] p-8 text-white shadow-shell lg:flex">
        <div className="space-y-6">
          <Badge className="w-fit border-white/10 bg-white/10 text-white">
            Brighter Horizons Academy
          </Badge>
          <div className="space-y-4">
            <p className="font-arabic text-4xl leading-relaxed text-white">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <h1 className="max-w-xl text-5xl text-white">Restorative Tarbiyah System</h1>
            <p className="max-w-xl text-base text-white/80">
              A pastoral workspace for referrals, restorative conversations, and character
              formation rooted in the 3Rs framework.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {[
            "Role-aware dashboard shell and protected route group",
            "Supabase Auth session handling through middleware and route handlers",
            "Permission map aligned to TD, counselor, principal, staff, and student roles"
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white/78"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <Card className="border-white/80 bg-white/80 shadow-shell backdrop-blur">
        <CardHeader className="space-y-4">
          <Badge className="w-fit bg-accent-gold/15 text-accent-gold">Phase 1</Badge>
          <div className="space-y-2">
            <CardTitle className="text-3xl">Sign in</CardTitle>
            <CardDescription className="text-base">
              Staff, counselors, principals, and the Tarbiyah Director sign in with email and
              password.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {reason && reasonMessages[reason] ? (
            <div className="rounded-2xl border border-accent-gold/20 bg-accent-gold/5 px-4 py-3 text-sm text-text-secondary">
              {reasonMessages[reason]}
            </div>
          ) : null}

          {auth.user && !auth.role ? (
            <div className="rounded-2xl border border-flag-muraaqabah/20 bg-flag-muraaqabah/5 px-4 py-3 text-sm text-flag-muraaqabah">
              Signed-in account detected without a role assignment. Add the user to
              <span className="font-medium text-flag-muraaqabah"> public.user_roles</span> and
              try again.
            </div>
          ) : null}

          {isMockMode() ? (
            <div className="rounded-2xl border border-accent-green/20 bg-accent-green/5 px-4 py-3 text-sm text-text-secondary">
              Mock mode is active. Use the seeded demo accounts such as
              <span className="font-medium text-text-primary"> moneeb@bha.org</span> with password
              <span className="font-medium text-text-primary"> password123</span>.
            </div>
          ) : !hasAuthEnv() ? (
            <div className="rounded-2xl border border-border bg-bg-secondary/80 px-4 py-3 text-sm text-text-secondary">
              Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
              to enable live authentication.
            </div>
          ) : null}

          <LoginForm configured={hasAuthEnv() || isMockMode()} nextPath={nextPath} />

          <div className="rounded-2xl border border-border bg-bg-secondary/75 p-4 text-sm text-text-secondary">
            <p className="font-medium text-text-primary">Expected Phase 1 roles</p>
            <p className="mt-2">
              Tarbiyah Director, Counselor, Principal, and Staff accounts should each have a
              matching `user_roles.role` value such as
              {" "}
              <span className="font-medium text-text-primary">{ROLE_LABELS.td}</span> or
              {" "}
              <span className="font-medium text-text-primary">{ROLE_LABELS.staff}</span>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
