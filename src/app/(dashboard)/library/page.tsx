import { requirePermission } from "@/lib/auth/session";
import { AnchorLibraryManager } from "@/components/library/AnchorLibraryManager";
import { isMockMode } from "@/lib/env";
import { listAnchors as listAnchorsDb } from "@/lib/db/library";
import { listAnchors as listAnchorsMock } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/server";

export default async function LibraryPage() {
  await requirePermission("library", "read");
  const anchors = isMockMode()
    ? listAnchorsMock()
    : await listAnchorsDb(createClient());

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Phase 8</p>
        <h1 className="mt-2 text-3xl">Islamic anchor library</h1>
      </div>
      <AnchorLibraryManager anchors={anchors} />
    </div>
  );
}

