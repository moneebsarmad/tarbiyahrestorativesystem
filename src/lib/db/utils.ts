import type { StudentRow } from "@/types";

export function mapStudent(
  s: { id: string; name: string | null; grade: number | string | null; house: string | null; division: string | null } | null
): StudentRow | null {
  if (!s) return null;
  return {
    id: s.id,
    name: s.name,
    grade: s.grade != null ? String(s.grade) : null,
    house: s.house,
    division: s.division as StudentRow["division"]
  };
}
