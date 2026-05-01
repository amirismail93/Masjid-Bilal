import { createClient } from "@/lib/supabase/server";

/**
 * Fetch all page_sections rows for a given page.
 * Returns a Map<section_key, content> so callers can do:
 *   sections.get("hero_title") ?? "Default Title"
 */
export async function getPageSections(
  page: string
): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("page_sections")
    .select("section_key, content")
    .eq("page", page);

  const map = new Map<string, string>();
  if (data) {
    for (const row of data) {
      map.set(row.section_key, row.content);
    }
  }
  return map;
}
