"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Save, Trash2, X, Pencil, CheckCircle2, ArrowLeft,
  GripVertical, ChevronDown, ChevronUp, Mail, Eye, DollarSign,
  ToggleLeft, ToggleRight, Copy,
} from "lucide-react";
import type { FormTemplate, FormField } from "@/types/database";
import { DynamicForm } from "@/components/dynamic-form";

const inputClass =
  "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

const FIELD_TYPES: { value: FormField["type"]; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Radio Buttons" },
  { value: "checkbox", label: "Checkbox" },
];

const WIDTHS: { value: FormField["width"]; label: string }[] = [
  { value: "full", label: "Full Width" },
  { value: "half", label: "Half Width" },
  { value: "third", label: "Third Width" },
];

const emptyField: FormField = {
  name: "", label: "", type: "text", required: false,
  placeholder: "", options: [], width: "half",
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ── Seed templates ────────────────────────────────── */
const SEED_TEMPLATES: Omit<FormTemplate, "id" | "created_at">[] = [
  {
    slug: "contact",
    name: "Contact Form",
    description: "Get in touch with Masjid Bilal.",
    notification_emails: "",
    success_title: "Message Sent",
    success_message: "Thank you for reaching out! We\u2019ll get back to you within 1\u20132 business days, insha\u2019Allah.",
    submit_label: "Send Message",
    is_active: true,
    payment_amount: null,
    payment_label: null,
    payment_required: false,
    fields: [
      { name: "full_name", label: "Full Name", type: "text", required: true, placeholder: "Your full name", width: "half" },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com", width: "half" },
      { name: "phone", label: "Phone", type: "tel", required: false, placeholder: "(713) 555-0000", width: "half" },
      { name: "subject", label: "Subject", type: "select", required: true, placeholder: "Select a topic\u2026", options: ["General Inquiry", "Volunteer", "Nikah Services", "Facility Rental", "Imam Meeting Request", "Other"], width: "half" },
      { name: "message", label: "Message", type: "textarea", required: true, placeholder: "How can we help you?", width: "full" },
    ],
  },
  {
    slug: "rental",
    name: "Rental Request",
    description: "Fill out the form below and our events coordinator will follow up.",
    notification_emails: "",
    success_title: "Request Submitted",
    success_message: "Thank you! Our team will review your request and get back to you within 2 business days.",
    submit_label: "Submit Request",
    is_active: true,
    payment_amount: null,
    payment_label: null,
    payment_required: false,
    fields: [
      { name: "full_name", label: "Full Name", type: "text", required: true, placeholder: "Your full name", width: "half" },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com", width: "half" },
      { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "(713) 555-0000", width: "half" },
      { name: "event_type", label: "Event Type", type: "select", required: true, placeholder: "Select type\u2026", options: ["Wedding / Walima", "Birthday / Aqeeqah", "Conference / Seminar", "Community Gathering", "Memorial / Janazah", "Other"], width: "half" },
      { name: "preferred_date", label: "Preferred Date", type: "date", required: true, width: "half" },
      { name: "expected_guests", label: "Expected Guests", type: "select", required: true, placeholder: "Select range\u2026", options: ["Under 50", "50\u2013100", "100\u2013200", "200\u2013300", "300+"], width: "half" },
      { name: "notes", label: "Additional Notes", type: "textarea", required: false, placeholder: "Any special requirements, setup preferences, or questions\u2026", width: "full" },
    ],
  },
  {
    slug: "nikah",
    name: "Nikah Request",
    description: "Please fill out all required fields. We will reach out to confirm details.",
    notification_emails: "",
    success_title: "Request Submitted!",
    success_message: "JazakAllahu Khayran! Your Nikah request has been received. Please check your email for a confirmation and next steps.",
    submit_label: "Submit Nikah Request",
    is_active: true,
    payment_amount: 20000,
    payment_label: "Nikah Fee",
    payment_required: true,
    fields: [
      { name: "bride_name", label: "Bride's Full Name", type: "text", required: true, width: "half", section: "Bride Information" },
      { name: "bride_phone", label: "Bride's Phone", type: "tel", required: true, placeholder: "(555) 555-5555", width: "half" },
      { name: "bride_email", label: "Bride's Email", type: "email", required: true, placeholder: "email@example.com", width: "half" },
      { name: "bride_address", label: "Bride's Address", type: "text", required: true, placeholder: "Street, City, State, ZIP", width: "half" },
      { name: "groom_name", label: "Groom's Full Name", type: "text", required: true, width: "half", section: "Groom Information" },
      { name: "groom_phone", label: "Groom's Phone", type: "tel", required: true, placeholder: "(555) 555-5555", width: "half" },
      { name: "groom_email", label: "Groom's Email", type: "email", required: true, placeholder: "email@example.com", width: "half" },
      { name: "groom_address", label: "Groom's Address", type: "text", required: true, placeholder: "Street, City, State, ZIP", width: "half" },
      { name: "wali_name", label: "Wali's Full Name", type: "text", required: true, width: "third", section: "Wali (Guardian) Information" },
      { name: "wali_phone", label: "Wali's Phone", type: "tel", required: true, placeholder: "(555) 555-5555", width: "third" },
      { name: "wali_relation", label: "Relationship to Bride", type: "select", required: true, options: ["Father", "Brother", "Uncle", "Grandfather", "Other"], width: "third" },
      { name: "requested_date", label: "Preferred Date", type: "date", required: true, width: "half", section: "Event Details" },
      { name: "requested_time", label: "Preferred Time", type: "time", required: true, width: "half" },
      { name: "location_preference", label: "Location Preference", type: "select", required: true, options: ["At the Masjid", "Off-site"], width: "third" },
      { name: "num_guests", label: "Number of Guests", type: "number", required: false, placeholder: "e.g. 50", width: "third" },
      { name: "has_marriage_license", label: "Marriage License Obtained?", type: "select", required: true, options: ["Yes", "No", "In Progress"], width: "third" },
      { name: "user_email", label: "Your Email Address (for confirmation)", type: "email", required: true, placeholder: "email@example.com", width: "full", section: "Contact & Additional Info" },
      { name: "additional_notes", label: "Additional Notes", type: "textarea", required: false, placeholder: "Any special requests, questions, or details\u2026", width: "full" },
    ],
  },
  {
    slug: "volunteer",
    name: "Volunteer Sign-Up",
    description: "Interested in volunteering at Masjid Bilal? Fill out this form and we\u2019ll be in touch.",
    notification_emails: "",
    success_title: "Thank You!",
    success_message: "JazakAllahu Khayran for your interest in volunteering! We will contact you with upcoming opportunities.",
    submit_label: "Sign Up",
    is_active: true,
    payment_amount: null,
    payment_label: null,
    payment_required: false,
    fields: [
      { name: "full_name", label: "Full Name", type: "text", required: true, placeholder: "Your full name", width: "half" },
      { name: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com", width: "half" },
      { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "(713) 555-0000", width: "half" },
      { name: "age_range", label: "Age Range", type: "select", required: false, placeholder: "Select\u2026", options: ["Under 18", "18\u201325", "26\u201335", "36\u201350", "51+"], width: "half" },
      { name: "interests", label: "Areas of Interest", type: "select", required: true, placeholder: "Select an area\u2026", options: ["Event Setup & Cleanup", "Teaching / Tutoring", "Administrative / Office Help", "Fundraising", "Youth Programs", "Media & Social Media", "Maintenance & Facilities", "Food Preparation", "Other"], width: "half" },
      { name: "availability", label: "Availability", type: "select", required: true, placeholder: "Select\u2026", options: ["Weekdays", "Weekends", "Both", "Flexible"], width: "half" },
      { name: "experience", label: "Relevant Experience / Skills", type: "textarea", required: false, placeholder: "Tell us about any relevant experience or skills you have\u2026", width: "full" },
      { name: "notes", label: "Additional Notes", type: "textarea", required: false, placeholder: "Anything else you\u2019d like us to know?", width: "full" },
    ],
  },
];

export default function AdminFormsPage() {
  const supabase = createClient();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [editing, setEditing] = useState<FormTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [expandedField, setExpandedField] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState<FormTemplate | null>(null);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchTemplates = useCallback(async () => {
    const { data } = await supabase.from("form_templates").select("*").order("name");
    if (data) setTemplates(data.map((d: Record<string, unknown>) => ({ ...d, fields: d.fields ?? [] })) as FormTemplate[]);
    return data;
  }, [supabase]);

  // Auto-seed default templates on first load if table is empty
  const seedDefaults = useCallback(async () => {
    const data = await fetchTemplates();
    if (data && data.length > 0) return; // already has templates
    const existingSlugs = (data ?? []).map((d: Record<string, unknown>) => d.slug);
    const toInsert = SEED_TEMPLATES.filter((s) => !existingSlugs.includes(s.slug));
    if (toInsert.length > 0) {
      await supabase.from("form_templates").insert(toInsert);
      await fetchTemplates();
    }
  }, [supabase, fetchTemplates]);

  useEffect(() => { seedDefaults(); }, [seedDefaults]);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("form_templates").update({ is_active: !current }).eq("id", id);
    fetchTemplates();
    showToast(!current ? "Form activated." : "Form deactivated.");
  };

  const startNew = () => {
    setEditing({
      id: "", slug: "", name: "", description: "",
      fields: [],
      notification_emails: "",
      success_title: "Thank You!",
      success_message: "Your submission has been received. We will get back to you shortly.",
      submit_label: "Submit",
      is_active: true,
      payment_amount: null,
      payment_label: null,
      payment_required: false,
      created_at: "",
    });
    setIsNew(true);
    setExpandedField(null);
    setShowTemplateMenu(false);
  };

  const duplicateFrom = (source: FormTemplate) => {
    setEditing({
      id: "",
      slug: source.slug + "-copy",
      name: source.name + " (Copy)",
      description: source.description,
      fields: JSON.parse(JSON.stringify(source.fields)),
      notification_emails: "",
      success_title: source.success_title,
      success_message: source.success_message,
      submit_label: source.submit_label,
      is_active: true,
      payment_amount: source.payment_amount,
      payment_label: source.payment_label,
      payment_required: source.payment_required,
      created_at: "",
    });
    setIsNew(true);
    setExpandedField(null);
    setShowTemplateMenu(false);
  };

  const set = (k: string, v: unknown) => setEditing((p) => p && ({ ...p, [k]: v } as FormTemplate));

  /* ── Field helpers ───────────────────────────────── */
  const addField = () => {
    if (!editing) return;
    const newName = `field_${editing.fields.length + 1}`;
    set("fields", [...editing.fields, { ...emptyField, name: newName }]);
    setExpandedField(editing.fields.length);
  };

  const updateField = (idx: number, k: string, v: unknown) => {
    if (!editing) return;
    const fields = [...editing.fields];
    fields[idx] = { ...fields[idx], [k]: v };
    // Auto-generate name from label
    if (k === "label" && typeof v === "string") {
      fields[idx].name = slugify(v).replace(/-/g, "_");
    }
    set("fields", fields);
  };

  const removeField = (idx: number) => {
    if (!editing) return;
    set("fields", editing.fields.filter((_, i) => i !== idx));
    setExpandedField(null);
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    if (!editing) return;
    const fields = [...editing.fields];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= fields.length) return;
    [fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
    set("fields", fields);
    setExpandedField(newIdx);
  };

  /* ── Save / Delete ───────────────────────────────── */
  const saveTemplate = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      slug: editing.slug || slugify(editing.name),
      name: editing.name,
      description: editing.description,
      fields: editing.fields,
      notification_emails: editing.notification_emails,
      success_title: editing.success_title,
      success_message: editing.success_message,
      submit_label: editing.submit_label,
      is_active: editing.is_active,
      payment_amount: editing.payment_amount,
      payment_label: editing.payment_label,
      payment_required: editing.payment_required,
    };
    if (isNew) {
      await supabase.from("form_templates").insert(payload);
    } else {
      await supabase.from("form_templates").update(payload).eq("id", editing.id);
    }
    setSaving(false);
    setEditing(null);
    setIsNew(false);
    fetchTemplates();
    showToast(isNew ? "Form created!" : "Form updated!");
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this form template? This won't delete existing submissions.")) return;
    await supabase.from("form_templates").delete().eq("id", id);
    fetchTemplates();
    showToast("Deleted.");
  };

  /* ── Render ──────────────────────────────────────── */
  return (
    <>
    {/* ── List view ─────────────────────────────────── */}
    {!editing && (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal">Form Templates</h1>
          <p className="text-sm text-muted-foreground">Create and edit forms used across the website. Configure fields, layout, and notification emails.</p>
        </div>

        {toast && <div className="flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium"><CheckCircle2 className="size-4" />{toast}</div>}

        <div className="flex justify-end">
          <div className="relative">
            <div className="flex items-center gap-0">
              <Button onClick={startNew} className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-l-full pl-5 pr-3 h-9 text-xs shadow-sm">
                <Plus className="size-3.5 mr-1.5" />New Form
              </Button>
              <button
                onClick={() => setShowTemplateMenu((v) => !v)}
                className="bg-sage hover:bg-sage-dark text-white h-9 px-2 rounded-r-full border-l border-white/20 shadow-sm"
              >
                <ChevronDown className="size-3.5" />
              </button>
            </div>
            {showTemplateMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowTemplateMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-40 bg-card border border-border/60 rounded-xl shadow-lg overflow-hidden min-w-[220px]">
                  <p className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">Use existing as template</p>
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => duplicateFrom(t)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-charcoal hover:bg-sage/10 transition-colors"
                    >
                      <Copy className="size-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{t.name}</span>
                      <Badge className="text-[9px] bg-warm-gray/60 text-muted-foreground border-0 ml-auto flex-shrink-0">{t.fields.length} fields</Badge>
                    </button>
                  ))}
                  {templates.length === 0 && (
                    <p className="px-3 py-3 text-xs text-muted-foreground">No templates available yet.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {templates.length === 0 ? (
          <Card className="bg-card border-border/60"><CardContent className="p-10 text-center text-muted-foreground text-sm">No form templates yet. Create one to get started.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <Card key={t.id} className="bg-card border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-heading text-sm font-bold text-charcoal">{t.name}</p>
                      <Badge className="text-[9px] bg-warm-gray/60 text-muted-foreground border-0">/{t.slug}</Badge>
                      <Badge className={`text-[9px] border-0 ${t.is_active ? "bg-sage/10 text-sage" : "bg-muted text-muted-foreground"}`}>
                        {t.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {t.payment_amount && t.payment_amount > 0 && (
                        <Badge className="text-[9px] bg-gold/10 text-gold-dark border-0">
                          <DollarSign className="size-2.5 mr-0.5" />{(t.payment_amount / 100).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {t.fields.length} fields · {t.notification_emails ? `Notifies: ${t.notification_emails}` : "No notifications"} · <a href={`/forms/${t.slug}`} target="_blank" className="text-sage hover:underline">View public form &rarr;</a>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(t.id, t.is_active)}
                      title={t.is_active ? "Deactivate form" : "Activate form"}
                      className={`p-1 rounded-lg transition-colors ${
                        t.is_active
                          ? "text-sage hover:bg-sage/10"
                          : "text-muted-foreground hover:bg-warm-gray/50"
                      }`}
                    >
                      {t.is_active ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                    </button>
                    <button onClick={() => setPreviewing({ ...t })} title="Preview form" className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors">
                      <Eye className="size-3.5" />
                    </button>
                    <button onClick={() => duplicateFrom(t)} title="Duplicate form" className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors">
                      <Copy className="size-3.5" />
                    </button>
                    <button onClick={() => { setEditing({ ...t }); setIsNew(false); setExpandedField(null); }} className="p-1.5 rounded-lg hover:bg-sage/10 text-muted-foreground hover:text-sage transition-colors">
                      <Pencil className="size-3.5" />
                    </button>
                    <button onClick={() => deleteTemplate(t.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )}

    {/* ── Editor view ───────────────────────────────── */}
    {editing && (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-1.5 rounded-lg hover:bg-warm-gray/50 text-muted-foreground hover:text-charcoal transition-colors">
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal">{isNew ? "New Form" : `Edit: ${editing.name}`}</h1>
          <p className="text-sm text-muted-foreground">Define the fields, layout, and notifications for this form.</p>
        </div>
      </div>

      {toast && <div className="flex items-center gap-2 bg-sage/10 text-sage px-4 py-2.5 rounded-xl text-sm font-medium"><CheckCircle2 className="size-4" />{toast}</div>}

      {/* ── General Settings ─────────────────────────── */}
      <Card className="bg-card border-border/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-heading text-base font-bold text-charcoal">General</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Form Name *</label>
              <input value={editing.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Contact Form" className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Slug (auto-generated)</label>
              <input value={editing.slug || slugify(editing.name)} onChange={(e) => set("slug", e.target.value)} placeholder="contact-form" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">Description</label>
            <input value={editing.description} onChange={(e) => set("description", e.target.value)} placeholder="Shown above the form" className={inputClass} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Submit Button Label</label>
              <input value={editing.submit_label} onChange={(e) => set("submit_label", e.target.value)} placeholder="Submit" className={inputClass} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer pb-2.5">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => set("is_active", e.target.checked)} className="accent-sage" />
                Active
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Notification Emails ──────────────────────── */}
      <Card className="bg-card border-border/60">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-sage" />
            <h2 className="font-heading text-base font-bold text-charcoal">Email Notifications</h2>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            When this form is submitted, notification emails will be sent to the addresses below. Separate multiple emails with commas.
          </p>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">Notification Email(s)</label>
            <input value={editing.notification_emails} onChange={(e) => set("notification_emails", e.target.value)} placeholder="admin@masjidbilal.org, imam@masjidbilal.org" className={inputClass} />
          </div>
        </CardContent>
      </Card>

      {/* ── Success Message ──────────────────────────── */}
      <Card className="bg-card border-border/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-heading text-base font-bold text-charcoal">Success Message</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Title</label>
              <input value={editing.success_title} onChange={(e) => set("success_title", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Message</label>
              <input value={editing.success_message} onChange={(e) => set("success_message", e.target.value)} className={inputClass} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Payment Configuration ───────────────────── */}
      <Card className="bg-card border-border/60">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-gold" />
            <h2 className="font-heading text-base font-bold text-charcoal">Payment</h2>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Optionally require a payment after this form is submitted. Leave the amount blank for no payment.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editing.payment_amount ? (editing.payment_amount / 100).toFixed(2) : ""}
                onChange={(e) => {
                  const v = e.target.value;
                  set("payment_amount", v ? Math.round(parseFloat(v) * 100) : null);
                }}
                placeholder="e.g. 200.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Payment Label</label>
              <input
                value={editing.payment_label ?? ""}
                onChange={(e) => set("payment_label", e.target.value || null)}
                placeholder="e.g. Nikah Fee"
                className={inputClass}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={editing.payment_required}
                  onChange={(e) => set("payment_required", e.target.checked)}
                  className="accent-sage"
                />
                Required
              </label>
            </div>
          </div>
          {editing.payment_amount && editing.payment_amount > 0 && (
            <div className="bg-gold/5 border border-gold/20 rounded-xl px-4 py-3 text-xs text-gold-dark">
              After submission, users will be redirected to a payment page for <strong>${(editing.payment_amount / 100).toFixed(2)}</strong>
              {editing.payment_label ? ` (${editing.payment_label})` : ""}.
              {!editing.payment_required && " Payment is optional — they can skip."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Field Builder ────────────────────────────── */}
      <Card className="bg-card border-border/60">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-charcoal">Fields ({editing.fields.length})</h2>
            <Button onClick={addField} variant="outline" className="rounded-full border-sage text-sage hover:bg-sage hover:text-white text-xs px-4 h-8">
              <Plus className="size-3 mr-1" />Add Field
            </Button>
          </div>

          {editing.fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No fields yet. Click &quot;Add Field&quot; to start building your form.</p>
          )}

          <div className="space-y-2">
            {editing.fields.map((field, idx) => {
              const isExpanded = expandedField === idx;
              return (
                <div key={idx} className={`border rounded-xl transition-colors ${isExpanded ? "border-sage/40 bg-sage/5" : "border-border/60 bg-warm-white"}`}>
                  {/* Field header (collapsed) */}
                  <div className="flex items-center gap-2 px-4 py-3 cursor-pointer" onClick={() => setExpandedField(isExpanded ? null : idx)}>
                    <GripVertical className="size-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground w-5 text-center">{idx + 1}</span>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-sm font-medium text-charcoal truncate">{field.label || "(untitled)"}</span>
                      <Badge className="text-[9px] bg-warm-gray/60 text-muted-foreground border-0">{field.type}</Badge>
                      {field.required && <Badge className="text-[9px] bg-gold/10 text-gold-dark border-0">required</Badge>}
                      <Badge className="text-[9px] bg-sage/10 text-sage border-0">{field.width}</Badge>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); moveField(idx, -1); }} className="p-1 rounded hover:bg-warm-gray/50" disabled={idx === 0}><ChevronUp className="size-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); moveField(idx, 1); }} className="p-1 rounded hover:bg-warm-gray/50" disabled={idx === editing.fields.length - 1}><ChevronDown className="size-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); removeField(idx); }} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="size-3" /></button>
                    </div>
                  </div>

                  {/* Field details (expanded) */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-border/40 space-y-3">
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Label *</label>
                          <input value={field.label} onChange={(e) => updateField(idx, "label", e.target.value)} placeholder="e.g. Full Name" className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Field Type</label>
                          <select value={field.type} onChange={(e) => updateField(idx, "type", e.target.value)} className={inputClass}>
                            {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Width</label>
                          <select value={field.width} onChange={(e) => updateField(idx, "width", e.target.value)} className={inputClass}>
                            {WIDTHS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Placeholder</label>
                          <input value={field.placeholder ?? ""} onChange={(e) => updateField(idx, "placeholder", e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Section Header (optional)</label>
                          <input value={field.section ?? ""} onChange={(e) => updateField(idx, "section", e.target.value)} placeholder="e.g. Contact Information" className={inputClass} />
                        </div>
                      </div>
                      {(field.type === "select" || field.type === "radio") && (
                        <div>
                          <label className="block text-[10px] font-medium text-muted-foreground mb-1">Options (one per line)</label>
                          <textarea
                            rows={3}
                            value={(field.options ?? []).join("\n")}
                            onChange={(e) => updateField(idx, "options", e.target.value.split("\n"))}
                            placeholder={"Option 1\nOption 2\nOption 3"}
                            className={inputClass + " resize-y font-mono text-xs"}
                          />
                        </div>
                      )}
                      <label className="flex items-center gap-2 text-sm text-charcoal cursor-pointer">
                        <input type="checkbox" checked={field.required} onChange={(e) => updateField(idx, "required", e.target.checked)} className="accent-sage" />
                        Required
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Save bar ─────────────────────────────────── */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => { setEditing(null); setIsNew(false); }} className="rounded-full px-6 h-10 text-sm">
          Cancel
        </Button>
        <Button variant="outline" onClick={() => setPreviewing({ ...editing })} disabled={editing.fields.length === 0} className="rounded-full px-6 h-10 text-sm border-sage text-sage hover:bg-sage hover:text-white">
          <Eye className="size-4 mr-2" />Preview
        </Button>
        <Button onClick={saveTemplate} disabled={saving || !editing.name} className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-8 h-10 text-sm shadow-sm">
          <Save className="size-4 mr-2" />{saving ? "Saving…" : "Save Form"}
        </Button>
      </div>

    </div>
    )}

    {/* ── Preview Modal (always mountable) ────────── */}
    {previewing && (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-10 px-4" onClick={() => setPreviewing(null)}>
        <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Form Preview</p>
            <button onClick={() => setPreviewing(null)} className="text-white/70 hover:text-white transition-colors">
              <X className="size-5" />
            </button>
          </div>
          <DynamicForm template={previewing} />
        </div>
      </div>
    )}
    </>
  );
}
