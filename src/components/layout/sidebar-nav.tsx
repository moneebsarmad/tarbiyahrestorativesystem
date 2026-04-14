"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  href: Route;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-4 lg:w-[292px] lg:self-start">
      <div className="rounded-[28px] border border-white/70 bg-gradient-to-b from-[#173326] via-[#1b4232] to-[#22523e] p-6 text-white shadow-shell">
        <div className="space-y-2 border-b border-white/10 pb-5">
          <p className="font-display text-2xl">RTS</p>
          <p className="max-w-xs text-sm text-white/72">
            A restorative, pastoral workspace grounded in the 3Rs framework.
          </p>
        </div>

        <nav className="mt-6 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.disabled) {
              return (
                <div
                  key={item.href}
                  className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/45"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] uppercase tracking-[0.16em]">
                    soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  isActive
                    ? "bg-white text-[#163327] shadow-card"
                    : "text-white/78 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-white/72">
          <p className="font-medium text-white">Local operating mode</p>
          <p className="mt-2">
            Running in mock mode until live Supabase, Sycamore, and Resend credentials are added.
          </p>
        </div>
      </div>
    </aside>
  );
}
