"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, CheckCircle2 } from "lucide-react";
import type { PageSection } from "@/types/database";

const PAGES = ["home", "about", "services", "programs", "resources"] as const;

export default function PageSectionsAdmin() {
  const supabase = createClient();
  const [sections, setSections] = useState<PageSection[]>([]);
  const [activePage, setActivePage] = useState<string>("home");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const fetchSections = useCallback(async () => {
    const { data } = await supabase
      .from("page_sections")
      .select("*")
      .order("page")
      .order("section_key");
    setSections((data as PageSection[]) ?? []);
    setDrafts({});
  }, [supabase]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const pageSections = sections.filter((s) => s.page === activePage);

  const handleChange = (id: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    const updates = pageSections
      .filter((s) => drafts[s.id] !== undefined && drafts[s.id] !== s.content)
      .map((s) =>
        supabase
          .from("page_sections")
          .update({ content: drafts[s.id] })
          .eq("id", s.id)
      );

    await Promise.all(updates);
    await fetchSections();
    setSaving(false);
    setToast("Sections saved successfully!");
    setTimeout(() => setToast(""), 3000);
  };

  const hasDirtyFields = pageSections.some(
    (s) => drafts[s.id] !== undefined && drafts[s.id] !== s.content
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal">
            Page Sections
          </h1>
          <p className="text-sm text-muted-foreground">
            Edit text content on public pages
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium">
          <CheckCircle2 className="size-4" />
          {toast}
        </div>
      )}

      {/* Page tabs */}
      <div className="flex gap-1 bg-warm-gray rounded-lg p-1 w-fit mb-6">
        {PAGES.map((page) => (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
              activePage === page
                ? "bg-card text-charcoal shadow-sm"
                : "text-charcoal/50 hover:text-charcoal"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Sections */}
      {pageSections.length === 0 ? (
        <Card className="bg-card border-border/60">
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            No sections found for &ldquo;{activePage}&rdquo;. Add rows to the
            page_sections table in Supabase for this page.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pageSections.map((section) => (
            <Card key={section.id} className="bg-card border-border/60">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-charcoal">
                    {section.label}
                  </label>
                  <Badge variant="secondary" className="text-[10px]">
                    {section.section_key}
                  </Badge>
                </div>
                <textarea
                  rows={4}
                  value={
                    drafts[section.id] !== undefined
                      ? drafts[section.id]
                      : section.content
                  }
                  onChange={(e) => handleChange(section.id, e.target.value)}
                  className="w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors resize-none"
                />
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveAll}
              disabled={saving || !hasDirtyFields}
              className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-10 shadow-sm"
            >
              <Save className="size-4 mr-1.5" />
              {saving ? "Saving…" : "Save All"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
