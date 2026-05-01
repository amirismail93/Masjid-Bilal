"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, CheckCircle } from "lucide-react";
import type { FormTemplate, FormField } from "@/types/database";

const defaultFields: FormField[] = [
  { name: "full_name", label: "Full Name", type: "text", required: true, placeholder: "Your full name", width: "half" },
  { name: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com", width: "half" },
  { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "(713) 555-0000", width: "half" },
  { name: "event_type", label: "Event Type", type: "select", required: true, placeholder: "Select type…", options: ["Wedding / Walima", "Birthday / Aqeeqah", "Conference / Seminar", "Community Gathering", "Memorial / Janazah", "Other"], width: "half" },
  { name: "preferred_date", label: "Preferred Date", type: "date", required: true, width: "half" },
  { name: "expected_guests", label: "Expected Guests", type: "select", required: true, placeholder: "Select range…", options: ["Under 50", "50–100", "100–200", "200–300", "300+"], width: "half" },
  { name: "notes", label: "Additional Notes", type: "textarea", required: false, placeholder: "Any special requirements, setup preferences, or questions…", width: "full" },
];

export function RentalRequestForm() {
  const supabase = createClient();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("form_templates").select("*").eq("slug", "rental").eq("is_active", true).single();
      if (data) {
        const t = { ...data, fields: data.fields ?? [] } as FormTemplate;
        setTemplate(t);
        const init: Record<string, string> = {};
        t.fields.forEach((f: FormField) => { init[f.name] = ""; });
        setValues(init);
      } else {
        const init: Record<string, string> = {};
        defaultFields.forEach((f) => { init[f.name] = ""; });
        setValues(init);
      }
    })();
  }, [supabase]);

  const fields = template?.fields?.length ? template.fields : defaultFields;
  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from("rental_submissions").insert({
        full_name: values.full_name ?? "",
        email: values.email ?? "",
        phone: values.phone ?? "",
        event_type: values.event_type ?? "",
        preferred_date: values.preferred_date ?? "",
        expected_guests: values.expected_guests ?? "",
        notes: values.notes ?? "",
      });
      await supabase.from("form_submissions").insert({ form_slug: "rental", data: values });
      if (template?.notification_emails) {
        try {
          await fetch("/api/send-form-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              form_name: template.name || "Rental Request",
              form_slug: "rental",
              notification_emails: template.notification_emails,
              fields,
              data: values,
            }),
          });
        } catch { /* non-blocking */ }
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setSubmitted(true);
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-warm-white px-4 py-2.5 text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

  if (submitted) {
    return (
      <Card className="bg-sage/5 border-sage/20">
        <CardContent className="p-8 sm:p-10 text-center">
          <CheckCircle className="size-10 text-sage mx-auto mb-3" />
          <h3 className="font-heading text-xl font-bold text-charcoal mb-2">
            {template?.success_title || "Request Submitted"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {template?.success_message || "Thank you! Our team will review your request and get back to you within 2 business days."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderField = (field: FormField) => {
    const widthClass = field.width === "full" ? "sm:col-span-2" : "";
    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className={widthClass}>
            <label className="block text-xs font-medium text-charcoal mb-1.5">{field.label}{field.required ? " *" : ""}</label>
            <textarea rows={3} required={field.required} placeholder={field.placeholder} value={values[field.name] ?? ""} onChange={(e) => set(field.name, e.target.value)} className={inputClass + " resize-none"} />
          </div>
        );
      case "select":
        return (
          <div key={field.name} className={widthClass}>
            <label className="block text-xs font-medium text-charcoal mb-1.5">{field.label}{field.required ? " *" : ""}</label>
            <select required={field.required} value={values[field.name] ?? ""} onChange={(e) => set(field.name, e.target.value)} className={inputClass}>
              <option value="">{field.placeholder || "Select…"}</option>
              {(field.options ?? []).filter(Boolean).map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        );
      default:
        return (
          <div key={field.name} className={widthClass}>
            <label className="block text-xs font-medium text-charcoal mb-1.5">{field.label}{field.required ? " *" : ""}</label>
            <input type={field.type} required={field.required} placeholder={field.placeholder} value={values[field.name] ?? ""} onChange={(e) => set(field.name, e.target.value)} className={inputClass} />
          </div>
        );
    }
  };

  const fullFields = fields.filter((f) => f.width === "full");
  const halfFields = fields.filter((f) => f.width !== "full");

  return (
    <Card className="bg-card border-border/60" id="rental-form">
      <CardContent className="p-6 sm:p-8">
        <h3 className="font-heading text-lg font-bold text-charcoal mb-1">
          {template?.name || "Submit a Rental Request"}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {template?.description || "Fill out the form below and our events coordinator will follow up."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {halfFields.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {halfFields.map(renderField)}
            </div>
          )}
          {fullFields.map(renderField)}

          <Button type="submit" disabled={loading} className="bg-sage hover:bg-sage-dark text-white font-semibold rounded-full px-7 h-11 shadow-sm">
            <Send className="size-4 mr-2" />
            {loading ? "Submitting…" : (template?.submit_label || "Submit Request")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
