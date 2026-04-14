import type { SupabaseClient } from "@supabase/supabase-js";

import type { IslamicAnchorRow, JsonValue, SubValueKey } from "@/types";

export async function listAnchors(supabase: SupabaseClient): Promise<IslamicAnchorRow[]> {
  const { data, error } = await supabase
    .from("islamic_anchor_library")
    .select("*")
    .order("sub_value")
    .order("created_at");

  if (error) throw error;
  return (data ?? []) as IslamicAnchorRow[];
}

export async function createAnchor(
  supabase: SupabaseClient,
  input: Omit<IslamicAnchorRow, "id" | "created_at" | "updated_at">
): Promise<IslamicAnchorRow> {
  const { data, error } = await supabase
    .from("islamic_anchor_library")
    .insert({
      sub_value: input.sub_value as SubValueKey,
      anchor_type: input.anchor_type,
      arabic_text: input.arabic_text,
      transliteration: input.transliteration ?? null,
      translation: input.translation,
      source: input.source,
      discussion_questions: (input.discussion_questions ?? []) as JsonValue,
      is_system_default: input.is_system_default ?? false,
      is_active: input.is_active ?? true,
      created_by: input.created_by ?? null
    })
    .select()
    .single();

  if (error) throw error;
  return data as IslamicAnchorRow;
}

export async function updateAnchor(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<IslamicAnchorRow>
): Promise<IslamicAnchorRow> {
  const { data, error } = await supabase
    .from("islamic_anchor_library")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as IslamicAnchorRow;
}

export async function deleteAnchor(
  supabase: SupabaseClient,
  id: string
): Promise<IslamicAnchorRow> {
  const { data, error } = await supabase
    .from("islamic_anchor_library")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as IslamicAnchorRow;
}
