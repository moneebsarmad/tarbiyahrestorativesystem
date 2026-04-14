"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin"
      });

      router.replace("/login");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={isSubmitting}
      onClick={handleLogout}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      {isSubmitting ? "Signing out..." : "Sign out"}
    </Button>
  );
}
