"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Save,
  Trash2,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { EventPage, RegistrationField } from "@/types/database";

const inputClass =
  "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

const FIELD_TYPES = ["text", "email", "phone", "select", "textarea"] as const;

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const emptyField: RegistrationField = {
  key: "",
  label: "",
  type: "text",
  required: true,
};

const defaultFields: RegistrationField[] = [
  { key: "full_name", label: "Full Name", type: "text", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "phone", label: "Phone", type: "phone", required: false },
];

export default function EventPagesAdmin() {
  const supabase = createClient();
  const [pages, setPages] = useState<EventPage[]>([]);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<EventPage | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchPages = useCallback(async () => {
    const { data } = await supabase
      .from("event_pages")
      .select("*")
      .order("created_at", { ascending: false });
    setPages((data as EventPage[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const startNew = () => {
    setEditing({
      id: "",
      slug: "",
      title: "",
      description: "",
      event_date: "",
      event_time: "",
      location: "",
      banner_image_url: null,
      registration_enabled: true,
      registration_fields: defaultFields,
      max_registrations: null,
      is_published: false,
      created_at: "",
    });
    setIsNew(true);
  };

  const startEdit = (p: EventPage) => {
    setEditing({ ...p });
    setIsNew(false);
  };

  const cancelEdit = () => {
    setEditing(null);
    setIsNew(false);
  };

  const updateField = (key: keyof EventPage, val: unknown) => {
    setEditing((prev) => (prev ? { ...prev, [key]: val } : prev));
  };

  /* Registration field helpers */
  const updateRegField = (
    idx: number,
    key: keyof RegistrationField,
    val: unknown
  ) => {
    if (!editing) return;
    const fields = [...editing.registration_fields];
    fields[idx] = { ...fields[idx], [key]: val };
    if (key === "label") {
      fields[idx].key = slugify(val as string);
    }
    updateField("registration_fields", fields);
  };

  const addRegField = () => {
    if (!editing) return;
    updateField("registration_fields", [
      ...editing.registration_fields,
      { ...emptyField },
    ]);
  };

  const removeRegField = (idx: number) => {
    if (!editing) return;
    const fields = editing.registration_fields.filter((_, i) => i !== idx);
    updateField("registration_fields", fields);
  };

  const saveEvent = async () => {
    if (!editing) return;
    setSaving(true);

    const payload = {
      slug: editing.slug || slugify(editing.title),
      title: editing.title,
      description: editing.description,
      event_date: editing.event_date,
      event_time: editing.event_time,
      location: editing.location,
      banner_image_url: editing.banner_image_url || null,
      registration_enabled: editing.registration_enabled,
      registration_fields: editing.registration_fields,
      max_registrations: editing.max_registrations || null,
      is_published: editing.is_published,
    };

    if (isNew) {
      await supabase.from("event_pages").insert(payload);
    } else {
      await supabase.from("event_pages").update(payload).eq("id", editing.id);
    }

    setSaving(false);
    setEditing(null);
    setIsNew(false);
    fetchPages();
    showToast(isNew ? "Event page created!" : "Event page updated!");
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event page and all its registrations?")) return;
    await supabase.from("event_registrations").delete().eq("event_page_id", id);
    await supabase.from("event_pages").delete().eq("id", id);
    fetchPages();
    showToast("Event page deleted.");
  };

  const togglePublish = async (p: EventPage) => {
    await supabase
      .from("event_pages")
      .update({ is_published: !p.is_published })
      .eq("id", p.id);
    fetchPages();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal">
            Event Pages
          </h1>
          <p className="text-sm text-muted-foreground">
            Create standalone event pages with registration forms
          </p>
        </div>
        <Button
          onClick={startNew}
          className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-5 h-9 text-xs shadow-sm"
        >
          <Plus className="size-3.5 mr-1.5" />
          New Event Page
        </Button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium">
          <CheckCircle2 className="size-4" />
          {toast}
        </div>
      )}

      {/* ── Editor Modal ──────────────────────────────────────────── */}
      {editing && (
        <Card className="bg-card border-sage/30 shadow-lg">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-charcoal">
                {isNew ? "New Event Page" : "Edit Event Page"}
              </h2>
              <button onClick={cancelEdit}>
                <X className="size-5 text-muted-foreground hover:text-charcoal" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                  Title *
                </label>
                <input
                  value={editing.title}
                  onChange={(e) => {
                    updateField("title", e.target.value);
                    if (isNew) updateField("slug", slugify(e.target.value));
                  }}
                  placeholder="Annual Fundraising Gala"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                  Slug (URL path)
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">/events/</span>
                  <input
                    value={editing.slug}
                    onChange={(e) => updateField("slug", slugify(e.target.value))}
                    placeholder="annual-fundraising-gala"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={editing.event_date}
                  onChange={(e) => updateField("event_date", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                  Event Time
                </label>
                <input
                  value={editing.event_time}
                  onChange={(e) => updateField("event_time", e.target.value)}
                  placeholder="6:00 PM – 9:00 PM"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                  Location
                </label>
                <input
                  value={editing.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="Masjid Bilal Main Hall"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editing.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the event details, schedule, and what attendees can expect…"
                  className={inputClass + " resize-y"}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                  Banner Image URL (optional)
                </label>
                <input
                  value={editing.banner_image_url ?? ""}
                  onChange={(e) =>
                    updateField("banner_image_url", e.target.value)
                  }
                  placeholder="https://…"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                  Max Registrations (blank = unlimited)
                </label>
                <input
                  type="number"
                  value={editing.max_registrations ?? ""}
                  onChange={(e) =>
                    updateField(
                      "max_registrations",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder="100"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Registration Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  updateField(
                    "registration_enabled",
                    !editing.registration_enabled
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editing.registration_enabled ? "bg-sage" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editing.registration_enabled
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-charcoal">
                Registration form enabled
              </span>
            </div>

            {/* Registration Fields */}
            {editing.registration_enabled && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-charcoal">
                    Registration Form Fields
                  </h3>
                  <Button
                    variant="outline"
                    onClick={addRegField}
                    className="rounded-full text-xs h-7 px-3 border-sage text-sage hover:bg-sage hover:text-white"
                  >
                    <Plus className="size-3 mr-1" />
                    Add Field
                  </Button>
                </div>
                <div className="space-y-2">
                  {editing.registration_fields.map((f, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_100px_60px_32px] gap-2 items-center"
                    >
                      <input
                        value={f.label}
                        onChange={(e) =>
                          updateRegField(i, "label", e.target.value)
                        }
                        placeholder="Field Label"
                        className={inputClass}
                      />
                      <select
                        value={f.type}
                        onChange={(e) =>
                          updateRegField(i, "type", e.target.value)
                        }
                        className={inputClass}
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={f.required}
                          onChange={(e) =>
                            updateRegField(i, "required", e.target.checked)
                          }
                          className="accent-sage"
                        />
                        Req
                      </label>
                      <button
                        onClick={() => removeRegField(i)}
                        className="flex items-center justify-center h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Published toggle + Save */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    updateField("is_published", !editing.is_published)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editing.is_published ? "bg-sage" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editing.is_published
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-charcoal">
                  {editing.is_published ? "Published" : "Draft"}
                </span>
              </div>
              <Button
                onClick={saveEvent}
                disabled={saving || !editing.title}
                className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-6 h-9 text-xs shadow-sm"
              >
                <Save className="size-3.5 mr-1.5" />
                {saving ? "Saving…" : "Save Event Page"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Event Pages List ──────────────────────────────────────── */}
      {pages.length === 0 && !editing ? (
        <Card className="bg-card border-border/60">
          <CardContent className="p-10 text-center text-muted-foreground text-sm">
            No event pages yet. Click &quot;New Event Page&quot; to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pages.map((p) => (
            <Card key={p.id} className="bg-card border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-base font-bold text-charcoal truncate">
                        {p.title}
                      </h3>
                      <Badge
                        className={`text-[10px] border-0 ${
                          p.is_published
                            ? "bg-sage/10 text-sage"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {p.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      /events/{p.slug} · {p.event_date || "No date"} · {p.location || "No location"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/event-pages/${p.id}/registrations`}>
                      <Button
                        variant="outline"
                        className="rounded-full text-xs h-8 px-3 border-border"
                      >
                        <ClipboardList className="size-3.5 mr-1" />
                        Registrations
                      </Button>
                    </Link>
                    <a
                      href={`/events/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="rounded-full text-xs h-8 px-3 border-border"
                      >
                        <ExternalLink className="size-3.5" />
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      onClick={() => togglePublish(p)}
                      className="rounded-full text-xs h-8 px-3 border-border"
                    >
                      {p.is_published ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => startEdit(p)}
                      className="rounded-full text-xs h-8 px-3 border-sage text-sage hover:bg-sage hover:text-white"
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => deleteEvent(p.id)}
                      className="flex items-center justify-center h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
