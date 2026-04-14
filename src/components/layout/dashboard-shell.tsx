"use client";

import type { AppRole } from "@/types/auth";
import {
  Bell,
  BookOpenText,
  FileText,
  Flag,
  Home,
  LibraryBig,
  ShieldCheck,
  Users
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarNav, type SidebarNavItem } from "@/components/layout/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/rbac/permissions";
import { useRole } from "@/lib/rbac/useRole";

const navItemsByRole: Record<Exclude<AppRole, "student">, SidebarNavItem[]> = {
  td: [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/referrals", label: "Referrals", icon: Bell },
    { href: "/sessions", label: "Sessions", icon: BookOpenText },
    { href: "/follow-up", label: "Follow-Up", icon: Flag },
    { href: "/students", label: "Students", icon: Users },
    { href: "/library", label: "Library", icon: LibraryBig },
    { href: "/reports", label: "Reports", icon: FileText }
  ],
  counselor: [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/referrals", label: "Referrals", icon: Bell },
    { href: "/sessions", label: "Sessions", icon: BookOpenText },
    { href: "/students", label: "Students", icon: Users },
    { href: "/reports", label: "Reports", icon: FileText }
  ],
  principal: [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/students", label: "Students", icon: Users },
    { href: "/reports", label: "Reports", icon: FileText }
  ],
  staff: [{ href: "/referrals", label: "Referrals", icon: Bell }]
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { role, userEmail } = useRole();

  if (!role || role === "student") {
    return null;
  }

  const navItems = navItemsByRole[role];

  return (
    <div className="min-h-screen bg-scholarly-grid [background-size:24px_24px]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <SidebarNav items={navItems} />

        <main className="flex-1">
          <div className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-shell backdrop-blur lg:p-8">
            <div className="mb-8 flex flex-col gap-4 border-b border-border/70 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <Badge className="w-fit bg-accent-gold/15 text-accent-gold">
                  Brighter Horizons Academy
                </Badge>
                <div>
                  <h1 className="text-3xl">Restorative Tarbiyah System</h1>
                  <p className="mt-2 max-w-3xl text-sm text-text-secondary">
                    A pastoral, restorative discipline workspace covering intake, facilitation,
                    follow-up, anchors, profiles, and reporting.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 lg:items-end">
                <div className="rounded-2xl border border-border/80 bg-bg-secondary/80 px-4 py-3 text-sm text-text-secondary">
                  <p className="font-medium text-text-primary">Current scope</p>
                  <p className="mt-1">Local MVP build with mock-mode workflows across Phases 3–9.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-accent-green/10 text-accent-green">
                    <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                    {ROLE_LABELS[role]}
                  </Badge>
                  {userEmail ? (
                    <span className="rounded-full border border-border bg-white px-3 py-1 text-xs text-text-secondary">
                      {userEmail}
                    </span>
                  ) : null}
                  <LogoutButton />
                </div>
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
